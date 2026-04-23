"use server";

import { chat, fetchBooth, fetchConstituencyHistory, fetchTimeline, fetchTts, searchConstituencies, translateTexts as apiBatchTranslate } from "@/lib/api";
import type { BoothData, ChatResponse, ConstituencyHistory, TimelinePhase } from "@/lib/api";
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

export async function getTimeline(lang = "en"): Promise<TimelinePhase[]> {
  const authHeader = await getBackendAuthHeader();
  return fetchTimeline(lang, authHeader);
}

export async function translateContent(texts: string[], lang: string): Promise<string[]> {
  const authHeader = await getBackendAuthHeader();
  return apiBatchTranslate(texts, lang, authHeader);
}

export async function getConstituencyHistory(pcName: string): Promise<ConstituencyHistory> {
  const authHeader = await getBackendAuthHeader();
  return fetchConstituencyHistory(pcName, authHeader);
}

export async function searchConstituencyNames(q: string): Promise<string[]> {
  const authHeader = await getBackendAuthHeader();
  return searchConstituencies(q, authHeader);
}
