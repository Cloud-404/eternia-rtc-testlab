// lib/livekit.ts
// Shared type helpers and utilities for LiveKit integration

import type { ConnectionQuality } from "livekit-client";

/**
 * Maps a LiveKit ConnectionQuality enum value to a human-readable label
 * and a colour token used in the UI.
 */
export function getQualityMeta(quality: ConnectionQuality | undefined): {
  label: string;
  colour: "green" | "amber" | "red" | "muted";
} {
  switch (quality) {
    case "excellent":
      return { label: "Excellent", colour: "green" };
    case "good":
      return { label: "Good", colour: "green" };
    case "poor":
      return { label: "Poor", colour: "amber" };
    case "lost":
      return { label: "Lost", colour: "red" };
    default:
      return { label: "Unknown", colour: "muted" };
  }
}

/** Validates a room code string — returns an error message or null. */
export function validateRoomCode(code: string): string | null {
  const trimmed = code.trim();
  if (trimmed.length < 2) return "Room code must be at least 2 characters.";
  if (trimmed.length > 64) return "Room code is too long (max 64 characters).";
  if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed))
    return "Room code may only contain letters, numbers, hyphens, and underscores.";
  return null;
}

/** Validates a display name — returns an error message or null. */
export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 1) return "Display name is required.";
  if (trimmed.length > 40) return "Display name is too long (max 40 characters).";
  return null;
}

/** Validates a demo access code — returns an error message or null. */
export function validateAccessCode(code: string): string | null {
  if (!code || code.trim().length === 0) return "Demo access code is required.";
  return null;
}
