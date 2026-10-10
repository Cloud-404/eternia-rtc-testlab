// app/room/page.tsx
// Audio call page — reads room + name from query params and renders AudioRoom

import type { Metadata } from "next";
import { Suspense } from "react";
import { RoomPageClient } from "./RoomPageClient";

export const metadata: Metadata = {
  title: "Room — Eternia RTC Test Lab",
  description: "Active audio call room.",
  robots: "noindex, nofollow",
};

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            height: "100vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="spinner" />
        </div>
      }
    >
      <RoomPageClient />
    </Suspense>
  );
}
