"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  ArrowUpDown,
  X,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

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
      {/* Mobile Top Bar with Filter & Sort Pills */}
      <div className="lg:hidden space-y-3 mb-6">
        {/* Controls row */}
        <div className="flex items-center gap-2">
          {/* Open Filter Drawer Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white border border-slate-200/90 text-slate-800 text-xs font-bold shadow-2xs active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex-1 relative">
            <select
              value={currentSort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="w-full appearance-none py-2.5 pl-3 pr-8 rounded-2xl bg-white border border-slate-200/90 text-slate-800 text-xs font-bold shadow-2xs focus:outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Quick Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pb-1">
          <button
            onClick={() => applyFilters({ category: "", type: "" })}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors ${
              !currentCategory && !currentType
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            Semua ({totalProducts})
          </button>
          <button
            onClick={() => applyFilters({ type: currentType === "physical" ? "" : "physical" })}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors ${
              currentType === "physical"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            📦 Produk Fisik
          </button>
          <button
            onClick={() => applyFilters({ type: currentType === "digital" ? "" : "digital" })}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors ${
              currentType === "digital"
                ? "bg-blue-600 text-white font-bold shadow-sm"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            ⚡ Produk Digital
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => applyFilters({ category: currentCategory === c.slug ? "" : c.slug })}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium text-xs transition-colors ${
                currentCategory === c.slug
                  ? "bg-blue-600 text-white font-bold shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700"
              }`}
            >
              {c.name.split("&")[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Slide-Up Bottom Sheet Filter Modal for Mobile */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Filter & Kategori Produk</h3>
              </div>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Options */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* Format Filter */}
              <div>
                <label className="font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Format Produk
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedType("")}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      !selectedType
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType("physical")}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      selectedType === "physical"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    📦 Fisik
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType("digital")}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      selectedType === "digital"
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    ⚡ Digital
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Kategori
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("")}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-semibold transition-all ${
                      !selectedCategory
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>Semua Kategori</span>
                    {!selectedCategory && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                  {categories.map((c) => {
                    const isSelected = selectedCategory === c.slug;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border font-semibold transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate pr-2">{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          {c._count && (
                            <span className="text-[11px] text-slate-400">
                              ({c._count.products})
                            </span>
                          )}
                          {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                  Rentang Harga (Rp)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Harga Minimum</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Harga Maksimum</span>
                    <input
                      type="number"
                      placeholder="Contoh: 500000"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-white transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => applyFilters()}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center shadow-md shadow-blue-500/20 transition-all cursor-pointer"
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
