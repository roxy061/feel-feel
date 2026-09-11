"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  QrCode,
  Calendar,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CheckCircle,
  Clock,
  Sparkles,
  X,
  ShieldCheck,
} from "lucide-react";
import { useTenant } from "../TenantContext";

export default function MerchantBillingPage() {
  const { currentSubdomain } = useTenant();
  const [store, setStore] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Top-up Modal
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState(300);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [topupLoading, setTopupLoading] = useState(false);

  // Renew action
  const [renewing, setRenewing] = useState(false);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/billing?subdomain=${currentSubdomain}`);
      const data = await res.json();
      if (res.ok) {
        setStore(data.store);
        setWallet(data.wallet);
      }
    } catch (err) {
      console.error("Fetch billing error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [currentSubdomain]);

  const handleGenerateTopupQR = async (amount: number) => {
    setTopupAmount(amount);
    setTopupLoading(true);
    try {
      const res = await fetch("/api/merchant/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-qr",
          subdomain: currentSubdomain,
          amount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQrCodeData(data.qrCode);
      }
    } catch (err) {
      alert("ไม่สามารถสร้าง QR Code ได้");
    } finally {
      setTopupLoading(false);
    }
  };

  const handleConfirmTopupSimulated = async () => {
    setTopupLoading(true);
    try {
      const res = await fetch("/api/merchant/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "topup",
          subdomain: currentSubdomain,
          amount: topupAmount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`เติมเงินสำเร็จ ${topupAmount} บาท เข้ากระเป๋าเรียบร้อยแล้ว!`);
        setIsTopupOpen(false);
        setQrCodeData(null);
        fetchBilling();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเติมเงิน");
    } finally {
      setTopupLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    if (
      !confirm(
        "ยืนยันการต่ออายุร้านค้า 30 วัน? (ระบบจะใช้ 1 Token หรือหัก 300 บาทจากกระเป๋าเงิน)"
      )
    )
      return;

    setRenewing(true);
    try {
      const res = await fetch("/api/merchant/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "renew",
          subdomain: currentSubdomain,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchBilling();
      } else {
        alert(data.message || data.error);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการต่ออายุ");
    } finally {
      setRenewing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>กำลังโหลดข้อมูลการเงินและโทเคน...</span>
      </div>
    );
  }

  const expireDate = new Date(store.expireAt);
  const daysLeft = Math.ceil(
    (expireDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-purple-400" />
          ระบบการเงิน บิลลิ่ง และโทเคน (Billing & Tokens)
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          จัดการกระเป๋าเงิน Wallet, เติมเงิน PromptPay, และต่ออายุร้านค้า (1 Token = 30 วัน)
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-slate-950 border border-purple-500/30 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-3">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-400" />
                กระเป๋าเงินร้านค้า (Merchant Wallet)
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-[10px] text-purple-300 border border-purple-500/40">
                THB Balance
              </span>
            </div>
            <div className="text-4xl font-black text-white tracking-tight">
              {wallet?.balance?.toFixed(2) || "0.00"}{" "}
              <span className="text-lg font-normal text-purple-400">บาท</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              ใช้สำหรับคิดค่าบริการ API Gateway อัตโนมัติ (0.35 บาท/ครั้ง) และต่ออายุร้านค้า
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-purple-500/20 flex items-center gap-3">
            <button
              onClick={() => {
                setIsTopupOpen(true);
                handleGenerateTopupQR(300);
              }}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>เติมเงินผ่าน PromptPay Dynamic QR</span>
            </button>
          </div>
        </div>

        {/* Subscription & Token Card */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-3">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                อายุสัญญาเช่าร้านค้า (Subscription Lifecycle)
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  store.status === "ACTIVE"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
              >
                {store.status}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {daysLeft > 0 ? `${daysLeft} วัน` : "หมดอายุ"}
              </span>
              <span className="text-xs text-slate-400">
                (ถึง {expireDate.toLocaleDateString("th-TH")})
              </span>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">โทเคนคงเหลือ (Token Balance)</span>
              <span className="font-bold text-amber-400 font-mono text-sm">
                {store.tokenBalance} Token
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={handleRenewSubscription}
              disabled={renewing}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {renewing
                  ? "กำลังต่ออายุ..."
                  : "ต่ออายุร้านค้า 30 วัน (หัก 1 Token หรือ 300฿)"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            ประวัติการทำธุรกรรมกระเป๋าเงิน (Wallet Transactions)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {wallet?.transactions?.length || 0} รายการ
          </span>
        </div>

        {wallet?.transactions?.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            ยังไม่มีประวัติการทำธุรกรรม
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">วันที่-เวลา</th>
                  <th className="p-3.5">ประเภทธุรกรรม</th>
                  <th className="p-3.5">คำอธิบาย</th>
                  <th className="p-3.5">เลขอ้างอิง</th>
                  <th className="p-3.5 text-right">จำนวนเงิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {wallet?.transactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 text-slate-400">
                      {new Date(tx.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.amount > 0
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {tx.amount > 0 ? (
                          <ArrowDownLeft className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        <span>{tx.type}</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-sans">{tx.description}</td>
                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {tx.reference || "-"}
                    </td>
                    <td
                      className={`p-3.5 text-right font-bold text-sm ${
                        tx.amount > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)}{" "}
                      ฿
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Topup PromptPay Modal */}
      {isTopupOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-800 p-6 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                เติมเงินผ่าน PromptPay Dynamic QR
              </h3>
              <button
                onClick={() => {
                  setIsTopupOpen(false);
                  setQrCodeData(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Amount Selectors */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[100, 300, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleGenerateTopupQR(amt)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                    topupAmount === amt
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {amt} ฿
                </button>
              ))}
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 inline-block mb-4 shadow-md">
              {topupLoading || !qrCodeData ? (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <img
                  src={qrCodeData}
                  alt="PromptPay QR Code"
                  className="w-48 h-48 mx-auto"
                />
              )}
              <div className="text-[11px] text-slate-700 font-mono mt-2">
                ยอดเติม:{" "}
                <span className="font-extrabold text-blue-600 text-sm">
                  {topupAmount.toLocaleString()} บาท
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 mb-5">
              สแกน QR ด้วยแอปพลิเคชันธนาคาร หรือกดปุ่มด้านล่างเพื่อจำลองการโอนสำเร็จทันที
            </div>

            <div className="space-y-2">
              <button
                onClick={handleConfirmTopupSimulated}
                disabled={topupLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>จำลองการโอนเงินสำเร็จ (+{topupAmount} ฿)</span>
              </button>
              <button
                onClick={() => {
                  setIsTopupOpen(false);
                  setQrCodeData(null);
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
