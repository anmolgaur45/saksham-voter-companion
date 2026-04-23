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
  error?: string;
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
