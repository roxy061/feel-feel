"use client";

import { useCart } from "@/context/CartContext";
import { 
  ShoppingBag, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Tag, 
  ShieldCheck 
} from "lucide-react";
import Image from "next/image";

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { 
    items, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    totalPrice, 
    totalItems 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#090A0F] border-l border-[#EEEFF2]/15 text-[#EEEFF2] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-6 border-b border-[#EEEFF2]/10 flex items-center justify-between bg-[#010101]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center text-[#EEEFF2]">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bebas text-2xl tracking-wide leading-none text-[#EEEFF2]">
                  ตะกร้าสินค้า
                </h3>
                <span className="font-mono text-xs text-[#EEEFF2]/60">
                  {totalItems} รายการในตะกร้า
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl bg-[#272835]/50 hover:bg-[#272835] text-[#EEEFF2]/70 hover:text-white border border-[#EEEFF2]/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-xl bg-[#272835]/40 border border-[#EEEFF2]/10 flex items-center justify-center text-[#EEEFF2]/40 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="font-bebas text-2xl tracking-wide text-[#EEEFF2]/80">
                  ยังไม่มีสินค้าในตะกร้า
                </div>
                <p className="font-sans text-xs text-[#EEEFF2]/50 mt-1 max-w-xs">
                  เลือกสินค้าสมรรถนะสูงจากคลังสินค้า แล้วกดปุ่มใส่ตะกร้าเพื่อรวมคำสั่งซื้อ
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/20 font-sans text-xs font-semibold text-[#EEEFF2] transition-colors cursor-pointer"
                >
                  เลือกดูแคตตาล็อกสินค้า
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/10 flex gap-4 hover:border-[#EEEFF2]/25 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-18 h-18 rounded-lg bg-[#010101] border border-[#EEEFF2]/10 overflow-hidden relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url || "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info & Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-sans font-bold text-xs text-[#EEEFF2] truncate">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#EEEFF2]/40 hover:text-rose-400 transition-colors p-1"
                          title="ลบรายการนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#010101]/60 text-[#EEEFF2]/60 border border-[#EEEFF2]/10 mt-1">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EEEFF2]/5">
                      <div className="font-mono text-xs font-bold text-amber-400">
                        {item.price.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
                        <span className="text-[10px] text-[#EEEFF2]/60 font-normal">THB</span>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1.5 bg-[#010101] border border-[#EEEFF2]/15 rounded-lg px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-[#EEEFF2]/60 hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-bold px-1.5 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="text-[#EEEFF2]/60 hover:text-white disabled:text-[#EEEFF2]/20 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Summary & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#EEEFF2]/10 bg-[#010101] space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between font-sans text-xs text-[#EEEFF2]/60">
                  <span>จำนวนรวม:</span>
                  <span className="font-mono text-[#EEEFF2]">{totalItems} ชิ้น</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm font-semibold text-[#EEEFF2]">
                    ยอดรวมทั้งสิ้น:
                  </span>
                  <div className="font-mono text-2xl font-bold text-emerald-400">
                    {totalPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
                    <span className="text-xs font-mono text-emerald-300">THB</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-3 py-3 rounded-xl bg-[#272835]/50 hover:bg-[#272835] text-[#EEEFF2]/60 hover:text-rose-400 border border-[#EEEFF2]/10 transition-colors"
                  title="ล้างตะกร้าสินค้า"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-bold text-xs sm:text-sm transition-all shadow-xl active:scale-95 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>ดำเนินการสั่งซื้อ ({totalPrice.toLocaleString("th-TH")} THB)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center font-sans text-[11px] text-[#EEEFF2]/50">
                รองรับ PromptPay QR และ TrueMoney Angpao
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
