"use client";
// components/room/states/LoadingState.tsx
// Shown while the token is being fetched or the LiveKit connection is establishing

import React from "react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Connecting to room…",
}: LoadingStateProps) {
  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        height: "100%",
        padding: 32,
      }}
    >
      <div className="spinner" />
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.9375rem",
          fontWeight: 500,
        }}
      >
        {message}
      </p>
    </div>
  );
}
