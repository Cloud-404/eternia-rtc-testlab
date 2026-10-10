"use client";
// components/ui/Input.tsx
// Reusable labelled text input with error state

import React from "react";

interface InputProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string | null;
  maxLength?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

export function Input({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
  maxLength,
  autoFocus,
  disabled,
}: InputProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "var(--text-secondary)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        className={`field-input${error ? " error" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        autoFocus={autoFocus}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
      />
      {error && (
        <span
          style={{
            fontSize: "0.8125rem",
            color: "var(--red-500)",
            marginTop: 2,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
