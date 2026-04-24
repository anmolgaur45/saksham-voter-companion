"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { searchConstituencyNames, getConstituencyHistory } from "@/app/chat/actions";
import type { ConstituencyHistory } from "@/lib/api";

// ── types ─────────────────────────────────────────────────────────────────────

interface Profile {
  name: string;
  firstTimeVoter: boolean;
  constituency: string;
  language: string;
}

// ── constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "saksham_profile";
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

// ── countdown hook ────────────────────────────────────────────────────────────

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

// ── root component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setProfile(stored ? (JSON.parse(stored) as Profile) : null);
  }, []);

  const handleOnboarded = useCallback((p: Profile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setProfile(p);
    setShowModal(false);
  }, []);

  if (profile === undefined) return null;

  if (profile === null) {
    return (
      <>
        <HeroState onStart={() => setShowModal(true)} />
        {showModal && (
          <OnboardingModal
            onComplete={handleOnboarded}
            onDismiss={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  return <Dashboard profile={profile} />;
}

// ── State A — first visit ─────────────────────────────────────────────────────

function HeroState({ onStart }: { onStart: () => void }) {
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

// ── Onboarding modal ──────────────────────────────────────────────────────────

function OnboardingModal({
  onComplete,
  onDismiss,
}: {
  onComplete: (p: Profile) => void;
  onDismiss: () => void;
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [firstTimeVoter, setFirstTimeVoter] = useState<boolean | null>(null);
  const [constituency, setConstituency] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [language, setLanguage] = useState("en");
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = (q: string) => {
    setConstituency(q);
    setSuggestions([]);
    setShowSuggestions(false);
    if (debounce.current) clearTimeout(debounce.current);
    if (q.length < 2) return;
    debounce.current = setTimeout(() => {
      searchConstituencyNames(q)
        .then((results) => { setSuggestions(results); setShowSuggestions(results.length > 0); })
        .catch(() => {});
    }, 300);
  };

  const progress = (step / 4) * 100;

  // Option card: transparent when unselected, saffron-tinted when selected
  const optionStyle = (selected: boolean) => ({
    backgroundColor: selected ? "var(--accent-soft-bg)" : "transparent",
    border: `1px solid ${selected ? "var(--accent-primary)" : "var(--border-default)"}`,
    color: selected ? "var(--accent-primary)" : "var(--text-secondary)",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(11,18,32,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <div
        className="w-full max-w-md rounded-xl p-8 space-y-6"
        style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-default)" }}
      >
        {/* Progress */}
        <div className="flex items-center gap-3">
          <div
            className="h-1 rounded-full flex-1 overflow-hidden"
            style={{ backgroundColor: "var(--border-default)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--accent-primary)",
                transition: "width 250ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
          <span
            className="text-[11px] font-medium shrink-0"
            style={{ color: "var(--text-tertiary)", letterSpacing: "0.08em" }}
          >
            {step} / 4
          </span>
        </div>

        {/* Step 1 — name */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-[22px]" style={{ color: "var(--text-primary)" }}>
              What should we call you?
            </h2>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
              placeholder="Your first name"
              className="w-full px-3 py-2.5 rounded-md text-[15px] outline-none transition-colors"
              style={{
                backgroundColor: "var(--bg-surface-2)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--border-default)")}
            />
            <button
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              className="w-full py-2.5 rounded-md text-[15px] font-medium transition-all"
              style={
                name.trim()
                  ? { backgroundColor: "var(--accent-primary)", color: "var(--bg-canvas)", cursor: "pointer" }
                  : { backgroundColor: "var(--bg-surface-2)", color: "var(--text-muted)", cursor: "not-allowed" }
              }
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2 — first-time voter */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-[22px]" style={{ color: "var(--text-primary)" }}>
              Are you a first-time voter?
            </h2>
            <div className="flex gap-3">
              {([true, false] as const).map((v) => (
                <button
                  key={String(v)}
                  onClick={() => setFirstTimeVoter(v)}
                  className="flex-1 py-3 rounded-md text-[15px] font-medium transition-all cursor-pointer"
                  style={optionStyle(firstTimeVoter === v)}
                >
                  {v ? "Yes" : "No"}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-2.5 rounded-md text-[15px] font-medium">
                Back
              </button>
              <button
                onClick={() => firstTimeVoter !== null && setStep(3)}
                disabled={firstTimeVoter === null}
                className="flex-1 py-2.5 rounded-md text-[15px] font-medium transition-all"
                style={
                  firstTimeVoter !== null
                    ? { backgroundColor: "var(--accent-primary)", color: "var(--bg-canvas)", cursor: "pointer" }
                    : { backgroundColor: "var(--bg-surface-2)", color: "var(--text-muted)", cursor: "not-allowed" }
                }
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — constituency */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-[22px]" style={{ color: "var(--text-primary)" }}>
              What&apos;s your constituency?
            </h2>
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={constituency}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-primary)"; if (suggestions.length > 0) setShowSuggestions(true); }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border-default)"; setShowSuggestions(false); }}
                placeholder="e.g. Mumbai North"
                className="w-full px-3 py-2.5 rounded-md text-[15px] outline-none transition-colors"
                style={{
                  backgroundColor: "var(--bg-surface-2)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div
                  className="absolute top-full mt-1 w-full rounded-md overflow-hidden z-20 max-h-48 overflow-y-auto"
                  style={{ backgroundColor: "var(--bg-surface-2)", border: "1px solid var(--border-default)" }}
                >
                  {suggestions.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      className="w-full text-left px-3 py-2 text-[14px] transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "var(--border-subtle)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")}
                      onClick={() => { setConstituency(s); setSuggestions([]); setShowSuggestions(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-2.5 rounded-md text-[15px] font-medium">
                Back
              </button>
              <button onClick={() => setStep(4)} className="btn-cta flex-1 py-2.5 rounded-md text-[15px] font-medium">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — language */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-[22px]" style={{ color: "var(--text-primary)" }}>
              Preferred language?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "en", label: "English"  },
                { value: "hi", label: "हिन्दी"   },
                { value: "ta", label: "தமிழ்"    },
                { value: "bn", label: "বাংলা"    },
              ].map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className="py-3 rounded-md text-[15px] font-medium transition-all cursor-pointer"
                  style={optionStyle(language === l.value)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="btn-secondary flex-1 py-2.5 rounded-md text-[15px] font-medium">
                Back
              </button>
              <button
                onClick={() => onComplete({ name: name.trim(), firstTimeVoter: firstTimeVoter ?? false, constituency, language })}
                className="btn-cta flex-1 py-2.5 rounded-md text-[15px] font-medium"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── State B — dashboard ───────────────────────────────────────────────────────

function Dashboard({ profile }: { profile: Profile }) {
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
          {/* Live badge moved here */}
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
