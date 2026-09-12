"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-sans font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
    >
      <Printer className="w-4 h-4 text-[#010101]" />
      <span>พิมพ์ใบเสร็จ / บันทึกเป็น PDF</span>
    </button>
  );
}
