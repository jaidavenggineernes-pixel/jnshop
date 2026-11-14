"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
  Send,
  MessageCircle,
  ExternalLink,
  ShoppingBag,
  RefreshCw,
  HelpCircle,
  Check,
  MessageSquare,
} from "lucide-react";
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
  recommendedProducts?: RecommendedProduct[];
  actionSuggestions?: string[];
}

export function AIChatAssistant({ storeSetting }: { storeSetting?: any }) {
  const pathname = usePathname();
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const cleanWa = (storeSetting?.whatsappNumber || "6285191219129").replace(/\D/g, "");
  const storeTitle = storeSetting?.storeName || "JNshop";

  const initialMessage: Message = {
    id: "initial-1",
    sender: "assistant",
    text: `Halo. Ada pertanyaan seputar spesifikasi produk ${storeTitle}, kompatibilitas perangkat, atau status lisensi digital?`,
    timestamp: new Date(),
    actionSuggestions: [
      "Rekomendasi laptop stand",
      "Beda switch keyboard mekanikal",
      "Info kupon diskon aktif",
      "Garansi dan retur barang",
    ],
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const handleCustomOpen = (event: any) => {
      setIsOpen(true);
      if (event.detail?.prompt) {
        setTimeout(() => {
          handleSendMessage(event.detail.prompt);
        }, 120);
      }
    };

    window.addEventListener("jnshop-open-ai", handleCustomOpen);
    return () => window.removeEventListener("jnshop-open-ai", handleCustomOpen);
  }, [messages, loading]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt ?? input).trim();
    if (!textToSend || loading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    const nextHistory = [...messages, userMessage].map((m) => ({
      role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengambil jawaban");
      }

      const data = await res.json();
      const replyText =
        data.reply ||
        "Maaf, silakan hubungi WhatsApp toko untuk informasi lebih lanjut.";

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: "assistant",
          text: replyText,
          timestamp: new Date(),
          recommendedProducts: data.recommendedProducts || [],
          actionSuggestions: data.actionSuggestions || [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: `Maaf, layanan pencari produk sedang sibuk. Silakan hubungi WhatsApp resmi di +${cleanWa}.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAddCart = (prod: RecommendedProduct) => {
    addItem(
      {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        price: prod.price,
        discountPrice: prod.discountPrice,
        stock: prod.stock,
        isPhysical: prod.isPhysical,
        images: [{ url: prod.imageUrl || "/placeholder.png", isPrimary: true }],
      },
      undefined,
      1
    );
    setAddedProductId(prod.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <>
      {/* Desktop-only unobtrusive support trigger; on mobile accessible via /help and Product page */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka panduan tanya produk"
          className="hidden sm:inline-flex fixed bottom-5 right-5 z-40 items-center gap-2 px-4 min-h-[44px] rounded-lg bg-zinc-900 hover:bg-green-800 text-white border border-zinc-700 shadow-lg transition-colors text-xs font-semibold"
        >
          <MessageSquare className="w-4 h-4 text-green-400" />
          <span>Tanya Produk</span>
        </button>
      )}

      {/* Assistant Dialog Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Panduan Produk JNshop"
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[400px] h-[540px] max-h-[82vh] bg-white rounded-xl shadow-2xl border border-zinc-300 flex flex-col overflow-hidden z-50"
        >
          {/* Header */}
          <div className="bg-zinc-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-800 text-white flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-sm leading-tight">
                  Tanya Produk {storeTitle}
                </h2>
                <p className="text-[11px] text-zinc-300">
                  Panduan spesifikasi & katalog
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([initialMessage])}
                aria-label="Ulangi percakapan"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup panel tanya produk"
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Direct WhatsApp Shortcut Bar */}
          <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs">
            <span className="text-zinc-600 font-medium">Butuh respon admin langsung?</span>
            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Halo ${storeTitle}, saya ingin bertanya tentang produk.`)}`}
              target="_blank"
              rel="noreferrer"
              className="text-green-800 hover:text-green-900 font-semibold inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat WhatsApp</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-900 border border-zinc-200"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-200 space-y-2">
                      <p className="text-[11px] font-semibold text-zinc-700">
                        Produk Terkait:
                      </p>
                      {msg.recommendedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          className="bg-white rounded-lg p-2 border border-zinc-200 flex items-center gap-2.5"
                        >
                          <img
                            src={prod.imageUrl || "/placeholder.png"}
                            alt={prod.name}
                            className="w-10 h-10 rounded-md object-cover bg-zinc-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${prod.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="text-xs font-semibold text-zinc-900 hover:text-green-800 block truncate"
                            >
                              {prod.name}
                            </Link>
                            <span className="text-xs font-bold text-zinc-900 tabular-nums">
                              {formatRupiah(prod.discountPrice || prod.price)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleQuickAddCart(prod)}
                            disabled={prod.stock === 0}
                            aria-label={`Tambah ${prod.name} ke keranjang`}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              addedProductId === prod.id
                                ? "bg-green-800 text-white"
                                : "bg-zinc-900 hover:bg-green-800 text-white"
                            }`}
                          >
                            {addedProductId === prod.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <ShoppingBag className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === "assistant" &&
                  msg.actionSuggestions &&
                  msg.actionSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.actionSuggestions.map((sugg, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(sugg)}
                          className="text-xs px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 hover:text-zinc-900 hover:border-zinc-400 transition-colors"
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="bg-zinc-100 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-600">
                  Mencari informasi produk...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2"
          >
            <label htmlFor="product-assistant-input" className="sr-only">
              Tulis pertanyaan produk
            </label>
            <input
              id="product-assistant-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan produk..."
              disabled={loading}
              className="flex-1 h-10 bg-zinc-50 border border-zinc-200 rounded-lg px-3 text-sm text-zinc-900 placeholder:text-zinc-600 focus:outline-none focus:bg-white focus:border-green-800"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Kirim pertanyaan"
              className="w-10 h-10 bg-zinc-900 hover:bg-green-800 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
