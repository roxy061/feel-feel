"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import StoreOverviewCard from "@/components/dashboard/StoreOverviewCard";
import ProductManagement from "@/components/dashboard/ProductManagement";
import OrderVerification from "@/components/dashboard/OrderVerification";
import { useStore } from "@/context/StoreContext";

export default function DashboardPage() {
  const { activeStoreId, setActiveStoreId, refreshStores } = useStore();
  const [overviewData, setOverviewData] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (storeId?: number | null) => {
    try {
      const url = storeId ? `/api/merchant/overview?store_id=${storeId}` : "/api/merchant/overview";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setOverviewData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    }
  }, []);

  const fetchProducts = useCallback(async (storeId?: number | null) => {
    try {
      const url = storeId ? `/api/merchant/products?store_id=${storeId}` : "/api/merchant/products";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setProducts(json.products || []);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }, []);

  const fetchOrders = useCallback(async (storeId?: number | null) => {
    try {
      const url = storeId ? `/api/merchant/orders?store_id=${storeId}` : "/api/merchant/orders";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setOrders(json.orders || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  }, []);

  const fetchAllData = useCallback(async (storeId?: number | null) => {
    setError(null);
    try {
      await Promise.all([fetchOverview(storeId), fetchProducts(storeId), fetchOrders(storeId)]);
    } catch (err: any) {
      setError(err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด");
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchProducts, fetchOrders]);

  useEffect(() => {
    fetchAllData(activeStoreId);
  }, [activeStoreId, fetchAllData]);

  const handleRenewSuccess = (newTokens: number, newExpiresAt: string) => {
    refreshStores();
    if (overviewData) {
      setOverviewData({
        ...overviewData,
        user: { ...overviewData.user, tokens: newTokens },
        store: {
          ...overviewData.store,
          expires_at: newExpiresAt,
          status: "Active",
          days_remaining: Math.max(
            1,
            Math.ceil(
              (new Date(newExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          ),
        },
      });
    }
  };

  if (loading && !overviewData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#EEEFF2]" />
        <div className="font-mono text-xs text-[#EEEFF2]/60">
          Loading 3NFM Merchant Dashboard...
        </div>
      </div>
    );
  }

  if (error && !overviewData) {
    return (
      <div className="p-8 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
        <h3 className="font-bebas text-2xl tracking-wide text-white mb-2">
          ไม่สามารถเชื่อมต่อระบบแดชบอร์ดได้
        </h3>
        <p className="font-sans text-xs text-rose-300 mb-5">{error}</p>
        <button
          type="button"
          onClick={() => fetchAllData(activeStoreId)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EEEFF2] text-[#010101] font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>ลองใหม่อีกครั้ง</span>
        </button>
      </div>
    );
  }

  const currentStoreId = activeStoreId || overviewData?.store?.id || 1;

  return (
    <div className="space-y-10 pb-16">
      {/* Section 1: Store Overview & Renewal */}
      <section id="overview">
        {overviewData && (
          <StoreOverviewCard
            data={overviewData}
            onRenewSuccess={handleRenewSuccess}
            selectedStoreId={currentStoreId}
            onSelectStore={(id) => setActiveStoreId(id)}
          />
        )}
      </section>

      {/* Section 2: Product Inventory CRUD */}
      <section id="products">
        <ProductManagement
          products={products}
          selectedStoreId={currentStoreId}
          onRefresh={() => {
            fetchProducts(currentStoreId);
            fetchOverview(currentStoreId);
          }}
        />
      </section>

      {/* Section 3: Orders & Slip Verification */}
      <section id="orders">
        <OrderVerification
          orders={orders}
          onRefresh={() => {
            fetchOrders(currentStoreId);
            fetchProducts(currentStoreId);
            fetchOverview(currentStoreId);
          }}
        />
      </section>
    </div>
  );
}
