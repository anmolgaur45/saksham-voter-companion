"use client";

import { useState, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Search, Loader2 } from "lucide-react";
import { getConstituencyHistory, searchConstituencyNames } from "@/app/chat/actions";
import type { ConstituencyHistory } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const PARTY_COLORS: Record<string, string> = {
  BJP: "#f97316",
  INC: "#3b82f6",
  AITC: "#22c55e",
  BSP: "#a855f7",
  SP: "#ef4444",
  AAP: "#06b6d4",
  DMK: "#14b8a6",
  AIADMK: "#eab308",
  NCP: "#8b5cf6",
  "NCP(SP)": "#7c3aed",
  CPI: "#ec4899",
  "CPI(M)": "#f43f5e",
  TDP: "#84cc16",
  YSRCP: "#f59e0b",
  JDU: "#10b981",
  SHS: "#64748b",
  "SHS(UBT)": "#475569",
  RJD: "#dc2626",
  SAD: "#ca8a04",
  BJD: "#0891b2",
  BRS: "#65a30d",
  LJPRV: "#7e22ce",
  ZPM: "#0d9488",
  NTK: "#b45309",
};

function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "#94a3b8";
}

function WinnerBadge({ party }: { party: string }) {
  return (
    <span
      className="inline-block text-xs font-medium px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: partyColor(party) }}
    >
      {party}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function ResultsView({ data }: { data: ConstituencyHistory }) {
  const chartData = data.elections.map((e) => ({
    year: String(e.year),
    "Vote share (%)": e.vote_share,
    "Margin (%)": e.margin_pct,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold capitalize">{data.constituency}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data.elections.length} general election{data.elections.length !== 1 ? "s" : ""}
          </p>
        </div>
        {data.elections.length > 0 && (
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Latest winner</p>
            <p className="text-sm font-medium">
              {data.elections[data.elections.length - 1]!.winner}
            </p>
            <WinnerBadge party={data.elections[data.elections.length - 1]!.party} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Winner vote share vs margin</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => (typeof v === "number" ? `${v.toFixed(1)}%` : v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Vote share (%)" fill="#f97316" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Margin (%)" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {[...data.elections].reverse().map((e) => (
          <Card key={e.year}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{e.year} General Election</CardTitle>
                <WinnerBadge party={e.party} />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Winner" value={e.winner} />
                <Stat label="Votes" value={e.votes.toLocaleString("en-IN")} />
                <Stat label="Vote share" value={`${e.vote_share.toFixed(1)}%`} />
                <Stat label="Margin" value={e.margin.toLocaleString("en-IN")} />
                <Stat label="Margin %" value={`${e.margin_pct.toFixed(2)}%`} />
                <Stat label="Turnout" value={e.turnout > 0 ? `${e.turnout.toFixed(1)}%` : "N/A"} />
                <Stat label="Candidates" value={String(e.total_candidates)} />
              </div>

              {e.top_candidates.length > 1 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                      Top candidates
                    </p>
                    <div className="flex flex-col gap-1">
                      {e.top_candidates.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: partyColor(c.party) }}
                          />
                          <span className={c.is_winner ? "font-medium" : "text-muted-foreground"}>
                            {c.candidate}
                          </span>
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {c.party}
                          </Badge>
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {c.vote_share.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ConstituencyClient({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [data, setData] = useState<ConstituencyHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectConstituency(name: string) {
    setQuery(name);
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
    setData(null);
    setIsLoading(true);
    getConstituencyHistory(name)
      .then((result) => { setData(result); })
      .catch((e) => { setError(e instanceof Error ? e.message : "Something went wrong."); })
      .finally(() => { setIsLoading(false); });
  }

  // Auto-load from prop passed by the server component (avoids useSearchParams entirely)
  useEffect(() => {
    if (!initialQuery) return;
    setQuery(initialQuery);
    let cancelled = false;
    (async () => {
      try {
        const result = await getConstituencyHistory(initialQuery);
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    setData(null);
    setError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      searchConstituencyNames(value)
        .then((results) => {
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        })
        .catch(() => {
          setSuggestions([]);
          setShowSuggestions(false);
        })
        .finally(() => { setIsSearching(false); });
    }, 250);
  }

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold">Constituency History</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Lok Sabha election results from 2004 to 2019 for any constituency.
        </p>
      </div>

      <div ref={wrapperRef} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={14}
            />
            {isSearching && (
              <Loader2
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
                size={14}
              />
            )}
            <input
              type="text"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder="Type a city or constituency, e.g. Delhi, Bangalore, Varanasi"
              className="w-full pl-8 pr-8 py-2 text-sm border rounded bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {isLoading && (
            <div className="flex items-center px-3">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-20 top-full mt-1 w-full bg-popover border rounded shadow-md max-h-64 overflow-y-auto">
            {suggestions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectConstituency(name)}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && <ResultsView data={data} />}
    </div>
  );
}
