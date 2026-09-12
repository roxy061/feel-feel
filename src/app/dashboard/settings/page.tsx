"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Settings,
  Store,
  Globe,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Save,
  Loader2,
  Plus,
  RefreshCw,
  Video,
  Image as ImageIcon,
} from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface StoreDetail {
  id: number;
  subdomain: string;
  name: string;
  description: string | null;
  tagline: string | null;
  decorative_text: string | null;
  video_url: string | null;
  banner_url: string | null;
  truemoney_phone: string | null;
  promptpay_number: string | null;
  expires_at: string | null;
  status: string;
  is_expired: boolean;
  days_remaining: number;
}

export default function StoreSettingsPage() {
  const {
    stores,
    activeStoreId,
    setActiveStoreId,
    refreshStores,
    setIsCreateModalOpen,
  } = useStore();

  const [storeData, setStoreData] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [decorativeText, setDecorativeText] = useState("");
  const [truemoneyPhone, setTruemoneyPhone] = useState("");
  const [promptpayNumber, setPromptpayNumber] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const fetchStoreData = useCallback(async (storeId?: number | null) => {
    if (!storeId) return;
    setLoading(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/merchant/stores/${storeId}`);
      const json = await res.json();

      if (json.success && json.store) {
        setStoreData(json.store);

        // Initialize form fields
        setName(json.store.name || "");
        setTagline(json.store.tagline || "");
        setDescription(json.store.description || "");
        setDecorativeText(json.store.decorative_text || "");
        setTruemoneyPhone(json.store.truemoney_phone || "");
        setPromptpayNumber(json.store.promptpay_number || "");
        setVideoUrl(json.store.video_url || "");
        setBannerUrl(json.store.banner_url || "");
      } else {
        setNotification({
          type: "error",
          message: json.message || "ไม่สามารถโหลดข้อมูลร้านค้าได้",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeStoreId) {
      fetchStoreData(activeStoreId);
    }
  }, [activeStoreId, fetchStoreData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStoreId) return;

    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/merchant/stores/${activeStoreId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          tagline: tagline.trim(),
          description: description.trim(),
          decorative_text: decorativeText.trim(),
          truemoney_phone: truemoneyPhone.trim(),
          promptpay_number: promptpayNumber.trim(),
          video_url: videoUrl.trim() || null,
          banner_url: bannerUrl.trim() || null,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setNotification({
          type: "success",
          message: "บันทึกการตั้งค่าร้านค้าเรียบร้อยแล้ว",
        });
        setStoreData((prev) => (prev ? { ...prev, ...json.store } : null));
        await refreshStores();
      } else {
        setNotification({
          type: "error",
          message: json.message || "บันทึกข้อมูลไม่สำเร็จ",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyStorefrontLink = () => {
    if (typeof window !== "undefined" && storeData) {
      const fullUrl = `${window.location.origin}/${storeData.subdomain}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading && !storeData) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#EEEFF2]" />
        <div className="font-mono text-xs text-[#EEEFF2]/60">
          Loading Store Settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Title & Store Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEEFF2]/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 text-xs font-mono text-[#EEEFF2]/80 mb-2">
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            <span>STORE CONFIGURATION & GATEWAYS</span>
          </div>
          <h1 className="font-bebas text-3xl sm:text-4xl tracking-wider text-[#EEEFF2]">
            การตั้งค่าร้านค้า (STORE SETTINGS)
          </h1>
          <p className="font-sans text-xs text-[#EEEFF2]/60 mt-0.5">
            ปรับแต่งชื่อร้าน สโลแกน คำอธิบาย ข้อมูลชำระเงิน และลิงก์หน้าร้านของร้านที่เลือก
          </p>
        </div>

        {/* Switcher & New Store CTA */}
        <div className="flex items-center gap-2.5">
          {stores.length > 1 && (
            <div className="relative">
              <select
                value={activeStoreId || ""}
                onChange={(e) => setActiveStoreId(Number(e.target.value))}
                className="px-3.5 py-2 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 text-xs font-semibold text-[#EEEFF2] focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#010101] text-[#EEEFF2]">
                    {s.name} (@{s.subdomain})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EEEFF2] text-[#010101] hover:bg-[#EEEFF2]/90 text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เปิดร้านใหม่</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            notification.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Storefront URL Preview & Status Card */}
      {storeData && (
        <div className="p-6 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 shadow-lg">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bebas text-2xl tracking-wide text-[#EEEFF2]">
                {storeData.name}
              </span>
              <span
                className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full border ${
                  storeData.is_expired
                    ? "bg-rose-950/40 border-rose-500/40 text-rose-400"
                    : "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                }`}
              >
                {storeData.is_expired ? "EXPIRED" : "ACTIVE"}
              </span>
            </div>

            <div className="font-mono text-xs text-[#EEEFF2]/60 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>หน้าร้าน: </span>
              <span className="text-amber-300 font-semibold">/{storeData.subdomain}</span>
            </div>

            <div className="font-sans text-xs text-[#EEEFF2]/50 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#EEEFF2]/40" />
              <span>
                {storeData.is_expired
                  ? "หมดอายุการใช้งานแล้ว กรุณาต่ออายุในแดชบอร์ด"
                  : `เหลือเวลาใช้งานอีก ${storeData.days_remaining} วัน (หมดอายุ: ${
                      storeData.expires_at
                        ? new Date(storeData.expires_at).toLocaleDateString("th-TH")
                        : "ไม่มีกำหนด"
                    })`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={copyStorefrontLink}
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-xs font-semibold text-[#EEEFF2] transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกลิงก์แล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </button>

            <Link
              href={`/${storeData.subdomain}`}
              target="_blank"
              className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EEEFF2] text-[#010101] hover:bg-[#EEEFF2]/90 text-xs font-semibold transition-all shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดหน้าร้าน</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General Info */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#EEEFF2]/10 pb-3">
            <Store className="w-4 h-4 text-sky-400" />
            <h2 className="font-bebas text-xl tracking-wide text-[#EEEFF2]">
              ข้อมูลพื้นฐานร้านค้า (STORE IDENTITY)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                ชื่อร้านค้า (Store Name) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                Subdomain <span className="text-[#EEEFF2]/40">(แก้ไขไม่ได้)</span>
              </label>
              <input
                type="text"
                disabled
                value={storeData?.subdomain || ""}
                className="w-full px-4 py-2.5 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 text-amber-400/80 font-mono text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
              สโลแกนร้านค้า (Tagline)
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="เช่น DOMINATE EVERY CORNER WITH PRECISION"
              className="w-full px-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
              คำอธิบายร้านค้า (Description)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="แนะนำร้านค้า ความเป็นมา หรือข้อมูลการติดต่อ..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs focus:outline-none focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
              ข้อความลายน้ำตกแต่ง Hero Section (Decorative Watermark Text)
            </label>
            <input
              type="text"
              value={decorativeText}
              onChange={(e) => setDecorativeText(e.target.value)}
              placeholder="เช่น 3NFM MOTORSPORT LAB"
              className="w-full px-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs focus:outline-none focus:border-amber-400 transition-colors font-mono uppercase"
            />
          </div>
        </div>

        {/* Section 2: Payment Gateways */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#EEEFF2]/10 pb-3">
            <CreditCard className="w-4 h-4 text-amber-400" />
            <h2 className="font-bebas text-xl tracking-wide text-[#EEEFF2]">
              ช่องทางการรับเงิน (PAYMENT GATEWAYS)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                เบอร์ TrueMoney Wallet (รับเงินซองของขวัญ) <span className="text-amber-400">*</span>
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
              <p className="font-sans text-[10px] text-[#EEEFF2]/50 mt-1.5">
                ระบบจะใช้เบอร์นี้ในการดึงยอดเงินจากลิงก์ซองของขวัญที่ลูกค้าส่งมาโดยอัตโนมัติ
              </p>
            </div>

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
              <p className="font-sans text-[10px] text-[#EEEFF2]/50 mt-1.5">
                ใช้สร้าง QR Code PromptPay มาตรฐานสำหรับการโอนเงินพร้อมแนบสลิป
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Media & Background Assets */}
        <div className="p-6 sm:p-8 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 space-y-5">
          <div className="flex items-center gap-2 border-b border-[#EEEFF2]/10 pb-3">
            <Video className="w-4 h-4 text-purple-400" />
            <h2 className="font-bebas text-xl tracking-wide text-[#EEEFF2]">
              สื่อและพื้นหลังหน้าร้าน (STORE MEDIA & BACKGROUND)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                URL วิดีโอพื้นหลัง Hero Section (.mp4)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#EEEFF2]/40">
                  <Video className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://.../video.mp4"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[#EEEFF2]/30"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-[#EEEFF2] uppercase tracking-wider mb-2">
                URL ภาพแบนเนอร์พื้นหลัง (Banner Fallback Image)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#EEEFF2]/40">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://.../banner.jpg"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs focus:outline-none focus:border-amber-400 transition-colors placeholder:text-[#EEEFF2]/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => fetchStoreData(activeStoreId)}
            className="px-5 py-3 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/15 text-xs font-semibold text-[#EEEFF2] transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเซ็ต</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-[#EEEFF2] text-[#010101] font-semibold text-xs hover:bg-[#EEEFF2]/90 disabled:opacity-50 transition-all shadow-xl flex items-center gap-2 cursor-pointer active:scale-95"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#010101]" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#010101]" />
                <span>บันทึกการตั้งค่าร้านค้า</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
