"use client";
// components/room/states/ErrorState.tsx
// Shown on any non-permission error (network failure, invalid token, etc.)

import React from "react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  onLeave: () => void;
}

// Triangle warning SVG icon
function WarningIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--red-500)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function ErrorState({ message, onRetry, onLeave }: ErrorStateProps) {
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
      <WarningIcon />
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          Something went wrong
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: 360 }}>
          {message}
        </p>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {onRetry && (
          <Button variant="accent" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant="ghost" onClick={onLeave}>
          Back to lobby
        </Button>
      </div>
    </div>
  );
}
