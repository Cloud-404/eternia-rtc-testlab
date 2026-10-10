"use client";
/**
 * components/room/AudioRoom.tsx
 *
 * Root audio call component. Uses the useRoomConnection hook which owns
 * the LiveKit Room object lifecycle directly — no @livekit/components-react
 * provider wrapping needed.
 *
 * Renders the correct screen for each phase of the state machine:
 *   idle / fetching-token / connecting → LoadingState
 *   connected / reconnecting          → In-call UI (header + grid + controls)
 *   disconnected                      → DisconnectedState
 *   permission_denied                 → PermissionDeniedState
 *   error                             → ErrorState
 */

import React from "react";
import { useRouter } from "next/navigation";
import { useRoomConnection } from "@/lib/useRoomConnection";
import { LoadingState } from "./states/LoadingState";
import { ErrorState } from "./states/ErrorState";
import { PermissionDeniedState } from "./states/PermissionDeniedState";
import { DisconnectedState } from "./states/DisconnectedState";
import { ParticipantGrid } from "./ParticipantGrid";
import { ControlBar } from "./ControlBar";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface AudioRoomProps {
  roomName: string;
  participantName: string;
  accessCode: string;
}

export function AudioRoom({ roomName, participantName, accessCode }: AudioRoomProps) {
  const router = useRouter();

  const {
    phase,
    participants,
    localIsMuted,
    errorMessage,
    toggleMic,
    leave,
    rejoin,
  } = useRoomConnection({
    displayName: participantName,
    roomName,
    accessCode,
  });

  function goToLobby() {
    router.push("/");
  }

  async function handleLeave() {
    await leave();
    // phase will become "disconnected" — DisconnectedState handles navigation
  }

  // ── Loading states ─────────────────────────────────────────────────────────
  if (phase === "idle" || phase === "fetching-token" || phase === "connecting") {
    const msg =
      phase === "fetching-token"
        ? "Generating secure token…"
        : phase === "connecting"
        ? "Connecting to room…"
        : "Starting…";
    return <LoadingState message={msg} />;
  }

  // ── Permission denied ──────────────────────────────────────────────────────
  if (phase === "permission_denied") {
    return <PermissionDeniedState onLeave={goToLobby} />;
  }

  // ── Disconnected ───────────────────────────────────────────────────────────
  if (phase === "disconnected") {
    return (
      <DisconnectedState
        roomName={roomName}
        onRejoin={rejoin}
        onLeave={goToLobby}
      />
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <ErrorState
        message={errorMessage || "An unexpected error occurred."}
        onRetry={rejoin}
        onLeave={goToLobby}
      />
    );
  }

  // ── Connected / Reconnecting ───────────────────────────────────────────────
  const badgeProps =
    phase === "reconnecting"
      ? { label: "Reconnecting…", colour: "amber" as const }
      : { label: "Connected", colour: "green" as const };

  const remoteCount = participants.filter((p) => !p.isLocal).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          borderBottom: "1px solid var(--bg-glass-border)",
          flexShrink: 0,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {/* Left: logo + room name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, var(--accent-500), var(--accent-400))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
          </div>
          <div>
            <p style={{
              fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500,
              letterSpacing: "0.06em", textTransform: "uppercase",
            }}>
              Eternia RTC
            </p>
            <p style={{
              fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 1,
            }}>
              {roomName}
            </p>
          </div>
        </div>

        {/* Right: participant count + status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
            {participants.length} participant{participants.length !== 1 ? "s" : ""}
            {remoteCount === 0 && (
              <span style={{ marginLeft: 6, color: "var(--accent-300)" }}>
                (alone)
              </span>
            )}
          </span>
          <StatusBadge {...badgeProps} />
        </div>
      </header>

      {/* ── Participant grid ── */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ParticipantGrid participants={participants} />
      </main>

      {/* ── Control bar ── */}
      <ControlBar
        isMuted={localIsMuted}
        onToggleMic={toggleMic}
        onLeave={handleLeave}
      />
    </div>
  );
}
