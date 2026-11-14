"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, ArrowUpDown, X, Check, SlidersHorizontal } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface MobileCatalogFiltersProps {
  categories: CategoryItem[];
  totalProducts: number;
}

export function MobileCatalogFilters({ categories, totalProducts }: MobileCatalogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentType = searchParams.get("type") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentFeatured = searchParams.get("featured") || "";
  const currentQ = searchParams.get("q") || "";

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(currentCategory);
  const [selectedType, setSelectedType] = useState(currentType);
  const [selectedSort, setSelectedSort] = useState(currentSort);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFilterOpen) setIsFilterOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFilterOpen]);

  const activeFilterCount =
    (currentCategory ? 1 : 0) +
    (currentType ? 1 : 0) +
    (currentMinPrice || currentMaxPrice ? 1 : 0) +
    (currentFeatured ? 1 : 0);

  const applyFilters = (overrides?: Record<string, string>) => {
    const params = new URLSearchParams();
    if (currentQ) params.set("q", currentQ);

    const cat = overrides?.category !== undefined ? overrides.category : selectedCategory;
    const typ = overrides?.type !== undefined ? overrides.type : selectedType;
    const srt = overrides?.sort !== undefined ? overrides.sort : selectedSort;
    const min = overrides?.minPrice !== undefined ? overrides.minPrice : minPriceInput;
    const max = overrides?.maxPrice !== undefined ? overrides.maxPrice : maxPriceInput;

    if (cat) params.set("category", cat);
    if (typ) params.set("type", typ);
    if (srt && srt !== "newest") params.set("sort", srt);
    if (min) params.set("minPrice", min);
    if (max) params.set("maxPrice", max);
    if (currentFeatured) params.set("featured", currentFeatured);

    router.push(`/products?${params.toString()}`);
    setIsFilterOpen(false);
  };

  const handleReset = () => {
    setSelectedCategory("");
    setSelectedType("");
    setSelectedSort("newest");
    setMinPriceInput("");
    setMaxPriceInput("");
    const params = new URLSearchParams();
    if (currentQ) params.set("q", currentQ);
    router.push(`/products?${params.toString()}`);
    setIsFilterOpen(false);
  };

  return (
    <>
      {/* Mobile Control Strip */}
      <div className="lg:hidden mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(currentCategory);
              setSelectedType(currentType);
              setSelectedSort(currentSort);
              setMinPriceInput(currentMinPrice);
              setMaxPriceInput(currentMaxPrice);
              setIsFilterOpen(true);
            }}
            className={`flex-1 min-h-[44px] px-3.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
              activeFilterCount > 0
                ? "bg-zinc-900 border-zinc-900 text-white"
                : "bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-green-700 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative flex-1">
            <label htmlFor="mobile-sort" className="sr-only">
              Urutkan produk
            </label>
            <select
              id="mobile-sort"
              value={currentSort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="w-full min-h-[44px] appearance-none pl-9 pr-7 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-900 focus:outline-none focus:border-green-800"
            >
              <option value="newest">Rilisan Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Quick Horizontal Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => applyFilters({ category: "", type: "" })}
            className={`min-h-[40px] px-3.5 rounded-lg whitespace-nowrap font-semibold text-xs transition-colors ${
              !currentCategory && !currentType
                ? "bg-zinc-900 text-white"
                : "bg-white border border-zinc-200 text-zinc-800 hover:border-zinc-400"
            }`}
          >
            Semua ({totalProducts})
          </button>
          <button
            type="button"
            onClick={() => applyFilters({ type: currentType === "physical" ? "" : "physical" })}
            className={`min-h-[40px] px-3.5 rounded-lg whitespace-nowrap font-semibold text-xs transition-colors ${
              currentType === "physical"
                ? "bg-zinc-900 text-white"
                : "bg-white border border-zinc-200 text-zinc-800 hover:border-zinc-400"
            }`}
          >
            Produk Fisik
          </button>
          <button
            type="button"
            onClick={() => applyFilters({ type: currentType === "digital" ? "" : "digital" })}
            className={`min-h-[40px] px-3.5 rounded-lg whitespace-nowrap font-semibold text-xs transition-colors ${
              currentType === "digital"
                ? "bg-green-800 text-white"
                : "bg-white border border-zinc-200 text-zinc-800 hover:border-zinc-400"
            }`}
          >
            Produk Digital
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => applyFilters({ category: currentCategory === c.slug ? "" : c.slug })}
              className={`min-h-[40px] px-3.5 rounded-lg whitespace-nowrap font-semibold text-xs transition-colors ${
                currentCategory === c.slug
                  ? "bg-zinc-900 text-white"
                  : "bg-white border border-zinc-200 text-zinc-800 hover:border-zinc-400"
              }`}
            >
              {c.name.split("&")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sheet Filter Modal */}
      {isFilterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter Katalog"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/50"
        >
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-zinc-200">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-zinc-900" />
                <h2 className="font-bold text-sm text-zinc-900">Filter Katalog</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Tutup filter"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              <div>
                <div className="font-semibold text-zinc-700 mb-2">Format Produk</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Semua", val: "" },
                    { label: "Fisik", val: "physical" },
                    { label: "Digital", val: "digital" },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSelectedType(opt.val)}
                      className={`min-h-[44px] rounded-lg border text-center font-semibold transition-colors ${
                        selectedType === opt.val
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-semibold text-zinc-700 mb-2">Kategori</div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className={`w-full min-h-[44px] px-3 flex items-center justify-between rounded-lg border font-medium transition-colors ${
                      !selectedCategory
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    <span>Semua Kategori</span>
                    {!selectedCategory && <Check className="w-4 h-4" />}
                  </button>
                  {categories.map((c) => {
                    const isSelected = selectedCategory === c.slug;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`w-full min-h-[44px] px-3 flex items-center justify-between rounded-lg border font-medium transition-colors ${
                          isSelected
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-200 text-zinc-800 hover:bg-zinc-50"
                        }`}
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          {c._count && (
                            <span className={`tabular-nums ${isSelected ? "text-zinc-300" : "text-zinc-600"}`}>
                              ({c._count.products})
                            </span>
                          )}
                          {isSelected && <Check className="w-4 h-4" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="font-semibold text-zinc-700 mb-2">Rentang Harga (Rp)</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="filter-min-price" className="text-[11px] text-zinc-600 block mb-1">
                      Minimum
                    </label>
                    <input
                      id="filter-min-price"
                      type="number"
                      placeholder="0"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-xs text-zinc-900 focus:outline-none focus:border-green-800"
                    />
                  </div>
                  <div>
                    <label htmlFor="filter-max-price" className="text-[11px] text-zinc-600 block mb-1">
                      Maksimum
                    </label>
                    <input
                      id="filter-max-price"
                      type="number"
                      placeholder="500000"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full h-11 bg-zinc-50 border border-zinc-300 rounded-lg px-3 text-xs text-zinc-900 focus:outline-none focus:border-green-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="min-h-[44px] px-4 rounded-lg border border-zinc-300 bg-white text-zinc-900 font-semibold text-xs hover:bg-zinc-100"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="flex-1 min-h-[44px] px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
