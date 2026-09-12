"use client";

import { useState, useEffect } from "react";
import {
  Store,
  X,
  Globe,
  Phone,
  CreditCard,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

export default function CreateStoreModal() {
  const { isCreateModalOpen, setIsCreateModalOpen, refreshStores, setActiveStoreId } = useStore();

  const [storeName, setStoreName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [truemoneyPhone, setTruemoneyPhone] = useState("0812345678");
  const [promptpayNumber, setPromptpayNumber] = useState("0812345678");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  // Subdomain Validation State
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  }>({
    checked: false,
    available: false,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Debounced Subdomain Check (500ms)
  useEffect(() => {
    const clean = subdomain.trim().toLowerCase();
    if (!clean) {
      setSubdomainStatus({ checked: false, available: false, message: "" });
      setIsCheckingSubdomain(false);
      return;
    }

    if (clean.length < 3) {
      setSubdomainStatus({
        checked: true,
        available: false,
        message: "ความยาวต้องอย่างน้อย 3 ตัวอักษร",
      });
      setIsCheckingSubdomain(false);
      return;
    }

    setIsCheckingSubdomain(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stores/check-subdomain?subdomain=${encodeURIComponent(clean)}`);
        const data = await res.json();
        setSubdomainStatus({
          checked: true,
          available: data.available,
          message: data.available ? data.message : data.reason,
        });
      } catch {
        setSubdomainStatus({
          checked: true,
          available: false,
          message: "ไม่สามารถตรวจสอบ Subdomain ได้",
        });
      } finally {
        setIsCheckingSubdomain(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomain]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!storeName.trim()) {
      setErrorMessage("กรุณาระบุชื่อร้านค้า");
      return;
    }

    if (!subdomainStatus.available) {
      setErrorMessage(subdomainStatus.message || "กรุณาระบุ Subdomain ที่พร้อมใช้งาน");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/stores/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: storeName.trim(),
          subdomain: subdomain.trim().toLowerCase(),
          truemoney_phone: truemoneyPhone.trim(),
          promptpay_number: promptpayNumber.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "เกิดข้อผิดพลาดในการสร้างร้านค้า");
      }

      await refreshStores();
      const createdId = json.data?.store_id || json.store?.id;
      if (createdId) {
        setActiveStoreId(createdId);
      }

      // รีเซ็ตฟอร์มและปิด Modal
      setStoreName("");
      setSubdomain("");
      setTagline("");
      setDescription("");
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err?.message || "ไม่สามารถสร้างร้านค้าได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/15 flex items-center justify-center text-[#EEEFF2]/60 hover:text-[#EEEFF2] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#272835] border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-semibold mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>14-DAY FREE TRIAL</span>
            </div>
            <h2 className="font-bebas text-2xl tracking-wide text-[#EEEFF2] leading-none">
              สร้างร้านค้าใหม่ (CREATE TENANT STORE)
            </h2>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Store Name */}
          <div>
            <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-1.5">
              ชื่อร้านค้า (Store Name) <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value);
                if (!subdomain) {
                  const autoSlug = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, "-")
                    .replace(/-+/g, "-")
                    .replace(/^-|-$/g, "")
                    .substring(0, 30);
                  setSubdomain(autoSlug);
                }
              }}
              placeholder="เช่น Thunder Motorsport Lab"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-xs text-[#EEEFF2] focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Subdomain */}
          <div>
            <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-1.5">
              Subdomain ร้านค้า <span className="text-amber-400">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="inline-flex items-center px-3 py-2.5 rounded-l-xl bg-[#272835] border border-r-0 border-[#EEEFF2]/20 text-[#EEEFF2]/60 font-mono text-xs">
                3nfm.shop/
              </span>
              <input
                type="text"
                required
                value={subdomain}
                onChange={(e) =>
                  setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                }
                placeholder="my-shop"
                className="flex-1 px-3 py-2.5 rounded-r-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors"
              />
              <div className="absolute right-3 flex items-center">
                {isCheckingSubdomain && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#EEEFF2]/60" />}
                {!isCheckingSubdomain && subdomainStatus.checked && subdomainStatus.available && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                {!isCheckingSubdomain && subdomainStatus.checked && !subdomainStatus.available && (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
              </div>
            </div>

            {subdomain && (
              <div className="mt-1.5 font-mono text-[11px]">
                {isCheckingSubdomain ? (
                  <span className="text-[#EEEFF2]/60">กำลังตรวจสอบ...</span>
                ) : subdomainStatus.checked ? (
                  <span className={subdomainStatus.available ? "text-emerald-400" : "text-rose-400"}>
                    {subdomainStatus.message}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Gateways Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-sans text-[11px] font-semibold text-[#EEEFF2] uppercase tracking-wider mb-1">
                เบอร์ TrueMoney Wallet <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#EEEFF2]/40">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  required
                  value={truemoneyPhone}
                  onChange={(e) => setTruemoneyPhone(e.target.value)}
                  placeholder="0812345678"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-xs font-mono text-[#EEEFF2] focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-[11px] font-semibold text-[#EEEFF2] uppercase tracking-wider mb-1">
                เบอร์/เลขพร้อมเพย์ <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#EEEFF2]/40">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  required
                  value={promptpayNumber}
                  onChange={(e) => setPromptpayNumber(e.target.value)}
                  placeholder="0812345678"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-xs font-mono text-[#EEEFF2] focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block font-sans text-[11px] font-semibold text-[#EEEFF2] uppercase tracking-wider mb-1">
              สโลแกนร้านค้า (Tagline) <span className="text-[#EEEFF2]/40">(ไม่บังคับ)</span>
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="เช่น DOMINATE EVERY CORNER"
              className="w-full px-3 py-2 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-xs text-[#EEEFF2] focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Trial info badge */}
          <div className="p-3 rounded-xl bg-[#272835]/40 border border-[#EEEFF2]/10 flex items-center gap-2 text-[11px] text-[#EEEFF2]/70 font-sans">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>รับสิทธิ์ทดลองใช้ฟรี 14 วัน พร้อมสร้าง 1 สินค้าตัวอย่างเริ่มต้นในร้านทันที</span>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isCheckingSubdomain || !subdomainStatus.available}
              className="w-full py-3 rounded-xl bg-[#EEEFF2] text-[#010101] font-semibold text-xs hover:bg-[#EEEFF2]/90 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้างร้านค้า...</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4" />
                  <span>สร้างร้านค้าใหม่และเริ่มใช้งาน 14 วัน</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
