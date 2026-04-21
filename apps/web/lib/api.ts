const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ChatResponse {
  response: string;
  agent: string;
}

export interface Citation {
  title: string;
  page: number | null;
  url: string | null;
}

export async function chat(
  req: ChatRequest,
  authHeader?: string
): Promise<ChatResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authHeader) headers["Authorization"] = authHeader;

  const res = await fetch(`${BACKEND_URL}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(req),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`backend error: ${res.status}`);
  return res.json() as Promise<ChatResponse>;
}
