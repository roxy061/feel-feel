"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface StoreSummary {
  id: number;
  name: string;
  subdomain: string;
  description?: string | null;
  tagline?: string | null;
  expires_at?: string | null;
  status?: string | null;
  is_active?: boolean;
  days_remaining?: number;
  truemoney_phone?: string | null;
  promptpay_number?: string | null;
}

interface StoreContextType {
  stores: StoreSummary[];
  activeStoreId: number | null;
  activeStore: StoreSummary | null;
  setActiveStoreId: (id: number) => void;
  refreshStores: () => Promise<void>;
  isLoadingStores: boolean;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [activeStoreId, setActiveStoreIdState] = useState<number | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchStores = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/stores");
      const json = await res.json();
      if (json.success && Array.isArray(json.stores)) {
        setStores(json.stores);

        // หา active store ที่เคยบันทึกไว้ใน localStorage
        const savedId = typeof window !== "undefined" ? localStorage.getItem("3nfm_active_store_id") : null;
        const matched = json.stores.find((s: StoreSummary) => String(s.id) === String(savedId));

        if (matched) {
          setActiveStoreIdState(matched.id);
        } else if (json.stores.length > 0) {
          // หากไม่มี หรือไม่ตรงกับรายการที่มี ให้ใช้ร้านแรก (3NFM Motorsport Lab หรือ Apex)
          setActiveStoreIdState(json.stores[0].id);
          if (typeof window !== "undefined") {
            localStorage.setItem("3nfm_active_store_id", String(json.stores[0].id));
          }
        }
      }
    } catch (err) {
      console.error("[StoreContext] Failed to fetch stores:", err);
    } finally {
      setIsLoadingStores(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const setActiveStoreId = (id: number) => {
    setActiveStoreIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("3nfm_active_store_id", String(id));
    }
  };

  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0] || null;

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStoreId,
        activeStore,
        setActiveStoreId,
        refreshStores: fetchStores,
        isLoadingStores,
        isCreateModalOpen,
        setIsCreateModalOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}

export const useStores = useStore;
