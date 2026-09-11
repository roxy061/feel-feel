"use client";

import { useState, useEffect } from "react";
import { X, Package, Tag, DollarSign, Layers, ImageIcon, FileText, CheckCircle2, Loader2 } from "lucide-react";

export interface ProductData {
  id?: number;
  name: string;
  description: string;
  price: number | string;
  stock: number | string;
  category: string;
  is_available: boolean | number;
  image_url: string;
}

interface ProductModalProps {
  isOpen: boolean;
  product?: ProductData | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductModal({
  isOpen,
  product,
  onClose,
  onSaved,
}: ProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("Performance");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(String(product.price || ""));
      setStock(String(product.stock ?? ""));
      setCategory(product.category || "Performance");
      setImageUrl(product.image_url || "");
      setIsAvailable(Boolean(product.is_available));
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("10");
      setCategory("Performance");
      setImageUrl("");
      setIsAvailable(true);
    }
    setError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const url = product?.id ? `/api/merchant/products/${product.id}` : "/api/merchant/products";
      const method = product?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          price: parseFloat(price) || 0,
          stock: parseInt(stock, 10) || 0,
          category: category.trim(),
          is_available: isAvailable ? 1 : 0,
          image_url: imageUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "บันทึกข้อมูลสินค้าไม่สำเร็จ");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-xl bg-[#272835] border border-[#EEEFF2]/20 text-[#EEEFF2] p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#010101]/50 hover:bg-[#010101] border border-[#EEEFF2]/10 text-[#EEEFF2]/70 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#010101]/60 border border-[#EEEFF2]/15 flex items-center justify-center text-[#EEEFF2]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bebas text-2xl sm:text-3xl tracking-wide text-[#EEEFF2] leading-none">
              {product?.id ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
            </h3>
            <span className="font-mono text-xs text-[#EEEFF2]/60">
              Product Catalog Inventory
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
              ชื่อสินค้า
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น Apex Carbon Fiber Aero Wing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
                ราคาจำหน่าย (บาท)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="24900.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-mono text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
                สต็อกคงเหลือ (ชิ้น)
              </label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-mono text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
              หมวดหมู่สินค้า
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="เช่น Aerodynamics, Braking System"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
              URL รูปภาพสินค้า
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-mono text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-[#EEEFF2]/80 mb-1">
              รายละเอียดสินค้า
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดชิ้นส่วน สเปคทางเทคนิค หรือการรับประกัน..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#010101] border border-[#EEEFF2]/20 font-sans text-xs text-[#EEEFF2] placeholder-[#EEEFF2]/30 focus:outline-none focus:border-[#EEEFF2]"
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#010101]/40 border border-[#EEEFF2]/10">
            <input
              type="checkbox"
              id="is_available"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="w-4 h-4 rounded accent-[#272835] cursor-pointer"
            />
            <label htmlFor="is_available" className="font-sans text-xs text-[#EEEFF2] cursor-pointer select-none">
              เปิดจำหน่ายสินค้านี้ในหน้าร้านค้าทันที (is_available = 1)
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-[#010101]/60 hover:bg-[#010101] text-[#EEEFF2]/80 text-xs font-medium border border-[#EEEFF2]/15 transition-all cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#EEEFF2] hover:bg-[#EEEFF2]/90 disabled:bg-[#272835] text-[#010101] disabled:text-[#EEEFF2]/40 text-xs font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>บันทึกสินค้า</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
