"use client";

import { useState, useEffect, useRef } from "react";
import { searchConstituencyNames } from "@/app/chat/actions";
import type { Profile } from "@/app/dashboard-client";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function OnboardingModal({
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  // Capture trigger, hide background siblings from screen readers, restore on close
  useEffect(() => {
    triggerRef.current = document.activeElement;
    const main = document.getElementById("main-content");
    const hidden: Element[] = [];
    if (main?.parentElement) {
      for (const el of Array.from(main.parentElement.children)) {
        if (el !== main) {
          el.setAttribute("aria-hidden", "true");
          hidden.push(el);
        }
      }
    }
    return () => {
      hidden.forEach((el) => el.removeAttribute("aria-hidden"));
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, []);

  // Move focus to first focusable element inside the dialog whenever the step changes
  useEffect(() => {
    const first = dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  }, [step]);

  // Escape closes; Tab/Shift+Tab cycle within the dialog
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onDismiss();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onDismiss]);

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-heading"
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
            <h2 id="onboarding-heading" className="text-[22px]" style={{ color: "var(--text-primary)" }}>
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
            <h2 id="onboarding-heading" className="text-[22px]" style={{ color: "var(--text-primary)" }}>
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
            <h2 id="onboarding-heading" className="text-[22px]" style={{ color: "var(--text-primary)" }}>
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
            <h2 id="onboarding-heading" className="text-[22px]" style={{ color: "var(--text-primary)" }}>
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
