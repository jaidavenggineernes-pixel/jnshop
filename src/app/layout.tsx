import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { AIChatAssistant } from "@/components/ai-chat-assistant";
import { prisma } from "@/lib/prisma";

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
  try {
    categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, slug: true },
    });
  } catch (err) {
    console.error("Failed to load categories in root layout:", err);
  }

  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        <Providers>
          <Navbar categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <AIChatAssistant />
        </Providers>
      </body>
    </html>
  );
}
