const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export interface ChatRequest {
  message: string;
  session_id: string;
  language?: string;
  agent_override?: string;
}

export interface Citation {
  title: string | null;
  url: string | null;
}

export interface ChatResponse {
  response: string;
  agent: string;
  citations: Citation[];
  booth_query?: string;
  verdict?: string;
  grounded?: boolean;
}

export interface Booth {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface BoothData {
  id: string;
  name: string;
  state: string;
  center: { lat: number; lng: number };
  booths: Booth[];
}

export interface TimelinePhase {
  id: string;
  title: string;
  short_description: string;
  duration: string | null;
  what_happens: string;
  what_citizens_can_do: string[];
  what_is_restricted: string[];
  icon_name: string;
  source_citation: string | null;
}

export interface CandidateResult {
  candidate: string;
  party: string;
  votes: number;
  vote_share: number;
  is_winner: boolean;
}

export interface ElectionYear {
  year: number;
  winner: string;
  party: string;
  votes: number;
  vote_share: number;
  margin: number;
  margin_pct: number;
  turnout: number;
  total_candidates: number;
  top_candidates: CandidateResult[];
}

export interface ConstituencyHistory {
  constituency: string;
  elections: ElectionYear[];
}

async function backendFetch(
  path: string,
  options: RequestInit,
  authHeader?: string
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (authHeader) headers["Authorization"] = authHeader;
  return fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}

export async function chat(
  req: ChatRequest,
  authHeader?: string
): Promise<ChatResponse> {
  const res = await backendFetch("/api/chat", { method: "POST", body: JSON.stringify(req) }, authHeader);
  if (!res.ok) throw new Error(`backend error: ${res.status}`);
  return res.json() as Promise<ChatResponse>;
}

export async function fetchBooth(
  query: string,
  authHeader?: string
): Promise<BoothData> {
  const res = await backendFetch(
    `/api/booth?q=${encodeURIComponent(query)}`,
    { method: "GET" },
    authHeader
  );
  if (!res.ok) throw new Error(`backend error: ${res.status}`);
  return res.json() as Promise<BoothData>;
}

export async function fetchTts(
  text: string,
  language: string,
  authHeader?: string
): Promise<string> {
  const res = await backendFetch(
    "/api/tts",
    { method: "POST", body: JSON.stringify({ text, language }) },
    authHeader
  );
  if (!res.ok) throw new Error(`tts error: ${res.status}`);
  const data = await res.json() as { audio: string };
  return data.audio;
}

export async function fetchTimeline(
  lang = "en",
  authHeader?: string
): Promise<TimelinePhase[]> {
  const path = lang === "en" ? "/api/timeline" : `/api/timeline?lang=${lang}`;
  const res = await backendFetch(path, { method: "GET" }, authHeader);
  if (!res.ok) throw new Error(`backend error: ${res.status}`);
  return res.json() as Promise<TimelinePhase[]>;
}

export async function searchConstituencies(
  q: string,
  authHeader?: string
): Promise<string[]> {
  if (!q.trim()) return [];
  const res = await backendFetch(
    `/api/constituency/search?q=${encodeURIComponent(q)}`,
    { method: "GET" },
    authHeader
  );
  if (!res.ok) return [];
  return res.json() as Promise<string[]>;
}

export async function fetchConstituencyHistory(
  pcName: string,
  authHeader?: string
): Promise<ConstituencyHistory> {
  const res = await backendFetch(
    `/api/constituency/${encodeURIComponent(pcName)}/history`,
    { method: "GET" },
    authHeader
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { detail?: string };
    throw new Error(err.detail ?? `backend error: ${res.status}`);
  }
  return res.json() as Promise<ConstituencyHistory>;
}

export async function translateTexts(
  texts: string[],
  lang: string,
  authHeader?: string
): Promise<string[]> {
  if (lang === "en" || texts.length === 0) return texts;
  const res = await backendFetch(
    "/api/translate",
    { method: "POST", body: JSON.stringify({ texts, lang }) },
    authHeader
  );
  if (!res.ok) return texts;
  const data = await res.json() as { translated: string[] };
  return data.translated;
}
