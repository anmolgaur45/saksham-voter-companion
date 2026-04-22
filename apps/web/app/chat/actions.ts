"use server";

import { chat, fetchBooth, fetchTts } from "@/lib/api";
import type { BoothData, ChatResponse } from "@/lib/api";
import { getBackendAuthHeader } from "@/lib/auth";

export async function sendMessage(
  message: string,
  sessionId: string,
  language: string = "en",
  agentOverride?: string
): Promise<ChatResponse> {
  const authHeader = await getBackendAuthHeader();
  return chat(
    { message, session_id: sessionId, language, agent_override: agentOverride },
    authHeader
  );
}

export async function searchBooth(query: string): Promise<BoothData> {
  const authHeader = await getBackendAuthHeader();
  return fetchBooth(query, authHeader);
}

export async function synthesizeSpeech(
  text: string,
  language: string
): Promise<string> {
  const authHeader = await getBackendAuthHeader();
  return fetchTts(text, language, authHeader);
}
