"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  CheckCircle,
  Truck,
  XCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  Eye,
  FileCheck,
  X,
} from "lucide-react";
import { useTenant } from "../TenantContext";

export default function MerchantOrdersPage() {
  const { currentSubdomain } = useTenant();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/orders?subdomain=${currentSubdomain}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentSubdomain]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const filteredOrders = orders.filter((o) =>
    filterStatus === "ALL" ? true : o.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-400" />
            คำสั่งซื้อและตรวจสลิป ({orders.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            ร้านค้า: {currentSubdomain}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          {["ALL", "PENDING", "PAID", "SHIPPED", "CANCELLED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filterStatus === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {st === "ALL" ? "ทั้งหมด" : st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>กำลังโหลดรายการคำสั่งซื้อ...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-500">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-sm">ไม่พบคำสั่งซื้อในหมวดหมู่นี้</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">เลขออเดอร์</th>
                  <th className="p-4">ลูกค้า / ผู้รับ</th>
                  <th className="p-4">รายการสินค้า</th>
                  <th className="p-4">ยอดชำระ</th>
                  <th className="p-4">หลักฐานสลิป</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-right">เปลี่ยนสถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">
                      {o.orderNumber}
                      <span className="block text-[11px] text-slate-500 font-normal">
                        {new Date(o.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{o.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {o.customerPhone}
                      </div>
                      {o.customerAddress && (
                        <div className="text-[11px] text-slate-500 max-w-xs truncate mt-0.5">
                          {o.customerAddress}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-0.5">
                        {o.items?.map((it: any) => (
                          <div key={it.id} className="text-slate-300">
                            • {it.productName} x{it.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-emerald-400 font-mono text-sm">
                      {o.totalAmount.toLocaleString()} ฿
                    </td>
                    <td className="p-4">
                      {o.slipUrl ? (
                        <button
                          onClick={() => setSelectedSlip(o.slipUrl)}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 flex items-center gap-1.5 transition-all text-[11px] font-medium"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>ดูสลิปโอนเงิน</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500">ไม่มีสลิป</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          o.status === "PAID"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : o.status === "SHIPPED"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : o.status === "CANCELLED"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {o.status === "PAID" && <CheckCircle className="w-3 h-3" />}
                        {o.status === "SHIPPED" && <Truck className="w-3 h-3" />}
                        {o.status === "PENDING" && <Clock className="w-3 h-3" />}
                        {o.status === "CANCELLED" && <XCircle className="w-3 h-3" />}
                        <span>{o.status}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === "PENDING" && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, "PAID")}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-all"
                          >
                            อนุมัติสลิป (PAID)
                          </button>
                        )}
                        {o.status === "PAID" && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, "SHIPPED")}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-all"
                          >
                            จัดส่งแล้ว (SHIPPED)
                          </button>
                        )}
                        {o.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, "CANCELLED")}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-red-900/50 hover:text-red-300 text-slate-400 text-[11px] transition-all"
                          >
                            ยกเลิก
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-800 p-5 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                หลักฐานสลิปการโอนเงิน (PromptPay)
              </h3>
              <button
                onClick={() => setSelectedSlip(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={selectedSlip}
              alt="Bank Transfer Slip"
              className="w-full rounded-xl border border-slate-700 mx-auto mb-4"
            />
            <button
              onClick={() => setSelectedSlip(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
