import { Store, ArrowLeft, SearchX, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function StoreNotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 flex items-center justify-center text-rose-400 mb-6 shadow-2xl">
        <Store className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/15 text-xs font-mono text-rose-400 mb-4">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>404 &bull; STORE NOT FOUND</span>
      </div>

      <h1 className="font-bebas text-5xl sm:text-7xl tracking-wider text-[#EEEFF2] leading-none mb-4">
        ไม่พบข้อมูลร้านค้านี้ในระบบ
      </h1>

      <p className="font-sans text-sm sm:text-base text-[#EEEFF2]/70 max-w-md mb-8 leading-relaxed">
        ชื่อ Subdomain ที่คุณระบุยังไม่ได้ลงทะเบียนหรืออาจถูกระงับการใช้งานในแพลตฟอร์ม 3NFM
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#EEEFF2] text-[#010101] font-semibold text-sm hover:bg-[#EEEFF2]/90 transition-all shadow-md active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่หน้าหลัก 3NFM</span>
        </Link>
        <Link
          href="/apex"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 text-[#EEEFF2] font-medium text-sm hover:bg-[#343647] transition-all"
        >
          <Store className="w-4 h-4" />
          <span>เข้าชมร้านตัวอย่าง (Apex)</span>
        </Link>
      </div>
    </div>
  );
}
