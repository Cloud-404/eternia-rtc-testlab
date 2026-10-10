// lib/roomTypes.ts
// Shared types for the audio room state machine and participant snapshots.
// Kept in lib/ so they can be imported by both room components and hooks
// without creating circular dependencies.

/** Phases of the audio room lifecycle. */
export type RoomPhase =
  | "idle"            // Component just mounted, nothing started yet
  | "fetching-token"  // POST /api/livekit/token in flight
  | "connecting"      // LiveKit Room.connect() in progress
  | "connected"       // Fully in the call
  | "reconnecting"    // Lost connection temporarily — trying to recover
  | "disconnected"    // Clean disconnect (user left or session ended)
  | "error"           // Unrecoverable error
  | "permission_denied"; // Browser denied microphone access

/**
 * Immutable snapshot of a single participant's state.
 * We snapshot rather than pass the LiveKit Participant object directly so
 * React can diff it correctly with its normal equality rules.
 */
export interface ParticipantSnapshot {
  /** LiveKit identity (display name + random suffix). */
  identity: string;
  /** Human-readable display name set in the token. */
  name: string;
  /** True when this participant is the local user. */
  isLocal: boolean;
  /** True when the microphone track is muted or absent. */
  isMuted: boolean;
  /** True when LiveKit considers this participant to be speaking. */
  isSpeaking: boolean;
}
