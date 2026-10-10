// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eternia RTC Test Lab",
  description:
    "Experimental audio-calling prototype for Eternia. Join a room, talk to your team — no video, no frills.",
  robots: "noindex, nofollow", // prototype — keep out of search engines
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
