"use client";

import { useState, useRef } from "react";
import { 
  X, 
  ShoppingBag, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  AlertCircle,
  Loader2,
  Gift,
  QrCode,
  Upload,
  User,
  Phone,
  MapPin,
  Trash2,
  Copy,
  Check,
  ImageIcon
} from "lucide-react";

export interface ProductItem {
  id: number | string;
  name: string;
  description: string | null;
  price: number | string;
  stock: number;
  category: string;
  image_url: string | null;
}

interface OrderModalProps {
  product: ProductItem | null;
  storeName: string;
  storeId: number | string;
  onClose: () => void;
}

interface OrderSuccessData {
  id: number;
  order_number: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  payment_method: string;
  voucher_amount?: number;
  slip_url?: string;
  status: string;
  payment_status?: string;
  created_at: string;
}

export default function OrderModal({
  product,
  storeName,
  storeId,
  onClose,
}: OrderModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"truemoney" | "bank_transfer">("truemoney");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [voucherUrl, setVoucherUrl] = useState("");
  
  // PromptPay Slip states
  const [slipBase64, setSlipBase64] = useState<string | null>(null);
  const [slipFileName, setSlipFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccessData | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  if (!product) return null;

  const numPrice = typeof product.price === "string" ? parseFloat(product.price) : product.price;
  const totalPrice = numPrice * quantity;

  const handleCopyOrderNumber = (orderNum: string) => {
    navigator.clipboard.writeText(orderNum);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("ขนาดไฟล์ต้องไม่เกิน 5 MB");
      return;
    }

    setSlipFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSlipBase64(e.target?.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemoveSlip = () => {
    setSlipBase64(null);
    setSlipFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (paymentMethod === "truemoney" && !voucherUrl.trim()) {
      setErrorMessage("กรุณาระบุลิงก์ซองของขวัญ TrueMoney");
      return;
    }

    if (paymentMethod === "bank_transfer" && !slipBase64) {
      setErrorMessage("กรุณาแนบรูปภาพสลิปโอนเงินเพื่อยืนยันรายการ");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id: storeId,
          product_id: product.id,
          customer_name: customerName.trim() || "ลูกค้าทั่วไป",
          customer_contact: customerContact.trim(),
          customer_address: customerAddress.trim(),
          quantity,
          payment_method: paymentMethod,
          voucher_url: paymentMethod === "truemoney" ? voucherUrl.trim() : undefined,
          slip_image: paymentMethod === "bank_transfer" ? slipBase64 : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "ไม่สามารถทำรายการสั่งซื้อได้");
      }

      setOrderSuccess(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-xl bg-[#272835] border border-[#EEEFF2]/20 text-[#EEEFF2] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[92vh] flex flex-col justify-between overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#010101]/50 hover:bg-[#010101] border border-[#EEEFF2]/10 text-[#EEEFF2]/70 hover:text-white transition-all cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {orderSuccess ? (
          /* Order Confirmation View */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-lg">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="font-bebas text-3xl sm:text-4xl tracking-wide text-[#EEEFF2] mb-1">
              {orderSuccess.payment_method === "bank_transfer"
                ? "บันทึกคำสั่งซื้อและสลิปแล้ว"
                : "สั่งซื้อและชำระเงินสำเร็จ"}
            </h3>
            <p className="font-sans text-xs sm:text-sm text-[#EEEFF2]/75 mb-5 leading-relaxed">
              {orderSuccess.payment_method === "bank_transfer"
                ? "ระบบได้รับหลักฐานการโอนเงินเรียบร้อยแล้ว ร้านค้าจะตรวจสอบและอนุมัติออเดอร์โดยเร็ว"
                : "ระบบตัดยอดเงินจากซองของขวัญ TrueMoney เรียบร้อยแล้ว"}
            </p>

            {/* Order Number Box */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/15 mb-4">
              <div>
                <span className="block font-sans text-[11px] text-[#EEEFF2]/50 text-left">
                  หมายเลขคำสั่งซื้อ
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-[#EEEFF2]">
                  {orderSuccess.order_number}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyOrderNumber(orderSuccess.order_number)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 font-mono text-xs text-[#EEEFF2] transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอก</span>
                  </>
                )}
              </button>
            </div>

            {/* Order Breakdown */}
            <div className="rounded-xl bg-[#010101]/40 border border-[#EEEFF2]/10 p-4 text-left font-sans text-xs space-y-2.5 mb-6">
              <div className="flex justify-between text-[#EEEFF2]/70">
                <span>ร้านค้า:</span>
                <span className="text-[#EEEFF2] font-semibold">{storeName}</span>
              </div>
              <div className="flex justify-between text-[#EEEFF2]/70">
                <span>สินค้า:</span>
                <span className="text-[#EEEFF2] font-medium">{orderSuccess.product_name}</span>
              </div>
              <div className="flex justify-between text-[#EEEFF2]/70">
                <span>จำนวน:</span>
                <span className="text-[#EEEFF2] font-mono">{orderSuccess.quantity} ชิ้น</span>
              </div>
              <div className="flex justify-between text-[#EEEFF2]/70">
                <span>ยอดเงินชำระ:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {orderSuccess.total_amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </span>
              </div>
              <div className="flex justify-between text-[#EEEFF2]/70">
                <span>ช่องทางชำระเงิน:</span>
                <span className="font-mono uppercase text-[#EEEFF2]">
                  {orderSuccess.payment_method === "bank_transfer" ? "PromptPay Transfer" : "TrueMoney Angpao"}
                </span>
              </div>
              <div className="flex justify-between text-[#EEEFF2]/70">
                <span>สถานะการตรวจสอบ:</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-amber-400 uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  {orderSuccess.status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-semibold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              เสร็จสิ้นและกลับสู่หน้าร้าน
            </button>
          </div>
        ) : (
          /* Checkout Form View */
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/15 flex items-center justify-center text-[#EEEFF2]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
                  สั่งซื้อและชำระเงิน
                </h3>
                <span className="font-mono text-xs text-[#EEEFF2]/60">
                  {storeName} &bull; Checkout Gateway
                </span>
              </div>
            </div>

            {/* Payment Method Switch Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/15 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("truemoney")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                  paymentMethod === "truemoney"
                    ? "bg-[#272835] text-[#EEEFF2] border border-[#EEEFF2]/20 shadow-sm"
                    : "text-[#EEEFF2]/60 hover:text-[#EEEFF2]"
                }`}
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>ซองของขวัญ TrueMoney</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("bank_transfer")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                  paymentMethod === "bank_transfer"
                    ? "bg-[#272835] text-[#EEEFF2] border border-[#EEEFF2]/20 shadow-sm"
                    : "text-[#EEEFF2]/60 hover:text-[#EEEFF2]"
                }`}
              >
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>สแกน QR / PromptPay</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5 mb-4 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Selected Product Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#010101]/50 border border-[#EEEFF2]/15 mb-4">
              <div className="flex-1 pr-3">
                <div className="font-sans font-semibold text-sm text-[#EEEFF2] truncate">
                  {product.name}
                </div>
                <div className="font-mono text-xs text-[#EEEFF2]/60 mt-0.5">
                  คงเหลือ {product.stock} ชิ้น &bull; {product.category}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-bold text-emerald-400">
                  {numPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-3.5">
              {/* Quantity */}
              <div className="flex items-center justify-between">
                <label className="font-sans text-xs font-medium text-[#EEEFF2]/80">
                  จำนวนที่ต้องการสั่งซื้อ:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, product.stock)}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 px-2.5 py-1.5 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-mono text-sm text-[#EEEFF2] focus:outline-none focus:border-[#EEEFF2] text-center"
                    required
                  />
                  <div className="font-mono text-xs text-[#EEEFF2]/80">
                    รวม: <span className="text-emerald-400 font-bold">{totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท</span>
                  </div>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="flex items-center gap-1.5 font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
                  <User className="w-3.5 h-3.5 text-[#EEEFF2]/60" />
                  <span>ชื่อ-นามสกุล ผู้สั่งซื้อ</span>
                </label>
                <input
                  type="text"
                  placeholder="เช่น สมเกียรติ ยานยนต์"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
                  required
                />
              </div>

              {/* Customer Contact */}
              <div>
                <label className="flex items-center gap-1.5 font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
                  <Phone className="w-3.5 h-3.5 text-[#EEEFF2]/60" />
                  <span>ข้อมูลติดต่อ (เบอร์โทรศัพท์ หรือ อีเมล)</span>
                </label>
                <input
                  type="text"
                  placeholder="08X-XXX-XXXX หรือ email@example.com"
                  value={customerContact}
                  onChange={(e) => setCustomerContact(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-mono text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
                  required
                />
              </div>

              {/* Delivery Address */}
              <div>
                <label className="flex items-center gap-1.5 font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#EEEFF2]/60" />
                  <span>ที่อยู่จัดส่งสินค้า</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
                  required
                />
              </div>

              {/* Method 1: TrueMoney Angpao */}
              {paymentMethod === "truemoney" && (
                <div className="p-3.5 rounded-xl bg-[#010101]/60 border border-amber-500/30">
                  <label className="flex items-center justify-between font-sans text-xs font-medium text-amber-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>ลิงก์ซองของขวัญ TrueMoney</span>
                    </span>
                    <span className="font-mono text-[10px] text-amber-400/80 uppercase">
                      Auto-Redeem
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://gift.truemoney.com/campaign/?v=xxxxxx"
                    value={voucherUrl}
                    onChange={(e) => setVoucherUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-mono text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <p className="font-sans text-[11px] text-[#EEEFF2]/60 mt-1.5 leading-relaxed">
                    สร้างซองของขวัญ TrueMoney มูลค่าเท่ากับราคาสินค้า แล้ววางลิงก์ที่นี่ ระบบจะตัดเงินอัตโนมัติทันที
                  </p>
                </div>
              )}

              {/* Method 2: PromptPay QR Code & Slip Upload */}
              {paymentMethod === "bank_transfer" && (
                <div className="p-4 rounded-xl bg-[#010101]/60 border border-sky-500/30 space-y-4">
                  {/* QR & Price Center Display */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-sky-400 font-semibold mb-2">
                      <QrCode className="w-4 h-4" />
                      <span>สแกน QR เพื่อชำระเงินผ่าน Mobile Banking</span>
                    </span>

                    {/* QR Code Container */}
                    <div className="w-56 max-w-full mx-auto p-2 bg-white rounded-xl shadow-lg flex items-center justify-center my-2 border border-[#EEEFF2]/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/promptpay-qr.jpg"
                        alt="PromptPay QR Code"
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    </div>

                    <div className="mt-2 font-sans text-xs text-[#EEEFF2]/60">
                      ยอดชำระเงินทั้งสิ้น
                    </div>
                    <div className="font-mono text-3xl font-bold text-emerald-400 tracking-tight">
                      {totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-sm font-sans text-[#EEEFF2]/70 font-normal">บาท</span>
                    </div>
                    <div className="font-sans text-xs text-[#EEEFF2]/70 mt-1">
                      บัญชีรับเงิน: <span className="font-semibold text-[#EEEFF2]">นาย ภคพล สมัยแก้ว</span> (KBank PromptPay)
                    </div>
                  </div>

                  {/* Drag & Drop Slip Upload Area */}
                  <div>
                    <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1.5">
                      แนบสลิปหลักฐานการโอนเงิน (JPG, PNG)
                    </label>

                    {slipBase64 ? (
                      /* Thumbnail Preview */
                      <div className="relative rounded-xl bg-[#272835] border border-emerald-500/40 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={slipBase64}
                            alt="Slip Preview"
                            className="w-14 h-14 object-cover rounded-xl border border-[#EEEFF2]/20"
                          />
                          <div>
                            <div className="font-sans font-semibold text-xs text-[#EEEFF2] truncate max-w-[200px]">
                              {slipFileName || "หลักฐานการโอนเงิน"}
                            </div>
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>แนบรูปภาพเรียบร้อย</span>
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveSlip}
                          className="p-2 rounded-xl bg-[#010101]/50 hover:bg-rose-950 text-rose-400 border border-[#EEEFF2]/10 transition-colors cursor-pointer"
                          title="ลบสลิป"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Drag & Drop Box */
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-sky-400 bg-sky-950/30"
                            : "border-[#EEEFF2]/20 hover:border-sky-400/60 bg-[#010101]/40"
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Upload className="w-7 h-7 text-sky-400 mx-auto mb-2" />
                        <div className="font-sans text-xs font-semibold text-[#EEEFF2]">
                          คลิกเพื่อเลือกไฟล์ หรือลากรูปสลิปมาวางที่นี่
                        </div>
                        <div className="font-mono text-[10px] text-[#EEEFF2]/50 mt-1">
                          รองรับ JPG, PNG (สูงสุด 5 MB)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || product.stock < 1}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 disabled:bg-[#272835] text-[#010101] disabled:text-[#EEEFF2]/40 font-semibold text-sm transition-all shadow-lg active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#010101]" />
                      <span>กำลังดำเนินการ...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-[#010101]" />
                      <span>ยืนยันและชำระเงิน ({totalPrice.toLocaleString("th-TH")} บาท)</span>
                      <ArrowRight className="w-4 h-4 text-[#010101]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
