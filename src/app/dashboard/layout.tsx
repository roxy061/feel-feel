import { ReactNode } from "react";
import { 
  LayoutDashboard, 
  Wallet, 
  Code2, 
  Store, 
  Layers, 
  ShieldCheck, 
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Merchant Dashboard - 3NFM Platform",
  description: "3NFM SaaS Merchant Management Portal",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-[#EEEFF2]/15 bg-[#010101]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 flex items-center justify-center text-[#EEEFF2]">
                <Layers className="w-5 h-5 text-[#EEEFF2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bebas text-2xl tracking-wider text-[#EEEFF2] leading-none">
                  3NFM
                </span>
                <span className="font-mono text-[9px] text-[#EEEFF2]/60 uppercase tracking-widest">
                  Merchant Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links: Store, Wallet, Developer */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#272835] border border-transparent hover:border-[#EEEFF2]/15 text-xs font-medium text-[#EEEFF2] transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">หน้าร้านค้า (Overview &amp; Orders)</span>
              <span className="sm:hidden">หน้าร้าน</span>
            </Link>

            <Link
              href="/dashboard/wallet"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#272835] border border-transparent hover:border-[#EEEFF2]/15 text-xs font-medium text-[#EEEFF2] transition-colors"
            >
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">กระเป๋าเงิน &amp; โทเคน (Wallet)</span>
              <span className="sm:hidden">กระเป๋าเงิน</span>
            </Link>

            <Link
              href="/dashboard/developer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#272835] border border-transparent hover:border-[#EEEFF2]/15 text-xs font-medium text-[#EEEFF2] transition-colors"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">นักพัฒนา (Developer API)</span>
              <span className="sm:hidden">API</span>
            </Link>
          </nav>

          {/* User Profile & Storefront Link */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/15">
              <div className="w-6 h-6 rounded-lg bg-[#010101] border border-[#EEEFF2]/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="block font-sans text-[11px] font-semibold text-[#EEEFF2] leading-none">
                  Owner u-001
                </span>
                <span className="font-mono text-[9px] text-[#EEEFF2]/50">
                  store-3nfm
                </span>
              </div>
            </div>

            <Link
              href="/apex"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-semibold text-xs transition-all shadow-sm active:scale-95"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">หน้าร้านค้า</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EEEFF2]/10 py-6 bg-[#010101] text-xs text-[#EEEFF2]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>3NFM Commerce Engine &bull; Merchant Control Suite</span>
          </div>
          <div className="font-mono text-[11px]">
            Session: user_id=&apos;u-001&apos; &bull; store_id=&apos;store-3nfm&apos;
          </div>
        </div>
      </footer>
    </div>
  );
}
