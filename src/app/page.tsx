"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Store,
  Terminal,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Cpu,
  ExternalLink,
  Code,
  Activity,
  Play,
} from "lucide-react";

export default function HomePage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<
    "products" | "slip-verify" | "ai-copywriter"
  >("ai-copywriter");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [activeSubdomain, setActiveSubdomain] = useState("techstore");

  const testApiKey =
    activeSubdomain === "techstore"
      ? "sk_live_tech9876543210abcdef123456"
      : "sk_live_fash4567890123abcdef987654";

  const runApiTest = async () => {
    setApiLoading(true);
    setApiResponse(null);

    let url = "/api/v1/store/products";
    let options: RequestInit = {
      method: "GET",
      headers: {
        "x-api-key": testApiKey,
      },
    };

    if (selectedEndpoint === "slip-verify") {
      url = "/api/v1/tools/slip-verify";
      options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": testApiKey,
        },
        body: JSON.stringify({
          slipUrl: "https://example.com/slip.jpg",
          expectedAmount: 2490,
          rawPayload: "00020101021229370016A00000067701011101130066819998877530376454072490.005802TH6304ABCD",
        }),
      };
    } else if (selectedEndpoint === "ai-copywriter") {
      url = "/api/v1/tools/ai-copywriter";
      options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": testApiKey,
        },
        body: JSON.stringify({
          productName:
            activeSubdomain === "techstore"
              ? "ANC Smart Headphone 2026"
              : "Linen Minimal Casual Shirt",
          category: activeSubdomain === "techstore" ? "Gadget" : "Fashion",
          highlights: "เบสแน่น ตัดเสียงรอบทิศทาง แบต 40 ชม. สวมใส่สบาย",
        }),
      };
    }

    try {
      const res = await fetch(url, options);
      const data = await res.json();
      setApiResponse({ status: res.status, data });
    } catch (err: any) {
      setApiResponse({ status: 500, error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-xs py-2 px-4 text-center font-medium text-white flex items-center justify-center gap-2">
        <span className="bg-white/20 px-2 py-0.5 rounded-full uppercase text-[10px] tracking-wider">
          Production Ready
        </span>
        ระบบ Multi-tenant SaaS ปล่อยเช่าร้านค้า & API Gateway อัตโนมัติ (Dynamic Subdomain + Pay-per-use 0.35฿)
      </div>

      {/* Navigation */}
      <header className="border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">
                FeelFeel<span className="text-blue-500">SaaS</span>
              </span>
              <span className="text-[10px] block text-slate-400 -mt-1 font-mono">
                Multi-tenant & API Engine
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">
              สถาปัตยกรรม 4 เสาหลัก
            </a>
            <a href="#live-demo" className="hover:text-blue-400 transition-colors">
              ร้านค้าตัวอย่าง (Demo)
            </a>
            <a href="#api-gateway" className="hover:text-blue-400 transition-colors">
              เกตเวย์ API (0.35฿)
            </a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors">
              แพ็กเกจราคา
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/merchant/dashboard"
              className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg transition-all"
            >
              Merchant Console
            </Link>
            <Link
              href="/store/techstore"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>เข้าชมหน้าร้าน</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl" />
          <div className="w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-3xl -translate-y-20 translate-x-20" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            ระบบสถาปัตยกรรมระดับองค์กร รองรับทั้ง Vercel และ Oracle Cloud VPS
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            แพลตฟอร์มปล่อยเช่าร้านค้าออนไลน์{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              และให้บริการ API อัตโนมัติ
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            ขับเคลื่อนด้วยระบบ Multi-tenancy เต็มรูปแบบ แยกข้อมูลลูกค้าด้วย{" "}
            <code className="text-blue-400 font-mono text-sm">tenant_id</code>, ระบบ
            PromptPay Dynamic QR, และเกตเวย์คิดเงินตามการเรียกใช้ API จริง 0.35 บาท
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/merchant/dashboard"
              className="px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 transition-all flex items-center gap-2 text-base"
            >
              <span>เปิดแดชบอร์ดเจ้าของร้าน</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#api-gateway"
              className="px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center gap-2 text-base"
            >
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>ทดลองยิง API Playground</span>
            </a>
          </div>

          {/* Quick Tenant Switcher Bar */}
          <div className="mt-14 max-w-3xl mx-auto p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm shadow-2xl">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-400" />
                เลือกร้านค้าจำลองในระบบ (Multi-tenant Live Stores)
              </span>
              <span className="text-emerald-400 text-[11px] font-mono">
                ● 2 Active Stores
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/store/techstore"
                className="group p-3 rounded-xl border border-blue-500/20 bg-blue-950/20 hover:bg-blue-900/30 hover:border-blue-500/40 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-blue-300 group-hover:text-blue-200">
                    🏬 TechStore Gadgets
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    subdomain: techstore (ธีมน้ำเงิน)
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </Link>

              <Link
                href="/store/fashionhub"
                className="group p-3 rounded-xl border border-pink-500/20 bg-pink-950/20 hover:bg-pink-900/30 hover:border-pink-500/40 transition-all text-left flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-sm text-pink-300 group-hover:text-pink-200">
                    👗 FashionHub Clothing
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    subdomain: fashionhub (ธีมชมพู)
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Architecture Breakdown */}
      <section id="features" className="py-20 bg-slate-900/50 border-t border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
              Core Architecture
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
              4 องค์ประกอบแกนกลางที่ทำงานประสานกัน
            </p>
            <p className="mt-4 text-slate-400">
              ตั้งแต่ระดับโครงสร้างเครือข่าย DNS และ Middleware ไปจนถึงการประมวลผลธุรกรรมทางการเงินและการหักค่าบริการ API
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pillar 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/30 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                1. สถาปัตยกรรม Multi-tenancy & Dynamic Routing
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                โครงสร้างแยกผู้เช่าแบบ Real-time ดักอ่าน Header Host ผ่าน Middleware เพื่อค้นหา{" "}
                <code className="text-blue-400 font-mono">store_id</code> จากฐานข้อมูล Shared Database โดยมี{" "}
                <code className="text-blue-400 font-mono">tenant_id</code> กำกับทุกตาราง ป้องกันข้อมูลปะปนกัน 100%
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Wildcard DNS & Reverse Proxy (*.yourdomain.com)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Next.js Middleware Host Resolution เสี้ยววินาที
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Shared Database, Shared Schema พร้อม Prisma ORM
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/30 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                2. หน้าร้านค้าสำเร็จรูปและแดชบอร์ดผู้เช่า
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Dynamic Storefront Engine แสดงผลตามธีมสี, โลโก้, รายการสินค้า และช่องทางติดต่อของร้านนั้นๆ พร้อม Merchant Console สำหรับจัดการสต็อก, ตรวจสอบออเดอร์, และตั้งค่าร้านค้า
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  ระบบ Template หน้าร้าน Responsive โหลดไว รองรับมือถือ
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  คอนโซลจัดการสินค้า, สต็อก, คำสั่งซื้อ และสลิปโอนเงิน
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  ปรับแต่งธีมสีและโลโก้ร้านค้าได้แบบอิสระ
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                3. ระบบการเงิน บิลลิ่ง และโทเคน (Token & Wallet)
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                ตรรกะควบคุมอายุร้านค้าด้วยระบบ Token (1 Token = ต่ออายุร้าน 30 วัน), กระเป๋าเงิน Wallet เติมเงินผ่าน PromptPay Dynamic QR และ Cron Worker ตรวจสอบวันหมดอายุอัตโนมัติ
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  สร้าง QR Code พร้อมเพย์มาตรฐาน EMVCo อัตโนมัติ
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  ระบบต่ออายุร้านค้า 30 วันด้วย 1 Token / 300 บาท
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  Background Cron Worker ตรวจสอบ expire_at อัตโนมัติ
                </li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">
                4. เกตเวย์และระบบบริการ API (0.35฿ / Call)
              </h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                โมเดลทำเงินอัตโนมัติ (API Monetization) คัดกรองสิทธิ์ผ่าน{" "}
                <code className="text-emerald-400 font-mono">x-api-key</code>, มี Rate Limiting, และหักค่าบริการ 0.35 บาทจาก Wallet ทันทีที่คำขอทำงานสำเร็จ พร้อมบันทึก Logs ละเอียด
              </p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Pay-per-use Billing หักเงินอัตโนมัติ 0.35฿ เมื่อสำเร็จ 200 OK
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ระบบ Rate Limiting จำกัด 60 requests/นาที ป้องกันระบบล่ม
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  บริการตรวจสลิป (Slip Verify) และ AI เขียนคำบรรยายสินค้า
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive API Gateway Playground */}
      <section id="api-gateway" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-3">
            <Activity className="w-3.5 h-3.5" />
            Live Metered API Gateway
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            ทดลองยิง API Gateway คิดเงินจริง 0.35฿ / Call
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            เลือก Endpoint ด้านล่าง แล้วกดปุ่มทดสอบเพื่อดูการตอบกลับของระบบพร้อมการหักค่าบริการจาก Wallet แบบ Real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                เลือกร้านค้าผู้เช่า (Tenant Store)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveSubdomain("techstore")}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left ${
                    activeSubdomain === "techstore"
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  TechStore Gadgets
                </button>
                <button
                  onClick={() => setActiveSubdomain("fashionhub")}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left ${
                    activeSubdomain === "fashionhub"
                      ? "bg-pink-600/20 border-pink-500 text-pink-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  FashionHub Style
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                เลือก Microservice Endpoint
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedEndpoint("ai-copywriter")}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium border transition-all text-left flex items-center justify-between ${
                    selectedEndpoint === "ai-copywriter"
                      ? "bg-purple-600/20 border-purple-500 text-purple-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-white block">
                      POST /api/v1/tools/ai-copywriter
                    </span>
                    <span className="text-[11px] text-slate-400">
                      AI เขียนจุดขายและสโลแกนสินค้าภาษาไทย
                    </span>
                  </div>
                  <span className="text-emerald-400 font-mono text-xs">0.35฿</span>
                </button>

                <button
                  onClick={() => setSelectedEndpoint("slip-verify")}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium border transition-all text-left flex items-center justify-between ${
                    selectedEndpoint === "slip-verify"
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-white block">
                      POST /api/v1/tools/slip-verify
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ระบบตรวจสลิปโอนเงินธนาคารอัตโนมัติ
                    </span>
                  </div>
                  <span className="text-emerald-400 font-mono text-xs">0.35฿</span>
                </button>

                <button
                  onClick={() => setSelectedEndpoint("products")}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-medium border transition-all text-left flex items-center justify-between ${
                    selectedEndpoint === "products"
                      ? "bg-blue-600/20 border-blue-500 text-blue-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  <div>
                    <span className="font-semibold text-white block">
                      GET /api/v1/store/products
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ดึงแคตตาล็อกสินค้าของร้านค้าผู้เช่า
                    </span>
                  </div>
                  <span className="text-emerald-400 font-mono text-xs">0.35฿</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                API Key (Header: x-api-key)
              </label>
              <input
                type="text"
                readOnly
                value={testApiKey}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
              />
            </div>

            <button
              onClick={runApiTest}
              disabled={apiLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{apiLoading ? "กำลังยิงคำขอ..." : "ส่งคำขอทดสอบ (หัก 0.35฿)"}</span>
            </button>
          </div>

          {/* Response Console */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
                <span className="ml-2 font-semibold">Response Terminal</span>
              </div>
              {apiResponse && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      apiResponse.status === 200 || apiResponse.status === 201
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "bg-red-500/20 text-red-400 border border-red-500/40"
                    }`}
                  >
                    HTTP {apiResponse.status}
                  </span>
                  {apiResponse.data?.meta?.costDeducted !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 text-[10px] font-mono">
                      -{apiResponse.data.meta.costDeducted} ฿
                    </span>
                  )}
                  {apiResponse.data?.meta?.latencyMs !== undefined && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {apiResponse.data.meta.latencyMs} ms
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-[420px] min-h-[300px]">
              {apiLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>กำลังเรียกใช้งาน API Gateway และคำนวณบิลลิ่ง...</span>
                </div>
              ) : apiResponse ? (
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(apiResponse.data || apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-2">
                  <Terminal className="w-8 h-8 text-slate-600" />
                  <span>กดปุ่ม &quot;ส่งคำขอทดสอบ&quot; ด้านซ้าย เพื่อยิง API จริง</span>
                  <span className="text-[11px] text-slate-600">
                    ข้อมูลจะถูกบันทึกลงใน ApiUsageLog และหักเครดิตจากกระเป๋าเงินทันที
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
              Pricing Plans
            </h2>
            <p className="mt-2 text-3xl sm:text-4xl font-bold text-white tracking-tight">
              โครงสร้างราคาที่โปร่งใสและคุ้มค่า
            </p>
            <p className="mt-4 text-slate-400 text-sm">
              เลือกเช่าร้านค้าออนไลน์แบบรายเดือน หรือใช้บริการ API แบบจ่ายตามจริง
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            {/* Plan 1 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">เช่าร้านค้าออนไลน์</h3>
                <p className="text-xs text-slate-400 mt-1">
                  เหมาะสำหรับผู้ประกอบการที่ต้องการเปิดหน้าร้านทันที
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">300</span>
                  <span className="text-slate-400 text-sm">บาท / เดือน (1 Token)</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Subdomain ร้านค้าส่วนตัว
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    ลงสินค้าได้ไม่จำกัด
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    ระบบ PromptPay Dynamic QR
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    ระบบตรวจสลิปและคุมสต็อก
                  </li>
                </ul>
              </div>
              <Link
                href="/merchant/dashboard"
                className="mt-8 w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all"
              >
                เปิดร้านค้าทันที
              </Link>
            </div>

            {/* Plan 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900 border-2 border-blue-500/50 flex flex-col justify-between relative shadow-xl shadow-blue-500/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                ยอดนิยม
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">API Pay-per-Use</h3>
                <p className="text-xs text-slate-400 mt-1">
                  สำหรับนักพัฒนาและโปรแกรมเมอร์ที่ต้องการต่อยอดระบบ
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">0.35</span>
                  <span className="text-slate-400 text-sm">บาท / Request</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    หักเงินเฉพาะเมื่อคำขอสำเร็จ 200 OK
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Slip Verification Microservice
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    AI Marketing Copywriter API
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Rate Limit สูงสุด 60 req/min
                  </li>
                </ul>
              </div>
              <Link
                href="/merchant/api-keys"
                className="mt-8 w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
              >
                รับ API Key และเติมเครดิต
              </Link>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Cloud VPS Dedicated</h3>
                <p className="text-xs text-slate-400 mt-1">
                  สำหรับองค์กรที่ต้องการเซิร์ฟเวอร์ส่วนตัว Nginx & Docker
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                  <span className="text-slate-400 text-sm">/ Oracle Cloud</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Nginx Wildcard Reverse Proxy
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    SSL Certbot Wildcard อัตโนมัติ
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    PM2 Cluster Mode รันเบื้องหลัง 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    มีเอกสารและไฟล์คอนฟิกพร้อมใช้
                  </li>
                </ul>
              </div>
              <a
                href="#features"
                className="mt-8 w-full py-2.5 text-center text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              >
                ดูคู่มือ Deployment
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            © 2026 FeelFeel Multi-tenant SaaS Platform. Powered by Next.js, Prisma, Tailwind CSS & PromptPay.
          </p>
        </div>
      </footer>
    </div>
  );
}
