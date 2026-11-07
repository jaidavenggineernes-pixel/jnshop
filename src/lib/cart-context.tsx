"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItemData } from "@/types";

interface CartContextType {
  items: CartItemData[];
  itemCount: number;
  subtotal: number;
  addItem: (product: any, variant?: any, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  itemCount: 0,
  subtotal: 0,
  addItem: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
});

const STORAGE_KEY = "jnshop_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from storage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart:", e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (product: any, variant?: any, quantity = 1) => {
    setItems((prev) => {
      const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
      const existing = prev.find((item) => item.id === cartItemId);
      const effectivePrice = variant?.price ?? (product.discountPrice || product.price);
      const originalPrice = variant?.price ?? product.price;
      const availableStock = variant?.stock ?? product.stock;

      const primaryImage = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url || "/placeholder.png";

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, availableStock);
        return prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item));
      } else {
        const newItem: CartItemData = {
          id: cartItemId,
          productId: product.id,
          variantId: variant?.id || null,
          name: product.name,
          slug: product.slug,
          image: primaryImage,
          price: effectivePrice,
          originalPrice,
          quantity: Math.min(quantity, availableStock),
          stock: availableStock,
          isPhysical: product.isPhysical,
          variantName: variant?.name || null,
        };
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.min(quantity, item.stock) };
        }
        return item;
      });
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
