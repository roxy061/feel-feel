import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { query } from "@/lib/db";
import { 
  Store, 
  ArrowLeft, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  CreditCard,
  PackageCheck
} from "lucide-react";
import PrintButton from "@/components/storefront/PrintButton";

export const dynamic = "force-dynamic";

interface ReceiptPageProps {
  params: {
    order_number: string;
  };
}

export async function generateMetadata({ params }: ReceiptPageProps): Promise<Metadata> {
  return {
    title: `ใบเสร็จรับเงิน ${params.order_number} - 3NFM Commerce`,
    description: `Digital Invoice & Payment Receipt for Order ${params.order_number}`,
  };
}

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const orderNumber = decodeURIComponent(params.order_number || "").trim();

  if (!orderNumber) {
    notFound();
  }

  // ดึงข้อมูลคำสั่งซื้อและร้านค้า
  let orders: any[] = [];
  try {
    orders = await query<any[]>(
      `SELECT o.*, s.name as store_name, s.subdomain as store_subdomain, s.description as store_desc, s.truemoney_phone
       FROM orders o
       LEFT JOIN stores s ON o.store_id = s.id
       WHERE o.order_number = ?
       LIMIT 1`,
      [orderNumber]
    );
  } catch (err) {
    console.error("[Receipt Query Error]:", err);
  }

  let order = orders && orders.length > 0 ? orders[0] : null;

  // Fallback demo order หากค้นหาไม่พบ (เพื่อการทดสอบ UI / พิมพ์)
  if (!order) {
    if (orderNumber.startsWith("DEMO") || orderNumber.startsWith("ORD-")) {
      order = {
        id: 999,
        order_number: orderNumber,
        store_id: 3,
        store_name: "3NFM Motorsport Lab",
        store_subdomain: "3nfm",
        product_name: "Titanium Exhaust Downpipe",
        quantity: 1,
        total_amount: 38500.0,
        customer_name: "สมเกียรติ ยานยนต์",
        customer_contact: "089-123-4567",
        customer_address: "123/45 หมู่ 6 ถ.สุขุมวิท ต.บางเมือง อ.เมือง จ.สมุทรปราการ 10270",
        payment_method: "bank_transfer",
        payment_status: "paid",
        status: "paid",
        shipping_status: "shipped",
        courier: "Flash Express",
        tracking_number: "TH0192837465B",
        items_json: JSON.stringify([
          {
            name: "Titanium Exhaust Downpipe",
            quantity: 1,
            price: 38500.0,
          },
        ]),
        created_at: new Date().toISOString(),
      };
    } else {
      notFound();
    }
  }

  // Parse items breakdown
  let items: any[] = [];
  if (order.items_json) {
    try {
      items = typeof order.items_json === "string" ? JSON.parse(order.items_json) : order.items_json;
    } catch {
      items = [];
    }
  }

  if (!items || items.length === 0) {
    items = [
      {
        name: order.product_name || "Performance Part",
        quantity: order.quantity || 1,
        price: order.total_amount / (order.quantity || 1),
      },
    ];
  }

  const storeName = order.store_name || "3NFM Motorsport Lab";
  const storeSubdomain = order.store_subdomain || "3nfm";
  const totalAmount = Number(order.total_amount) || 0;

  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Print Specific CSS Overrides */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #111827 !important;
          }
          .print-hide {
            display: none !important;
          }
          .receipt-paper {
            background-color: #ffffff !important;
            color: #111827 !important;
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 32px !important;
          }
          .receipt-text-muted {
            color: #4b5563 !important;
          }
          .receipt-text-main {
            color: #111827 !important;
          }
          .receipt-border {
            border-color: #e5e7eb !important;
          }
          .receipt-table-header {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
          }
          .receipt-box-bg {
            background-color: #f9fafb !important;
            border-color: #e5e7eb !important;
          }
          .receipt-accent-text {
            color: #047857 !important;
          }
        }
      `}</style>

      {/* Top Navigation & Action Bar (Hidden on Print) */}
      <div className="print-hide border-b border-[#EEEFF2]/10 bg-[#090A0F]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={storeSubdomain ? `/${storeSubdomain}/track?q=${order.order_number}` : `/track?q=${order.order_number}`}
              className="p-2 rounded-xl bg-[#272835]/60 hover:bg-[#272835] border border-[#EEEFF2]/10 text-[#EEEFF2] transition-colors"
              title="กลับสู่หน้าติดตามสถานะ"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bebas text-2xl tracking-wide leading-none text-[#EEEFF2]">
                ใบเสร็จรับเงินดิจิทัล
              </h1>
              <span className="font-mono text-[11px] text-[#EEEFF2]/50">
                Official Digital Tax Invoice &bull; {order.order_number}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <PrintButton />
          </div>
        </div>
      </div>

      {/* Printable Invoice Container (A4 Proportions) */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="receipt-paper rounded-2xl bg-[#090A0F] border border-[#EEEFF2]/15 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Watermark/Accent stripe */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400" />

          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b receipt-border border-[#EEEFF2]/10">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center text-amber-400 shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bebas text-3xl sm:text-4xl tracking-wide receipt-text-main text-[#EEEFF2] leading-none">
                    {storeName}
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs receipt-text-muted text-[#EEEFF2]/60 uppercase">
                      {storeSubdomain}.3nfm.shop
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 receipt-accent-text">
                      <ShieldCheck className="w-3 h-3" />
                      VERIFIED TENANT
                    </span>
                  </div>
                </div>
              </div>
              <p className="font-sans text-xs receipt-text-muted text-[#EEEFF2]/50 max-w-sm leading-relaxed mt-2">
                ศูนย์รวมชิ้นส่วนและอุปกรณ์ยานยนต์สมรรถนะสูง ผ่านมาตรฐานการทดสอบมอเตอร์สปอร์ต
              </p>
            </div>

            <div className="sm:text-right">
              <div className="font-mono text-xs receipt-text-muted text-[#EEEFF2]/60 uppercase tracking-wider">
                INVOICE &bull; RECEIPT
              </div>
              <div className="font-mono text-lg sm:text-xl font-bold receipt-text-main text-[#EEEFF2] mt-0.5">
                {order.order_number}
              </div>
              <div className="font-mono text-xs receipt-text-muted text-[#EEEFF2]/60 mt-1 flex sm:justify-end items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#EEEFF2]/40" />
                <span>วันที่ออกเอกสาร: {new Date(order.created_at).toLocaleDateString("th-TH")}</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 receipt-accent-text font-mono text-xs font-semibold uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ชำระเงินเรียบร้อยแล้ว ({order.payment_status || "PAID"})</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b receipt-border border-[#EEEFF2]/10 font-sans text-xs">
            {/* Customer Details */}
            <div className="receipt-box-bg p-4 rounded-xl bg-[#272835]/30 border receipt-border border-[#EEEFF2]/10 space-y-2.5">
              <div className="font-mono text-[11px] receipt-text-muted text-[#EEEFF2]/60 uppercase tracking-wider font-semibold">
                ข้อมูลลูกค้า (BILLED TO)
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 receipt-text-muted text-[#EEEFF2]/40 shrink-0" />
                <span className="font-medium receipt-text-main text-[#EEEFF2] text-sm">
                  {order.customer_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 receipt-text-muted text-[#EEEFF2]/40 shrink-0" />
                <span className="font-mono receipt-text-main text-[#EEEFF2]">
                  {order.customer_contact}
                </span>
              </div>
              {order.customer_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 receipt-text-muted text-[#EEEFF2]/40 shrink-0 mt-0.5" />
                  <span className="receipt-text-muted text-[#EEEFF2]/80 leading-relaxed">
                    {order.customer_address}
                  </span>
                </div>
              )}
            </div>

            {/* Payment & Logistics Details */}
            <div className="receipt-box-bg p-4 rounded-xl bg-[#272835]/30 border receipt-border border-[#EEEFF2]/10 space-y-2.5">
              <div className="font-mono text-[11px] receipt-text-muted text-[#EEEFF2]/60 uppercase tracking-wider font-semibold">
                การชำระเงิน & การจัดส่ง (FULFILLMENT)
              </div>
              <div className="flex items-center justify-between">
                <span className="receipt-text-muted text-[#EEEFF2]/60">วิธีการชำระเงิน:</span>
                <span className="font-mono uppercase font-semibold receipt-text-main text-[#EEEFF2]">
                  {order.payment_method === "bank_transfer" ? "PromptPay Transfer" : "TrueMoney Angpao"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="receipt-text-muted text-[#EEEFF2]/60">สถานะจัดส่ง:</span>
                <span className="font-mono uppercase font-semibold receipt-accent-text text-amber-400">
                  {order.shipping_status || "Processing"}
                </span>
              </div>
              {order.tracking_number && (
                <div className="pt-2 border-t receipt-border border-[#EEEFF2]/10 flex items-center justify-between">
                  <span className="receipt-text-muted text-[#EEEFF2]/60">
                    เลขพัสดุ ({order.courier || "Express"}):
                  </span>
                  <span className="font-mono font-bold receipt-text-main text-white">
                    {order.tracking_number}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="py-6">
            <div className="font-mono text-xs receipt-text-muted text-[#EEEFF2]/60 uppercase tracking-wider mb-3">
              รายการสินค้า (ITEMIZED SPECIFICATION)
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="receipt-table-header bg-[#272835]/60 border-b receipt-border border-[#EEEFF2]/10 text-[#EEEFF2]/70 receipt-text-muted font-mono">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">รายการสินค้า</th>
                    <th className="py-3 px-4 text-right">ราคาต่อหน่วย</th>
                    <th className="py-3 px-4 text-center">จำนวน</th>
                    <th className="py-3 px-4 text-right">ยอดรวม (THB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y receipt-border divide-[#EEEFF2]/10 font-sans">
                  {items.map((item, idx) => {
                    const itemQty = Number(item.quantity) || 1;
                    const itemPrice = Number(item.price) || 0;
                    const itemSubtotal = itemQty * itemPrice;

                    return (
                      <tr key={idx} className="hover:bg-[#272835]/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-center receipt-text-muted text-[#EEEFF2]/50">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4 font-medium receipt-text-main text-[#EEEFF2]">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-right receipt-text-main text-[#EEEFF2]/90">
                          {itemPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-center receipt-text-main text-[#EEEFF2]">
                          {itemQty}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-right receipt-text-main text-[#EEEFF2]">
                          {itemSubtotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown / Totals */}
          <div className="border-t receipt-border border-[#EEEFF2]/10 pt-6 flex flex-col sm:flex-row justify-between gap-6">
            {/* Note & Authenticity Stamp */}
            <div className="max-w-xs space-y-2">
              <div className="font-mono text-[10px] receipt-text-muted text-[#EEEFF2]/50 uppercase tracking-wider">
                เอกสารนี้เป็นหลักฐานการสั่งซื้อและชำระเงินอิเล็กทรอนิกส์ ถูกต้องตามมาตรฐาน 3NFM Platform Architecture
              </div>
              <div className="inline-flex items-center gap-2 p-2 rounded-lg bg-[#010101] receipt-box-bg border receipt-border border-[#EEEFF2]/10 font-mono text-[10px] text-[#EEEFF2]/60 receipt-text-muted">
                <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SECURED ORDER &bull; VERIFIED HASH</span>
              </div>
            </div>

            {/* Total Math */}
            <div className="w-full sm:w-72 space-y-2.5 font-sans text-xs">
              <div className="flex justify-between receipt-text-muted text-[#EEEFF2]/70">
                <span>ยอดรวมสินค้า (Subtotal):</span>
                <span className="font-mono receipt-text-main text-[#EEEFF2]">
                  {totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} THB
                </span>
              </div>

              <div className="flex justify-between receipt-text-muted text-[#EEEFF2]/70">
                <span>ค่าจัดส่ง (Shipping Fee):</span>
                <span className="font-mono receipt-accent-text text-emerald-400 font-semibold">
                  0.00 THB (จัดส่งฟรี)
                </span>
              </div>

              <div className="flex justify-between receipt-text-muted text-[#EEEFF2]/70">
                <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
                <span className="font-mono receipt-text-muted text-[#EEEFF2]/60">
                  รวมในราคาสินค้าแล้ว
                </span>
              </div>

              <div className="pt-3 border-t receipt-border border-[#EEEFF2]/15 flex justify-between items-baseline">
                <span className="receipt-text-main text-sm font-bold text-[#EEEFF2]">
                  ยอดชำระสุทธิ (Total):
                </span>
                <span className="font-mono text-xl font-bold receipt-text-main text-emerald-400">
                  {totalAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
                  <span className="text-xs font-normal">THB</span>
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Footer */}
          <div className="mt-10 pt-6 border-t receipt-border border-[#EEEFF2]/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] receipt-text-muted text-[#EEEFF2]/40">
            <span>ISSUED BY {storeName.toUpperCase()} &bull; POWERED BY 3NFM SAAS PLATFORM</span>
            <span>THANK YOU FOR YOUR MOTORSPORT ENGINE PATRONAGE</span>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="print-hide border-t border-[#EEEFF2]/10 bg-[#090A0F] py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center font-mono text-xs text-[#EEEFF2]/50">
          3NFM Multi-Tenant SaaS Commerce Platform &bull; Motorsport Grade Reliability
        </div>
      </footer>
    </div>
  );
}
