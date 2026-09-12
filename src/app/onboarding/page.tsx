"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Store,
  Globe,
  Phone,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Loader2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  LayoutDashboard,
} from "lucide-react";

export default function OnboardingPage() {
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

  // Form Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdStore, setCreatedStore] = useState<{
    store_id: number;
    subdomain: string;
    name: string;
    store_url: string;
    expires_at: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Debounced Subdomain Check (500ms)
  useEffect(() => {
    const cleanSubdomain = subdomain.trim().toLowerCase();

    if (!cleanSubdomain) {
      setSubdomainStatus({ checked: false, available: false, message: "" });
      setIsCheckingSubdomain(false);
      return;
    }

    if (cleanSubdomain.length < 3) {
      setSubdomainStatus({
        checked: true,
        available: false,
        message: "Subdomain ต้องมีความยาวอย่างน้อย 3 ตัวอักษร",
      });
      setIsCheckingSubdomain(false);
      return;
    }

    setIsCheckingSubdomain(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/stores/check-subdomain?subdomain=${encodeURIComponent(cleanSubdomain)}`
        );
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
          message: "ไม่สามารถตรวจสอบ Subdomain ได้ในขณะนี้",
        });
      } finally {
        setIsCheckingSubdomain(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [subdomain]);

  // Handle Form Submit
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
      const res = await fetch("/api/stores/create", {
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

      setCreatedStore(json.data);
    } catch (err: any) {
      setErrorMessage(err?.message || "ไม่สามารถเปิดร้านค้าได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof window !== "undefined") {
      const fullUrl = `${window.location.origin}${text}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Navigation Header */}
      <nav className="border-b border-[#EEEFF2]/15 bg-[#010101]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 flex items-center justify-center text-[#EEEFF2]">
              <Layers className="w-5 h-5 text-[#EEEFF2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bebas text-2xl tracking-widest text-[#EEEFF2] leading-none">
                3NFM
              </span>
              <span className="font-mono text-[10px] text-[#EEEFF2]/60 uppercase tracking-wider">
                Multi-Tenant Storefront Onboarding
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/15 text-xs font-semibold text-[#EEEFF2] transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
              <span>Merchant Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {createdStore ? (
          /* Success Screen */
          <div className="rounded-xl border border-emerald-500/30 bg-[#090A0F] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="font-mono text-xs text-emerald-400 tracking-wider uppercase mb-2">
              ONBOARDING COMPLETE &bull; FREE TRIAL ACTIVATED
            </div>

            <h1 className="font-bebas text-4xl sm:text-5xl tracking-wide text-[#EEEFF2] mb-3">
              ยินดีด้วย! ร้านค้าของคุณพร้อมเปิดให้บริการแล้ว
            </h1>

            <p className="font-sans text-sm sm:text-base text-[#EEEFF2]/75 leading-relaxed mb-8 max-w-2xl">
              ร้านค้า <span className="text-white font-semibold">{createdStore.name}</span> ได้รับสิทธิ์ทดลองใช้งานฟรี 14 วัน พร้อมสร้างกระเป๋าเงินและลงรายการสินค้าเริ่มต้น 2 รายการเรียบร้อยแล้ว
            </p>

            {/* Store URL Card */}
            <div className="p-5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/15 mb-8">
              <div className="font-mono text-xs text-[#EEEFF2]/60 mb-2">
                STOREFRONT DOMAIN URL
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="font-mono text-base text-amber-400 font-semibold break-all">
                  /{createdStore.subdomain}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdStore.store_url)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-xs font-semibold text-[#EEEFF2] transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกลิงก์</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/${createdStore.subdomain}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EEEFF2] text-[#010101] hover:bg-[#EEEFF2]/90 text-xs font-semibold transition-all shadow-md"
                  >
                    <span>เปิดหน้าร้าน</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#EEEFF2] text-[#010101] hover:bg-[#EEEFF2]/90 font-semibold text-sm transition-all shadow-xl"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>เข้าสู่ Merchant Dashboard จัดการร้านค้า</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setCreatedStore(null);
                  setStoreName("");
                  setSubdomain("");
                  setTagline("");
                  setDescription("");
                }}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/15 text-xs font-semibold text-[#EEEFF2] transition-all"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span>เปิดร้านค้าใหม่อีกร้าน</span>
              </button>
            </div>
          </div>
        ) : (
          /* Onboarding Form Screen */
          <div className="space-y-8">
            {/* Header / Hero */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#272835] border border-amber-500/30 text-xs font-mono text-amber-300 mb-4 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>14-DAY FREE TRIAL ACTIVATION</span>
              </div>

              <h1 className="font-bebas text-4xl sm:text-6xl tracking-wider text-[#EEEFF2] leading-none mb-4">
                LAUNCH YOUR STOREFRONT IN SECONDS
              </h1>

              <p className="font-sans text-sm sm:text-base text-[#EEEFF2]/70 max-w-2xl leading-relaxed">
                สร้างร้านค้าออนไลน์ระดับมอเตอร์สปอร์ตของคุณเองบนโครงสร้างระบบมัลติเทแนนต์ 3NFM เชื่อมต่อระบบชำระเงินอัตโนมัติ พร้อมสิทธิ์ทดลองใช้งานฟรี 14 วันเต็ม
              </p>
            </div>

            {/* Plan Perks Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#272835]/40 border border-[#EEEFF2]/10 font-sans text-xs">
              <div className="flex items-center gap-2.5 text-[#EEEFF2]/80">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ฟรี 14 วัน ไม่ต้องผูกบัตรเครดิต</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#EEEFF2]/80">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ลงสินค้าเริ่มต้น 2 รายการพร้อมขายทันที</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#EEEFF2]/80">
                <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Subdomain โดเมนเฉพาะร้านค้าแยกอิสระ</span>
              </div>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-100 mb-0.5">เกิดข้อผิดพลาด</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 space-y-6 shadow-xl">
              {/* Field 1: Store Name */}
              <div>
                <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                  ชื่อร้านค้า (Store Name) <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#EEEFF2]/40">
                    <Store className="w-4 h-4" />
                  </div>
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
                    placeholder="เช่น Thunder Motorsport Lab, Boost Spec Shop"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[#EEEFF2]/30"
                  />
                </div>
                <p className="font-sans text-[11px] text-[#EEEFF2]/50 mt-1.5">
                  ชื่อร้านค้าจะแสดงบนแถบเนวิเกชัน หัวข้อหลัก และแท็กเมทาดาต้าของหน้าร้าน
                </p>
              </div>

              {/* Field 2: Subdomain with Real-time Debounce Validation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider">
                    ชื่อ Subdomain ของร้านค้า <span className="text-amber-400">*</span>
                  </label>
                  <span className="font-mono text-[11px] text-[#EEEFF2]/50">
                    ความยาว 3 - 30 ตัวอักษร
                  </span>
                </div>

                <div className="relative flex items-center">
                  <span className="inline-flex items-center px-3.5 py-3 rounded-l-xl bg-[#272835] border border-r-0 border-[#EEEFF2]/20 text-[#EEEFF2]/60 font-mono text-xs">
                    3nfm.shop/
                  </span>
                  <input
                    type="text"
                    required
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    placeholder="my-shop"
                    className="flex-1 py-3 px-3.5 rounded-r-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[#EEEFF2]/30"
                  />

                  <div className="absolute right-3.5 flex items-center">
                    {isCheckingSubdomain && (
                      <Loader2 className="w-4 h-4 animate-spin text-[#EEEFF2]/60" />
                    )}
                    {!isCheckingSubdomain && subdomainStatus.checked && subdomainStatus.available && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {!isCheckingSubdomain && subdomainStatus.checked && !subdomainStatus.available && (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>
                </div>

                {/* Subdomain Feedback Status Pill */}
                {subdomain && (
                  <div className="mt-2 flex items-center gap-2">
                    {isCheckingSubdomain ? (
                      <div className="font-mono text-xs text-[#EEEFF2]/60 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>กำลังตรวจสอบความพร้อมใช้งานในฐานข้อมูล...</span>
                      </div>
                    ) : subdomainStatus.checked ? (
                      <div
                        className={`font-mono text-xs flex items-center gap-1.5 ${
                          subdomainStatus.available ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {subdomainStatus.available ? (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3 h-3 shrink-0" />
                        )}
                        <span>{subdomainStatus.message}</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Grid: Payment Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#EEEFF2]/10">
                {/* Field 3: TrueMoney Phone */}
                <div>
                  <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                    เบอร์ TrueMoney Wallet (รับเงิน) <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#EEEFF2]/40">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={truemoneyPhone}
                      onChange={(e) => setTruemoneyPhone(e.target.value)}
                      placeholder="0812345678"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <p className="font-sans text-[10px] text-[#EEEFF2]/50 mt-1">
                    เบอร์โทรศัพท์สำหรับรับยอดเงินซองของขวัญอั่งเปาอัตโนมัติ
                  </p>
                </div>

                {/* Field 4: PromptPay Number */}
                <div>
                  <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                    เบอร์ / เลขพร้อมเพย์ (PromptPay QR) <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#EEEFF2]/40">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={promptpayNumber}
                      onChange={(e) => setPromptpayNumber(e.target.value)}
                      placeholder="0812345678 หรือ 13 หลัก"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                  <p className="font-sans text-[10px] text-[#EEEFF2]/50 mt-1">
                    เลขพร้อมเพย์สำหรับสร้าง QR Code ให้ลูกค้าสแกนจ่ายเงิน
                  </p>
                </div>
              </div>

              {/* Field 5: Tagline (Optional) */}
              <div className="pt-2 border-t border-[#EEEFF2]/10">
                <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                  สโลแกนร้านค้า (Tagline) <span className="text-[#EEEFF2]/40">(ไม่บังคับ)</span>
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="เช่น ENGINEERED FOR SUPREMACY, DOMINATE EVERY TRACK"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[#EEEFF2]/30"
                />
              </div>

              {/* Field 6: Description (Optional) */}
              <div>
                <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                  คำอธิบายร้านค้า (Description) <span className="text-[#EEEFF2]/40">(ไม่บังคับ)</span>
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="แนะนำร้านค้า ความเชี่ยวชาญ และจุดเด่นของผลิตภัณฑ์ของคุณ..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[#EEEFF2]/30 resize-none"
                />
              </div>

              {/* Submit CTA Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || isCheckingSubdomain || !subdomainStatus.available}
                  className="w-full py-4 rounded-xl bg-[#EEEFF2] text-[#010101] font-semibold text-sm hover:bg-[#EEEFF2]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#010101]" />
                      <span>กำลังสร้างร้านค้าและระบบวอลเล็ต...</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-4 h-4 text-[#010101]" />
                      <span>เปิดร้านค้าและรับสิทธิ์ทดลองใช้งาน 14 วันทันที</span>
                      <ArrowRight className="w-4 h-4 text-[#010101]" />
                    </>
                  )}
                </button>
                <div className="font-sans text-[11px] text-center text-[#EEEFF2]/50 mt-3">
                  เมื่อกดเปิดร้านค้า ระบบจะผูกบัญชีเข้ากับ Merchant Suite และเริ่มนับสิทธิ์ Free Trial 14 วัน
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EEEFF2]/15 py-6 bg-[#010101] text-xs text-[#EEEFF2]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EEEFF2]/60" />
            <span>3NFM Commerce Engine &bull; Multi-Tenant Onboarding</span>
          </div>
          <div className="font-mono text-[11px]">
            Zero Emojis &bull; Full TiDB Cloud / MySQL Synchronization
          </div>
        </div>
      </footer>
    </div>
  );
}
