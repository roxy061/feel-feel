"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  KeyRound,
  Settings,
  ExternalLink,
  Store,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { TenantProvider, useTenant } from "./TenantContext";

function MerchantLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentSubdomain, setCurrentSubdomain } = useTenant();

  const navItems = [
    {
      name: "แดชบอร์ดภาพรวม",
      href: "/merchant/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "จัดการสินค้า",
      href: "/merchant/products",
      icon: Package,
    },
    {
      name: "คำสั่งซื้อ & สลิป",
      href: "/merchant/orders",
      icon: ShoppingCart,
    },
    {
      name: "การเงิน & โทเคน",
      href: "/merchant/billing",
      icon: CreditCard,
    },
    {
      name: "API Keys & Logs (0.35฿)",
      href: "/merchant/api-keys",
      icon: KeyRound,
    },
    {
      name: "ตั้งค่าร้านค้า & ธีม",
      href: "/merchant/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-white tracking-tight">
                  Merchant Console
                </span>
                <span className="text-[10px] block text-blue-400 font-mono">
                  SaaS Backoffice
                </span>
              </div>
            </Link>
          </div>

          {/* Tenant Store Switcher */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              เลือกร้านค้าที่จัดการ (Switch Tenant)
            </label>
            <select
              value={currentSubdomain}
              onChange={(e) => setCurrentSubdomain(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="techstore">🏬 TechStore Gadgets</option>
              <option value="fashionhub">👗 FashionHub Style</option>
            </select>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Storefront preview link */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href={`/store/${currentSubdomain}`}
            target="_blank"
            className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium flex items-center justify-between group transition-all"
          >
            <span className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span>ชมหน้าร้านค้าจริง</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
          </Link>

          <div className="text-[11px] text-slate-500 text-center font-mono">
            feel-feel-saas v1.0
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-800 bg-slate-950/60 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>SaaS Merchant</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium capitalize">
              {currentSubdomain}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Multi-tenancy Active
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <MerchantLayoutInner>{children}</MerchantLayoutInner>
    </TenantProvider>
  );
}
