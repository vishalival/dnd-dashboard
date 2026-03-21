"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Send, Loader2, MessageSquare, FileText } from "lucide-react";
import { Citation, parseAssistantResponse } from "@/lib/citation-utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  displayText?: string;
  citations?: Citation[];
}

interface NotesChatPanelProps {
  campaignId: string;
  onClose: () => void;
  onCitationClick: (docId: string, quote: string) => void;
}

export function NotesChatPanel({
  campaignId,
  onClose,
  onCitationClick,
}: NotesChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    // Build history from previous messages using displayText (without sources block)
    const history = messages.map(({ role, displayText, content }) => ({
      role,
      content: displayText ?? content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/notes/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          campaignId,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantContent = "";

      // Add empty assistant message to fill via streaming
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantContent += decoder.decode(value, { stream: true });
        const current = assistantContent;
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: current },
        ]);
      }

      // Parse citations from the complete response
      const { text, citations } = parseAssistantResponse(assistantContent);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: assistantContent,
          displayText: text,
          citations,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /** Get the visible text for a message, stripping any <sources> block */
  const getDisplayText = (msg: ChatMessage) => {
    if (msg.displayText != null) return msg.displayText;
    // During streaming, hide partial <sources> tags
    return msg.content.split("<sources>")[0];
  };

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 384, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="shrink-0 border-l border-white/[0.06] flex flex-col h-full overflow-hidden bg-zinc-950/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-orange-400" />
          <h3 className="text-sm font-semibold text-zinc-200">
            Ask about your notes
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center px-4">
            <MessageSquare className="h-8 w-8 mb-3 text-zinc-600" />
            <p className="text-sm">
              Ask anything about your campaign notes. I&apos;ll search across
              all your documents to find the answer.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-orange-500/10 border border-orange-500/20 text-zinc-200"
                  : "bg-white/[0.04] border border-white/[0.06] text-zinc-300"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {getDisplayText(msg)}
                {msg.role === "assistant" && !msg.content && isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                )}
              </div>

              {/* Citation pills */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/[0.06]">
                  {msg.citations.map((cite, j) => (
                    <button
                      key={j}
                      onClick={() => onCitationClick(cite.docId, cite.quote)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
                        bg-orange-500/10 border border-orange-500/20 text-orange-300
                        hover:bg-orange-500/20 hover:text-orange-200 transition-colors
                        cursor-pointer"
                      title={`"${cite.quote}"`}
                    >
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {cite.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-white/[0.06]"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your notes..."
            disabled={isLoading}
            className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
