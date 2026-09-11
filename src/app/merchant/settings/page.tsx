"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Store,
  QrCode,
  Palette,
  Globe,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useTenant } from "../TenantContext";

const PRESET_COLORS = [
  { name: "Ocean Blue", hex: "#2563eb" },
  { name: "Rose Pink", hex: "#db2777" },
  { name: "Emerald Green", hex: "#059669" },
  { name: "Purple Dream", hex: "#7c3aed" },
  { name: "Sunset Orange", hex: "#ea580c" },
  { name: "Dark Slate", hex: "#0f172a" },
];

export default function MerchantSettingsPage() {
  const { currentSubdomain } = useTenant();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [promptpayNumber, setPromptpayNumber] = useState("");
  const [promptpayName, setPromptpayName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/settings?subdomain=${currentSubdomain}`);
      const data = await res.json();
      if (res.ok && data.store) {
        setStore(data.store);
        setName(data.store.name || "");
        setDescription(data.store.description || "");
        setPrimaryColor(data.store.primaryColor || "#2563eb");
        setPromptpayNumber(data.store.promptpayNumber || "");
        setPromptpayName(data.store.promptpayName || "");
        setLogoUrl(data.store.logoUrl || "");
        setBannerUrl(data.store.bannerUrl || "");
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [currentSubdomain]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/merchant/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSubdomain,
          name,
          description,
          primaryColor,
          promptpayNumber,
          promptpayName,
          logoUrl,
          bannerUrl,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกการตั้งค่า");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>กำลังโหลดการตั้งค่า...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          ตั้งค่าร้านค้า & แบรนดิ้ง (Store Settings)
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          ปรับแต่งชื่อร้าน ธีมสี โลโก้ และข้อมูลบัญชี PromptPay รับเงินของร้านค้า
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>บันทึกการตั้งค่าร้านค้าสำเร็จเรียบร้อยแล้ว! หน้าร้านค้าจะแสดงผลตามที่ตั้งค่าทันที</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Store className="w-4 h-4 text-blue-400" />
            ข้อมูลร้านค้าทั่วไป
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ชื่อร้านค้า (Store Name) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Subdomain ร้านค้า
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  readOnly
                  value={currentSubdomain}
                  className="w-full bg-slate-950 border border-slate-800 rounded-l-lg px-3 py-2 text-slate-400 font-mono focus:outline-none"
                />
                <span className="bg-slate-900 border border-l-0 border-slate-800 px-3 py-2 text-slate-500 rounded-r-lg font-mono">
                  .yourdomain.com
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              สโลแกน / คำอธิบายร้านค้า
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ลิงก์รูปโลโก้ (Logo URL)
              </label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ลิงก์รูปแบนเนอร์ (Banner URL)
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Theme Primary Color */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Palette className="w-4 h-4 text-pink-400" />
            ธีมสีหลักประจำร้าน (Primary Theme Color)
          </h3>

          <div>
            <label className="block text-slate-300 font-medium mb-2">
              เลือกพาเลทสีสำเร็จรูป หรือระบุรหัสสี HEX
            </label>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {PRESET_COLORS.map((col) => (
                <button
                  type="button"
                  key={col.hex}
                  onClick={() => setPrimaryColor(col.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    primaryColor.toLowerCase() === col.hex.toLowerCase()
                      ? "border-white bg-slate-800 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: col.hex }}
                  />
                  <span>{col.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
              <span className="text-slate-500 text-[11px]">
                ตัวอย่างปุ่มและแบนเนอร์หน้าร้านจะใช้สีนี้
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: PromptPay Account */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <QrCode className="w-4 h-4 text-emerald-400" />
            ข้อมูลพร้อมเพย์สำหรับรับเงินลูกค้า (PromptPay Receiver)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                เบอร์โทรศัพท์ หรือ เลขบัตรประชาชนพร้อมเพย์ *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น 0812345678 หรือ 1100200300400"
                value={promptpayNumber}
                onChange={(e) => setPromptpayNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                ระบบจะนำไปสร้าง Dynamic QR Code ตามมาตรฐาน EMVCo อัตโนมัติ
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                ชื่อบัญชีผู้รับเงิน (แสดงใต้ QR Code) *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น นายสมชาย หรือ บจก. เทคสโตร์"
                value={promptpayName}
                onChange={(e) => setPromptpayName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่าทั้งหมด"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
