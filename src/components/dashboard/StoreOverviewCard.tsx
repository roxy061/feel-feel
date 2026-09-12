"use client";

import { useState } from "react";
import {
  Store,
  ShieldCheck,
  Clock,
  Coins,
  TrendingUp,
  ShoppingCart,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";

interface StoreItem {
  id: number;
  name: string;
  subdomain: string;
  expires_at: string;
  is_active?: boolean;
}

interface StoreOverviewCardProps {
  data: {
    user: {
      id: string;
      name: string;
      tokens: number;
    };
    store: {
      id: number;
      name: string;
      subdomain: string;
      expires_at: string;
      status: string;
      days_remaining: number;
    };
    all_stores?: StoreItem[];
    stats: {
      total_orders: number;
      total_revenue: number;
      pending_orders: number;
      total_products: number;
    };
  };
  onRenewSuccess: (newTokens: number, newExpiresAt: string) => void;
  selectedStoreId?: number;
  onSelectStore?: (storeId: number) => void;
}

export default function StoreOverviewCard({
  data,
  onRenewSuccess,
  selectedStoreId,
  onSelectStore,
}: StoreOverviewCardProps) {
  const [isRenewing, setIsRenewing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [internalStoreId, setInternalStoreId] = useState<number>(data.store.id);
  const activeStoreId = selectedStoreId !== undefined ? selectedStoreId : internalStoreId;

  const { user, store, stats, all_stores = [] } = data;

  // Active store selected by user
  const currentStore = all_stores.find((s) => s.id === activeStoreId) || store;
  const currentExpiresAt = new Date(currentStore.expires_at || store.expires_at);
  const now = new Date();
  const diffTime = currentExpiresAt.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isExpired = daysRemaining <= 0;

  const handleRenewStore = async () => {
    if (user.tokens < 1) {
      setFeedback({
        type: "error",
        message: "โทเคนไม่เพียงพอ กรุณาเติมโทเคนก่อนดำเนินการต่ออายุ",
      });
      return;
    }

    setIsRenewing(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/merchant/stores/${currentStore.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "ต่ออายุร้านค้าไม่สำเร็จ");
      }

      setFeedback({
        type: "success",
        message: `ต่ออายุร้านค้า ${currentStore.name} สำเร็จ (+30 วัน) หัก 1 โทเคนเรียบร้อยแล้ว`,
      });

      onRenewSuccess(result.data.tokens, result.data.expires_at);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "เกิดข้อผิดพลาดในการต่ออายุร้านค้า",
      });
    } finally {
      setIsRenewing(false);
    }
  };

  const formattedExpireDate = currentExpiresAt.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Store Status & Renewal */}
      <div className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
        {/* Store Selector Pill bar if multiple stores */}
        {all_stores.length > 1 && (
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#EEEFF2]/10 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#EEEFF2]/60">
              <Store className="w-4 h-4 text-sky-400" />
              <span>เลือกร้านค้าที่ต้องการจัดการ:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {all_stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setInternalStoreId(s.id);
                    onSelectStore?.(s.id);
                    setFeedback(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all cursor-pointer ${
                    activeStoreId === s.id
                      ? "bg-[#EEEFF2] text-[#010101] font-bold shadow-md"
                      : "bg-[#010101]/60 text-[#EEEFF2]/70 hover:bg-[#010101] hover:text-[#EEEFF2] border border-[#EEEFF2]/10"
                  }`}
                >
                  {s.name} (/{s.subdomain})
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Store Info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 flex items-center justify-center text-[#EEEFF2] shrink-0 shadow-inner">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-bebas text-3xl sm:text-4xl tracking-wide text-[#EEEFF2] leading-none">
                  {currentStore.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold border ${
                    isExpired
                      ? "bg-rose-950/80 text-rose-400 border-rose-500/40"
                      : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isExpired ? "bg-rose-400" : "bg-emerald-400 animate-pulse"
                    }`}
                  />
                  {isExpired ? "ร้านหมดอายุ (Expired)" : "เปิดใช้งานปกติ (Active)"}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-2 text-xs font-mono text-[#EEEFF2]/70">
                <span className="bg-[#010101]/60 px-2.5 py-1 rounded-lg border border-[#EEEFF2]/10">
                  Subdomain: {currentStore.subdomain}.3nfm.shop
                </span>
                <Link
                  href={`/${currentStore.subdomain}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <span>เยี่ยมชมหน้าร้าน</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Tokens & Renew Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#EEEFF2]/10">
            {/* Tokens Pill */}
            <div className="p-3.5 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/15 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-sans text-[11px] text-[#EEEFF2]/50">
                  โทเคนคงเหลือ (Tokens)
                </span>
                <span className="font-mono text-xl font-bold text-amber-400">
                  {user.tokens}{" "}
                  <span className="text-xs font-normal text-[#EEEFF2]/60">Tokens</span>
                </span>
              </div>
            </div>

            {/* Renew Button */}
            <button
              type="button"
              onClick={handleRenewStore}
              disabled={isRenewing}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 disabled:bg-[#272835] text-[#010101] disabled:text-[#EEEFF2]/40 font-semibold text-xs transition-all shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              <RotateCw className={`w-4 h-4 ${isRenewing ? "animate-spin" : ""}`} />
              <span>ต่ออายุร้านค้านี้ (+30 วัน) &bull; ใช้ 1 โทเคน</span>
            </button>
          </div>
        </div>

        {/* Expiration Details Bar */}
        <div className="mt-6 pt-5 border-t border-[#EEEFF2]/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#EEEFF2]/80 font-sans">
            <Calendar className="w-4 h-4 text-[#EEEFF2]/60" />
            <span>วันหมดอายุร้านค้า:</span>
            <span className="font-mono font-bold text-[#EEEFF2] bg-[#010101]/40 px-2 py-0.5 rounded-lg border border-[#EEEFF2]/10">
              {formattedExpireDate}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>คงเหลือเวลา:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-lg ${
                daysRemaining <= 5
                  ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                  : "bg-[#010101]/40 text-emerald-400 border border-[#EEEFF2]/10"
              }`}
            >
              {daysRemaining} วัน
            </span>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/80 border border-rose-500/40 text-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#272835] border border-[#EEEFF2]/15">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs text-[#EEEFF2]/60 font-medium">
              ยอดขายรวมทุกร้านค้า
            </span>
            <div className="p-2 rounded-lg bg-[#010101]/50 text-emerald-400 border border-[#EEEFF2]/10">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono text-2xl font-bold text-emerald-400">
            {stats.total_revenue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
            <span className="text-xs text-[#EEEFF2]/60 font-sans font-normal">บาท</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#272835] border border-[#EEEFF2]/15">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs text-[#EEEFF2]/60 font-medium">
              คำสั่งซื้อทั้งหมด
            </span>
            <div className="p-2 rounded-lg bg-[#010101]/50 text-sky-400 border border-[#EEEFF2]/10">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bebas text-3xl tracking-wide text-[#EEEFF2]">
            {stats.total_orders}{" "}
            <span className="text-xs text-[#EEEFF2]/60 font-sans font-normal">ออเดอร์</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#272835] border border-[#EEEFF2]/15">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans text-xs text-[#EEEFF2]/60 font-medium">
              รอการตรวจสอบสลิป
            </span>
            <div className="p-2 rounded-lg bg-[#010101]/50 text-amber-400 border border-[#EEEFF2]/10">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-bebas text-3xl tracking-wide text-amber-400">
            {stats.pending_orders}{" "}
            <span className="text-xs text-[#EEEFF2]/60 font-sans font-normal">รายการ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
