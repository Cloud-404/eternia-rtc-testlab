"use client";
// components/room/ParticipantTile.tsx
// Renders a single participant card driven by an immutable ParticipantSnapshot.
// No LiveKit hooks — all state flows in through props for predictable re-renders.

import React from "react";
import type { ParticipantSnapshot } from "@/lib/roomTypes";

interface ParticipantTileProps {
  participant: ParticipantSnapshot;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

// Deterministic colour from identity string
function getAvatarColour(identity: string): string {
  const colours = [
    "#7c3aed", "#2563eb", "#059669", "#d97706",
    "#dc2626", "#9333ea", "#0891b2", "#be185d",
  ];
  let hash = 0;
  for (let i = 0; i < identity.length; i++) {
    hash = identity.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colours[Math.abs(hash) % colours.length];
}

export function ParticipantTile({ participant }: ParticipantTileProps) {
  const { name, identity, isLocal, isMuted, isSpeaking } = participant;
  const initials = getInitials(name || identity);
  const avatarColour = getAvatarColour(identity);

  return (
    <div
      className="glass-card fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "28px 20px",
        minHeight: 160,
        position: "relative",
        transition: "border-color 0.25s",
        borderColor: isSpeaking ? "var(--accent-500)" : "var(--bg-glass-border)",
      }}
    >
      {/* Avatar */}
      <div
        className={isSpeaking ? "speaking-ring" : ""}
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: avatarColour,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.375rem",
          fontWeight: 700,
          color: "#fff",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {initials}

        {/* Mute badge */}
        {isMuted && (
          <span
            title="Microphone muted"
            aria-label="Microphone muted"
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--bg-base)",
              border: "2px solid var(--bg-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--red-500)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            </svg>
          </span>
        )}
      </div>

      {/* Name */}
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: "0.9375rem",
            color: "var(--text-primary)",
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name || identity}
          {isLocal && (
            <span
              style={{
                marginLeft: 6,
                fontSize: "0.7rem",
                color: "var(--accent-300)",
                fontWeight: 500,
              }}
            >
              (you)
            </span>
          )}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: isSpeaking ? "var(--accent-300)" : "var(--text-muted)",
            marginTop: 3,
            fontWeight: 500,
            transition: "color 0.2s",
          }}
        >
          {isMuted ? "Muted" : isSpeaking ? "Speaking…" : "Listening"}
        </p>
      </div>
    </div>
  );
}
