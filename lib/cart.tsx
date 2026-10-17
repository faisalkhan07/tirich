"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  label: string; // e.g. "250g"
  price: number; // PKR
  image?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  isHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "tirich_cart_v1";

// Cache for useSyncExternalStore to maintain reference equality
let cachedRaw: string | null = null;
let cachedItems: CartItem[] = [];

function getCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") return cachedItems;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "[]";
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      const parsed = JSON.parse(raw);
      cachedItems = Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    cachedItems = [];
  }
  return cachedItems;
}

const emptyItems: CartItem[] = [];
function getServerSnapshot(): CartItem[] {
  return emptyItems;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("tirich_cart_updated", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tirich_cart_updated", callback);
  };
}

function persist(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("tirich_cart_updated"));
  } catch {
    // Storage quota or disabled
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getCartSnapshot, getServerSnapshot);
  // On client, items is populated from snapshot; on server it's emptyItems.
  const isHydrated = typeof window !== "undefined";

  function addItem(item: Omit<CartItem, "quantity">, quantity: number = 1) {
    if (quantity <= 0) return;
    const current = getCartSnapshot();
    const index = current.findIndex((i) => i.variantId === item.variantId);
    let next: CartItem[];

    if (index > -1) {
      next = [...current];
      const existing = next[index];
      if (existing) {
        next[index] = { ...existing, quantity: existing.quantity + quantity };
      }
    } else {
      next = [...current, { ...item, quantity }];
    }

    persist(next);
  }

  function removeItem(variantId: string) {
    const current = getCartSnapshot();
    const next = current.filter((i) => i.variantId !== variantId);
    persist(next);
  }

  function updateQuantity(variantId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    const current = getCartSnapshot();
    const next = current.map((i) =>
      i.variantId === variantId ? { ...i, quantity } : i
    );
    persist(next);
  }

  function clearCart() {
    persist([]);
  }

  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemsCount,
        subtotal,
        isHydrated,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
