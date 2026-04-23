"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CitationCard } from "@/components/CitationCard";
import type { Citation } from "@/lib/api";
import { sendMessage } from "@/app/chat/actions";

const VERDICT_STYLES: Record<string, string> = {
  TRUE: "bg-green-50 border-green-300 text-green-800",
  FALSE: "bg-red-50 border-red-300 text-red-800",
  PARTIALLY_TRUE: "bg-yellow-50 border-yellow-300 text-yellow-800",
  UNVERIFIABLE: "bg-gray-50 border-gray-300 text-gray-700",
};

const VERDICT_LABEL: Record<string, string> = {
  TRUE: "True",
  FALSE: "False",
  PARTIALLY_TRUE: "Partially True",
  UNVERIFIABLE: "Unverifiable",
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
      setError("Failed to verify the claim. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const verdictStyle = result ? (VERDICT_STYLES[result.verdict] ?? VERDICT_STYLES.UNVERIFIABLE) : "";

  return (
    <div className="flex flex-col gap-5 p-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Claim Verifier</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Paste a claim about the Indian election process to check it against ECI sources.
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label htmlFor="claim-input" className="sr-only">Claim to verify</label>
        <textarea
          id="claim-input"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="e.g. EVMs can be hacked remotely during counting."
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
        <Button type="submit" disabled={loading || !claim.trim()} className="self-start">
          {loading ? "Checking…" : "Verify claim"}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <div className={`rounded-lg border p-4 flex flex-col gap-3 ${verdictStyle}`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide">Verdict</span>
            <span className="font-bold text-base">
              {VERDICT_LABEL[result.verdict] ?? result.verdict}
            </span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.response}</p>
          {result.citations.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
