"use server";

import { chat } from "@/lib/api";
import { getBackendAuthHeader } from "@/lib/auth";

export async function sendMessage(
  message: string,
  sessionId: string
): Promise<{ response: string; agent: string }> {
  const authHeader = await getBackendAuthHeader();
  return chat({ message, session_id: sessionId }, authHeader);
}
