# Eternia RTC Test Lab

An experimental, standalone audio-calling prototype powered by **LiveKit Cloud**.  
> ⚠️ This is a prototype. It is **not connected to any Eternia production system**.

---

## Prerequisites

- Node.js 18+
- A [LiveKit Cloud](https://livekit.io/cloud) account (free tier works)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your LiveKit credentials:

```
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
LIVEKIT_URL=wss://your-project.livekit.cloud
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
DEMO_ACCESS_CODE=test01
```

You can find your LiveKit credentials in the [LiveKit Cloud Console](https://cloud.livekit.io) under your project's **Settings → Keys**.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Usage

1. Enter a **display name** (what others will see)
2. Enter a **room code** (letters, numbers, hyphens, underscores)
3. Enter the **demo access code** (`test01` by default)
4. Click **Join Room**
5. Allow microphone access when prompted
6. Anyone who enters the **same room code** will join the same audio call

---

## Project Structure

```
app/
  page.tsx                  # Landing / join page
  layout.tsx                # Root layout (suppressHydrationWarning)
  globals.css               # Design system & dark theme
  room/
    page.tsx                # Audio call page (server component)
    RoomPageClient.tsx      # Audio call page (client component)
  api/livekit/token/route.ts # Canonical token minting endpoint

components/
  ui/                       # Button, Input, StatusBadge
  landing/JoinForm.tsx      # Landing form with validation
  room/
    AudioRoom.tsx           # Root call component + state machine
    ControlBar.tsx          # Mute toggle + leave controls
    ParticipantGrid.tsx     # Grid of participants
    ParticipantTile.tsx     # Participant card with speech/mute indicators
    states/                 # Loading, Error, PermissionDenied, Disconnected

lib/
  livekit.ts                # Validation helpers
  roomTypes.ts              # ParticipantSnapshot & RoomPhase types
  useRoomConnection.ts      # LiveKit Room lifecycle hook (livekit-client)
```

---

## Security

- `LIVEKIT_API_SECRET` is **server-side only** — it is never exposed to the browser
- Tokens are minted with a 2-hour TTL per session
- `.env.local` is gitignored by default

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Custom dark design system |
| RTC | LiveKit Cloud |
| Client SDK | `livekit-client` |
| Server SDK | `livekit-server-sdk` |
