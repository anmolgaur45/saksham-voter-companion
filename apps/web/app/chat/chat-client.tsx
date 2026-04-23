"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LanguageToggle } from "@/components/LanguageToggle";
import { VoicePlayButton } from "@/components/VoicePlayButton";
import type { Citation } from "@/lib/api";
import { sendMessage } from "./actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  booth_query?: string;
  grounded?: boolean;
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const sessionId = useRef(crypto.randomUUID());

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
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Saksham</h1>
        <LanguageToggle onChange={setLanguage} />
      </div>

      <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center mt-8 text-sm">
            Ask me anything about Indian elections.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-3 flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            {msg.role === "user" ? (
              <span className="inline-block px-3 py-2 rounded-lg max-w-[80%] text-sm bg-primary text-primary-foreground">
                {msg.content}
              </span>
            ) : (
              <div className="px-3 py-2 rounded-lg max-w-[80%] text-sm bg-muted [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            )}
            {msg.role === "assistant" && (
              <div className="flex flex-col gap-1 max-w-[80%]">
                {msg.grounded === true && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Sourced from official ECI documents
                  </p>
                )}
                {msg.booth_query && (
                  <Link
                    href={`/booth?q=${msg.booth_query}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-primary underline underline-offset-2"
                  >
                    View on map →
                  </Link>
                )}
                <VoicePlayButton text={msg.content} language={language} />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-3">
            <span className="inline-block px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm">
              Thinking…
            </span>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about voter registration, polling booths…"
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
