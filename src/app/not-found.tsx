import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home, LayoutDashboard } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#EEEFF2]/10 bg-[#010101]/90 flex items-center px-6">
        <div className="flex items-center gap-2">
          <span className="font-bebas text-2xl tracking-wider text-[#EEEFF2]">3NFM</span>
          <span className="font-mono text-[10px] text-[#EEEFF2]/50 uppercase tracking-widest">
            Error 404
          </span>
        </div>
      </header>

      {/* Center 404 Hero */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-xl bg-[#272835] border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="font-mono text-xs text-amber-400 mb-2 uppercase tracking-widest">
          PAGE NOT FOUND &bull; 404 ERROR
        </div>

        <h1 className="font-bebas text-6xl sm:text-8xl tracking-wide text-[#EEEFF2] leading-none mb-4">
          ROUTE OUT OF BOUNDS
        </h1>

        <p className="font-sans text-xs sm:text-sm text-[#EEEFF2]/70 leading-relaxed mb-8">
          ไม่พบหน้าที่คุณต้องการ หรือร้านค้าเทแนนต์ดังกล่าวอาจยังไม่ได้เปิดให้บริการในระบบ 3NFM Platform
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>กลับหน้าหลัก (Portal Home)</span>
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-[#EEEFF2] text-xs font-medium transition-all cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>เข้าสู่ระบบ Dashboard</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EEEFF2]/10 py-4 text-center font-mono text-xs text-[#EEEFF2]/40">
        3NFM Multi-Tenant Commerce Architecture &bull; All Rights Reserved
      </footer>
    </div>
  );
}
