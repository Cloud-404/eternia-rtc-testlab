"use client";
// components/room/states/DisconnectedState.tsx
// Shown after graceful disconnect / call ended

import React from "react";
import { Button } from "@/components/ui/Button";

interface DisconnectedStateProps {
  roomName: string;
  onRejoin: () => void;
  onLeave: () => void;
}

function PhoneOffIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--text-muted)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.88a19.72 19.72 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.32 8.91" />
      <line x1="23" y1="1" x2="1" y2="23" />
    </svg>
  );
}

export function DisconnectedState({
  roomName,
  onRejoin,
  onLeave,
}: DisconnectedStateProps) {
  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        height: "100%",
        padding: 32,
        textAlign: "center",
      }}
    >
      <PhoneOffIcon />
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          You left the call
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          You were disconnected from{" "}
          <span style={{ color: "var(--accent-300)", fontWeight: 600 }}>
            {roomName}
          </span>
          .
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <Button variant="accent" onClick={onRejoin}>
          Rejoin room
        </Button>
        <Button variant="ghost" onClick={onLeave}>
          Back to lobby
        </Button>
      </div>
    </div>
  );
}
