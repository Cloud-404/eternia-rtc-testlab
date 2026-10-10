"use client";
// components/room/ControlBar.tsx
// Mute/unmute toggle and leave button.
// Props-driven — no LiveKit hooks, works outside any provider context.

import React from "react";
import { Button } from "@/components/ui/Button";

interface ControlBarProps {
  isMuted: boolean;
  onToggleMic: () => void;
  onLeave: () => void;
}

function MicOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function PhoneOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.43 9.88a19.72 19.72 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.32 8.91" />
      <line x1="23" y1="1" x2="1" y2="23" />
    </svg>
  );
}

export function ControlBar({ isMuted, onToggleMic, onLeave }: ControlBarProps) {
  return (
    <div
      className="slide-up"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "20px 24px",
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--bg-glass-border)",
        flexShrink: 0,
      }}
    >
      <button
        id="mute-toggle-btn"
        className={`mute-btn ${isMuted ? "muted" : "unmuted"}`}
        onClick={onToggleMic}
        title={isMuted ? "Unmute microphone (M)" : "Mute microphone (M)"}
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
        aria-pressed={!isMuted}
      >
        {isMuted ? <MicOffIcon /> : <MicOnIcon />}
        {isMuted ? "Unmute" : "Mute"}
      </button>

      <Button
        id="leave-btn"
        variant="danger"
        onClick={onLeave}
        leftIcon={<PhoneOffIcon />}
        aria-label="Leave call"
      >
        Leave
      </Button>
    </div>
  );
}
