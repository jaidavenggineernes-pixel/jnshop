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
  ArrowRight,
  Zap,
  Check,
} from "lucide-react";
import Link from "next/link";
import { formatRupiah } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string;
  categoryName: string;
  isPhysical: boolean;
  stock: number;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  source?: "gemini" | "intelligent-local";
  recommendedProducts?: RecommendedProduct[];
  actionSuggestions?: string[];
  isTyping?: boolean;
}

export function AIChatAssistant() {
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      sender: "assistant",
      text: "Halo! Selamat datang di JNshop. 😊 Saya asisten belanja personal Anda di sini. Ada yang bisa saya bantu terkait ukuran laptop stand, tipe switch keyboard, klaim lisensi produk digital, atau rekomendasi sesuai budget belanja Anda?",
      timestamp: new Date(),
      source: "intelligent-local",
      actionSuggestions: [
        "💻 Stand muat MacBook 16\"?",
        "⌨️ Beda Red vs Brown Switch",
        "🎟️ Kupon Diskon Aktif",
        "🚚 Garansi Retur 7 Hari",
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Listen to global open AI event from product detail page or anywhere
  useEffect(() => {
    const handleCustomOpen = (event: any) => {
      setIsOpen(true);
      if (event.detail?.prompt) {
        setTimeout(() => {
          handleSendMessage(event.detail.prompt);
        }, 200);
      }
    };

    window.addEventListener("jnshop-open-ai", handleCustomOpen);
    return () => {
      window.removeEventListener("jnshop-open-ai", handleCustomOpen);
    };
  }, [messages, loading]);

  // Stream text word-by-word into message to deliver authentic real-time AI feel
  const streamBotResponse = (
    fullText: string,
    meta: {
      source?: "gemini" | "intelligent-local";
      recommendedProducts?: RecommendedProduct[];
      actionSuggestions?: string[];
    }
  ) => {
    const messageId = `ai-${Date.now()}`;
    const words = fullText.split(" ");
    let currentWordIndex = 0;

    // Create placeholder message
    setMessages((prev) => [
      ...prev,
      {
        id: messageId,
        sender: "assistant",
        text: words[0] || "",
        timestamp: new Date(),
        source: meta.source,
        recommendedProducts: meta.recommendedProducts,
        actionSuggestions: meta.actionSuggestions,
        isTyping: true,
      },
    ]);

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      currentWordIndex++;
      if (currentWordIndex >= words.length) {
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        // Mark typing finished
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, text: fullText, isTyping: false } : m
          )
        );
      } else {
        const partialText = words.slice(0, currentWordIndex + 1).join(" ");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, text: partialText } : m
          )
        );
      }
    }, 28);
  };

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
      const history = messages
        .filter((m) => !m.isTyping)
        .map((m) => ({
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
      const replyText =
        data.reply ||
        "Maaf, saya sedang memproses terlalu banyak permintaan. Silakan tanyakan kembali!";

      streamBotResponse(replyText, {
        source: data.source,
        recommendedProducts: data.recommendedProducts,
        actionSuggestions: data.actionSuggestions,
      });
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: "assistant",
          text: "Maaf, terjadi gangguan sesaat. Anda juga bisa langsung chat dengan Admin via WhatsApp di tombol bawah ini.",
          timestamp: new Date(),
          source: "intelligent-local",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartQuick = (prod: RecommendedProduct) => {
    addItem(
      {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        discountPrice: prod.discountPrice,
        isPhysical: prod.isPhysical,
        stock: prod.stock,
        images: prod.imageUrl ? [{ url: prod.imageUrl }] : [],
      },
      null,
      1
    );

    setAddedProductId(prod.id);
    setTimeout(() => setAddedProductId(null), 2000);
  };

  // Convert markdown links [Text](/url) into clickable Next Links
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
          onClick={() => {
            if (url.startsWith("/products/") || url.startsWith("/cart") || url.startsWith("/checkout")) {
              setIsOpen(false);
            }
          }}
          className="text-blue-600 font-bold underline underline-offset-2 hover:text-blue-800"
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
      <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
        {parts.map((p, i) => (typeof p === "string" ? <span key={i}>{p}</span> : p))}
      </div>
    );
  };

  // Extract latest dynamic suggestions from last assistant message
  const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === "assistant");
  const activeSuggestions = lastAssistantMsg?.actionSuggestions || [
    "🔥 Produk Terlaris",
    "💻 Laptop stand muat 16 inch?",
    "🎟️ Kupon Diskon yang Aktif",
  ];

  return (
    <>
      {/* Floating Trigger Button (Positioned safely above mobile bottom bar) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="ai-floating-btn flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-[#1c1917] hover:bg-stone-800 text-[#faf9f6] border border-stone-700 font-bold text-xs sm:text-sm shadow-xl hover:scale-103 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <span className="tracking-wide">Asisten Toko</span>
          </button>
        </div>
      )}

      {/* Responsive Chat Modal (Native Bottom Sheet on Mobile, Floating Card on Desktop) */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:bottom-6 sm:right-6 sm:inset-x-auto z-50 w-full sm:w-96 md:w-[420px] h-[92vh] sm:h-[580px] bg-[#faf9f6] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-4 bg-[#1c1917] text-[#faf9f6] flex flex-col shrink-0 border-b border-stone-800">
            {/* Mobile Sheet Handle */}
            <div className="w-10 h-1 bg-stone-700 rounded-full mx-auto sm:hidden mb-2.5" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-amber-300 border border-stone-700 shadow-inner">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm leading-tight text-white">
                    <span>JNshop Concierge</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mt-0.5">
                    <span>Asisten Belanja Personal • Ramah & Sigap</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: `res-${Date.now()}`,
                        sender: "assistant",
                        text: "Percakapan telah direset. Silakan tanyakan seputar produk, spesifikasi, atau promo yang Anda minati! 😊",
                        timestamp: new Date(),
                        source: "intelligent-local",
                        actionSuggestions: [
                          "💻 Stand muat MacBook 16\"?",
                          "⌨️ Beda Red vs Brown Switch",
                          "🎟️ Kupon Diskon Aktif",
                        ],
                      },
                    ])
                  }
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  title="Reset Percakapan"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Action Suggested Chips */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs shrink-0">
            {activeSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion.replace(/^[^\w\s]+/, "").trim())}
                disabled={loading}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 font-medium whitespace-nowrap transition-all text-[11px] shadow-2xs active:scale-95 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "assistant" && (
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[88%] space-y-2.5`}>
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-xs shadow-sm"
                        : "bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-sm"
                    }`}
                  >
                    {renderMessageContent(m.text)}

                    {m.isTyping && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-blue-500 animate-pulse align-middle" />
                    )}

                    <div
                      className={`text-[9px] mt-1.5 flex items-center justify-between gap-2 ${
                        m.sender === "user" ? "text-blue-200" : "text-slate-400"
                      }`}
                    >
                      {m.sender === "assistant" && (
                        <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-1">
                          {m.source === "gemini" ? (
                            <>
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>Gemini 2.5</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-2.5 h-2.5 text-blue-500" />
                              <span>Live Engine</span>
                            </>
                          )}
                        </span>
                      )}
                      <span>
                        {new Intl.DateTimeFormat("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(m.timestamp))}
                      </span>
                    </div>
                  </div>

                  {/* Rich Product Recommendation Cards attached to message */}
                  {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                    <div className="space-y-2 pt-0.5">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                        <span>Rekomendasi Produk Terkait:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {m.recommendedProducts.map((p) => {
                          const isJustAdded = addedProductId === p.id;
                          return (
                            <div
                              key={p.id}
                              className="p-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3 hover:border-blue-300 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {p.imageUrl ? (
                                  <img
                                    src={p.imageUrl}
                                    alt={p.name}
                                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 shrink-0"
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-5 h-5 text-slate-400" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <Link
                                    href={`/products/${p.slug}`}
                                    onClick={() => setIsOpen(false)}
                                    className="font-bold text-xs text-slate-900 hover:text-blue-600 truncate block leading-tight"
                                  >
                                    {p.name}
                                  </Link>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="font-extrabold text-blue-600 text-xs">
                                      {formatRupiah(p.discountPrice || p.price)}
                                    </span>
                                    {p.discountPrice && (
                                      <span className="text-[10px] text-slate-400 line-through">
                                        {formatRupiah(p.price)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAddToCartQuick(p)}
                                  className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                    isJustAdded
                                      ? "bg-emerald-600 text-white"
                                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                  }`}
                                  title="Tambahkan ke Keranjang"
                                >
                                  {isJustAdded ? (
                                    <Check className="w-3.5 h-3.5" />
                                  ) : (
                                    <ShoppingBag className="w-3.5 h-3.5" />
                                  )}
                                </button>
                                <Link
                                  href={`/products/${p.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                                  title="Buka Halaman Detail"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
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
                <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse delay-150"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse delay-300"></span>
                  <span className="text-slate-600 text-xs font-medium ml-1">
                    JNshop AI sedang mengetik...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* WhatsApp Escalation Bar */}
          <div className="bg-emerald-50 border-t border-emerald-100 px-3 py-2 flex items-center justify-between text-xs shrink-0">
            <span className="text-emerald-800 font-medium flex items-center gap-1 text-[11px]">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Butuh bantuan manusia langsung?</span>
            </span>
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20JNshop,%20saya%20butuh%20bantuan%20terkait%20pesanan%20saya"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] transition-colors"
            >
              <span>WhatsApp Admin</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Tanya spek, switch, ukuran, promo, atau pesanan..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-100 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
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
