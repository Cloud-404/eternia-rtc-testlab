"use client";
// app/room/RoomPageClient.tsx
// Client component — reads searchParams and boots AudioRoom.
// Redirects back to the lobby if required params are missing.

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { AudioRoom } from "@/components/room/AudioRoom";

export function RoomPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomName = searchParams.get("room") ?? "";
  const participantName = searchParams.get("name") ?? "";
  // The access code is passed as a query param so it arrives at the call
  // page without needing a global state store. It is used exclusively to
  // call the server-side token endpoint — it is never rendered or logged.
  const accessCode = searchParams.get("code") ?? "";

  // Guard: redirect to lobby if required params are absent
  useEffect(() => {
    if (!roomName || !participantName || !accessCode) {
      router.replace("/");
    }
  }, [roomName, participantName, accessCode, router]);

  if (!roomName || !participantName || !accessCode) {
    return null; // redirecting
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-base)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1, flex: 1, overflow: "hidden" }}>
        <AudioRoom
          roomName={roomName}
          participantName={participantName}
          accessCode={accessCode}
        />
      </div>
    </div>
  );
}
