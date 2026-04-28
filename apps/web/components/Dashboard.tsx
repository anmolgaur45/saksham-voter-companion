"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  CalendarDays,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Play,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { getConstituencyHistory } from "@/app/chat/actions";
import type { ConstituencyHistory } from "@/lib/api";
import type { Profile } from "@/app/dashboard-client";

const POLLING_DATE = new Date("2026-05-06T07:00:00+05:30");
const electionActive = true;

const DEFAULT_CHECKLIST = [
  { id: "registration", label: "Voter registration confirmed", done: true },
  { id: "booth",        label: "Polling booth located",        done: true },
  { id: "documents",   label: "Documents gathered",           done: false },
  { id: "candidates",  label: "Candidates reviewed",          done: false },
  { id: "plan",        label: "Polling day plan set",         done: false },
];

const TIMELINE_SNAP = [
  { label: "Nomination Filing", date: "Apr 18, 2026", status: "done"     as const },
  { label: "Campaign Period",   date: "Apr 19 – May 4", status: "active"   as const },
  { label: "Polling Day",       date: "May 6, 2026",   status: "upcoming" as const },
];

const COMMON_QUESTIONS = [
  "What documents do I need to vote?",
  "How do I check if my name is on the voter list?",
  "What is the Model Code of Conduct?",
];

const QUICK_ACTIONS = [
  { href: "/timeline", icon: CalendarDays, title: "Timeline",           desc: "Election phases and key dates",   isNew: false },
  { href: "/chat",     icon: MessageCircle, title: "Ask AI",             desc: "ECI-grounded Q&A",                isNew: false },
  { href: "/verify",   icon: ShieldCheck,   title: "Verify a claim",     desc: "Check against ECI sources",       isNew: false },
  { href: "/practice", icon: Play,           title: "Practice voting day", desc: "Walk through polling day step by step", isNew: false },
  { href: "/quiz",     icon: GraduationCap, title: "Election quiz",       desc: "15 questions on the voting process",    isNew: true  },
];

const STATS = [
  { number: "96.8 Crore", label: "Eligible voters nationally" },
  { number: "543",        label: "Lok Sabha constituencies"   },
  { number: "1.05M",      label: "Polling stations"           },
];

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(() => Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  return {
    days:  Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins:  Math.floor((diff % 3_600_000)  / 60_000),
    secs:  Math.floor((diff % 60_000)     / 1_000),
  };
}

export default function Dashboard({ profile }: { profile: Profile }) {
  const cd = useCountdown(POLLING_DATE);
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);

  const msLeft = POLLING_DATE.getTime() - Date.now();
  const daysLeft = Math.floor(msLeft / 86_400_000);
  const pollingSubline =
    msLeft <= 0
      ? "Counting in progress."
      : daysLeft === 0
      ? "Polling day is today."
      : `Your election literacy dashboard. ${daysLeft} ${daysLeft === 1 ? "day" : "days"} to polling day.`;
  const [historyLoading, setHistoryLoading] = useState(!!profile.constituency);
  const [historyData, setHistoryData] = useState<ConstituencyHistory | null>(null);

  useEffect(() => {
    if (!profile.constituency) return;
    setHistoryLoading(true);
    getConstituencyHistory(profile.constituency)
      .then((data) => { setHistoryData(data); setHistoryLoading(false); })
      .catch(() => { setHistoryLoading(false); });
  }, [profile.constituency]);

  const toggle = (id: string) =>
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));

  const doneCount = checklist.filter((i) => i.done).length;
  const pct = Math.round((doneCount / checklist.length) * 100);
  const year2019 = historyData?.elections.find((e) => e.year === 2019) ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">

      {/* Top bar — welcome */}
      <div className="py-1 space-y-1">
        <p className="text-[15px] font-medium" style={{ color: "var(--text-secondary)" }}>
          Welcome back, <span style={{ color: "var(--text-primary)" }}>{profile.name || "Voter"}</span>.
          {profile.constituency && (
            <> <span style={{ color: "var(--text-tertiary)" }}>· {profile.constituency}</span></>
          )}
        </p>
        <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
          {pollingSubline}
        </p>
      </div>

      {/* Row 1 — countdown + readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Countdown — col-span-8 */}
        <div
          className="lg:col-span-8 rounded-xl p-6 space-y-5"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          {electionActive && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent-primary)" }} />
              <span
                className="text-[11px] font-medium uppercase"
                style={{ color: "var(--accent-primary)", letterSpacing: "0.08em" }}
              >
                Live
              </span>
            </div>
          )}

          <p className="text-[15px] font-medium" style={{ color: "var(--text-secondary)" }}>
            Next phase: Polling Day
          </p>

          <div className="flex items-end gap-4">
            {(
              [
                { val: cd.days, unit: "DAYS" },
                { val: cd.hours, unit: "HRS"  },
                { val: cd.mins,  unit: "MIN"   },
                { val: cd.secs,  unit: "SEC"   },
              ] as const
            ).map(({ val, unit }, i) => (
              <div key={unit} className="flex items-end gap-4">
                {i > 0 && (
                  <span className="text-[28px] font-semibold pb-5" style={{ color: "var(--border-strong)" }}>
                    :
                  </span>
                )}
                <div className="text-center">
                  <div
                    className="text-[40px] font-semibold tabular-nums leading-none"
                    style={{ color: "var(--accent-primary)" }}
                  >
                    {String(val).padStart(2, "0")}
                  </div>
                  <div
                    className="text-[11px] font-medium mt-1"
                    style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}
                  >
                    {unit}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Polling begins on May 6, 2026. Find your booth, verify your documents, plan your commute.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/booth" className="btn-cta px-4 py-2 rounded-md text-[15px] font-medium">
              Find my booth
            </Link>
            <Link
              href="/chat?q=What+documents+do+I+need+to+bring+on+polling+day%3F"
              className="btn-secondary inline-flex items-center px-4 py-2 rounded-md text-[15px] font-medium"
            >
              What to bring
            </Link>
          </div>
        </div>

        {/* Readiness — col-span-4 */}
        <div
          className="lg:col-span-4 rounded-xl p-6 flex flex-col gap-4"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <p className="text-[17px] font-medium" style={{ color: "var(--text-primary)" }}>
            Your readiness
          </p>

          <div className="space-y-3 flex-1">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="flex items-center gap-3 w-full text-left"
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "var(--success)" }} />
                ) : (
                  <Circle className="w-4 h-4 shrink-0" style={{ color: "var(--border-strong)" }} />
                )}
                <span
                  className="text-[13px]"
                  style={{ color: item.done ? "var(--text-secondary)" : "var(--text-primary)" }}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border-default)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: "var(--accent-primary)", transition: "width 300ms ease" }}
              />
            </div>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {doneCount} of {checklist.length} complete · {pct}%
            </p>
          </div>
        </div>
      </div>

      {/* Row 2 — timeline snapshot + constituency + questions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Timeline snapshot */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <p className="text-[17px] font-medium" style={{ color: "var(--text-primary)" }}>
            Timeline snapshot
          </p>
          <div className="space-y-3">
            {TIMELINE_SNAP.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span
                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                  style={{
                    backgroundColor:
                      item.status === "done"     ? "var(--success)"        :
                      item.status === "active"   ? "var(--accent-primary)" :
                                                   "var(--border-strong)",
                  }}
                />
                <div>
                  <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                    {item.label}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/timeline"
            className="flex items-center gap-1 text-[13px]"
            style={{ color: "var(--accent-primary)" }}
          >
            View full timeline <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Constituency */}
        <div
          className="rounded-xl p-5 space-y-2"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <p className="text-[17px] font-medium" style={{ color: "var(--text-primary)" }}>
            Your constituency
          </p>
          <p className="text-[22px] font-medium leading-tight" style={{ color: "var(--text-primary)" }}>
            {profile.constituency || "Not set"}
          </p>

          {historyLoading ? (
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              Loading results…
            </p>
          ) : year2019 ? (
            <div className="space-y-0.5">
              <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                2019 · {year2019.party}
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                Turnout: {year2019.turnout.toFixed(1)}%
              </p>
            </div>
          ) : profile.constituency ? (
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              Historical data available for 2004–2019.{" "}
              {profile.constituency} not found in dataset.
            </p>
          ) : (
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
              Set your constituency to see results.
            </p>
          )}

          <Link
            href={profile.constituency ? `/constituency?q=${encodeURIComponent(profile.constituency)}` : "/constituency"}
            className="flex items-center gap-1 text-[13px] pt-1"
            style={{ color: "var(--accent-primary)" }}
          >
            View full history <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Common questions */}
        <div
          className="rounded-xl p-5 space-y-4"
          style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
        >
          <p className="text-[17px] font-medium" style={{ color: "var(--text-primary)" }}>
            Common questions
          </p>
          <div className="space-y-3">
            {COMMON_QUESTIONS.map((q) => (
              <Link key={q} href={`/chat?q=${encodeURIComponent(q)}`} className="flex items-start gap-2">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                <span className="text-[13px] leading-snug" style={{ color: "var(--text-secondary)" }}>
                  {q}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 — quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {QUICK_ACTIONS.map(({ href, icon: Icon, title, desc, isNew }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl p-4 space-y-2 transition-colors"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)")}
          >
            <Icon className="w-6 h-6" style={{ color: "var(--highlight)" }} />
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-medium" style={{ color: "var(--text-primary)" }}>
                {title}
              </p>
              {isNew && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "var(--accent-primary)", color: "var(--bg-canvas)" }}
                >
                  New
                </span>
              )}
            </div>
            <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {desc}
            </p>
          </Link>
        ))}
      </div>

      {/* Row 4 — stats */}
      <div className="grid grid-cols-3" style={{ borderTop: "1px solid var(--border-default)" }}>
        {STATS.map(({ number, label }, i) => (
          <div
            key={label}
            className="py-5"
            style={{
              paddingLeft:  i === 0              ? 0         : "1.5rem",
              paddingRight: i === STATS.length-1 ? 0         : "1.5rem",
              borderLeft:   i > 0               ? "1px solid var(--border-default)" : "none",
            }}
          >
            <p className="text-[34px] font-semibold leading-none" style={{ color: "var(--highlight)" }}>
              {number}
            </p>
            <p className="text-[13px] mt-1.5" style={{ color: "var(--text-secondary)" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
