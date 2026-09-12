"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  LayoutDashboard,
  Wallet,
  Code2,
  Settings,
  ShieldCheck,
  Store,
  ExternalLink,
} from "lucide-react";
import StoreSwitcher from "./StoreSwitcher";
import { useStore } from "@/context/StoreContext";

export default function DashboardHeader() {
  const pathname = usePathname();
  const { activeStore } = useStore();

  const navLinks = [
    {
      href: "/dashboard",
      label: "หน้าร้านค้า",
      shortLabel: "ภาพรวม",
      icon: LayoutDashboard,
      color: "text-sky-400",
      exact: true,
    },
    {
      href: "/dashboard/wallet",
      label: "กระเป๋าเงิน (กองกลาง)",
      shortLabel: "วอลเล็ต",
      icon: Wallet,
      color: "text-amber-400",
      exact: false,
    },
    {
      href: "/dashboard/developer",
      label: "นักพัฒนา (API)",
      shortLabel: "API",
      icon: Code2,
      color: "text-emerald-400",
      exact: false,
    },
    {
      href: "/dashboard/settings",
      label: "ตั้งค่าร้านค้า",
      shortLabel: "ตั้งค่า",
      icon: Settings,
      color: "text-purple-400",
      exact: false,
    },
  ];

  return (
    <header className="h-16 border-b border-[#EEEFF2]/15 bg-[#010101]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2">
        {/* Left: Logo & Store Switcher */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 flex items-center justify-center text-[#EEEFF2]">
              <Layers className="w-5 h-5 text-[#EEEFF2]" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-bebas text-2xl tracking-wider text-[#EEEFF2] leading-none">
                3NFM
              </span>
              <span className="font-mono text-[9px] text-[#EEEFF2]/60 uppercase tracking-widest">
                Merchant Suite
              </span>
            </div>
          </Link>

          <div className="h-5 w-[1px] bg-[#EEEFF2]/15 hidden sm:block" />

          {/* Store Switcher Dropdown */}
          <StoreSwitcher />
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5">
          {navLinks.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#272835] border-[#EEEFF2]/20 text-[#EEEFF2] font-semibold"
                    : "hover:bg-[#272835]/50 border-transparent text-[#EEEFF2]/70 hover:text-[#EEEFF2]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${link.color}`} />
                <span className="hidden md:inline">{link.label}</span>
                <span className="md:hidden">{link.shortLabel}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: User Profile & Current Storefront Link */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/15">
            <div className="w-6 h-6 rounded-lg bg-[#010101] border border-[#EEEFF2]/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <span className="block font-sans text-[11px] font-semibold text-[#EEEFF2] leading-none">
                Owner u-001
              </span>
              <span className="font-mono text-[9px] text-amber-400 font-medium">
                @{activeStore?.subdomain || "tenant"}
              </span>
            </div>
          </div>

          {/* View Active Storefront */}
          {activeStore && (
            <Link
              href={`/${activeStore.subdomain}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#272835] hover:bg-[#343647] border border-amber-500/30 text-amber-300 font-semibold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              title={`เปิดหน้าร้าน ${activeStore.name}`}
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ดูหน้าร้าน</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
