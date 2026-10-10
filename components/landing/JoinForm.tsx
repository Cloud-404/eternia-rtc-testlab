"use client";
/**
 * components/landing/JoinForm.tsx
 *
 * Landing page join form.
 * Validates inputs client-side, then calls POST /api/livekit/token to verify
 * credentials server-side. On success, navigates to /room with room, name,
 * and code as query parameters.
 *
 * The access code is forwarded to the room page as a query param so the room
 * can use it when the token needs to be re-fetched (e.g. on rejoin).
 * It is never stored in localStorage or logged.
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  validateDisplayName,
  validateRoomCode,
  validateAccessCode,
} from "@/lib/livekit";

export function JoinForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [code, setCode] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    // Client-side validation
    const ne = validateDisplayName(name);
    const re = validateRoomCode(room);
    const ce = validateAccessCode(code);
    setNameError(ne);
    setRoomError(re);
    setCodeError(ce);
    if (ne || re || ce) return;

    setIsLoading(true);
    try {
      // Validate credentials against the server before navigating.
      // The server mints a token — if this succeeds, the room page can use
      // the same credentials to mint another token on connect.
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: name.trim(),
          roomName: room.trim(),
          accessCode: code.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error ?? `Server returned ${res.status}. Please try again.`
        );
      }

      // Navigate to the room page. The access code is included as a query
      // param so the room component can re-authenticate on rejoin without
      // requiring a global state store.
      const params = new URLSearchParams({
        room: room.trim(),
        name: name.trim(),
        code: code.trim(),
      });
      router.push(`/room?${params.toString()}`);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setIsLoading(false);
    }
  }

  return (
    <form
      id="join-form"
      onSubmit={handleJoin}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
      noValidate
    >
      <Input
        id="display-name"
        label="Your display name"
        placeholder="e.g. Alex"
        value={name}
        onChange={(v) => {
          setName(v);
          if (nameError) setNameError(validateDisplayName(v));
        }}
        error={nameError}
        maxLength={40}
        autoFocus
        disabled={isLoading}
      />

      <Input
        id="room-code"
        label="Room code"
        placeholder="e.g. standup-2026"
        value={room}
        onChange={(v) => {
          setRoom(v);
          if (roomError) setRoomError(validateRoomCode(v));
        }}
        error={roomError}
        maxLength={64}
        disabled={isLoading}
      />

      {/* Access code */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label
          htmlFor="access-code"
          style={{
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Demo access code
        </label>
        <input
          id="access-code"
          type="password"
          className={`field-input${codeError ? " error" : ""}`}
          placeholder="Enter the shared demo code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (codeError) setCodeError(validateAccessCode(e.target.value));
          }}
          autoComplete="off"
          disabled={isLoading}
          aria-describedby={codeError ? "access-code-error" : "access-code-hint"}
        />
        {codeError ? (
          <span
            id="access-code-error"
            style={{ fontSize: "0.8125rem", color: "var(--red-500)", marginTop: 2 }}
          >
            {codeError}
          </span>
        ) : (
          <span
            id="access-code-hint"
            style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}
          >
            Ask the organiser for the demo code.
          </span>
        )}
      </div>

      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.22)",
            color: "var(--red-500)",
            fontSize: "0.875rem",
          }}
        >
          {serverError}
        </div>
      )}

      <Button
        id="join-btn"
        type="submit"
        variant="accent"
        isLoading={isLoading}
        style={{ width: "100%", marginTop: 4 }}
      >
        {isLoading ? "Verifying…" : "Join Room"}
      </Button>

      <p
        style={{
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: -4,
          lineHeight: 1.5,
        }}
      >
        Room codes accept letters, numbers, hyphens, and underscores.
      </p>
    </form>
  );
}
