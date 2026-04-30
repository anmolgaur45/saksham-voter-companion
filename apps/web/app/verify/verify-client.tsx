"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/CitationCard";
import type { Citation } from "@/lib/api";
import { sendMessage } from "@/app/chat/actions";
import { useI18n } from "@/lib/useI18n";

const VERDICT_BORDER: Record<string, string> = {
  TRUE: "border-l-green-600",
  FALSE: "border-l-red-500",
  PARTIALLY_TRUE: "border-l-amber-500",
  UNVERIFIABLE: "border-l-gray-400",
};

interface Result {
  response: string;
  verdict: string;
  citations: Citation[];
}

const SESSION_ID = crypto.randomUUID();

export default function VerifyClient() {
  const [claim, setClaim] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = useI18n({
    heading: "Claim Verifier",
    description:
      "Paste a claim about the Indian election process to check it against ECI sources.",
    disclaimer:
      "Procedural Facts Only. This tool does not verify claims about candidates, parties, or election outcomes.",
    placeholder: "e.g. EVMs can be hacked remotely during counting.",
    buttonVerify: "Verify claim",
    buttonChecking: "Checking…",
    verdictLabel: "Verdict",
    verdict_TRUE: "True",
    verdict_FALSE: "False",
    verdict_PARTIALLY_TRUE: "Partially True",
    verdict_UNVERIFIABLE: "Unverifiable",
    errorMsg: "Failed to verify the claim. Please try again.",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!claim.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await sendMessage(claim.trim(), SESSION_ID, "en", "verifier");
      setResult({
        response: res.response,
        verdict: res.verdict ?? "UNVERIFIABLE",
        citations: res.citations,
      });
    } catch {
      setError(t.errorMsg);
    } finally {
      setLoading(false);
    }
  }

  const borderClass = result
    ? (VERDICT_BORDER[result.verdict] ?? VERDICT_BORDER.UNVERIFIABLE)
    : "";

  const verdictDisplay = result
    ? ((t as Record<string, string>)[`verdict_${result.verdict}`] ?? result.verdict)
    : "";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold mb-0.5">{t.heading}</h1>
        <p className="text-sm text-muted-foreground">{t.description}</p>
      </div>

      <div
        className="rounded-lg px-4 py-3 text-xs"
        style={{
          backgroundColor: "var(--warning-soft-bg)",
          border: "1px solid var(--warning)",
          color: "var(--warning)",
        }}
      >
        <strong>Procedural Facts Only.</strong>{" "}{t.disclaimer.replace("Procedural Facts Only. ", "")}
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label htmlFor="claim-input" className="sr-only">
          {t.heading}
        </label>
        <textarea
          id="claim-input"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder={t.placeholder}
          rows={4}
          className="w-full rounded border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
        <Button
          type="submit"
          disabled={loading || !claim.trim()}
          className="self-start"
        >
          {loading ? t.buttonChecking : t.buttonVerify}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div
          className={`rounded-r-lg border border-l-4 p-4 flex flex-col gap-3 ${borderClass}`}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.verdictLabel}
            </span>
            <span className="font-semibold text-sm">{verdictDisplay}</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.response}</p>
          {result.citations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.citations.map((c, i) => (
                <CitationCard key={i} citation={c} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
