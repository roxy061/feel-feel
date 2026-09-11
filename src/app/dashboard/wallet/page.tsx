"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Wallet,
  Coins,
  QrCode,
  Upload,
  ShoppingBag,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  TrendingDown,
  ShieldCheck,
} from "lucide-react";

interface Transaction {
  id: number;
  amount: number | string;
  type: string;
  description: string;
  status: string;
  slip_url: string | null;
  reference_id: string;
  created_at: string;
}

interface WalletData {
  wallet_id: number;
  balance: number;
  tokens: number;
  transactions: Transaction[];
}

const TOKEN_PACKAGES = [
  {
    id: "pkg_1",
    tokens: 1,
    cost: 50,
    name: "Starter Package",
    desc: "เหมาะสำหรับต่ออายุร้านค้า 1 เดือน",
    badge: "1 เดือน",
  },
  {
    id: "pkg_5",
    tokens: 5,
    cost: 225,
    name: "Pro Package",
    desc: "ต่ออายุร้านค้า 5 เดือน หรือใช้งาน API",
    badge: "ประหยัด 10%",
    popular: true,
  },
  {
    id: "pkg_10",
    tokens: 10,
    cost: 400,
    name: "Business Package",
    desc: "ต่ออายุร้านค้ายาวนาน พร้อมสิทธิประโยชน์",
    badge: "ประหยัด 20%",
  },
  {
    id: "pkg_25",
    tokens: 25,
    cost: 900,
    name: "Enterprise Package",
    desc: "สำหรับธุรกิจขนาดใหญ่ จัดการร้านค้าต่อเนื่อง",
    badge: "ประหยัด 28%",
  },
];

export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Topup Modal State
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("300");
  const [slipBase64, setSlipBase64] = useState<string | null>(null);
  const [slipFileName, setSlipFileName] = useState<string | null>(null);
  const [isSubmittingTopup, setIsSubmittingTopup] = useState(false);
  const [topupFeedback, setTopupFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buy Tokens State
  const [buyingPkgId, setBuyingPkgId] = useState<string | null>(null);
  const [shopFeedback, setShopFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await fetch("/api/merchant/wallet");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || "Failed to load wallet");
      }
    } catch (err: any) {
      setError(err?.message || "Connection error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleProcessSlip = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดรูปภาพต้องไม่เกิน 5 MB");
      return;
    }

    setSlipFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSlipBase64(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slipBase64) {
      setTopupFeedback({ type: "error", message: "กรุณาแนบรูปภาพสลิปการโอนเงิน" });
      return;
    }

    setIsSubmittingTopup(true);
    setTopupFeedback(null);

    try {
      const res = await fetch("/api/merchant/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(topupAmount),
          slip_image: slipBase64,
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.message || "ส่งคำขอเติมเงินไม่สำเร็จ");
      }

      setTopupFeedback({
        type: "success",
        message: "ส่งคำขอเติมเงินและหลักฐานเรียบร้อยแล้ว ระบบจะตรวจสอบยอดเงินให้ท่านโดยเร็ว",
      });

      setSlipBase64(null);
      setSlipFileName(null);
      fetchWallet();
    } catch (err: any) {
      setTopupFeedback({ type: "error", message: err.message || "เกิดข้อผิดพลาด" });
    } finally {
      setIsSubmittingTopup(false);
    }
  };

  const handleBuyTokens = async (packageId: string) => {
    setBuyingPkgId(packageId);
    setShopFeedback(null);

    try {
      const res = await fetch("/api/merchant/wallet/buy-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package_id: packageId }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.message || "ซื้อโทเคนไม่สำเร็จ");
      }

      setShopFeedback({
        type: "success",
        message: resJson.message,
      });

      fetchWallet();
    } catch (err: any) {
      setShopFeedback({
        type: "error",
        message: err.message || "เกิดข้อผิดพลาดในการซื้อโทเคน",
      });
    } finally {
      setBuyingPkgId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#EEEFF2]" />
        <div className="font-mono text-xs text-[#EEEFF2]/60">Loading Wallet...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Wallet Balance & Token Counter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 flex items-center justify-center text-[#EEEFF2] shadow-inner">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-sans text-xs text-[#EEEFF2]/60 block">
                    ยอดเงินคงเหลือในกระเป๋า (Wallet Balance)
                  </span>
                  <span className="font-mono text-xs text-sky-400">
                    Wallet ID: #{data?.wallet_id} &bull; Active
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTopupFeedback(null);
                  setIsTopupOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เติมเงินเข้า Wallet</span>
              </button>
            </div>

            <div className="my-4">
              <div className="font-mono text-4xl sm:text-5xl font-bold text-[#EEEFF2] tracking-tight">
                {(data?.balance || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
                <span className="text-xl font-sans text-[#EEEFF2]/70 font-normal">บาท</span>
              </div>
              <p className="font-sans text-xs text-[#EEEFF2]/60 mt-2">
                ใช้สำหรับซื้อโทเคนต่ออายุร้านค้า หรือชำระค่าธรรมเนียม API อัตโนมัติ (0.35 บาท/รายการ)
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EEEFF2]/10 flex items-center justify-between text-xs font-mono text-[#EEEFF2]/60">
            <span>สถานะระบบเติมเงิน: PromptPay Instant</span>
            <button
              type="button"
              onClick={fetchWallet}
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>อัปเดตยอดเงิน</span>
            </button>
          </div>
        </div>

        {/* Tokens Pill Card */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#010101] border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="font-sans text-xs text-[#EEEFF2]/60 block">
                  จำนวนโทเคนคงเหลือ (Store Tokens)
                </span>
                <span className="font-mono text-xs text-amber-400 font-semibold">
                  1 โทเคน = ต่ออายุร้านค้าได้ 30 วัน
                </span>
              </div>
            </div>

            <div className="font-bebas text-5xl sm:text-6xl tracking-wide text-amber-400 mt-2">
              {data?.tokens || 0}{" "}
              <span className="text-xl font-sans text-[#EEEFF2]/60 font-normal">Tokens</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EEEFF2]/10">
            <a
              href="#token-shop"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#010101]/60 hover:bg-[#010101] border border-[#EEEFF2]/15 text-xs text-[#EEEFF2] font-semibold transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>เลือกซื้อโทเคนเพิ่มด้านล่าง</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Token Shop Section */}
      <section id="token-shop" className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#EEEFF2]/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="font-bebas text-3xl tracking-wide text-[#EEEFF2] leading-none">
                ร้านค้าซื้อโทเคน (Token Shop)
              </h3>
            </div>
            <p className="font-sans text-xs text-[#EEEFF2]/60">
              ซื้อโทเคนเพื่อใช้ต่ออายุร้านค้า 3NFM โดยตัดยอดเงินจากกระเป๋าเงิน (Wallet) ทันที
            </p>
          </div>

          <div className="font-mono text-xs px-3 py-1.5 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/10 text-emerald-400">
            ยอดเงินพร้อมใช้: {(data?.balance || 0).toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
          </div>
        </div>

        {shopFeedback && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in ${
              shopFeedback.type === "success"
                ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-200"
                : "bg-rose-950/80 border border-rose-500/40 text-rose-200"
            }`}
          >
            {shopFeedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{shopFeedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOKEN_PACKAGES.map((pkg) => {
            const canAfford = (data?.balance || 0) >= pkg.cost;
            const isBuying = buyingPkgId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-xl p-5 border flex flex-col justify-between transition-all ${
                  pkg.popular
                    ? "bg-[#010101] border-amber-500/40 shadow-lg shadow-amber-500/5"
                    : "bg-[#010101]/50 border-[#EEEFF2]/15 hover:border-[#EEEFF2]/30"
                }`}
              >
                {pkg.badge && (
                  <span className="absolute top-3 right-3 font-mono text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {pkg.badge}
                  </span>
                )}

                <div>
                  <div className="font-sans font-semibold text-sm text-[#EEEFF2] mb-1">
                    {pkg.name}
                  </div>
                  <div className="font-bebas text-4xl text-amber-400 tracking-wider">
                    {pkg.tokens} <span className="text-base text-[#EEEFF2]/60 font-sans">Tokens</span>
                  </div>
                  <p className="font-sans text-[11px] text-[#EEEFF2]/60 mt-2 min-h-[32px]">
                    {pkg.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EEEFF2]/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-sans text-xs text-[#EEEFF2]/60">ราคาจำหน่าย:</span>
                    <span className="font-mono text-base font-bold text-emerald-400">
                      {pkg.cost.toLocaleString("th-TH")} บาท
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuyTokens(pkg.id)}
                    disabled={!canAfford || isBuying}
                    className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                      canAfford
                        ? "bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101]"
                        : "bg-[#272835] text-[#EEEFF2]/40 border border-[#EEEFF2]/10 cursor-not-allowed"
                    }`}
                  >
                    {isBuying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังดำเนินการ...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>ซื้อด้วยยอดเงินใน Wallet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Wallet Transactions History */}
      <section className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EEEFF2]/10">
          <div>
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
              ประวัติธุรกรรมกระเป๋าเงิน (Wallet Transactions)
            </h3>
            <p className="font-sans text-xs text-[#EEEFF2]/60 mt-1">
              รายการเติมเงิน, หักค่าบริการ API และการซื้อโทเคนทั้งหมด
            </p>
          </div>
          <span className="font-mono text-xs text-[#EEEFF2]/60">
            {data?.transactions.length || 0} รายการล่าสุด
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-[#EEEFF2]/10 text-[#EEEFF2]/50 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 pr-4">รหัสอ้างอิง / เวลา</th>
                <th className="pb-3 px-4">ประเภทรายการ</th>
                <th className="pb-3 px-4">รายละเอียด</th>
                <th className="pb-3 px-4 text-center">สถานะ</th>
                <th className="pb-3 pl-4 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEEFF2]/5">
              {!data?.transactions || data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#EEEFF2]/40 font-mono">
                    ยังไม่มีประวัติธุรกรรมในกระเป๋าเงิน
                  </td>
                </tr>
              ) : (
                data.transactions.map((tx) => {
                  const numAmt = typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount;
                  const isPositive = numAmt > 0;

                  return (
                    <tr key={tx.id} className="hover:bg-[#010101]/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-mono font-bold text-[#EEEFF2]">
                          {tx.reference_id || `#${tx.id}`}
                        </div>
                        <div className="font-mono text-[10px] text-[#EEEFF2]/40">
                          {new Date(tx.created_at).toLocaleString("th-TH", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] px-2.5 py-1 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/10 text-[#EEEFF2]/80">
                          {tx.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#EEEFF2]/80">
                        {tx.description}
                        {tx.slip_url && (
                          <a
                            href={tx.slip_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block ml-2 text-sky-400 hover:underline font-mono text-[10px]"
                          >
                            [ดูสลิป]
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-0.5 rounded-xl uppercase font-bold border ${
                            tx.status === "completed"
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-950/80 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {tx.status === "completed" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{tx.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 pl-4 text-right font-mono font-bold text-sm">
                        <span className={isPositive ? "text-emerald-400" : "text-[#EEEFF2]"}>
                          {isPositive ? "+" : ""}
                          {numAmt.toLocaleString("th-TH", { minimumFractionDigits: 2 })} ฿
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Topup Modal with PromptPay QR & Slip Upload */}
      {isTopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-xl bg-[#272835] border border-[#EEEFF2]/20 text-[#EEEFF2] p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsTopupOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-[#010101]/50 hover:bg-[#010101] text-[#EEEFF2]/70 hover:text-white border border-[#EEEFF2]/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/15 flex items-center justify-center text-sky-400">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
                  เติมเงินเข้า Wallet ผ่าน PromptPay
                </h3>
                <span className="font-mono text-xs text-[#EEEFF2]/60">
                  สแกน QR และแนบสลิปเพื่อส่งยอด
                </span>
              </div>
            </div>

            {topupFeedback && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
                  topupFeedback.type === "success"
                    ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-200"
                    : "bg-rose-950/80 border border-rose-500/40 text-rose-200"
                }`}
              >
                {topupFeedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{topupFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleTopupSubmit} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
                  จำนวนเงินที่ต้องการเติม (บาท)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {["100", "300", "500", "1000"].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopupAmount(amt)}
                      className={`py-2 rounded-lg font-mono text-xs border transition-colors cursor-pointer ${
                        topupAmount === amt
                          ? "bg-[#EEEFF2] text-[#010101] font-bold border-[#EEEFF2]"
                          : "bg-[#010101]/60 text-[#EEEFF2]/70 border-[#EEEFF2]/10 hover:bg-[#010101]"
                      }`}
                    >
                      {amt} ฿
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-mono text-sm text-[#EEEFF2] focus:outline-none focus:border-[#EEEFF2]"
                />
              </div>

              {/* QR Display */}
              <div className="p-4 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/15 text-center">
                <div className="w-40 h-40 mx-auto p-2 bg-white rounded-xl shadow-lg flex items-center justify-center my-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/promptpay-qr.jpg"
                    alt="PromptPay QR"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="font-mono text-xs text-[#EEEFF2]/60 mt-2">
                  พร้อมเพย์: 081-234-5678 (3NFM Platform)
                </div>
                <div className="font-mono text-xl font-bold text-emerald-400 mt-1">
                  ยอดที่ต้องโอน: {parseFloat(topupAmount || "0").toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </div>
              </div>

              {/* Slip Attachment */}
              <div>
                <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
                  แนบสลิปหลักฐานการโอนเงิน (JPG, PNG)
                </label>
                {slipBase64 ? (
                  <div className="p-3 rounded-xl bg-[#010101]/50 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slipBase64}
                        alt="Slip preview"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-sans text-xs text-[#EEEFF2] truncate max-w-[200px]">
                        {slipFileName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSlipBase64(null);
                        setSlipFileName(null);
                      }}
                      className="p-1.5 rounded-lg bg-rose-950 text-rose-400 border border-rose-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-[#EEEFF2]/20 hover:border-sky-400/60 bg-[#010101]/40 text-center cursor-pointer transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProcessSlip(file);
                      }}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-sky-400 mx-auto mb-1" />
                    <span className="font-sans text-xs text-[#EEEFF2]/80 block">
                      คลิกเพื่อแนบสลิปโอนเงิน
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingTopup}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 disabled:bg-[#272835] text-[#010101] disabled:text-[#EEEFF2]/40 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isSubmittingTopup ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>กำลังส่งคำขอเติมเงิน...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>ยืนยันการแจ้งโอนเงิน</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
