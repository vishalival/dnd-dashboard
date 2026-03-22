"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Loader2,
  Sparkles,
  User,
  ScrollText,
  Swords,
  Users,
  BookOpen,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Citation,
  parseAssistantResponse,
  parseCiteUri,
} from "@/lib/citation-utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  displayText?: string;
  citations?: Citation[];
}

interface NotesChatPanelProps {
  campaignId: string;
  onCitationClick: (docId: string, quote: string) => void;
}

const SUGGESTIONS = [
  { icon: ScrollText, text: "Recap last session's events" },
  { icon: Swords, text: "What unresolved plot hooks remain?" },
  { icon: Users, text: "How are these NPCs connected?" },
];

export function NotesChatPanel({
  campaignId,
  onCitationClick,
}: NotesChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const history = messages.map(({ role, displayText, content }) => ({
      role,
      content: displayText ?? content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const getDisplayText = (msg: ChatMessage) => {
    if (msg.displayText != null) return msg.displayText;
    return msg.content.split("<sources>")[0];
  };

  const isStreaming = (msg: ChatMessage) =>
    msg.role === "assistant" && !msg.displayText && isLoading;

  return (
    <div className="w-[400px] shrink-0 border-l border-white/[0.06] flex flex-col h-full overflow-hidden bg-zinc-950/50">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        <div className="p-1 rounded-md bg-orange-500/10">
          <Sparkles className="h-3.5 w-3.5 text-orange-400" />
        </div>
        <h3 className="text-sm font-heading font-semibold text-zinc-200">
          The Lorekeep
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
              <BookOpen className="h-6 w-6 text-orange-400" />
            </div>
            <h4 className="text-sm font-heading font-semibold text-zinc-200 mb-1.5">
              Consult the Lorekeep
            </h4>
            <p className="text-xs text-zinc-500 mb-6 max-w-[260px]">
              Seek knowledge from your campaign tomes. The Lorekeep shall
              scour your scrolls and reveal what lies within.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[280px]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => handleSuggestionClick(s.text)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left
                    bg-white/[0.03] border border-white/[0.06] text-zinc-400
                    hover:text-orange-300 hover:border-orange-500/20 hover:bg-orange-500/[0.04]
                    transition-colors text-xs"
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            {/* Avatar */}
            <div
              className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                msg.role === "user"
                  ? "bg-orange-500/15"
                  : "bg-blue-500/15"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-3 w-3 text-orange-400" />
              ) : (
                <Sparkles className="h-3 w-3 text-blue-400" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-orange-500/10 border border-orange-500/20 text-zinc-200"
                  : "bg-white/[0.04] border border-white/[0.06] text-zinc-300"
              }`}
            >
              {msg.role === "assistant" && !isStreaming(msg) ? (
                <div className="prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    urlTransform={(url) => url}
                    components={{
                      a: ({ href, children }) => {
                        const cite = href ? parseCiteUri(href) : null;
                        if (cite) {
                          return (
                            <button
                              onClick={() => {
                                console.log("[CITE CLICK]", { docId: cite.docId, quote: cite.quote, href });
                                onCitationClick(cite.docId, cite.quote);
                              }}
                              className="text-orange-300 hover:text-orange-200 underline decoration-orange-500/40 hover:decoration-orange-400/60 transition-colors cursor-pointer"
                              title={`Source: "${cite.quote}"`}
                            >
                              {children}
                            </button>
                          );
                        }
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        );
                      },
                      code: ({ children }) => (
                        <code className="bg-white/[0.08] px-1 py-0.5 rounded text-orange-300 text-xs">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-white/[0.06] border border-white/[0.06] rounded-lg p-3 overflow-x-auto text-xs">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {getDisplayText(msg)}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {getDisplayText(msg)}
                  {msg.role === "assistant" && !msg.content && isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                  )}
                </div>
              )}

            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resetTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="What knowledge do you seek..."
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500/30 disabled:opacity-50 resize-none min-h-[36px] max-h-[120px] scrollbar-thin"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        <p className="text-[10px] text-zinc-600 mt-1.5 px-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
