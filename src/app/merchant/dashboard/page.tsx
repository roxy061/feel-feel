"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  ShoppingCart,
  CreditCard,
  Terminal,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useTenant } from "../TenantContext";

export default function MerchantDashboardPage() {
  const { currentSubdomain } = useTenant();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch billing & orders & products for current tenant
      const [billingRes, ordersRes, productsRes, keysRes] = await Promise.all([
        fetch(`/api/merchant/billing?subdomain=${currentSubdomain}`),
        fetch(`/api/merchant/orders?subdomain=${currentSubdomain}`),
        fetch(`/api/merchant/products?subdomain=${currentSubdomain}`),
        fetch(`/api/merchant/api-keys?subdomain=${currentSubdomain}`),
      ]);

      const billing = await billingRes.json();
      const orders = await ordersRes.json();
      const products = await productsRes.json();
      const keys = await keysRes.json();

      setData({
        store: billing.store,
        wallet: billing.wallet,
        orders: orders.orders || [],
        products: products.products || [],
        apiKeys: keys.apiKeys || [],
        usageLogs: keys.usageLogs || [],
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentSubdomain]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>กำลังโหลดข้อมูลแดชบอร์ด...</span>
      </div>
    );
  }

  if (!data?.store) {
    return (
      <div className="text-center py-12 text-slate-400">
        ไม่พบข้อมูลร้านค้า {currentSubdomain}
      </div>
    );
  }

  const { store, wallet, orders, products, usageLogs } = data;

  // Calculate revenue from PAID orders
  const totalRevenue = orders
    .filter((o: any) => o.status === "PAID")
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  // Calculate days remaining
  const expireDate = new Date(store.expireAt);
  const now = new Date();
  const diffTime = expireDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            ภาพรวมร้านค้า: {store.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Subdomain: {store.subdomain}.localhost:3000 | สถานะร้าน:{" "}
            <span
              className={`font-semibold ${
                store.status === "ACTIVE" ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {store.status}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/merchant/products"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มสินค้าใหม่</span>
          </Link>
          <Link
            href="/merchant/billing"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span>เติมเงิน / โทเคน</span>
          </Link>
        </div>
      </div>

      {/* Subscription Alert if near expiration */}
      {daysLeft <= 7 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs text-amber-200">
              <span className="font-bold">แจ้งเตือนอายุการใช้งาน:</span> ร้านค้าจะหมดอายุในอีก{" "}
              <span className="font-bold underline">{daysLeft} วัน</span> (วันที่{" "}
              {expireDate.toLocaleDateString("th-TH")}) หากหมดอายุระบบจะระงับการเข้าถึงหน้าร้านค้าอัตโนมัติ
            </div>
          </div>
          <Link
            href="/merchant/billing"
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition-all"
          >
            ต่ออายุทันที (1 Token)
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>ยอดขายสุทธิ (PAID)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            {totalRevenue.toLocaleString()} ฿
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            จากทั้งหมด {orders.length} คำสั่งซื้อ
          </div>
        </div>

        {/* Orders */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>คำสั่งซื้อทั้งหมด</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{orders.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            รอตรวจสอบ {orders.filter((o: any) => o.status === "PENDING").length} รายการ
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>เครดิต Wallet คงเหลือ</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300">
            {wallet?.balance?.toFixed(2) || "0.00"} ฿
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            สำหรับเรียกใช้ API (0.35฿/ครั้ง)
          </div>
        </div>

        {/* Token Days Left */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>อายุร้านค้าคงเหลือ</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">
            {daysLeft > 0 ? `${daysLeft} วัน` : "หมดอายุ"}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            โทเคนสำรอง: {store.tokenBalance} Token
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Recent API Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              คำสั่งซื้อล่าสุด
            </h3>
            <Link
              href="/merchant/orders"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              ยังไม่มีคำสั่งซื้อเข้ามา
            </p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">
                      {order.customerName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {order.orderNumber} • {order.items?.length || 1} สินค้า
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">
                      {order.totalAmount.toLocaleString()} ฿
                    </div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                        order.status === "PAID"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : order.status === "SHIPPED"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent API Logs */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              ประวัติการเรียกใช้ API ล่าสุด (0.35฿/req)
            </h3>
            <Link
              href="/merchant/api-keys"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>ดูทั้งหมด</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {usageLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              ยังไม่มีประวัติการเรียกใช้ API
            </p>
          ) : (
            <div className="space-y-3">
              {usageLogs.slice(0, 5).map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="font-mono">
                    <div className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {log.method}
                      </span>
                      <span>{log.endpoint}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(log.createdAt).toLocaleTimeString("th-TH")} • {log.latencyMs}ms
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-400 text-xs font-bold block">
                      -{log.cost.toFixed(2)} ฿
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      HTTP {log.statusCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
