"use client";

import { Store, ShoppingBag, ArrowLeft, LayoutDashboard, ArrowRightLeft, Truck } from "lucide-react";
import Link from "next/link";

interface StoreNavbarProps {
  storeName: string;
  subdomain: string;
  cartCount?: number;
  onOpenCart?: () => void;
}

export default function StoreNavbar({
  storeName,
  subdomain,
  cartCount = 0,
  onOpenCart,
}: StoreNavbarProps) {
  const alternateStore = subdomain === "3nfm" ? { name: "Apex", path: "/apex" } : { name: "3NFM", path: "/3nfm" };

  return (
    <header className="absolute top-0 inset-x-0 z-30 h-20 border-b border-[#EEEFF2]/10 bg-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Store Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#272835]/90 border border-[#EEEFF2]/20 flex items-center justify-center text-[#EEEFF2] shadow-lg">
            <Store className="w-5 h-5 text-[#EEEFF2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bebas text-2xl sm:text-3xl tracking-wider text-[#EEEFF2] leading-none">
              {storeName}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[11px] text-[#EEEFF2]/60 uppercase tracking-wider">
                {subdomain}.3nfm.shop
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Official Store
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Link to Order Tracking */}
          <Link
            href={`/${subdomain}/track`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#272835]/70 hover:bg-[#272835] border border-[#EEEFF2]/15 text-xs text-[#EEEFF2] transition-all font-sans"
            title="ค้นหาและติดตามสถานะคำสั่งซื้อ"
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ติดตามสถานะ</span>
            <span className="sm:hidden">Track</span>
          </Link>

          {/* Switch to alternate store */}
          <Link
            href={alternateStore.path}
            className="hidden lg:inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#272835]/50 hover:bg-[#272835] border border-[#EEEFF2]/10 text-xs text-[#EEEFF2]/75 hover:text-white transition-all font-sans"
            title={`สลับไปร้าน ${alternateStore.name}`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-sky-400" />
            <span>ไปร้าน {alternateStore.name}</span>
          </Link>

          {/* Link to Merchant Dashboard */}
          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#272835]/70 hover:bg-[#272835] border border-[#EEEFF2]/15 text-xs text-[#EEEFF2] transition-all font-sans"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Merchant Suite</span>
          </Link>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            aria-label="Open Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#010101]" />
            <span className="hidden sm:inline">ตะกร้า</span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-[#010101] text-[#EEEFF2] font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
