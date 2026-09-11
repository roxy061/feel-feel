import { Store, ShieldCheck, Zap, Truck, Layers } from "lucide-react";
import Link from "next/link";

interface StoreFooterProps {
  storeName: string;
  subdomain: string;
}

export default function StoreFooter({ storeName, subdomain }: StoreFooterProps) {
  return (
    <footer className="w-full border-t border-[#EEEFF2]/15 bg-[#010101] text-[#EEEFF2] mt-auto">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-[#EEEFF2]/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10">
            <div className="p-3 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 text-[#EEEFF2]">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-sans font-semibold text-sm text-[#EEEFF2]">สินค้าแท้มาตรฐานมอเตอร์สปอร์ต</h4>
              <p className="font-sans text-xs text-[#EEEFF2]/60 mt-0.5">รับประกันคุณภาพทุกชิ้นงาน</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10">
            <div className="p-3 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 text-[#EEEFF2]">
              <Zap className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h4 className="font-sans font-semibold text-sm text-[#EEEFF2]">ระบบจัดการออเดอร์อัตโนมัติ</h4>
              <p className="font-sans text-xs text-[#EEEFF2]/60 mt-0.5">ประมวลผลคำสั่งซื้อเรียลไทม์</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10">
            <div className="p-3 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 text-[#EEEFF2]">
              <Truck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h4 className="font-sans font-semibold text-sm text-[#EEEFF2]">จัดส่งด่วนทั่วประเทศ</h4>
              <p className="font-sans text-xs text-[#EEEFF2]/60 mt-0.5">ระบบติดตามสถานะพัสดุตลอด 24 ชม.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center text-[#EEEFF2]">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="font-sans font-semibold text-sm text-[#EEEFF2]">
              {storeName}
            </span>
            <span className="font-mono text-xs text-[#EEEFF2]/50 ml-2">
              &copy; {new Date().getFullYear()} All Rights Reserved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#EEEFF2]/60">
          <span>Powered by</span>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bebas text-base text-[#EEEFF2] tracking-wider hover:text-white transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3NFM SAAS PLATFORM</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
