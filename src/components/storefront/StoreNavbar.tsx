"use client";

import { Store, ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
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
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#272835]/60 hover:bg-[#272835] border border-[#EEEFF2]/15 text-xs text-[#EEEFF2]/80 hover:text-white transition-all font-sans"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>3NFM Platform</span>
          </Link>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-sm font-medium text-[#EEEFF2] transition-all shadow-md active:scale-95"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#EEEFF2]" />
            <span className="hidden sm:inline font-sans text-xs font-semibold">ตะกร้า</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-[#010101] text-[#EEEFF2] border border-[#EEEFF2]/15 font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
