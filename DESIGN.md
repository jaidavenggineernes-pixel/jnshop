# JNshop Design System: Crisp Independent Studio

**Reading this as:** A calm, utilitarian independent studio catalog (`ENERGY: 3`, `RHYTHM: 4`, `MOTION: 2`). High-contrast white canvas with precision charcoal ink, cool studio zinc borders, and a single forest green accent. Every page from storefront to admin console uses one unified design language.

## 1. Visual Dials
- **ENERGY (3/5):** Structured clarity over visual noise. Clean whitespace, sharp typographic hierarchy, zero pulsing status dots, zero floating marketing badges.
- **RHYTHM (4/5):** Intentional visual variety across sections: asymmetric hero split, 4-column visual card grid, full-width horizontal category band, and 2-column technical spec list for new releases.
- **MOTION (2/5):** Fast 150ms color and border transitions only. No infinite keyframe breathing animations, no fake typing timers, full `@media (prefers-reduced-motion: reduce)` respect.

## 2. Color Tokens & Verified WCAG AA Pairs
Strict palette: 2 core neutrals (canvas white + charcoal ink) + 1 accent (forest green). Semantic states only for real warnings/errors/confirmations.

| Token | Hex / Tailwind | Usage | Contrast Verified |
| :--- | :--- | :--- | :--- |
| Canvas | `#ffffff` (`bg-white`) | Page & card surface | Base |
| Surface Subtle | `#f4f4f5` (`bg-zinc-100`) / `#fafafa` (`bg-zinc-50`) | Image frames, table headers, input backgrounds | Base |
| Primary Ink | `#18181b` (`text-zinc-900`) | Headings, titles, prices, primary solid buttons | 17.72:1 on `#ffffff`, 16.12:1 on `#f4f4f5` |
| Secondary Ink | `#52525b` (`text-zinc-600`) | Body copy, subtitles, metadata, categories, labels | 7.73:1 on `#ffffff`, 7.03:1 on `#f4f4f5` |
| Border | `#e4e4e7` (`border-zinc-200`) / `#d4d4d8` (`border-zinc-300`) | Hairline structural separation instead of heavy shadows | Structural |
| Accent (Primary) | `#166534` (`text-green-800` / `bg-green-800`) | Active nav indicator, digital fulfillment label, verified accent CTA | 7.13:1 (`#166534` on `#ffffff` & `#ffffff` on `#166534`) |
| Accent Tint | `#f0fdf4` (`bg-green-50`) / `#bbf7d0` (`border-green-200`) | Active status pills, digital badges (`#166534` text) | 6.81:1 (`#166534` on `#f0fdf4`) |
| Semantic Error | `#991b1b` on `#fef2f2` (`red-800` on `red-50`) | Validation errors, destructive confirmation | 7.60:1 |
| Semantic Warning | `#92400e` on `#fffbeb` (`amber-800` on `amber-50`) | Stock alerts, restricted COD notes | 6.84:1 |

**Banned color patterns:** Zero `blue-600`, `indigo-*`, `violet-*`, `slate-*` SaaS remnants, and zero `text-stone-400`/`text-zinc-400` (`2.56:1` FAIL) on light surfaces.

## 3. Typography & Radius Scale
- **Font Family:** System geometric sans (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) for clean UI legibility + monospace (`ui-monospace, SFMono-Regular, Menlo, monospace`) for order codes, SKU labels, coupon codes, and tabular prices (`tabular-nums`).
- **Hierarchy:** Headings use crisp semibold/bold tracking (`tracking-tight`), never decorative italic serifs or all-caps eyebrow badges above `<h1>`.
- **Radius Scale:**
  - Cards & structural panels: `rounded-xl` (12px) or `rounded-2xl` (16px) max.
  - Buttons, inputs, search fields: `rounded-lg` (8px).
  - Status badges / tags: `rounded-md` (6px) — crisp rectangular pills instead of bubbly pill clutter.

## 4. Layout & Mobile Craft Rules
- **Single-purpose surface hierarchy:** Flat bordered cards on crisp white. `backdrop-blur-sm` reserved strictly for sticky top navigation header.
- **No overlapping bottom bars:** Mobile bottom bar is fixed `h-16` (`64px`) with 4 equal destinations (`Beranda`, `Katalog`, `Keranjang`, `Akun`). Any contextual page bar (Product Purchase Bar, Cart Checkout Bar) sits cleanly at `bottom-16` without intersecting the nav bar or covering floating triggers.
- **Minimum Touch Targets:** All mobile interactive buttons, icon triggers, pagination/filter chips, and cart controls enforce `min-h-[44px]` and minimum `44x44px` hit areas for icon buttons.
- **Human-Centered UX Guarantees:**
  - Coupon codes persist cleanly in `CartContext` across drawer, cart page, and checkout.
  - Digital-only carts hide shipping address & courier forms cleanly in checkout, dynamically numbering active steps.
  - Order proof submission supports direct image file upload (`JPG`/`PNG`/`WEBP`) with inline preview alongside optional image links.
  - Support paths stay concise: direct Help page + WhatsApp contact link + clean optional Product Finder panel (zero fake word-by-word typing timers, zero emoji pills, zero "Concierge" jargon).

## 5. Rationales (R-31)
1. **Crisp white + charcoal + single forest green accent:** Eliminates the jarring clash between warm beige homepage and blue-slate checkout/admin pages while keeping high-contrast catalog scanability.
2. **Tabular sans & monospace over decorative serif + eyebrow pills:** Gives hardware specs, SKU numbers, and IDR prices authentic independent-studio precision without template ornamentation.
3. **Flattened 4-tab mobile bottom nav + non-colliding `bottom-16` contextual bars:** Stops the protruding AI circle from overlapping product purchase buttons and removes the duplicate cart checkout bar bug.
4. **Coupon persistence in `CartContext` + conditional shipping steps + direct proof image upload:** Fixes the three biggest shopper dead-ends where discounts dropped, digital buyers saw courier forms, and mobile users were asked for Imgur URLs.
OverhaulStatus: Active
