"use client";

import { useState } from "react";
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search,
  Tag,
  AlertCircle,
  Store
} from "lucide-react";
import ProductModal, { ProductData } from "./ProductModal";

interface Product {
  id: number;
  store_id?: number;
  store_name?: string;
  subdomain?: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  category: string;
  is_available: number;
  image_url: string | null;
}

interface ProductManagementProps {
  products: Product[];
  onRefresh: () => void;
}

export default function ProductManagement({
  products,
  onRefresh,
}: ProductManagementProps) {
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const filtered = products.filter((p) => {
    const matchesStore =
      storeFilter === "all" ||
      (storeFilter === "3nfm" && (p.subdomain === "3nfm" || p.store_id === 3)) ||
      (storeFilter === "apex" && (p.subdomain === "apex" || p.store_id === 1));

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

    return matchesStore && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      store_id: product.store_id,
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category: product.category,
      is_available: Boolean(product.is_available),
      image_url: product.image_url || "",
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("คุณต้องการลบสินค้านี้ใช่หรือไม่?")) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/merchant/products/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "ลบสินค้าไม่สำเร็จ");
      } else {
        onRefresh();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบสินค้า");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-xl bg-[#272835] border border-[#EEEFF2]/15 shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#EEEFF2]/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-[#EEEFF2]" />
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
              ระบบจัดการสินค้า (Product Inventory)
            </h3>
          </div>
          <p className="font-sans text-xs text-[#EEEFF2]/60">
            รายการสินค้าทั้งหมด {products.length} รายการในคลังสินค้าทุกร้านค้า
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Store Filter Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/10 font-sans text-xs">
            {[
              { id: "all", label: "ทุกร้าน" },
              { id: "3nfm", label: "3NFM" },
              { id: "apex", label: "Apex" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStoreFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  storeFilter === tab.id
                    ? "bg-[#272835] text-[#EEEFF2] font-semibold border border-[#EEEFF2]/20 shadow-sm"
                    : "text-[#EEEFF2]/60 hover:text-[#EEEFF2]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#EEEFF2]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-[#010101] border border-[#EEEFF2]/15 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
            />
          </div>

          {/* Add Product Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 text-[#010101] font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าใหม่</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-xs">
          <thead>
            <tr className="border-b border-[#EEEFF2]/10 text-[#EEEFF2]/50 font-mono text-[11px] uppercase tracking-wider">
              <th className="pb-3 pr-4">สินค้า &amp; ร้านค้า</th>
              <th className="pb-3 px-4">หมวดหมู่</th>
              <th className="pb-3 px-4 text-right">ราคา</th>
              <th className="pb-3 px-4 text-center">สต็อก</th>
              <th className="pb-3 px-4 text-center">สถานะจำหน่าย</th>
              <th className="pb-3 pl-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEEFF2]/5">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#EEEFF2]/40 font-mono">
                  ไม่พบรายการสินค้าในระบบ
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const numPrice =
                  typeof item.price === "string" ? parseFloat(item.price) : item.price;
                const isAvail = Boolean(item.is_available);
                const isStore3NFM = item.subdomain === "3nfm" || item.store_id === 3;

                return (
                  <tr key={item.id} className="hover:bg-[#010101]/30 transition-colors">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#010101] border border-[#EEEFF2]/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-[#EEEFF2]/40" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-[#EEEFF2] leading-snug line-clamp-1">
                            {item.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`font-mono text-[10px] px-1.5 py-0.2 rounded border ${
                                isStore3NFM
                                  ? "bg-amber-950/70 text-amber-400 border-amber-500/30"
                                  : "bg-sky-950/70 text-sky-400 border-sky-500/30"
                              }`}
                            >
                              {isStore3NFM ? "3NFM" : "Apex"}
                            </span>
                            <span className="font-mono text-[10px] text-[#EEEFF2]/40">
                              ID: #{item.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-xl bg-[#010101]/50 border border-[#EEEFF2]/10 text-[#EEEFF2]/80">
                        {item.category || "General"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-[#EEEFF2] text-sm">
                      {numPrice.toLocaleString("th-TH", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-[10px] text-[#EEEFF2]/50 font-normal">฿</span>
                    </td>

                    <td className="py-4 px-4 text-center font-mono">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                          item.stock > 0
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-950/80 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {item.stock} ชิ้น
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded-xl border ${
                          isAvail
                            ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/30"
                            : "bg-[#010101]/50 text-[#EEEFF2]/40 border-[#EEEFF2]/10"
                        }`}
                      >
                        {isAvail ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>เปิดขาย</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>ปิดขาย</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-lg bg-[#010101]/40 hover:bg-[#010101] text-[#EEEFF2]/80 hover:text-white border border-[#EEEFF2]/10 transition-colors cursor-pointer"
                          title="แก้ไขสินค้า"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isDeleting === item.id}
                          className="p-2 rounded-lg bg-[#010101]/40 hover:bg-rose-950 text-rose-400 border border-[#EEEFF2]/10 transition-colors cursor-pointer"
                          title="ลบสินค้า"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      <ProductModal
        isOpen={modalOpen}
        product={editingProduct}
        onClose={() => setModalOpen(false)}
        onSaved={onRefresh}
      />
    </div>
  );
}
