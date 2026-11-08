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
  title: "JNshop — Toko Online Pribadi & Produk Digital Resmi",
  description:
    "Platform e-commerce modern resmi JNshop. Menjual kebutuhan workstation, gadget, apparel, produk digital, dan jasa konsultasi profesional dengan AI Shopping Assistant.",
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
      <body className="min-h-full flex flex-col bg-[#faf9f6] text-stone-900 font-sans selection:bg-stone-900 selection:text-amber-100">
        <Providers>
          <Navbar categories={categories} storeSetting={storeSetting} />
          <main className="flex-1 pb-16 sm:pb-0">{children}</main>
          <Footer storeSetting={storeSetting} />
          <CartDrawer />
          <AIChatAssistant storeSetting={storeSetting} />
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
