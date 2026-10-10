"use client";
// components/room/ParticipantGrid.tsx
// Responsive grid of ParticipantTile cards, driven by snapshot props.

import React from "react";
import type { ParticipantSnapshot } from "@/lib/roomTypes";
import { ParticipantTile } from "./ParticipantTile";

interface ParticipantGridProps {
  participants: ParticipantSnapshot[];
}

export function ParticipantGrid({ participants }: ParticipantGridProps) {
  if (participants.length === 0) {
    return (
      <div
        className="fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          flex: 1,
          color: "var(--text-muted)",
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <p style={{ fontSize: "0.875rem" }}>Waiting for others to join…</p>
      </div>
    );
  }

  // Responsive column count by participant count
  const cols =
    participants.length === 1 ? 1
    : participants.length <= 4 ? 2
    : participants.length <= 9 ? 3
    : 4;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(160px, 1fr))`,
        gap: 16,
        width: "100%",
        padding: "4px 0",
      }}
    >
      {participants.map((p) => (
        <ParticipantTile key={p.identity} participant={p} />
      ))}
    </div>
  );
}
