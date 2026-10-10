"use client";
/**
 * lib/useRoomConnection.ts
 *
 * Custom hook that owns the entire LiveKit Room lifecycle:
 *   • Fetches the participant token from the server.
 *   • Creates and connects a Room object from livekit-client directly,
 *     without depending on @livekit/components-react context.
 *   • Subscribes to all Room events and reflects changes into React state
 *     as immutable ParticipantSnapshot objects — making re-renders
 *     predictable and avoiding stale closure bugs.
 *   • Attaches <audio> elements to the document for every remote audio
 *     track and cleans them up when tracks or participants are removed.
 *   • Provides mute/unmute and leave actions.
 *   • Cleans up the Room and local microphone track when the component
 *     unmounts or the user leaves.
 *
 * WHY DIRECT livekit-client INSTEAD OF @livekit/components-react?
 * ────────────────────────────────────────────────────────────────
 * @livekit/components-react hooks (useParticipants, useIsSpeaking, etc.)
 * only work inside a <LiveKitRoom> provider tree. That provider re-mounts
 * on token changes, which causes a flash during reconnection. Using the
 * Room object directly gives us full lifecycle control.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  RoomOptions,
  Track,
  RemoteTrackPublication,
  RemoteParticipant,
  Participant,
  ConnectionState,
  type LocalParticipant,
} from "livekit-client";
import type { RoomPhase, ParticipantSnapshot } from "./roomTypes";

// ── Types ──────────────────────────────────────────────────────────────────

interface UseRoomConnectionOptions {
  displayName: string;
  roomName: string;
  accessCode: string;
}

interface UseRoomConnectionResult {
  phase: RoomPhase;
  participants: ParticipantSnapshot[];
  localIsMuted: boolean;
  errorMessage: string;
  toggleMic: () => Promise<void>;
  leave: () => Promise<void>;
  rejoin: () => void;
}

// ── Helper: snapshot all participants in the room ──────────────────────────

function snapshotParticipants(
  room: Room
): ParticipantSnapshot[] {
  const local = room.localParticipant;
  const all: Participant[] = [local, ...Array.from(room.remoteParticipants.values())];

  return all.map((p) => {
    const micPub = p.getTrackPublication(Track.Source.Microphone);
    return {
      identity: p.identity,
      name: p.name ?? p.identity,
      isLocal: p.identity === local.identity,
      isMuted: micPub?.isMuted ?? true,
      isSpeaking: p.isSpeaking,
    };
  });
}

// ── Helper: attach a remote audio track to a hidden <audio> element ────────

const audioElements = new Map<string, HTMLAudioElement>();

function attachAudioTrack(
  trackPub: RemoteTrackPublication,
  participant: RemoteParticipant
): void {
  if (trackPub.source !== Track.Source.Microphone) return;
  const track = trackPub.audioTrack;
  if (!track) return;

  // Key by participant identity + track SID for uniqueness
  const key = `${participant.identity}__${trackPub.trackSid}`;
  if (audioElements.has(key)) return; // already attached

  const el = document.createElement("audio");
  el.id = `audio-${key}`;
  el.autoplay = true;
  el.setAttribute("playsinline", "true");
  track.attach(el);
  document.body.appendChild(el);
  audioElements.set(key, el);
}

function detachAudioTrack(
  trackPub: RemoteTrackPublication,
  participant: RemoteParticipant
): void {
  const key = `${participant.identity}__${trackPub.trackSid}`;
  const el = audioElements.get(key);
  if (!el) return;
  trackPub.audioTrack?.detach(el);
  el.remove();
  audioElements.delete(key);
}

function detachAllAudioTracksForParticipant(identity: string): void {
  for (const [key, el] of audioElements.entries()) {
    if (key.startsWith(`${identity}__`)) {
      el.pause();
      el.remove();
      audioElements.delete(key);
    }
  }
}

function detachAllAudioTracks(): void {
  for (const el of audioElements.values()) {
    el.pause();
    el.remove();
  }
  audioElements.clear();
}

// ── ROOM OPTIONS ───────────────────────────────────────────────────────────

const ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  // Audio-only: do not capture or subscribe to video
  videoCaptureDefaults: { resolution: undefined },
  publishDefaults: {
    videoSimulcastLayers: [],
    // Disable video DTX and simulcast — we are audio-only
    dtx: true,
    videoEncoding: undefined,
  },
};

// ── Hook ───────────────────────────────────────────────────────────────────

export function useRoomConnection({
  displayName,
  roomName,
  accessCode,
}: UseRoomConnectionOptions): UseRoomConnectionResult {
  const [phase, setPhase] = useState<RoomPhase>("idle");
  const [participants, setParticipants] = useState<ParticipantSnapshot[]>([]);
  const [localIsMuted, setLocalIsMuted] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Stable ref to the Room instance — never triggers re-renders on change
  const roomRef = useRef<Room | null>(null);
  // Guard against double-connecting in StrictMode or fast effect re-runs
  const connectingRef = useRef(false);

  // ── Refresh participant snapshots into React state ───────────────────────
  const refreshParticipants = useCallback(() => {
    const room = roomRef.current;
    if (!room) return;
    setParticipants(snapshotParticipants(room));
    // Also sync local mute state
    const micPub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
    setLocalIsMuted(micPub?.isMuted ?? true);
  }, []);

  // ── Connect to the room ──────────────────────────────────────────────────
  const connect = useCallback(async () => {
    if (connectingRef.current) return;
    connectingRef.current = true;

    // ── Fetch token ──────────────────────────────────────────────────────
    setPhase("fetching-token");
    setErrorMessage("");

    let token: string;
    let url: string;

    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, roomName, accessCode }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error ?? `Token request failed (${res.status}).`);
      }

      token = data.token as string;
      url = data.url as string;

      if (!token || !url) {
        throw new Error("Server returned an incomplete token response.");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to reach the server."
      );
      setPhase("error");
      connectingRef.current = false;
      return;
    }

    // ── Create Room and register events before connecting ────────────────
    setPhase("connecting");

    const room = new Room(ROOM_OPTIONS);
    roomRef.current = room;

    // Participant changes
    const onParticipantChange = () => refreshParticipants();

    room
      .on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
        refreshParticipants();
        // Attach any tracks the participant already has
        for (const pub of p.trackPublications.values()) {
          if (pub.kind === Track.Kind.Audio) {
            attachAudioTrack(pub as RemoteTrackPublication, p);
          }
        }
      })
      .on(RoomEvent.ParticipantDisconnected, (p: RemoteParticipant) => {
        detachAllAudioTracksForParticipant(p.identity);
        refreshParticipants();
      })
      .on(
        RoomEvent.TrackSubscribed,
        (_track, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (pub.kind === Track.Kind.Audio) {
            attachAudioTrack(pub, participant);
          }
          refreshParticipants();
        }
      )
      .on(
        RoomEvent.TrackUnsubscribed,
        (_track, pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          if (pub.kind === Track.Kind.Audio) {
            detachAudioTrack(pub, participant);
          }
          refreshParticipants();
        }
      )
      .on(RoomEvent.TrackMuted, onParticipantChange)
      .on(RoomEvent.TrackUnmuted, onParticipantChange)
      .on(RoomEvent.ActiveSpeakersChanged, onParticipantChange)
      .on(RoomEvent.LocalTrackPublished, onParticipantChange)
      .on(RoomEvent.LocalTrackUnpublished, onParticipantChange)
      .on(RoomEvent.ConnectionStateChanged, (state: ConnectionState) => {
        if (state === ConnectionState.Reconnecting) {
          setPhase("reconnecting");
        } else if (state === ConnectionState.Connected) {
          setPhase("connected");
          refreshParticipants();
        }
      })
      .on(RoomEvent.Reconnected, () => {
        setPhase("connected");
        refreshParticipants();
      })
      .on(RoomEvent.Disconnected, () => {
        detachAllAudioTracks();
        setPhase("disconnected");
      });

    // ── Connect with audio enabled; no video ─────────────────────────────
    try {
      await room.connect(url, token, {
        autoSubscribe: true,
      });

      // Request microphone permission and publish audio
      await room.localParticipant.setMicrophoneEnabled(true);

      setPhase("connected");
      refreshParticipants();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);

      // Distinguish microphone permission denial from other errors
      if (
        msg.toLowerCase().includes("permission") ||
        msg.toLowerCase().includes("notallowed") ||
        msg.toLowerCase().includes("denied") ||
        (err instanceof DOMException && err.name === "NotAllowedError")
      ) {
        setPhase("permission_denied");
      } else {
        setErrorMessage(msg);
        setPhase("error");
      }

      // Clean up the room if we failed after creating it
      await room.disconnect().catch(() => {});
      roomRef.current = null;
    }

    connectingRef.current = false;
  }, [displayName, roomName, accessCode, refreshParticipants]);

  // ── Disconnect and clean up ──────────────────────────────────────────────
  const leave = useCallback(async () => {
    connectingRef.current = false;
    const room = roomRef.current;
    if (!room) {
      setPhase("disconnected");
      return;
    }
    // Stop the local microphone track before disconnecting so the browser
    // removes the recording indicator immediately.
    try {
      await room.localParticipant.setMicrophoneEnabled(false);
    } catch {
      // best effort
    }
    await room.disconnect();
    detachAllAudioTracks();
    roomRef.current = null;
    setPhase("disconnected");
  }, []);

  // ── Mute / unmute ────────────────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    const micPub = room.localParticipant.getTrackPublication(Track.Source.Microphone);
    const currentlyMuted = micPub?.isMuted ?? true;
    await room.localParticipant.setMicrophoneEnabled(currentlyMuted);
    refreshParticipants();
  }, [refreshParticipants]);

  // ── Rejoin (re-run connect) ──────────────────────────────────────────────
  const rejoin = useCallback(() => {
    connectingRef.current = false;
    roomRef.current = null;
    detachAllAudioTracks();
    connect();
  }, [connect]);

  // ── Initial connect on mount ─────────────────────────────────────────────
  useEffect(() => {
    connect();

    return () => {
      // Cleanup on unmount
      const room = roomRef.current;
      if (room) {
        room.disconnect().catch(() => {});
        roomRef.current = null;
      }
      detachAllAudioTracks();
      connectingRef.current = false;
    };
    // connect is stable (useCallback with stable deps) — run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    phase,
    participants,
    localIsMuted,
    errorMessage,
    toggleMic,
    leave,
    rejoin,
  };
}
