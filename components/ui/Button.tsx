"use client";
// components/ui/Button.tsx
// Reusable button with variant support

import React from "react";

type Variant = "accent" | "ghost" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export function Button({
  variant = "accent",
  isLoading = false,
  leftIcon,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  const cls =
    variant === "accent"
      ? "btn-accent"
      : variant === "danger"
      ? "btn-danger"
      : "btn-ghost";

  return (
    <button
      className={`${cls} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin-slow 0.7s linear infinite",
          }}
        />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
}
