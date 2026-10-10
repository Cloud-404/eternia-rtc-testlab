"use client";
// components/ui/StatusBadge.tsx
// Colour-coded connection quality / status badge

import React from "react";

type Colour = "green" | "amber" | "red" | "muted";

interface StatusBadgeProps {
  label: string;
  colour: Colour;
}

export function StatusBadge({ label, colour }: StatusBadgeProps) {
  return (
    <span className={`badge badge-${colour}`}>
      <span className={`dot dot-${colour}`} />
      {label}
    </span>
  );
}
