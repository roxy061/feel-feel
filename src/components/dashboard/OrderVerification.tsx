"use client";

import { useState } from "react";
import { 
  ShoppingCart, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  FileText, 
  Gift, 
  QrCode,
  Search,
  Filter,
  ArrowUpDown
} from "lucide-react";
import SlipViewerModal from "./SlipViewerModal";

interface Order {
  id: number;
  order_number: string;
  store_id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  customer_name: string;
  customer_contact: string;
  customer_address: string;
  quantity: number;
  total_amount: number | string;
  payment_method: string;
  voucher_code: string | null;
  voucher_amount: number | string;
  slip_url: string | null;
  payment_status: string;
  status: string;
  created_at: string;
}

interface OrderVerificationProps {
  orders: Order[];
  onRefresh: () => void;
}

export default function OrderVerification({
  orders,
  onRefresh,
}: OrderVerificationProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedSlipOrder, setSelectedSlipOrder] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "pending" && ord.status === "pending") ||
      (filterStatus === "completed" && (ord.status === "completed" || ord.status === "paid")) ||
      (filterStatus === "failed" && ord.status === "failed");

    const matchesSearch =
      ord.order_number.toLowerCase().includes(search.toLowerCase()) ||
      ord.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      ord.customer_contact.toLowerCase().includes(search.toLowerCase()) ||
      (ord.product_name && ord.product_name.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleQuickAction = async (orderId: number, action: "approve" | "reject") => {
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/merchant/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "ดำเนินการไม่สำเร็จ");
      } else {
        onRefresh();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการทำรายการ");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#EEEFF2]/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCart className="w-5 h-5 text-[#EEEFF2]" />
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
              ตรวจสอบคำสั่งซื้อและตรวจสลิป (Orders & Slip Verification)
            </h3>
          </div>
          <p className="font-sans text-xs text-[#EEEFF2]/60">
            รายการสั่งซื้อและหลักฐานการโอนเงินจากลูกค้าทั้งหมด {orders.length} ออเดอร์
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#EEEFF2]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหา Order, ลูกค้า, เบอร์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-[#010101] border border-[#EEEFF2]/15 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/10 font-sans text-xs">
            {[
              { id: "all", label: "ทั้งหมด" },
              { id: "pending", label: "รอตรวจสลิป" },
              { id: "completed", label: "สำเร็จ" },
              { id: "failed", label: "ยกเลิก" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  filterStatus === tab.id
                    ? "bg-[#272835] text-[#EEEFF2] font-semibold border border-[#EEEFF2]/20 shadow-sm"
                    : "text-[#EEEFF2]/60 hover:text-[#EEEFF2]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs">
          <thead>
            <tr className="border-b border-[#EEEFF2]/10 text-[#EEEFF2]/50 font-mono text-[11px] uppercase tracking-wider">
              <th className="pb-3 pr-4">หมายเลขออเดอร์</th>
              <th className="pb-3 px-4">ลูกค้า & ที่อยู่</th>
              <th className="pb-3 px-4">สินค้า & จำนวน</th>
              <th className="pb-3 px-4 text-right">ยอดชำระ</th>
              <th className="pb-3 px-4 text-center">วิธีชำระเงิน</th>
              <th className="pb-3 px-4 text-center">สถานะ</th>
              <th className="pb-3 pl-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEEFF2]/5">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#EEEFF2]/40 font-mono">
                  ไม่พบรายการคำสั่งซื้อตามเงื่อนไข
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => {
                const numAmount =
                  typeof ord.total_amount === "string"
                    ? parseFloat(ord.total_amount)
                    : ord.total_amount;

                const isBank =
                  ord.payment_method === "bank_transfer" ||
                  ord.payment_method === "promptpay";
                const isPending = ord.status === "pending";
                const isCompleted =
                  ord.status === "completed" || ord.status === "paid";
                const isFailed = ord.status === "failed";

                return (
                  <tr key={ord.id} className="hover:bg-[#010101]/30 transition-colors">
                    {/* Order Number */}
                    <td className="py-4 pr-4">
                      <div className="font-mono font-bold text-[#EEEFF2]">
                        {ord.order_number}
                      </div>
                      <div className="font-mono text-[10px] text-[#EEEFF2]/40 mt-0.5">
                        {new Date(ord.created_at).toLocaleString("th-TH", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </td>

                    {/* Customer Info */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-[#EEEFF2]">
                        {ord.customer_name}
                      </div>
                      <div className="font-mono text-[11px] text-sky-400">
                        {ord.customer_contact}
                      </div>
                      {ord.customer_address && (
                        <div className="font-sans text-[11px] text-[#EEEFF2]/50 line-clamp-1 max-w-[200px] mt-0.5">
                          {ord.customer_address}
                        </div>
                      )}
                    </td>

                    {/* Product & Quantity */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-[#EEEFF2] line-clamp-1 max-w-[180px]">
                        {ord.product_name || `สินค้า #${ord.product_id}`}
                      </div>
                      <div className="font-mono text-[11px] text-[#EEEFF2]/60">
                        จำนวน {ord.quantity} ชิ้น
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-[#EEEFF2] text-sm">
                      {numAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-[10px] text-[#EEEFF2]/50 font-normal">฿</span>
                    </td>

                    {/* Payment Method Badge */}
                    <td className="py-4 px-4 text-center">
                      {isBank ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-xl bg-sky-950/70 text-sky-300 border border-sky-500/30">
                          <QrCode className="w-3 h-3" />
                          <span>PromptPay</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-xl bg-amber-950/70 text-amber-300 border border-amber-500/30">
                          <Gift className="w-3 h-3" />
                          <span>TrueMoney</span>
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-xl uppercase font-bold border ${
                          isCompleted
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/30"
                            : isFailed
                            ? "bg-rose-950/80 text-rose-400 border-rose-500/30"
                            : "bg-amber-950/80 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                        {isFailed && <XCircle className="w-3 h-3" />}
                        {isPending && <Clock className="w-3 h-3" />}
                        <span>{ord.status}</span>
                      </span>
                    </td>

                    {/* Action Controls */}
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Inspect Slip Button (if bank transfer with slip) */}
                        {isBank && ord.slip_url && (
                          <button
                            type="button"
                            onClick={() => setSelectedSlipOrder(ord)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-colors cursor-pointer"
                            title="เปิดดูสลิปโอนเงิน"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>ตรวจสลิป</span>
                          </button>
                        )}

                        {/* Quick Approve/Reject buttons for pending orders */}
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleQuickAction(ord.id, "approve")}
                              disabled={actionLoading === ord.id}
                              className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                              title="อนุมัติคำสั่งซื้อ"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickAction(ord.id, "reject")}
                              disabled={actionLoading === ord.id}
                              className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                              title="ปฏิเสธคำสั่งซื้อ"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Full Slip Modal */}
      <SlipViewerModal
        order={selectedSlipOrder}
        onClose={() => setSelectedSlipOrder(null)}
        onActionComplete={onRefresh}
      />
    </div>
  );
}
