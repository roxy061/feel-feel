"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: number;
  store_id: number | string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
  category: string;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subdomain: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  subdomain = "default",
}: {
  children: React.ReactNode;
  subdomain?: string;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `3nfm_cart_${subdomain.toLowerCase()}`;

  // โหลดข้อมูลตะกร้าจาก localStorage ตอนเริ่มต้น
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (err) {
      console.error("[CartContext] Failed to load cart from storage:", err);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // บันทึกตะกร้าลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch (err) {
      console.error("[CartContext] Failed to persist cart:", err);
    }
  }, [items, isLoaded, storageKey]);

  const addToCart = useCallback((product: any, qtyToAdd: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const productPrice = typeof product.price === "string" ? parseFloat(product.price) : Number(product.price) || 0;
      const maxStock = product.stock !== undefined ? Number(product.stock) : 999;

      if (existing) {
        const newQty = Math.min(maxStock, existing.quantity + qtyToAdd);
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: newQty } : i
        );
      } else {
        const initialQty = Math.min(maxStock, Math.max(1, qtyToAdd));
        return [
          ...prev,
          {
            id: product.id,
            store_id: product.store_id || 1,
            name: product.name,
            price: productPrice,
            quantity: initialQty,
            image_url: product.image_url || null,
            category: product.category || "General",
            stock: maxStock,
          },
        ];
      }
    });
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((productId: number, newQty: number) => {
    setItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((i) => i.id !== productId);
      }
      return prev.map((i) => {
        if (i.id === productId) {
          const clamped = Math.min(i.stock || 999, newQty);
          return { ...i, quantity: clamped };
        }
        return i;
      });
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        subdomain,
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
