"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  ArrowUpDown,
  X,
  Check,
  SlidersHorizontal,
} from "lucide-react";

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
      {/* Mobile Top Control Strip (Sticky under header) */}
      <div className="lg:hidden mb-6 space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Filter Trigger Button with badge */}
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
            className={`flex-1 py-2.5 px-3.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
              activeFilterCount > 0
                ? "bg-stone-900 border-stone-900 text-stone-100"
                : "bg-white/95 border-stone-200 text-stone-800 hover:bg-stone-50"
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Saring Produk</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-900 text-[10px] font-mono font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Quick Sort Dropdown */}
          <div className="relative flex-1">
            <select
              value={currentSort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="w-full appearance-none py-2.5 pl-8 pr-7 bg-white/95 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 cursor-pointer"
            >
              <option value="newest">Rilisan Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Quick Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pb-1">
          <button
            onClick={() => applyFilters({ category: "", type: "" })}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors cursor-pointer ${
              !currentCategory && !currentType
                ? "bg-stone-900 text-stone-100 shadow-sm"
                : "bg-white/95 border border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            Semua ({totalProducts})
          </button>
          <button
            onClick={() => applyFilters({ type: currentType === "physical" ? "" : "physical" })}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors cursor-pointer ${
              currentType === "physical"
                ? "bg-stone-900 text-stone-100 shadow-sm"
                : "bg-white/95 border border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            📦 Produk Fisik
          </button>
          <button
            onClick={() => applyFilters({ type: currentType === "digital" ? "" : "digital" })}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors cursor-pointer ${
              currentType === "digital"
                ? "bg-stone-900 text-stone-100 shadow-sm"
                : "bg-white/95 border border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            ⚡ Produk Digital
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => applyFilters({ category: currentCategory === c.slug ? "" : c.slug })}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors cursor-pointer ${
                currentCategory === c.slug
                  ? "bg-stone-900 text-stone-100 shadow-sm"
                  : "bg-white/95 border border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {c.name.split("&")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Slide-Up Bottom Sheet Filter Modal for Mobile */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 border border-stone-200">
            {/* Header */}
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-stone-800" />
                <h3 className="font-serif font-bold text-sm text-stone-900">Saring Katalog Produk</h3>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Options */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Format Filter */}
              <div>
                <label className="font-medium text-stone-500 block mb-2">
                  Format Produk
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedType("")}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      !selectedType
                        ? "border-stone-900 bg-stone-900 text-stone-100"
                        : "border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType("physical")}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      selectedType === "physical"
                        ? "border-stone-900 bg-stone-900 text-stone-100"
                        : "border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    📦 Fisik
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType("digital")}
                    className={`p-2.5 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                      selectedType === "digital"
                        ? "border-stone-900 bg-stone-900 text-stone-100"
                        : "border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    ⚡ Digital
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="font-medium text-stone-500 block mb-2">
                  Kategori
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-medium transition-all cursor-pointer ${
                      !selectedCategory
                        ? "border-stone-900 bg-stone-900 text-stone-100"
                        : "border-stone-200 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    <span>Semua Kategori</span>
                    {!selectedCategory && <Check className="w-4 h-4 text-stone-100" />}
                  </button>
                  {categories.map((c) => {
                    const isSelected = selectedCategory === c.slug;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "border-stone-900 bg-stone-900 text-stone-100"
                            : "border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          {c._count && (
                            <span className={`text-[11px] ${isSelected ? "text-stone-300" : "text-stone-400"}`}>
                              ({c._count.products})
                            </span>
                          )}
                          {isSelected && <Check className="w-4 h-4 text-stone-100" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="font-medium text-stone-500 block mb-2">
                  Rentang Harga (Rp)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-1">Harga Minimum</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-1">Harga Maksimum</span>
                    <input
                      type="number"
                      placeholder="Contoh: 500000"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-stone-100 bg-stone-50/70 flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-medium text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 font-medium text-xs text-center shadow-sm transition-all cursor-pointer"
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
