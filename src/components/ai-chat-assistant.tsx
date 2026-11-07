"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  X,
  Send,
  MessageCircle,
  ExternalLink,
  Bot,
  User,
  ShoppingBag,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}

export function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      sender: "assistant",
      text: "Halo! Saya **JNshop AI**, asisten belanja pintar Anda. Ada produk fisik, digital, atau layanan yang ingin Anda tanyakan hari ini? 🌟",
      timestamp: new Date(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
      history.push({ role: "user", content: textToSend });

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        throw new Error("AI request failed");
      }

      const data = await res.json();
      const aiReply: Message = {
        id: `ai-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "Maaf, saya sedang mengalami kendala jaringan. Silakan coba lagi.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "assistant",
          text: "Maaf, terjadi gangguan sesaat. Anda juga bisa langsung chat dengan Admin via WhatsApp di tombol bawah ini.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Convert simple markdown links [Text](/url) into clickable Next Links
  const renderMessageContent = (text: string) => {
    const parts = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      parts.push(
        <Link
          key={`${url}-${match.index}`}
          href={url}
          className="text-blue-600 font-semibold underline underline-offset-2 hover:text-blue-800"
        >
          {label}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-sm">
        {parts.map((p, i) => (typeof p === "string" ? <span key={i}>{p}</span> : p))}
      </div>
    );
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="ai-floating-btn flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-bold text-sm shadow-xl shadow-blue-500/30 hover:opacity-95 transition-all cursor-pointer group"
          >
            <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="tracking-wide">Tanya JNshop AI</span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm leading-tight">
                  <span>JNshop AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[11px] text-blue-100">Didukung Gemini & Live Database</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: "res-1",
                      sender: "assistant",
                      text: "Percakapan telah direset. Ada yang bisa JNshop AI bantu lagi? 😊",
                      timestamp: new Date(),
                    },
                  ])
                }
                className="p-1.5 rounded-lg hover:bg-white/10 text-blue-100 hover:text-white transition-colors"
                title="Reset Percakapan"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-blue-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              onClick={() => handleSendMessage("Rekomendasikan produk terlaris di JNshop")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 text-slate-700 font-medium whitespace-nowrap transition-colors"
            >
              🔥 Produk Terlaris
            </button>
            <button
              onClick={() => handleSendMessage("Bagaimana cara memesan dan metode pembayaran apa saja?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 text-slate-700 font-medium whitespace-nowrap transition-colors"
            >
              💳 Cara Bayar
            </button>
            <button
              onClick={() => handleSendMessage("Produk digital pengirimannya seperti apa?")}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-400 text-slate-700 font-medium whitespace-nowrap transition-colors"
            >
              ⚡ Produk Digital
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    m.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-sm shadow-sm"
                      : "bg-white border border-slate-200/80 text-slate-800 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {renderMessageContent(m.text)}
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      m.sender === "user" ? "text-blue-200" : "text-slate-400"
                    }`}
                  >
                    {new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(
                      new Date(m.timestamp)
                    )}
                  </div>
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs py-1">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl px-3 py-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse delay-300"></span>
                  <span className="text-slate-500 font-medium ml-1">JNshop AI sedang mengetik...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Escalation Bar */}
          <div className="bg-emerald-50 border-t border-emerald-100 px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-emerald-800 font-medium flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              Butuh bantuan pemilik toko?
            </span>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20JNshop,%20saya%20butuh%20bantuan%20terkait%20pesanan%20saya"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition-colors"
            >
              <span>Chat WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanya harga, spesifikasi, atau pesanan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
