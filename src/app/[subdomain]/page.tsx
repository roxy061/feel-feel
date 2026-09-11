import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";
import StoreNavbar from "@/components/storefront/StoreNavbar";
import HeroSection from "@/components/storefront/HeroSection";
import ProductGrid from "@/components/storefront/ProductGrid";
import StoreFooter from "@/components/storefront/StoreFooter";

export const dynamic = "force-dynamic";

interface TenantStorePageProps {
  params: {
    subdomain: string;
  };
}

interface StoreRecord {
  id: number | string;
  subdomain: string;
  name: string;
  description: string | null;
  tagline: string | null;
  decorative_text: string | null;
  video_url: string | null;
  banner_url: string | null;
  created_at?: string;
}

interface ProductRecord {
  id: number | string;
  store_id: number | string;
  name: string;
  description: string | null;
  price: number | string;
  stock: number;
  image_url: string | null;
  category: string;
  is_available: number;
  created_at?: string;
}

export async function generateMetadata({
  params,
}: TenantStorePageProps): Promise<Metadata> {
  const { subdomain } = params;

  try {
    let stores = await query<StoreRecord[]>(
      "SELECT name, description, tagline FROM stores WHERE subdomain = ? LIMIT 1",
      [subdomain]
    );

    if (!stores || stores.length === 0) {
      await ensureDatabaseSeeded();
      stores = await query<StoreRecord[]>(
        "SELECT name, description, tagline FROM stores WHERE subdomain = ? LIMIT 1",
        [subdomain]
      );
    }

    if (stores && stores.length > 0) {
      const store = stores[0];
      return {
        title: `${store.name} - Official Storefront`,
        description:
          store.description ||
          store.tagline ||
          "Powered by 3NFM High-Performance Multi-Tenant Commerce",
      };
    }
  } catch {
    // Fallback if db isn't reachable during metadata gen
  }

  return {
    title: `${subdomain} Store - 3NFM Commerce`,
  };
}

export default async function TenantStorePage({ params }: TenantStorePageProps) {
  const { subdomain } = params;

  // 1. ดึงข้อมูลร้านค้าจากตาราง stores โดยเทียบ subdomain
  let stores: StoreRecord[] = [];
  try {
    stores = await query<StoreRecord[]>(
      "SELECT * FROM stores WHERE subdomain = ? LIMIT 1",
      [subdomain]
    );
  } catch {
    // หากมีข้อผิดพลาด (เช่น ตารางยังไม่มีใน Cloud DB) ให้รัน Auto-Seed ทันที
    try {
      await ensureDatabaseSeeded();
      stores = await query<StoreRecord[]>(
        "SELECT * FROM stores WHERE subdomain = ? LIMIT 1",
        [subdomain]
      );
    } catch (retryErr) {
      console.error(`[Auto-Seed & Query Failed] Subdomain: ${subdomain}`, retryErr);
      notFound();
    }
  }

  // หากยังไม่พบร้านค้า (เช่น เข้าชม /3nfm หรือ /apex ครั้งแรกบนฐานข้อมูลใหม่) ให้เรียก Auto-Seed แล้วดึงซ้ำ
  if (!stores || stores.length === 0) {
    try {
      await ensureDatabaseSeeded();
      stores = await query<StoreRecord[]>(
        "SELECT * FROM stores WHERE subdomain = ? LIMIT 1",
        [subdomain]
      );
    } catch (err) {
      console.error(`[Seed Retry Error]:`, err);
    }
  }

  if (!stores || stores.length === 0) {
    notFound();
  }

  const store = stores[0];

  // 2. ดึงรายการสินค้าที่มี is_available = 1 จากตาราง products โดยเทียบ store_id
  let products: ProductRecord[] = [];
  try {
    products = await query<ProductRecord[]>(
      "SELECT * FROM products WHERE store_id = ? AND is_available = 1 ORDER BY id DESC",
      [store.id]
    );
  } catch (error) {
    console.error(`[Database Error] Failed to fetch products for store_id: ${store.id}`, error);
    products = [];
  }

  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Navbar ด้านบน พร้อมชื่อร้านและ Cart Icon จาก Lucide */}
      <StoreNavbar storeName={store.name} subdomain={store.subdomain} />

      {/* Hero Section สไตล์ New Era Automotive Hero ตามข้อกำหนดใน design.md */}
      <HeroSection
        storeName={store.name}
        description={store.description}
        tagline={store.tagline}
        decorativeText={store.decorative_text}
        videoUrl={store.video_url}
        bannerUrl={store.banner_url}
      />

      {/* Products Grid: Responsive Grid พร้อมการ์ด #272835 และปุ่มสั่งซื้อสินค้า */}
      <main className="flex-1 w-full">
        <ProductGrid products={products} storeName={store.name} storeId={store.id} />
      </main>

      {/* Store Footer */}
      <StoreFooter storeName={store.name} subdomain={store.subdomain} />
    </div>
  );
}
