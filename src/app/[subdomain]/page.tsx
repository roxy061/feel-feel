import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, AlertTriangle, LayoutDashboard, ArrowRight } from "lucide-react";
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
  expires_at?: string | Date | null;
  status?: string | null;
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
    name: "Titanium Exhaust Downpipe",
    description: "ท่อระบายไอเสียไทเทเนียมเกรดอากาศยาน น้ำหนักเบาพิเศษ เพิ่มอัตราการไหลเวียนไอเสีย Flow สูงสุด 38% ทนความร้อนสูง",
    price: 38500.0,
    stock: 6,
    category: "Exhaust & Intake",
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 302,
    store_id: 3,
    name: "Digital Telemetry Lap Timer",
    description: "จอแสดงผลข้อมูลการขับขี่และจับเวลารอบสนามแบบเรียลไทม์ พร้อมเซนเซอร์ GPS 10Hz และการเชื่อมต่อ CAN-Bus แม่นยำสูง",
    price: 21900.0,
    stock: 10,
    category: "Electronics & Telemetry",
    image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 303,
    store_id: 3,
    name: "High-Flow Air Intake Box",
    description: "ชุดกรองอากาศคาร์บอนไฟเบอร์เกรดแห้งแบบ Dry Carbon เพิ่มปริมาณอากาศเข้าสู่ห้องเผาไหม้และกักเก็บความเย็น",
    price: 28000.0,
    stock: 8,
    category: "Exhaust & Intake",
    image_url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 304,
    store_id: 3,
    name: "Quickshifter Controller Unit",
    description: "กล่องตัดรอบไฟเปลี่ยนเกียร์สมูทไม่ต้องยกคันเร่ง ความเร็วตัดไฟ 0.04 วินาที ยกระดับความเร็วอัตราเร่งทางตรง",
    price: 16500.0,
    stock: 12,
    category: "Electronics & Telemetry",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 305,
    store_id: 3,
    name: "3NFM Stage-3 Carbon Intake Plenum",
    description: "ท่อร่วมไอดีคาร์บอนไฟเบอร์เกรดแห้งแบบ Dry Carbon เพิ่มปริมาตรการไหลเวียนของไอดี 45% ทนความร้อนสูง",
    price: 36500.0,
    stock: 4,
    category: "Exhaust & Intake",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 306,
    store_id: 3,
    name: "Ceramic-Carbon Monoblock Brake Rotor 380mm",
    description: "จานเบรกเซรามิกคาร์บอนน้ำหนักเบาพิเศษ ทนอุณหภูมิสนามแข่งได้ถึง 1,000°C โดยไม่มีอาการเบรกเฟด",
    price: 58000.0,
    stock: 3,
    category: "Braking System",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
];

const FALLBACK_PRODUCTS_APEX: ProductRecord[] = [
  {
    id: 101,
    store_id: 1,
    name: "Carbon Fiber Aero GT Wing",
    description: "สปอยเลอร์คาร์บอนไฟเบอร์แท้ 100% เพิ่มแรงกดท้าย Downforce 45 กก. ที่ความเร็ว 200 กม./ชม. พร้อมขายึดไทเทเนียม CNC น้ำหนักเบาพิเศษ",
    price: 34900.0,
    stock: 5,
    category: "Aero & Carbon",
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 102,
    store_id: 1,
    name: "Forged Monoblock 6-Pot Calipers",
    description: "ชุดคาลิปเปอร์เบรกโมโนบล็อกอะลูมิเนียมฟอร์จ 6 ลูกสูบ พร้อมจานขยายเซาะร่อง 390mm ทนความร้อนสูง 800°C ตอบสนองระยะเบรกแม่นยำฉับไว",
    price: 54000.0,
    stock: 4,
    category: "Braking System",
    image_url: "https://images.unsplash.com/photo-1600705722908-bab1e61c0b4d?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 103,
    store_id: 1,
    name: "ECU Stage 2 Remap Tuning File",
    description: "ซอฟต์แวร์ปรับจูนแมพน้ำมันและไฟจุดระเบิด ปลดล็อคแรงม้าเพิ่มขึ้น +65 HP และแรงบิด +90 Nm สำหรับเชื้อเพลิง 95/E20",
    price: 19500.0,
    stock: 99,
    category: "Engine & Tuning",
    image_url: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 104,
    store_id: 1,
    name: "Titanium Valvetronic Cat-Back Exhaust",
    description: "ระบบท่อไอเสียไทเทเนียมเกรดอากาศยานทั้งเส้นพร้อมวาล์วไฟฟ้าเปิด-ปิดเสียง ควบคุมด้วยรีโมทไร้สายและแอปพลิเคชัน",
    price: 46000.0,
    stock: 6,
    category: "Exhaust & Intake",
    image_url: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 105,
    store_id: 1,
    name: "Competition 2-Way Coilover Suspension",
    description: "โช้คอัพสตรัทปรับเกลียว 2-Way ปรับ Rebound และ Compression แยกอิสระ 32 ระดับ ซับแรงกระแทกและควบคุมเสถียรภาพตัวถังในโค้ง",
    price: 44500.0,
    stock: 8,
    category: "Aero & Carbon",
    image_url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
    is_available: 1,
  },
  {
    id: 106,
    store_id: 1,
    name: "Forged Racing Monoblock Wheels 19-inch",
    description: "ล้อแม็กฟอร์จน้ำหนักเบาพิเศษ แข็งแกร่งทนทานรับแรงบิดมหาศาล สไตล์ Racing Concave Spec",
    price: 56000.0,
    stock: 4,
    category: "Aero & Carbon",
    image_url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
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

  // ตรวจสอบสถานะการหมดอายุของร้านค้า (Store Subscription / Trial Expiration)
  const now = new Date();
  const isExpired =
    store.status === "expired" ||
    (store.expires_at ? new Date(store.expires_at) < now : false);

  if (isExpired) {
    return (
      <div className="min-h-[100dvh] bg-[#010101] text-[#EEEFF2] flex flex-col justify-between selection:bg-[#272835] selection:text-[#EEEFF2]">
        <StoreNavbar storeName={store.name} subdomain={store.subdomain} cartCount={0} />

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
          <div className="p-8 sm:p-12 rounded-xl bg-[#090A0F] border border-amber-500/30 w-full shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6 text-amber-400">
              <Clock className="w-8 h-8" />
            </div>

            <div className="font-mono text-xs text-amber-400 tracking-wider uppercase mb-2">
              STORE SUBSCRIPTION NOTICE &bull; TRIAL PERIOD EXPIRED
            </div>

            <h1 className="font-bebas text-4xl sm:text-5xl tracking-wide text-[#EEEFF2] mb-3">
              ร้านค้านี้หมดอายุการใช้งานชั่วคราว
            </h1>

            <p className="font-sans text-sm sm:text-base text-[#EEEFF2]/75 max-w-xl mx-auto leading-relaxed mb-8">
              ร้านค้า <span className="text-white font-semibold">{store.name}</span> ได้สิ้นสุดระยะเวลาทดลองใช้งานหรือรอบบิลปัจจุบันแล้ว หากคุณเป็นเจ้าของร้านค้า กรุณาเข้าสู่ Merchant Dashboard เพื่อต่ออายุการใช้งานด้วยโทเคน
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#EEEFF2] text-[#010101] hover:bg-[#EEEFF2]/90 font-semibold text-xs transition-all shadow-xl active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>เข้าสู่ Merchant Dashboard เพื่อต่ออายุ</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#272835] hover:bg-[#343647] border border-[#EEEFF2]/15 text-xs font-semibold text-[#EEEFF2] transition-all"
              >
                <span>กลับสู่หน้าแรก 3NFM</span>
              </Link>
            </div>
          </div>
        </main>

        <StoreFooter storeName={store.name} subdomain={store.subdomain} />
      </div>
    );
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
