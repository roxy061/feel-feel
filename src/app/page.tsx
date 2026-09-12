import {
  Layers,
  Store,
  Terminal,
  ShieldCheck,
  Zap,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Globe,
  Database,
  ExternalLink,
  LayoutDashboard,
  Wallet,
  Code2,
  Receipt,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const showcasePortals = [
    {
      name: "3NFM Motorsport Lab",
      subdomain: "3nfm",
      badge: "Official Flagship",
      description: "ศูนย์รวมนวัตกรรมชิ้นส่วนยานยนต์และแอโรไดนามิกส์ระดับการแข่งขัน ออกแบบเฉพาะทางเพื่อการขับขี่สมรรถนะสูงสุด",
      items: 6,
      accentColor: "border-amber-500/40 text-amber-400 bg-amber-950/30",
      href: "/3nfm",
      actionLabel: "เข้าชมหน้าร้าน 3NFM",
    },
    {
      name: "Apex Performance",
      subdomain: "apex",
      badge: "Motorsport Spec",
      description: "ผู้นำด้านอะไหล่และอุปกรณ์ยานยนต์สมรรถนะสูง ระบบเบรก ช่วงล่าง สปอยเลอร์คาร์บอน และท่อไอเสียไทเทเนียม",
      items: 6,
      accentColor: "border-sky-500/40 text-sky-400 bg-sky-950/30",
      href: "/apex",
      actionLabel: "เข้าชมหน้าร้าน Apex",
    },
    {
      name: "Merchant Dashboard Suite",
      subdomain: "dashboard",
      badge: "Merchant Admin",
      description: "ระบบบริหารจัดการร้านค้าแบบครบวงจร ตรวจสอบสลิปโอนเงิน อนุมัติออเดอร์ เติมเงิน Wallet และ Developer API Key",
      items: "All-in-One",
      accentColor: "border-emerald-500/40 text-emerald-400 bg-emerald-950/30",
      href: "/dashboard",
      actionLabel: "เปิดระบบจัดการ Dashboard",
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Top Navigation */}
      <nav className="border-b border-[#EEEFF2]/15 bg-[#010101]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 flex items-center justify-center text-[#EEEFF2]">
              <Layers className="w-5 h-5 text-[#EEEFF2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bebas text-2xl tracking-widest text-[#EEEFF2] leading-none">
                3NFM
              </span>
              <span className="font-mono text-[10px] text-[#EEEFF2]/60 uppercase tracking-wider">
                Multi-Tenant Commerce Engine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 text-[#EEEFF2]/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Cluster: Production Ready</span>
            </div>

            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-300 transition-all"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>เปิดร้านใหม่ (Free 14 วัน)</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-xs font-semibold text-[#EEEFF2] transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
              <span>Merchant Suite</span>
            </Link>

            <a
              href="#test-subdomains"
              className="px-4 py-2 rounded-xl bg-[#EEEFF2] text-[#010101] text-xs font-semibold hover:bg-[#EEEFF2]/90 transition-all cursor-pointer"
            >
              Explore Stores
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 text-xs font-mono text-[#EEEFF2] mb-6 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ENTERPRISE MULTI-TENANT COMMERCE ARCHITECTURE</span>
          </div>

          <h1 className="font-bebas text-5xl sm:text-7xl lg:text-8xl tracking-wider text-[#EEEFF2] leading-none mb-6">
            HIGH PERFORMANCE STOREFRONT INFRASTRUCTURE
          </h1>

          <p className="font-sans text-base sm:text-lg text-[#EEEFF2]/75 leading-relaxed mb-8">
            โครงสร้างระบบพาณิชย์อิเล็กทรอนิกส์มัลติเทแนนต์ พัฒนาด้วย Next.js App Router, MySQL Connection Pooling, ระบบชำระเงินซองอั่งเปา TrueMoney อัตโนมัติ, สลิป PromptPay Base64 และ Merchant Dashboard เต็มรูปแบบ
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#EEEFF2] text-[#010101] hover:bg-[#EEEFF2]/90 text-sm font-semibold transition-all shadow-xl active:scale-95"
            >
              <Store className="w-4 h-4 text-[#010101]" />
              <span>เปิดร้านค้าของคุณเอง (ฟรี 14 วัน)</span>
              <ArrowRight className="w-4 h-4 text-[#010101]" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-sm font-medium text-[#EEEFF2] transition-all"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Merchant Dashboard</span>
            </Link>

            <Link
              href="/3nfm"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-[#272835]/50 border border-[#EEEFF2]/15 text-sm font-medium text-[#EEEFF2]/80 transition-all"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>หน้าร้าน 3NFM</span>
            </Link>

            <Link
              href="/apex"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-[#272835]/50 border border-[#EEEFF2]/15 text-sm font-medium text-[#EEEFF2]/80 transition-all"
            >
              <Store className="w-4 h-4 text-sky-400" />
              <span>หน้าร้าน Apex</span>
            </Link>
          </div>
        </div>

        {/* Live Portals Gateway Section */}
        <section id="test-subdomains" className="rounded-xl border border-[#EEEFF2]/15 bg-[#272835]/20 p-6 sm:p-10 mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="font-bebas text-3xl sm:text-4xl tracking-wide text-[#EEEFF2]">
                DEMO TENANTS & MANAGEMENT PORTAL
              </div>
              <p className="font-sans text-sm text-[#EEEFF2]/70 mt-1">
                คลิกเพื่อทดสอบการทำงานของระบบร้านค้าเทแนนต์และระบบจัดการ Merchant แบบ End-to-End
              </p>
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#EEEFF2]/60 bg-[#272835] px-3 py-1.5 rounded-xl border border-[#EEEFF2]/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Subdomain Rewriting Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {showcasePortals.map((portal) => (
              <Link
                key={portal.subdomain}
                href={portal.href}
                className="group p-6 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 hover:border-[#EEEFF2]/40 transition-all flex flex-col justify-between hover:shadow-2xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#272835] text-[#EEEFF2]/80 border border-[#EEEFF2]/10">
                      /{portal.subdomain}
                    </span>
                    <span
                      className={`font-mono text-[11px] px-2.5 py-0.5 rounded-md border ${portal.accentColor}`}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  <div className="font-sans font-bold text-lg text-[#EEEFF2] group-hover:text-white transition-colors">
                    {portal.name}
                  </div>

                  <p className="font-sans text-xs text-[#EEEFF2]/65 mt-2.5 leading-relaxed">
                    {portal.description}
                  </p>

                  <div className="font-mono text-xs text-[#EEEFF2]/50 mt-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>
                      {typeof portal.items === "number"
                        ? `${portal.items} active catalog products`
                        : "Full suite unlocked"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EEEFF2]/10 flex items-center justify-between text-xs font-semibold text-[#EEEFF2]/80 group-hover:text-white">
                  <span>{portal.actionLabel}</span>
                  <ExternalLink className="w-4 h-4 text-[#EEEFF2]/60 group-hover:text-[#EEEFF2] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Technical Architecture Specs */}
        <section id="architecture" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center mb-4 text-[#EEEFF2]">
              <Globe className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-[#EEEFF2] mb-2">
              Dynamic Subdomain Routing
            </h3>
            <p className="font-sans text-sm text-[#EEEFF2]/70 leading-relaxed mb-4">
              Edge middleware ตรวจจับ Host header และ rewrite ไปยังโฟลเดอร์เทแนนต์ [subdomain] แบบ Zero Latency รองรับ Custom Domains
            </p>
            <div className="font-mono text-xs text-[#EEEFF2]/50 bg-[#272835]/50 p-2.5 rounded-xl border border-[#EEEFF2]/10">
              src/middleware.ts &rarr; /[subdomain]
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center mb-4 text-[#EEEFF2]">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-[#EEEFF2] mb-2">
              Cloud MySQL & Auto-Seed
            </h3>
            <p className="font-sans text-sm text-[#EEEFF2]/70 leading-relaxed mb-4">
              รองรับ TiDB Cloud / Vercel Serverless พร้อมระบบ Auto-Seed สร้างสคีมาและข้อมูลเริ่มต้นให้อัตโนมัติ ป้องกันปัญหา 404
            </p>
            <div className="font-mono text-xs text-[#EEEFF2]/50 bg-[#272835]/50 p-2.5 rounded-xl border border-[#EEEFF2]/10">
              src/lib/db.ts & auto-seed.ts
            </div>
          </div>

          <div className="p-6 rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15">
            <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center mb-4 text-[#EEEFF2]">
              <Receipt className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-[#EEEFF2] mb-2">
              Dual Checkout & TrueMoney
            </h3>
            <p className="font-sans text-sm text-[#EEEFF2]/70 leading-relaxed mb-4">
              ชำระเงินฉับไวด้วยลิงก์ซองของขวัญ TrueMoney ตัดยอดเงินอัตโนมัติ หรือ PromptPay QR พร้อมอัปโหลดสลิป Base64 ปลอดภัย
            </p>
            <div className="font-mono text-xs text-[#EEEFF2]/50 bg-[#272835]/50 p-2.5 rounded-xl border border-[#EEEFF2]/10">
              src/lib/truemoney.ts & OrderModal
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-sans text-xs font-semibold text-[#EEEFF2]">
                30-Day Token Renewal
              </div>
              <div className="font-mono text-[10px] text-[#EEEFF2]/50">
                ต่ออายุร้านค้าด้วย 1 โทเคน
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 flex items-center gap-3">
            <Receipt className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="font-sans text-xs font-semibold text-[#EEEFF2]">
                Slip Verification Modal
              </div>
              <div className="font-mono text-[10px] text-[#EEEFF2]/50">
                อนุมัติสลิปและตัดสต็อกทันที
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 flex items-center gap-3">
            <Wallet className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-sans text-xs font-semibold text-[#EEEFF2]">
                Wallet & Token Shop
              </div>
              <div className="font-mono text-[10px] text-[#EEEFF2]/50">
                กระเป๋าเงินและซื้อแพ็กเกจ
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 flex items-center gap-3">
            <Code2 className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="font-sans text-xs font-semibold text-[#EEEFF2]">
                Developer API Portal
              </div>
              <div className="font-mono text-[10px] text-[#EEEFF2]/50">
                64-Char Keys & 0.35 THB Log
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Platform Footer */}
      <footer className="border-t border-[#EEEFF2]/15 py-8 bg-[#010101]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#EEEFF2]/60" />
            <span className="font-sans text-sm text-[#EEEFF2]/70">
              3NFM Multi-Tenant SaaS Platform &copy; {new Date().getFullYear()} &bull; Production Spec
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[#EEEFF2]/50">
            <span>Powered by Next.js App Router & MySQL Pool</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
