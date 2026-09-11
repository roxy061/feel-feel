"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle,
  X,
} from "lucide-react";
import { useTenant } from "../TenantContext";

export default function MerchantProductsPage() {
  const { currentSubdomain } = useTenant();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("ทั่วไป");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/merchant/products?subdomain=${currentSubdomain}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentSubdomain]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setSaving(true);
    try {
      const res = await fetch("/api/merchant/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subdomain: currentSubdomain,
          name,
          price: Number(price),
          stock: Number(stock) || 10,
          category,
          description,
          imageUrl: imageUrl || undefined,
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setName("");
        setPrice("");
        setStock("");
        setDescription("");
        setImageUrl("");
        fetchProducts();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการบันทึกสินค้า");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) return;
    try {
      await fetch(`/api/merchant/products?id=${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            จัดการสินค้าและสต็อก ({products.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            ร้านค้า: {currentSubdomain}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสินค้าใหม่</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>กำลังโหลดรายการสินค้า...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-950 border border-slate-800 text-center text-slate-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <p className="text-sm">ยังไม่มีสินค้าในร้านค้านี้</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium"
          >
            เริ่มลงสินค้าชิ้นแรก
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">รูปภาพ</th>
                  <th className="p-4">ชื่อสินค้า</th>
                  <th className="p-4">หมวดหมู่</th>
                  <th className="p-4">ราคา</th>
                  <th className="p-4">คงเหลือ</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <img
                        src={p.imageUrl || "https://placehold.co/100x100"}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-800 border border-slate-700"
                      />
                    </td>
                    <td className="p-4 font-semibold text-white max-w-xs truncate">
                      {p.name}
                      <span className="block text-[11px] text-slate-500 font-normal truncate mt-0.5">
                        {p.description || "-"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400 font-mono">
                      {p.price.toLocaleString()} ฿
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.stock > 5
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {p.stock} ชิ้น
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="ลบสินค้า"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                เพิ่มสินค้าใหม่เข้าสู่ร้าน
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ชื่อสินค้า *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น หูฟังบลูทูธไร้สาย ANC"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ราคาขาย (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="990"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    จำนวนสต็อก *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  หมวดหมู่สินค้า
                </label>
                <input
                  type="text"
                  placeholder="เช่น อุปกรณ์ไอที, แฟชั่น, แกดเจ็ต"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  ลิงก์รูปภาพสินค้า (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  รายละเอียดสินค้า
                </label>
                <textarea
                  rows={3}
                  placeholder="คุณสมบัติเด่นของสินค้า..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกสินค้า"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
