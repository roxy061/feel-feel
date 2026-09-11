"use client";

import { useState } from "react";
import { X, CheckCircle2, XCircle, ExternalLink, ShieldCheck, FileText, Loader2 } from "lucide-react";

interface OrderSlipData {
  id: number;
  order_number: string;
  customer_name: string;
  customer_contact: string;
  product_name: string;
  quantity: number;
  total_amount: number | string;
  slip_url: string;
  status: string;
}

interface SlipViewerModalProps {
  order: OrderSlipData | null;
  onClose: () => void;
  onActionComplete: () => void;
}

export default function SlipViewerModal({
  order,
  onClose,
  onActionComplete,
}: SlipViewerModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!order) return null;

  const handleAction = async (action: "approve" | "reject") => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/merchant/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "ดำเนินการไม่สำเร็จ");
      } else {
        onActionComplete();
        onClose();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการทำรายการ");
    } finally {
      setIsProcessing(false);
    }
  };

  const numAmount =
    typeof order.total_amount === "string"
      ? parseFloat(order.total_amount)
      : order.total_amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-xl bg-[#272835] border border-[#EEEFF2]/20 text-[#EEEFF2] p-6 sm:p-8 shadow-2xl max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#010101]/50 hover:bg-[#010101] border border-[#EEEFF2]/10 text-[#EEEFF2]/70 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/15 flex items-center justify-center text-[#EEEFF2]">
            <FileText className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
              ตรวจสอบสลิปโอนเงิน
            </h3>
            <span className="font-mono text-xs text-[#EEEFF2]/60">
              {order.order_number} &bull; {order.customer_name}
            </span>
          </div>
        </div>

        {/* Content: Slip Image + Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
          {/* Slip Image */}
          <div className="relative rounded-xl bg-[#010101] border border-[#EEEFF2]/15 p-2 flex items-center justify-center overflow-hidden min-h-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.slip_url}
              alt="Transfer Slip"
              className="max-h-[380px] w-auto object-contain rounded-lg"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-3 p-4 rounded-xl bg-[#010101]/40 border border-[#EEEFF2]/10 text-xs font-sans">
              <div className="flex justify-between">
                <span className="text-[#EEEFF2]/60">หมายเลขคำสั่งซื้อ:</span>
                <span className="font-mono font-bold text-[#EEEFF2]">{order.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#EEEFF2]/60">ลูกค้า:</span>
                <span className="text-[#EEEFF2] font-semibold">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#EEEFF2]/60">ติดต่อ:</span>
                <span className="font-mono text-[#EEEFF2]">{order.customer_contact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#EEEFF2]/60">สินค้า:</span>
                <span className="text-[#EEEFF2] font-medium">{order.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#EEEFF2]/60">จำนวน:</span>
                <span className="font-mono text-[#EEEFF2]">{order.quantity} ชิ้น</span>
              </div>
              <div className="pt-2 border-t border-[#EEEFF2]/10 flex justify-between items-center">
                <span className="text-[#EEEFF2]/60 font-semibold">ยอดโอนที่ต้องได้รับ:</span>
                <span className="font-mono text-lg font-bold text-emerald-400">
                  {numAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#EEEFF2]/60">สถานะปัจจุบัน:</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/30 font-semibold uppercase">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Actions for Merchant */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleAction("approve")}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-[#272835] text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>อนุมัติคำสั่งซื้อ (ตัดสต็อกสินค้า)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleAction("reject")}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-semibold text-xs transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                <span>ปฏิเสธคำสั่งซื้อ (สลิปไม่ถูกต้อง)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
