"use client";
// components/room/states/PermissionDeniedState.tsx
// Shown when the browser denies microphone access

import React from "react";
import { Button } from "@/components/ui/Button";

interface PermissionDeniedStateProps {
  onLeave: () => void;
}

function MicOffIcon() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--amber-500)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function PermissionDeniedState({ onLeave }: PermissionDeniedStateProps) {
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
      <MicOffIcon />
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          Microphone access denied
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.9rem",
            maxWidth: 380,
          }}
        >
          Eternia RTC needs microphone permission to join a call. Please allow
          access in your browser&apos;s site settings, then refresh the page.
        </p>
      </div>
      <div
        style={{
          padding: "14px 20px",
          borderRadius: "var(--radius-md)",
          background: "rgba(245,158,11,0.07)",
          border: "1px solid rgba(245,158,11,0.2)",
          fontSize: "0.8125rem",
          color: "var(--text-secondary)",
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--amber-500)" }}>Chrome / Edge:</strong>{" "}
        Click the lock icon in the address bar → Microphone → Allow.
        <br />
        <strong style={{ color: "var(--amber-500)" }}>Firefox:</strong> Click
        the shield icon → Permissions → Allow microphone.
      </div>
      <Button variant="ghost" onClick={onLeave}>
        Back to lobby
      </Button>
    </div>
  );
}
