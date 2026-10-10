// app/page.tsx
// Landing / login page — enter display name and room code

import type { Metadata } from "next";
import { JoinForm } from "@/components/landing/JoinForm";

export const metadata: Metadata = {
  title: "Eternia RTC Test Lab",
  description:
    "Experimental audio-calling prototype. Enter your name and a room code to start a call.",
  robots: "noindex, nofollow",
};

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 440,
        }}
      >
        {/* Logo + title */}
        <div
          className="fade-in"
          style={{
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background:
                "linear-gradient(135deg, var(--accent-500), var(--accent-400))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            <span className="gradient-text">Eternia</span>
            <span style={{ color: "var(--text-primary)" }}> RTC</span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9375rem",
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            Audio-calling test lab
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-card slide-up"
          style={{ padding: "32px 32px 28px" }}
        >
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 6,
            }}
          >
            Join a room
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.875rem",
              marginBottom: 28,
            }}
          >
            Enter your name and a room code to start or join an audio call.
          </p>

          <JoinForm />
        </div>

        {/* Footer */}
        <p
          className="fade-in"
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: 24,
          }}
        >
          Powered by{" "}
          <span style={{ color: "var(--accent-300)", fontWeight: 600 }}>
            LiveKit Cloud
          </span>{" "}
          &mdash; prototype, not for production use
        </p>
      </div>
    </div>
  );
}
