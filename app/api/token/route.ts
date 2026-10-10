// app/api/token/route.ts
// Server-side LiveKit token generation endpoint.
// The API_SECRET is ONLY used here — it never reaches the browser.

import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { participantName, roomName } = await req.json();

    // ── Validate inputs ────────────────────────────────────────────────────
    if (
      typeof participantName !== "string" ||
      participantName.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "participantName is required." },
        { status: 400 }
      );
    }

    if (typeof roomName !== "string" || roomName.trim().length < 2) {
      return NextResponse.json(
        { error: "roomName must be at least 2 characters." },
        { status: 400 }
      );
    }

    // ── Read server-side secrets ───────────────────────────────────────────
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      console.error(
        "[token] Missing LiveKit environment variables. " +
          "Ensure LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL are set in .env.local."
      );
      return NextResponse.json(
        { error: "Server configuration error. Contact the administrator." },
        { status: 500 }
      );
    }

    // ── Mint the token ─────────────────────────────────────────────────────
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName.trim(),
      ttl: "4h",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName.trim(),
      canPublish: true,
      canSubscribe: true,
      canPublishData: false, // audio-only prototype
    });

    const token = await at.toJwt();

    return NextResponse.json({ token }, { status: 200 });
  } catch (err) {
    console.error("[token] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to generate token. Please try again." },
      { status: 500 }
    );
  }
}
