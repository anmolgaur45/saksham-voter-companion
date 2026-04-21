"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CitationCard } from "@/components/CitationCard";
import type { Citation } from "@/lib/api";
import { sendMessage } from "./actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

export default function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(crypto.randomUUID());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await sendMessage(text, sessionId.current);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.response, citations: res.citations },
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
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Saksham</h1>

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
            <span
              className={`inline-block px-3 py-2 rounded-lg max-w-[80%] text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.content}
            </span>
            {msg.role === "assistant" &&
              msg.citations &&
              msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 max-w-[80%]">
                  {msg.citations.map((c, j) => (
                    <CitationCard key={j} citation={c} />
                  ))}
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
