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

// In-memory fallback stores (รับประกันว่า /3nfm และ /apex จะเปิดได้เสมอ 100% แม้ Database จะ Offline หรือยังไม่ได้เชื่อมต่อ)
const FALLBACK_STORES: Record<string, StoreRecord> = {
  "3nfm": {
    id: 3,
    subdomain: "3nfm",
    name: "3NFM Motorsport Lab",
    description:
      "ศูนย์รวมนวัตกรรมชิ้นส่วนยานยนต์และแอโรไดนามิกส์ระดับการแข่งขัน ออกแบบเฉพาะทางเพื่อการขับขี่สมรรถนะสูงสุด",
    tagline: "ENGINEERED FOR SUPREMACY",
    decorative_text: "3NFM MOTORSPORT",
    video_url:
      "https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4",
    banner_url:
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80",
  },
  "apex": {
    id: 1,
    subdomain: "apex",
    name: "Apex Performance",
    description:
      "ผู้นำด้านอะไหล่และอุปกรณ์ยานยนต์สมรรถนะสูง ออกแบบด้วยมาตรฐานมอเตอร์สปอร์ตเพื่อความเร็วและความแม่นยำสูงสุดในทุกเส้นทาง",
    tagline: "DOMINATE EVERY CORNER WITH PRECISION",
    decorative_text: "APEX PERFORMANCE",
    video_url:
      "https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4",
    banner_url:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=80",
  },
};

const FALLBACK_PRODUCTS_3NFM: ProductRecord[] = [
  {
    id: 301,
    store_id: 3,
    name: "3NFM Stage-3 Carbon Intake Plenum",
    description: "ท่อร่วมไอดีคาร์บอนไฟเบอร์เกรดแห้งแบบ Dry Carbon เพิ่มปริมาตรการไหลเวียนของไอดี 45% ทนความร้อนสูง",
    price: 36500.0,
    stock: 6,
    category: "Intake System",
    image_url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 302,
    store_id: 3,
    name: "3NFM Titanium Valvetronic Race Exhaust",
    description: "ระบบท่อไอเสียไทเทเนียมพร้อมวาล์วไฟฟ้าเปิด-ปิดเสียงอัตโนมัติตามรอบเครื่องยนต์ ลดน้ำหนักตัวถังลง 14.5 กก.",
    price: 49000.0,
    stock: 4,
    category: "Exhaust System",
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 303,
    store_id: 3,
    name: "Forged Carbon GT Rear Wing 1600mm",
    description: "วิงหลังคาร์บอนลายฟอร์จแท้ ปรับมุมองศาการรับลมได้ 4 ระดับ ขาจับอะลูมิเนียมเกรดอากาศยาน 7075",
    price: 28500.0,
    stock: 8,
    category: "Aerodynamics",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 304,
    store_id: 3,
    name: "3NFM Competition Inverted Coilover Kit",
    description: "โช้คอัพหัวกลับระดับการแข่งขัน ปรับหนืด Bump/Rebound แยกอิสระ 2-Way สปริงนำเข้าจากเยอรมนี",
    price: 42000.0,
    stock: 10,
    category: "Suspension",
    image_url: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 305,
    store_id: 3,
    name: "Ceramic-Carbon Monoblock Brake Rotor 380mm",
    description: "จานเบรกเซรามิกคาร์บอนน้ำหนักเบาพิเศษ ทนอุณหภูมิสนามแข่งได้ถึง 1,000°C โดยไม่มีอาการเบรกเฟด",
    price: 58000.0,
    stock: 3,
    category: "Braking System",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 306,
    store_id: 3,
    name: "Full Standalone Motorsport ECU V3",
    description: "กล่องควบคุมเครื่องยนต์อัจฉริยะ รองรับระบบ Launch Control, Flat Shift, Anti-Lag และการเชื่อมต่อ CAN-Bus",
    price: 26000.0,
    stock: 12,
    category: "Engine Management",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
];

const FALLBACK_PRODUCTS_APEX: ProductRecord[] = [
  {
    id: 101,
    store_id: 1,
    name: "Apex Carbon Fiber Aero Wing V2",
    description: "สปอยเลอร์คาร์บอนไฟเบอร์แท้ 100% เพิ่มแรงกด Downforce 35% พร้อมขายึดไทเทเนียม CNC น้ำหนักเบาพิเศษ",
    price: 24900.0,
    stock: 5,
    category: "Aerodynamics",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 102,
    store_id: 1,
    name: "Monoblock 6-Pot Brake Caliper Set",
    description: "ชุดเบรกคาลิปเปอร์อะลูมิเนียมหล่อชิ้นเดียว ทนความร้อนสูงพิเศษ 800°C ตอบสนองระยะเบรกแม่นยำฉับไว",
    price: 48500.0,
    stock: 3,
    category: "Braking System",
    image_url: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 103,
    store_id: 1,
    name: "Forged Titanium Exhaust System",
    description: "ระบบท่อไอเสียไทเทเนียมเกรดอากาศยาน น้ำหนักเบากว่าของเดิม 60% เสียงกระหึ่มเร้าใจแบบมอเตอร์สปอร์ต",
    price: 38900.0,
    stock: 8,
    category: "Exhaust",
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 104,
    store_id: 1,
    name: "Full Adjustable Coilover Suspension",
    description: "โช้คอัพสตรัทปรับเกลียว 32 ระดับ ซับแรงกระแทกและควบคุมเสถียรภาพตัวถังได้อย่างเฉียบคมในโค้ง",
    price: 32000.0,
    stock: 12,
    category: "Suspension",
    image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 105,
    store_id: 1,
    name: "Forged Monoblock Wheels 19-inch",
    description: "ล้อแม็กฟอร์จน้ำหนักเบาพิเศษ แข็งแกร่งทนทานรับแรงบิดมหาศาล สไตล์ Racing Concave",
    price: 56000.0,
    stock: 4,
    category: "Wheels",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 106,
    store_id: 1,
    name: "Motorsport ECU Tuning Module",
    description: "กล่องเพิ่มแรงม้าและแรงบิดระดับแข่งขัน ปรับจูนกราฟอัตราเร่งและรอบเครื่องอย่างมีประสิทธิภาพ",
    price: 18500.0,
    stock: 15,
    category: "Electronics",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
];

export async function generateMetadata({
  params,
}: TenantStorePageProps): Promise<Metadata> {
  const subdomain = (params?.subdomain || "").toLowerCase().trim();

  try {
    let stores = await query<StoreRecord[]>(
      "SELECT name, description, tagline FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
      [subdomain]
    );

    if (!stores || stores.length === 0) {
      await ensureDatabaseSeeded();
      stores = await query<StoreRecord[]>(
        "SELECT name, description, tagline FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
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
    // Fallback if db isn't reachable
  }

  // Fallback metadata for known default stores
  const fallbackStore = FALLBACK_STORES[subdomain];
  if (fallbackStore) {
    return {
      title: `${fallbackStore.name} - Official Storefront`,
      description: fallbackStore.description || fallbackStore.tagline || "Powered by 3NFM Commerce",
    };
  }

  return {
    title: `${subdomain} Store - 3NFM Commerce`,
  };
}

export default async function TenantStorePage({ params }: TenantStorePageProps) {
  const subdomain = (params?.subdomain || "").toLowerCase().trim();

  // 1. ดึงข้อมูลร้านค้าจากตาราง stores โดยเทียบ subdomain (LOWER)
  let stores: StoreRecord[] = [];
  try {
    stores = await query<StoreRecord[]>(
      "SELECT * FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
      [subdomain]
    );
  } catch {
    // หากมีข้อผิดพลาด (เช่น ต่อ Cloud DB ไม่ติด หรือยังไม่มีตาราง) ให้ลองรัน Auto-Seed
    try {
      await ensureDatabaseSeeded();
      stores = await query<StoreRecord[]>(
        "SELECT * FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
        [subdomain]
      );
    } catch (retryErr) {
      console.warn(`[Auto-Seed / DB Query Warning] Subdomain: ${subdomain}`, retryErr);
    }
  }

  // หากยังไม่พบร้านค้าใน Database ให้เรียก Auto-Seed ดึงซ้ำอีกครั้ง
  if (!stores || stores.length === 0) {
    try {
      await ensureDatabaseSeeded();
      stores = await query<StoreRecord[]>(
        "SELECT * FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
        [subdomain]
      );
    } catch {}
  }

  // 2. หากยังไม่พบใน Database ให้ตรวจสอบ In-Memory Fallback ทันที (การันตีว่า 3nfm และ apex จะเปิดได้ 100%)
  let store: StoreRecord;
  if (stores && stores.length > 0) {
    store = stores[0];
  } else if (FALLBACK_STORES[subdomain]) {
    store = FALLBACK_STORES[subdomain];
  } else {
    notFound();
  }

  // 3. ดึงรายการสินค้าของร้านค้า
  let products: ProductRecord[] = [];
  try {
    products = await query<ProductRecord[]>(
      "SELECT * FROM products WHERE store_id = ? AND is_available = 1 ORDER BY id DESC",
      [store.id]
    );
  } catch (error) {
    console.warn(`[Products Query Warning] Falling back to default catalog for store: ${subdomain}`, error);
  }

  // หากไม่มีสินค้าใน DB ให้ใช้ In-Memory Fallback ตามร้านค้านั้นๆ
  if (!products || products.length === 0) {
    if (subdomain === "3nfm") {
      products = FALLBACK_PRODUCTS_3NFM;
    } else if (subdomain === "apex") {
      products = FALLBACK_PRODUCTS_APEX;
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
      {/* Navbar ด้านบน พร้อมชื่อร้านและ Cart Icon จาก Lucide */}
      <StoreNavbar storeName={store.name} subdomain={store.subdomain} cartCount={products.length} />

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
