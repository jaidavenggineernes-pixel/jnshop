import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { AIChatAssistant } from "@/components/ai-chat-assistant";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "JNshop - Toko Workstation & Produk Digital Terkurasi",
  description:
    "Katalog independen JNshop untuk perlengkapan workstation, aksesori meja kerja, perangkat lunak resmi, dan produk digital siap pakai.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: any[] = [];
  let storeSetting: any = null;

  try {
    const [cats, setting] = await Promise.all([
      prisma.category.findMany({
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true, slug: true },
      }),
      prisma.storeSetting.findUnique({
        where: { id: "default" },
      }),
    ]);
    categories = cats;
    storeSetting = setting;
  } catch (err) {
    console.error("Failed to load layout data:", err);
  }

  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-white text-zinc-900 font-sans selection:bg-green-800 selection:text-white">
        <Providers>
          <Navbar categories={categories} storeSetting={storeSetting} />
          <main className="flex-1 pb-20 sm:pb-0">{children}</main>
          <Footer storeSetting={storeSetting} />
          <CartDrawer />
          <AIChatAssistant storeSetting={storeSetting} />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
