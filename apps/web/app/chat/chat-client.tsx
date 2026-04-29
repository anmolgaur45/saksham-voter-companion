"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VoicePlayButton } from "@/components/VoicePlayButton";
import { useLanguage } from "@/components/LanguageContext";
import { useI18n } from "@/lib/useI18n";
import type { Citation } from "@/lib/api";
import { sendMessage } from "./actions";

const AGENT_LABELS: Record<string, string> = {
  knowledge: "Knowledge Agent",
  locator: "Locator Agent",
  verifier: "Verifier Agent",
  journey: "Journey Agent",
  orchestrator: "Orchestrator",
};

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  booth_query?: string;
  grounded?: boolean;
  agent?: string;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const searchParams = useSearchParams();
  const [input, setInput] = useState(() => searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const sessionId = useRef(crypto.randomUUID());
  const t = useI18n({
    emptyState: "Ask me anything about Indian elections.",
    placeholder: "Ask about voter registration, polling booths…",
    send: "Send",
    thinking: "Thinking…",
    sourcedFromECI: "Sourced from official ECI documents",
    viewOnMap: "View on map →",
    errorMsg: "Something went wrong. Please try again.",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await sendMessage(text, sessionId.current, language);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.response,
          citations: res.citations,
          booth_query: res.booth_query,
          grounded: res.grounded,
          agent: res.agent,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t.errorMsg },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4 py-4">
      <ScrollArea className="flex-1 min-h-0 border rounded-lg p-4 mb-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center mt-8 text-sm">
            {t.emptyState}
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            {msg.role === "user" ? (
              <span className="inline-block px-3 py-2 rounded-lg max-w-[80%] text-sm bg-primary text-primary-foreground">
                {msg.content}
              </span>
            ) : (
              <>
                {msg.agent && (
                  <span className="text-[10px] font-medium text-muted-foreground mb-1 ml-0.5 uppercase tracking-wide">
                    {AGENT_LABELS[msg.agent] ?? msg.agent}
                  </span>
                )}
                <div className="px-3 py-2 rounded-lg max-w-[80%] text-sm bg-muted [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </>
            )}
            {msg.role === "assistant" && (
              <div className="flex items-center gap-2 mt-1 ml-0.5">
                {msg.grounded === true && (
                  <span className="text-xs text-muted-foreground">
                    {t.sourcedFromECI}
                  </span>
                )}
                {msg.booth_query && (
                  <Link
                    href={`/booth?q=${msg.booth_query}`}
                    className="text-xs text-primary underline underline-offset-2"
                  >
                    {t.viewOnMap}
                  </Link>
                )}
                <VoicePlayButton text={msg.content} language={language} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <span className="inline-block px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
              {t.thinking}
            </span>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.placeholder}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          {t.send}
        </Button>
      </form>
    </div>
  );
}
