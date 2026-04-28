"use client";

import Link from "next/link";
import { MessageCircle, CalendarDays, MapPin } from "lucide-react";

const FEATURES = [
  {
    icon: MessageCircle,
    title: "Ask questions in your language",
    desc: "Get ECI-grounded answers in English, Hindi, Tamil, or Bengali.",
  },
  {
    icon: CalendarDays,
    title: "Explore the election timeline",
    desc: "See each phase from nominations to results in a single view.",
  },
  {
    icon: MapPin,
    title: "Find your polling booth",
    desc: "Locate your assigned booth and plan your route with Google Maps.",
  },
];

export default function HeroState({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12">

      {/* Hero */}
      <div className="max-w-[600px] space-y-5">
        <div className="space-y-3">
          <p
            className="text-[11px] font-medium uppercase"
            style={{ color: "var(--accent-primary)", letterSpacing: "0.12em" }}
          >
            INDEPENDENT. MULTILINGUAL. VERIFIED.
          </p>
          <h1
            className="text-[34px] font-semibold leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            The Indian election, explained.
          </h1>
        </div>
        <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          A guide to how voting works, when it happens, and what it asks of you.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onStart}
            className="btn-cta px-5 py-2.5 rounded-md text-[15px] font-medium"
          >
            Get started
          </button>
          <Link
            href="/timeline"
            className="btn-secondary inline-flex items-center px-5 py-2.5 rounded-md text-[15px] font-medium"
          >
            Explore without signing up
          </Link>
        </div>
      </div>

      {/* Feature row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-14">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="space-y-2">
            <Icon className="w-5 h-5" style={{ color: "var(--highlight)" }} />
            <p className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>
              {title}
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* Inline stats strip */}
      <p
        className="text-[13px] mt-10"
        style={{ color: "var(--text-tertiary)", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}
      >
        <span style={{ color: "var(--highlight)", fontWeight: 500 }}>96.8 Crore</span> eligible voters
        {" · "}
        <span style={{ color: "var(--highlight)", fontWeight: 500 }}>543</span> constituencies
        {" · "}
        <span style={{ color: "var(--highlight)", fontWeight: 500 }}>1.05M</span> polling stations
      </p>

    </div>
  );
}
