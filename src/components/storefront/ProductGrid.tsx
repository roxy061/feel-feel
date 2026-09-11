"use client";

import { useState } from "react";
import { 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  Search, 
  SlidersHorizontal,
  PackageCheck
} from "lucide-react";
import OrderModal, { ProductItem } from "./OrderModal";

interface ProductGridProps {
  products: ProductItem[];
  storeName: string;
  storeId: number | string;
}

export default function ProductGrid({ products, storeName, storeId }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["ALL", ...Array.from(new Set(products.map((p) => p.category || "General")))];

  const filteredProducts = products.filter((item) => {
    const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="products-catalog" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#EEEFF2]/15">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#272835] border border-[#EEEFF2]/20 font-mono text-xs text-[#EEEFF2] mb-3">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>AUTHENTIC INVENTORY</span>
          </div>
          <h2 className="font-bebas text-4xl sm:text-5xl tracking-wide text-[#EEEFF2] leading-none">
            รายการสินค้าและอุปกรณ์
          </h2>
          <p className="font-sans text-sm text-[#EEEFF2]/70 mt-2">
            ชิ้นส่วนสมรรถนะสูงพร้อมจัดส่ง คัดสรรคุณภาพเพื่อความแม่นยำและความทนทาน
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-[#EEEFF2]/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl bg-[#272835]/50 border border-[#EEEFF2]/15 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/40 focus:outline-none focus:border-[#EEEFF2]/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-mono transition-all border ${
                activeCategory === cat
                  ? "bg-[#EEEFF2] text-[#010101] font-bold border-[#EEEFF2]"
                  : "bg-[#272835]/40 text-[#EEEFF2]/70 border-[#EEEFF2]/10 hover:bg-[#272835] hover:text-[#EEEFF2]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-xl bg-[#272835]/30 border border-[#EEEFF2]/15 p-12 text-center my-6">
          <div className="w-12 h-12 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 flex items-center justify-center mx-auto mb-4 text-[#EEEFF2]/60">
            <PackageCheck className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-semibold text-lg text-[#EEEFF2] mb-1">
            ไม่พบรายการสินค้าที่ค้นหา
          </h3>
          <p className="font-sans text-xs text-[#EEEFF2]/60">
            โปรดลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่สินค้า
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const numPrice =
              typeof product.price === "string" ? parseFloat(product.price) : product.price;
            const inStock = product.stock > 0;

            return (
              <div
                key={product.id}
                className="group rounded-xl bg-[#272835] border border-[#EEEFF2]/15 overflow-hidden flex flex-col justify-between hover:border-[#EEEFF2]/40 transition-all shadow-xl hover:shadow-[#272835]/50"
              >
                {/* Product Image / Visual Area */}
                <div className="relative w-full aspect-[16/10] bg-[#010101] overflow-hidden">
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#010101] via-[#090A0F] to-[#272835] text-[#EEEFF2]/30">
                      <ShoppingBag className="w-12 h-12" />
                    </div>
                  )}

                  {/* Badges Over Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="font-mono text-[11px] px-2.5 py-1 rounded-xl bg-[#010101]/80 backdrop-blur-md text-[#EEEFF2] border border-[#EEEFF2]/15">
                      {product.category || "Performance"}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    {inStock ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-xl bg-emerald-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>คงเหลือ {product.stock} ชิ้น</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-xl bg-rose-950/80 backdrop-blur-md text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" />
                        <span>สินค้าหมด</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Product Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-sans font-bold text-lg text-[#EEEFF2] group-hover:text-white transition-colors leading-snug">
                      {product.name}
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-[#EEEFF2]/70 mt-2 line-clamp-2 leading-relaxed">
                      {product.description || "ชิ้นส่วนสมรรถนะสูง ผ่านการทดสอบตามมาตรฐานมอเตอร์สปอร์ตสากล"}
                    </p>
                  </div>

                  {/* Footer: Price + CTA Button */}
                  <div className="mt-6 pt-4 border-t border-[#EEEFF2]/10 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-sans text-[11px] text-[#EEEFF2]/50 font-medium">
                        ราคาจำหน่าย
                      </div>
                      <div className="font-mono text-xl sm:text-2xl font-bold text-[#EEEFF2] tracking-tight">
                        {numPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
                        <span className="text-xs font-sans text-[#EEEFF2]/60 font-normal">บาท</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => setSelectedProduct(product)}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all shadow-md active:scale-95 ${
                        inStock
                          ? "bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] cursor-pointer"
                          : "bg-[#010101]/60 text-[#EEEFF2]/40 border border-[#EEEFF2]/10 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>สั่งซื้อสินค้า</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Order Modal */}
      <OrderModal
        product={selectedProduct}
        storeName={storeName}
        storeId={storeId}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
