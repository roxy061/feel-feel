"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  CheckCircle,
  X,
  Plus,
  Minus,
  Trash2,
  QrCode,
  ShieldAlert,
  ArrowLeft,
  Store as StoreIcon,
  Tag,
  Phone,
  User,
  MapPin,
  Sparkles,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string;
}

interface Store {
  id: string;
  subdomain: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  primaryColor: string;
  promptpayNumber: string;
  promptpayName: string;
  status: string;
  products: Product[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function StorefrontClient({ store }: { store: Store }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [slipUploaded, setSlipUploaded] = useState(false);

  const categories = ["all", ...Array.from(new Set(store.products.map((p) => p.category)))];

  const filteredProducts = store.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || cart.length === 0) return;

    setCheckoutLoading(true);
    try {
      const res = await fetch(`/api/store/${store.subdomain}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          items: cart.map((i) => ({
            productId: i.product.id,
            productName: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
          })),
          slipUploaded,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrderResult(data);
        setCart([]); // Clear cart
      } else {
        alert(data.error || "เกิดข้อผิดพลาดในการสั่งซื้อ");
      }
    } catch (err: any) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // If Store is Expired or Suspended
  if (store.status === "EXPIRED" || store.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-800 border border-slate-700 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">หน้าร้านค้านี้ปิดให้บริการชั่วคราว</h1>
          <p className="text-sm text-slate-400 mb-6">
            ร้านค้า <span className="text-white font-semibold">{store.name}</span> ได้หมดอายุสัญญาเช่า (Subscription Expired) ระบบได้ทำการล็อกการเข้าถึงอัตโนมัติตามนโยบาย Lifecycle Management
          </p>
          <div className="space-y-3">
            <Link
              href="/merchant/billing"
              className="block w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all"
            >
              เข้าสู่แดชบอร์ดเจ้าของร้านเพื่อต่ออายุ (1 Token)
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium text-sm transition-all"
            >
              กลับหน้าหลัก SaaS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Top Tenant Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors pr-3 border-r border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>FeelFeel SaaS</span>
            </Link>

            <div className="flex items-center gap-3">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="w-9 h-9 rounded-lg object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  <StoreIcon className="w-5 h-5" />
                </div>
              )}
              <div>
                <h1 className="font-bold text-slate-900 text-base leading-tight">
                  {store.name}
                </h1>
                <span className="text-[11px] text-slate-500 block">
                  {store.subdomain}.localhost:3000
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              <span className="hidden sm:inline text-xs font-semibold">
                ตะกร้า ({totalItems})
              </span>
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center shadow"
                  style={{ backgroundColor: store.primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner with Custom Theme Color */}
      <div
        className="relative text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${store.primaryColor} 0%, #1e1b4b 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              ร้านค้าออนไลน์คุณภาพ รับชำระผ่าน PromptPay QR
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {store.name}
            </h2>
            <p className="mt-2 text-slate-100 text-sm sm:text-base leading-relaxed opacity-90">
              {store.description || "ยินดีต้อนรับสู่ร้านค้าออนไลน์ของเรา สินค้าคุณภาพพร้อมส่งทันที"}
            </p>
          </div>
        </div>
      </div>

      {/* Store Catalog Controls */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? store.primaryColor : undefined,
                }}
              >
                {cat === "all" ? "สินค้าทั้งหมด" : cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาสินค้าในร้าน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">ไม่พบสินค้าที่ค้นหา</h3>
            <p className="text-xs text-slate-400 mt-1">ลองพิมพ์คำค้นหาอื่นหรือเปลี่ยนหมวดหมู่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden flex flex-col group"
              >
                <div className="aspect-square relative overflow-hidden bg-slate-100">
                  <img
                    src={
                      product.imageUrl ||
                      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-md text-slate-700 shadow-sm">
                      สต็อก {product.stock}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                      {product.category}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                      {product.description || "ไม่มีรายละเอียดสินค้า"}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-normal">ราคา</span>
                      <span className="text-base font-extrabold text-slate-900">
                        {product.price.toLocaleString()} ฿
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className="px-3.5 py-2 rounded-xl text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                      style={{ backgroundColor: store.primaryColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ใส่ตะกร้า</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer Slide-over */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-slate-700" />
                  <h2 className="font-bold text-base text-slate-900">
                    ตะกร้าสินค้า ({totalItems})
                  </h2>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">ไม่มีสินค้าในตะกร้า</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                    >
                      <img
                        src={item.product.imageUrl || ""}
                        alt={item.product.name}
                        className="w-14 h-14 rounded-lg object-cover bg-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-slate-900 truncate">
                          {item.product.name}
                        </h4>
                        <span className="text-xs font-bold text-slate-700 block mt-0.5">
                          {item.product.price.toLocaleString()} ฿
                        </span>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">ยอดรวมทั้งสิ้น</span>
                    <span className="text-xl font-black text-slate-900">
                      {cartTotal.toLocaleString()} ฿
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>ชำระเงินผ่าน PromptPay QR</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal with Dynamic PromptPay QR */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">สั่งซื้อและชำระเงิน</h3>
              </div>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderResult(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {orderResult ? (
                /* Order Confirmation & QR Display */
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">สร้างออเดอร์สำเร็จ!</h4>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      เลขที่คำสั่งซื้อ: {orderResult.order.orderNumber}
                    </p>
                  </div>

                  {/* QR Box */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 inline-block">
                    <img
                      src={orderResult.qrCode}
                      alt="PromptPay QR Code"
                      className="w-48 h-48 mx-auto rounded-lg shadow-sm"
                    />
                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-900">
                        {orderResult.promptpay.name}
                      </p>
                      <p className="font-mono text-slate-500">
                        พร้อมเพย์: {orderResult.promptpay.number}
                      </p>
                      <p className="text-sm font-extrabold text-blue-600 mt-1">
                        ยอดที่ต้องชำระ: {orderResult.promptpay.amount.toLocaleString()} บาท
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 text-left">
                    <span className="font-bold block mb-1">สถานะ: รอตรวจสอบการชำระเงิน</span>
                    เมื่อโอนเงินแล้ว ร้านค้าจะตรวจสอบสลิปและดำเนินการจัดส่งไปยัง {orderResult.order.customerName} ทันที
                  </div>

                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setOrderResult(null);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
                  >
                    เสร็จสิ้น
                  </button>
                </div>
              ) : (
                /* Checkout Form */
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      ชื่อ-นามสกุล ผู้รับสินค้า *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น สมชาย ใจดี"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      เบอร์โทรศัพท์ติดต่อ *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="เช่น 0891234567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      ที่อยู่จัดส่ง
                    </label>
                    <textarea
                      rows={2}
                      placeholder="เลขที่ บ้าน ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex justify-between font-medium text-slate-600 mb-1">
                      <span>จำนวนรายการ</span>
                      <span>{totalItems} ชิ้น</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 text-sm">
                      <span>ยอดสุทธิ</span>
                      <span className="text-blue-600">{cartTotal.toLocaleString()} ฿</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="slipSim"
                      checked={slipUploaded}
                      onChange={(e) => setSlipUploaded(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="slipSim" className="text-xs text-slate-600 cursor-pointer">
                      จำลองการแนบสลิปโอนเงินทันที (ตั้งสถานะเป็น PAID อัตโนมัติ)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: store.primaryColor }}
                  >
                    {checkoutLoading ? "กำลังสร้างออเดอร์..." : "ยืนยันการสั่งซื้อและออกคิวอาร์โค้ด"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Storefront Footer */}
      <footer className="border-t border-slate-200 py-6 bg-white text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 {store.name}. All rights reserved.</span>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Powered by</span>
            <Link href="/" className="font-semibold text-blue-600 hover:underline">
              FeelFeel Multi-tenant SaaS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
