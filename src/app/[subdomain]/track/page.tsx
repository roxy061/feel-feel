"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Truck,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
  Store,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  Copy,
  Check,
  XCircle,
  Loader2,
} from "lucide-react";

interface TrackedOrderItem {
  product_id?: number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

interface TrackedOrder {
  id: number;
  order_number: string;
  store_id: number;
  product_id: number;
  product_name: string;
  customer_name: string;
  customer_contact: string;
  customer_address: string;
  quantity: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  tracking_number: string | null;
  courier: string | null;
  shipping_status: string;
  tracking_url: string | null;
  items: TrackedOrderItem[];
  created_at: string;
  store_name?: string;
  store_subdomain?: string;
}

function TenantOrderTrackContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const subdomain = (params?.subdomain as string) || "";

  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedOrder, setCopiedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (searchQuery: string) => {
      const q = searchQuery.trim();
      if (!q) return;

      setIsLoading(true);
      setErrorMessage(null);
      setHasSearched(true);

      try {
        const url = `/api/orders/track?q=${encodeURIComponent(q)}${
          subdomain ? `&subdomain=${encodeURIComponent(subdomain)}` : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "ไม่สามารถค้นหาคำสั่งซื้อได้");
        }

        setOrders(data.orders || []);
      } catch (err: any) {
        setErrorMessage(err.message || "เกิดข้อผิดพลาดในการค้นหาคำสั่งซื้อ");
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    },
    [subdomain]
  );

  useEffect(() => {
    const qFromUrl = searchParams.get("q");
    if (qFromUrl) {
      setQuery(qFromUrl);
      fetchOrders(qFromUrl);
    }
  }, [searchParams, fetchOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchOrders(query.trim());
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOrder(text);
    setTimeout(() => setCopiedOrder(null), 2000);
  };

  // 4-step Timeline calculation
  const getStepProgress = (order: TrackedOrder) => {
    if (order.status === "cancelled") {
      return -1;
    }
    if (order.shipping_status === "shipped") {
      return 4;
    }
    if (order.shipping_status === "packing") {
      return 3;
    }
    if (order.status === "paid" || order.payment_status === "paid") {
      return 2;
    }
    return 1;
  };

  const steps = [
    { step: 1, label: "สร้างคำสั่งซื้อ", sub: "Order Placed" },
    { step: 2, label: "ยืนยันชำระเงิน", sub: "Payment Verified" },
    { step: 3, label: "จัดเตรียม & QC", sub: "Packing & QC" },
    { step: 4, label: "จัดส่งพัสดุแล้ว", sub: "Dispatched" },
  ];

  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Top Header */}
      <header className="border-b border-[#EEEFF2]/10 bg-[#090A0F]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {subdomain ? (
              <Link
                href={`/${subdomain}`}
                className="p-2 rounded-xl bg-[#272835]/60 hover:bg-[#272835] border border-[#EEEFF2]/10 text-[#EEEFF2] transition-colors"
                title="กลับสู่หน้าร้าน"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/"
                className="p-2 rounded-xl bg-[#272835]/60 hover:bg-[#272835] border border-[#EEEFF2]/10 text-[#EEEFF2] transition-colors"
                title="กลับสู่หน้าหลัก 3NFM"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center text-amber-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-bebas text-2xl tracking-wide leading-none text-[#EEEFF2]">
                  ระบบติดตามสถานะคำสั่งซื้อ
                </h1>
                <span className="font-mono text-[10px] text-[#EEEFF2]/50 uppercase tracking-wider">
                  {subdomain ? `${subdomain}.3nfm.shop` : "3NFM Multi-Tenant Commerce"}
                </span>
              </div>
            </div>
          </div>

          {subdomain && (
            <Link
              href={`/${subdomain}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#272835]/50 hover:bg-[#272835] border border-[#EEEFF2]/10 text-xs font-sans text-[#EEEFF2]/70 hover:text-white transition-colors"
            >
              <Store className="w-3.5 h-3.5 text-[#EEEFF2]/60" />
              <span className="hidden sm:inline">หน้าร้านค้า</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Search Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Search Banner */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 font-mono text-xs text-amber-400 mb-3">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>REAL-TIME DISPATCH TRACKER</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-5xl tracking-wide text-[#EEEFF2]">
            ตรวจสอบสถานะพัสดุและออเดอร์
          </h2>
          <p className="font-sans text-xs sm:text-sm text-[#EEEFF2]/65 mt-2 leading-relaxed">
            กรอกหมายเลขคำสั่งซื้อ (เช่น <span className="font-mono text-[#EEEFF2]">ORD-20260912-XXXXX</span>) หรือเบอร์โทรศัพท์ที่ใช้ในการสั่งซื้อ
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#EEEFF2]/40 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ระบุหมายเลขคำสั่งซื้อ หรือ เบอร์โทรศัพท์..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#272835]/60 border border-[#EEEFF2]/20 font-mono text-sm text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2] transition-colors shadow-lg"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-sans font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#010101]" />
                  <span>กำลังค้นหา</span>
                </>
              ) : (
                <span>ค้นหา</span>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {hasSearched && !isLoading && orders.length === 0 && (
          <div className="rounded-xl bg-[#090A0F] border border-[#EEEFF2]/10 p-12 text-center max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-xl bg-[#272835]/50 border border-[#EEEFF2]/10 flex items-center justify-center mx-auto mb-4 text-[#EEEFF2]/40">
              <PackageCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bebas text-2xl tracking-wide text-[#EEEFF2]">
              ไม่พบข้อมูลคำสั่งซื้อ
            </h3>
            <p className="font-sans text-xs text-[#EEEFF2]/60 mt-1 max-w-xs mx-auto leading-relaxed">
              ไม่พบคำสั่งซื้อที่ตรงกับ &ldquo;{query}&rdquo; กรุณาตรวจสอบเลขคำสั่งซื้อหรือเบอร์โทรศัพท์อีกครั้ง
            </p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between text-xs font-mono text-[#EEEFF2]/60 px-1">
              <span>พบคำสั่งซื้อ {orders.length} รายการ</span>
              <span>คำค้นหา: {query}</span>
            </div>

            {orders.map((order) => {
              const currentStep = getStepProgress(order);
              const isCancelled = order.status === "cancelled";

              return (
                <div
                  key={order.id}
                  className="rounded-xl bg-[#090A0F] border border-[#EEEFF2]/15 shadow-2xl overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-6 bg-[#272835]/40 border-b border-[#EEEFF2]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base sm:text-lg font-bold text-[#EEEFF2]">
                          {order.order_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.order_number)}
                          className="p-1 rounded-lg bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/15 text-[#EEEFF2]/70 hover:text-white transition-colors"
                          title="คัดลอกเลขคำสั่งซื้อ"
                        >
                          {copiedOrder === order.order_number ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-xs text-[#EEEFF2]/50 mt-1">
                        สั่งซื้อเมื่อ: {new Date(order.created_at).toLocaleString("th-TH")}
                        {order.store_name && ` • ร้านค้า: ${order.store_name}`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Printable Receipt Link */}
                      <a
                        href={`/receipt/${order.order_number}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 text-xs font-sans text-[#EEEFF2] transition-colors shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>ใบเสร็จดิจิทัล</span>
                        <ExternalLink className="w-3 h-3 text-[#EEEFF2]/40" />
                      </a>
                    </div>
                  </div>

                  {/* 4-Step Timeline Stepper */}
                  <div className="p-6 sm:p-8 border-b border-[#EEEFF2]/10 bg-[#010101]/40">
                    <div className="font-mono text-xs text-[#EEEFF2]/60 uppercase tracking-wider mb-6 flex items-center justify-between">
                      <span>สถานะการดำเนินการ (ORDER TIMELINE)</span>
                      {isCancelled ? (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          ยกเลิกแล้ว (CANCELLED)
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          ขั้นที่ {currentStep} จาก 4
                        </span>
                      )}
                    </div>

                    {!isCancelled ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative">
                        {steps.map((st, index) => {
                          const isDone = currentStep > st.step;
                          const isCurrent = currentStep === st.step;

                          return (
                            <div key={st.step} className="flex flex-col items-center text-center relative">
                              {/* Step circle */}
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all z-10 ${
                                  isDone
                                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                                    : isCurrent
                                    ? "bg-[#EEEFF2] text-[#010101] ring-4 ring-[#EEEFF2]/20 font-bold"
                                    : "bg-[#272835] text-[#EEEFF2]/40 border border-[#EEEFF2]/10"
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-black" />
                                ) : isCurrent ? (
                                  <Clock className="w-4 h-4 text-black animate-spin" />
                                ) : (
                                  st.step
                                )}
                              </div>

                              {/* Label */}
                              <div className="mt-3">
                                <div
                                  className={`font-sans text-xs font-semibold ${
                                    isDone || isCurrent ? "text-[#EEEFF2]" : "text-[#EEEFF2]/40"
                                  }`}
                                >
                                  {st.label}
                                </div>
                                <div className="font-mono text-[10px] text-[#EEEFF2]/50 uppercase">
                                  {st.sub}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs text-center font-sans">
                        คำสั่งซื้อนี้ถูกยกเลิก กรุณาติดต่อทางร้านค้าหากมีข้อสงสัย
                      </div>
                    )}
                  </div>

                  {/* Tracking Number & Courier Display */}
                  {order.tracking_number && (
                    <div className="p-6 bg-amber-500/5 border-b border-amber-500/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Truck className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-amber-400 uppercase tracking-wider font-semibold">
                                บริษัทขนส่ง: {order.courier || "Express Delivery"}
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                                {order.shipping_status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-lg sm:text-xl font-bold text-white tracking-wide">
                                {order.tracking_number}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(order.tracking_number!)}
                                className="p-1 rounded-lg bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/15 text-[#EEEFF2]/70 hover:text-white transition-colors"
                                title="คัดลอกเลขพัสดุ"
                              >
                                {copiedOrder === order.tracking_number ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-sans font-bold text-xs transition-all shadow-lg active:scale-95 shrink-0"
                          >
                            <span>เช็คสถานะกับ {order.courier || "ผู้ให้บริการขนส่ง"}</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Details Body */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Column 1: Items List */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="font-mono text-xs text-[#EEEFF2]/60 uppercase tracking-wider pb-2 border-b border-[#EEEFF2]/10">
                        รายการสินค้า ({order.items?.length || 1} รายการ)
                      </div>

                      <div className="space-y-2">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                {it.image_url ? (
                                  <img
                                    src={it.image_url}
                                    alt={it.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-[#EEEFF2]/10 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-[#272835] border border-[#EEEFF2]/10 flex items-center justify-center shrink-0">
                                    <ShoppingBag className="w-4 h-4 text-[#EEEFF2]/50" />
                                  </div>
                                )}
                                <div className="truncate">
                                  <div className="font-sans font-medium text-[#EEEFF2] truncate">
                                    {it.name}
                                  </div>
                                  <div className="font-mono text-[11px] text-[#EEEFF2]/50">
                                    จำนวน {it.quantity} ชิ้น
                                  </div>
                                </div>
                              </div>

                              <div className="font-mono font-bold text-[#EEEFF2] shrink-0 text-right">
                                {(it.price * it.quantity).toLocaleString("th-TH", {
                                  minimumFractionDigits: 2,
                                })}{" "}
                                <span className="text-[10px] text-amber-400 font-normal">THB</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-lg bg-[#272835] border border-[#EEEFF2]/10 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-4 h-4 text-[#EEEFF2]/50" />
                              </div>
                              <div>
                                <div className="font-sans font-medium text-[#EEEFF2]">
                                  {order.product_name}
                                </div>
                                <div className="font-mono text-[11px] text-[#EEEFF2]/50">
                                  จำนวน {order.quantity} ชิ้น
                                </div>
                              </div>
                            </div>

                            <div className="font-mono font-bold text-[#EEEFF2] shrink-0 text-right">
                              {Number(order.total_amount).toLocaleString("th-TH", {
                                minimumFractionDigits: 2,
                              })}{" "}
                              <span className="text-[10px] text-amber-400 font-normal">THB</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Customer & Summary Details */}
                    <div className="space-y-4">
                      <div className="font-mono text-xs text-[#EEEFF2]/60 uppercase tracking-wider pb-2 border-b border-[#EEEFF2]/10">
                        ข้อมูลผู้สั่งซื้อและการจัดส่ง
                      </div>

                      <div className="p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 space-y-3 font-sans text-xs">
                        <div className="flex items-start gap-2 text-[#EEEFF2]/70">
                          <User className="w-3.5 h-3.5 text-[#EEEFF2]/40 shrink-0 mt-0.5" />
                          <span className="text-[#EEEFF2] font-medium">{order.customer_name}</span>
                        </div>

                        <div className="flex items-start gap-2 text-[#EEEFF2]/70">
                          <Phone className="w-3.5 h-3.5 text-[#EEEFF2]/40 shrink-0 mt-0.5" />
                          <span className="font-mono text-[#EEEFF2]">{order.customer_contact}</span>
                        </div>

                        {order.customer_address && (
                          <div className="flex items-start gap-2 text-[#EEEFF2]/70">
                            <MapPin className="w-3.5 h-3.5 text-[#EEEFF2]/40 shrink-0 mt-0.5" />
                            <span className="text-[#EEEFF2]/80 leading-relaxed">
                              {order.customer_address}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Payment Summary */}
                      <div className="p-4 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/10 space-y-2 font-sans text-xs">
                        <div className="flex justify-between text-[#EEEFF2]/60">
                          <span>วิธีชำระเงิน:</span>
                          <span className="font-mono uppercase text-[#EEEFF2]">
                            {order.payment_method === "bank_transfer" ? "PromptPay Transfer" : "TrueMoney"}
                          </span>
                        </div>
                        <div className="flex justify-between text-[#EEEFF2]/60">
                          <span>สถานะชำระเงิน:</span>
                          <span className="font-mono uppercase font-semibold text-emerald-400">
                            {order.payment_status}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-[#EEEFF2]/10 flex justify-between items-baseline">
                          <span className="text-[#EEEFF2] font-medium">ยอดสุทธิ:</span>
                          <span className="font-mono text-base font-bold text-emerald-400">
                            {Number(order.total_amount).toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            <span className="text-xs font-normal">THB</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#EEEFF2]/10 bg-[#090A0F] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="font-mono text-xs text-[#EEEFF2]/50">
            Powered by 3NFM Multi-Tenant Motorsport Commerce
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function TenantOrderTrackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#010101] flex items-center justify-center text-[#EEEFF2]">
          <div className="flex items-center gap-3 font-mono text-xs text-[#EEEFF2]/60">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span>กำลังโหลดระบบติดตามสถานะ...</span>
          </div>
        </div>
      }
    >
      <TenantOrderTrackContent />
    </Suspense>
  );
}
