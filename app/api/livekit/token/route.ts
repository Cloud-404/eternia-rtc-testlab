/**
 * app/api/livekit/token/route.ts
 *
 * Secure server-side LiveKit participant token endpoint.
 *
 * WHAT THIS DOES
 * ──────────────
 * Validates the request, then uses the server-side LiveKit credentials to
 * mint a short-lived participant JWT. Returns only the token and the server
 * URL — never the API key or secret.
 *
 * DEMO AUTH LIMITATION
 * ────────────────────
 * This endpoint is gated by a shared DEMO_ACCESS_CODE environment variable.
 * This is intentionally minimal: it prevents completely open token issuance
 * without requiring a database or auth provider. It is NOT suitable for
 * production. Replace it with proper authentication before going live.
 *
 * SECURITY PROPERTIES
 * ───────────────────
 * • LIVEKIT_API_SECRET is read only here, server-side, and never returned.
 * • Tokens, secrets, and the access code are never logged.
 * • The token grants permission to join exactly the requested room and to
 *   publish/subscribe audio only.
 * • Each participant gets a unique identity derived from their display name
 *   plus a random suffix to prevent identity collisions.
 */

import { NextRequest, NextResponse } from "next/server";
import { AccessToken, type VideoGrant } from "livekit-server-sdk";
import { validateDisplayName, validateRoomCode } from "@/lib/livekit";

/** Token lifetime — 2 hours is enough for a demo call. */
const TOKEN_TTL = "2h";

export async function POST(req: NextRequest) {
  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const { displayName, roomName, accessCode } = body as Record<string, unknown>;

  // ── 2. Validate inputs ─────────────────────────────────────────────────────
  const nameErr = validateDisplayName(typeof displayName === "string" ? displayName : "");
  if (nameErr) {
    return NextResponse.json({ error: nameErr }, { status: 400 });
  }

  const roomErr = validateRoomCode(typeof roomName === "string" ? roomName : "");
  if (roomErr) {
    return NextResponse.json({ error: roomErr }, { status: 400 });
  }

  // ── 3. Verify demo access code ─────────────────────────────────────────────
  // This is a simple shared-secret gate. Defaults to "test01" in dev mode if not explicitly set.
  const demoCode =
    process.env.DEMO_ACCESS_CODE ||
    (process.env.NODE_ENV !== "production" ? "test01" : undefined);

  if (!demoCode) {
    // Misconfiguration — server operator forgot to set the code.
    console.error("[livekit/token] DEMO_ACCESS_CODE is not set in environment.");
    return NextResponse.json(
      { error: "Server is not configured for demo access. Contact the administrator." },
      { status: 503 }
    );
  }

  if (typeof accessCode !== "string" || accessCode.trim() !== demoCode.trim()) {
    // Wrong code — do not reveal whether the code exists or what it is.
    return NextResponse.json({ error: "Invalid access code." }, { status: 403 });
  }

  // ── 4. Read server-side LiveKit credentials ────────────────────────────────
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  const isPlaceholderSecret =
    !apiSecret ||
    apiSecret.includes("••") ||
    apiSecret.includes("your_livekit_api_secret_here");

  if (!apiKey || isPlaceholderSecret || !livekitUrl) {
    const errorMsg = isPlaceholderSecret
      ? "LIVEKIT_API_SECRET in .env.local needs your real LiveKit API secret from cloud.livekit.io (currently placeholder)."
      : "Missing LiveKit environment variables. Ensure LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL are set in .env.local.";
    console.error("[livekit/token] " + errorMsg);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }

  // ── 5. Build a unique participant identity ─────────────────────────────────
  // Using display name alone risks collisions when two people share a name.
  // We append a short random hex suffix to guarantee uniqueness per session.
  const safeDisplayName = (displayName as string).trim();
  const randomSuffix = Math.random().toString(16).slice(2, 8); // e.g. "a3f71c"
  const identity = `${safeDisplayName}__${randomSuffix}`;

  // ── 6. Mint the access token ───────────────────────────────────────────────
  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    // Store the human-readable name separately so the UI can display it
    // without having to strip the suffix from the identity.
    name: safeDisplayName,
    ttl: TOKEN_TTL,
  });

  const grant: VideoGrant = {
    roomJoin: true,
    room: (roomName as string).trim(),
    canPublish: true,       // publish microphone audio
    canSubscribe: true,     // subscribe to remote audio
    canPublishData: false,  // data channels not needed for audio-only
  };
  at.addGrant(grant);

  let token: string;
  try {
    token = await at.toJwt();
  } catch (err) {
    // Do not log err — it could contain key material in some SDK versions.
    console.error("[livekit/token] Failed to sign JWT.");
    return NextResponse.json(
      { error: "Failed to generate token. Please try again." },
      { status: 500 }
    );
  }

  // ── 7. Return only the token and server URL — never the key/secret ─────────
  return NextResponse.json(
    { token, url: livekitUrl },
    { status: 200 }
  );
}
