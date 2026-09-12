import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "dashboard",
  "root",
  "app",
  "dev",
  "onboarding",
  "settings",
  "mail",
  "superadmin",
  "status",
  "auth",
  "login",
  "register",
  "static",
  "media",
  "assets",
  "null",
  "undefined",
  "system",
  "support",
  "billing",
]);

// GET: ดึงรายชื่อร้านค้าทั้งหมดของผู้ใช้ u-001
export async function GET() {
  try {
    const userId = "u-001";

    let stores = await query<any[]>(
      `SELECT id, subdomain, name, description, tagline, decorative_text, 
              video_url, banner_url, truemoney_phone, promptpay_number, 
              expires_at, status, created_at 
       FROM stores 
       WHERE user_id = ? OR id IN (1, 2, 3) 
       ORDER BY id ASC`,
      [userId]
    );

    if (!stores || stores.length === 0) {
      await ensureDatabaseSeeded();
      stores = await query<any[]>(
        `SELECT id, subdomain, name, description, tagline, decorative_text, 
                video_url, banner_url, truemoney_phone, promptpay_number, 
                expires_at, status, created_at 
         FROM stores 
         WHERE user_id = ? OR id IN (1, 2, 3) 
         ORDER BY id ASC`,
        [userId]
      );
    }

    const now = new Date();
    const formattedStores = stores.map((s) => {
      const expiresAt = s.expires_at ? new Date(s.expires_at) : null;
      const isExpired = s.status === "expired" || (expiresAt ? expiresAt < now : false);
      const daysRemaining = expiresAt
        ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        ...s,
        is_expired: isExpired,
        is_active: !isExpired,
        days_remaining: daysRemaining,
      };
    });

    return NextResponse.json({
      success: true,
      stores: formattedStores,
    });
  } catch (error: any) {
    console.error("[Get Merchant Stores Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: สร้างร้านค้าใหม่ (14-day trial + 1 starter product)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลคำขอไม่ถูกต้อง (Invalid JSON)" },
        { status: 400 }
      );
    }

    const {
      name,
      subdomain: rawSubdomain,
      truemoney_phone = "0812345678",
      promptpay_number = "0812345678",
      description = "",
      tagline = "",
    } = body;

    const cleanName = (name || "").trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุชื่อร้านค้าความยาว 2 - 100 ตัวอักษร" },
        { status: 400 }
      );
    }

    const subdomain = (rawSubdomain || "").trim().toLowerCase();
    if (!subdomain || subdomain.length < 3 || subdomain.length > 30) {
      return NextResponse.json(
        { success: false, message: "Subdomain ต้องมีความยาวระหว่าง 3 - 30 ตัวอักษร" },
        { status: 400 }
      );
    }

    const subdomainRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        {
          success: false,
          message: "Subdomain ต้องเป็นตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) ตัวเลข (0-9) หรือขีดกลาง (-)",
        },
        { status: 400 }
      );
    }

    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      return NextResponse.json(
        { success: false, message: `คำว่า '${subdomain}' เป็นคำสงวนของระบบ ไม่สามารถใช้งานได้` },
        { status: 400 }
      );
    }

    // ตรวจสอบความซ้ำในฐานข้อมูล
    let existing: any[] = [];
    try {
      existing = await query<any[]>(
        "SELECT id FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
        [subdomain]
      );
    } catch {
      await ensureDatabaseSeeded();
      existing = await query<any[]>(
        "SELECT id FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
        [subdomain]
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `Subdomain '${subdomain}' ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น` },
        { status: 400 }
      );
    }

    const userId = "u-001";
    const storeKey = `sk_${subdomain}_${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
    const cleanTagline = (tagline || "").trim() || `OFFICIAL STORE OF ${cleanName.toUpperCase()}`;
    const cleanDescription =
      (description || "").trim() ||
      `ยินดีต้อนรับสู่ ${cleanName} ร้านค้าคุณภาพบนแพลตฟอร์ม 3NFM Multi-Tenant SaaS`;
    const decorativeText = cleanName.toUpperCase();
    const videoUrl =
      "https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-through-a-dark-tunnel-43846-large.mp4";
    const bannerUrl =
      "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1920&q=80";

    const insertResult = await query<any>(
      `INSERT INTO stores (
        subdomain,
        user_id,
        store_key,
        name,
        description,
        tagline,
        decorative_text,
        video_url,
        banner_url,
        truemoney_phone,
        promptpay_number,
        expires_at,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 14 DAY), 'active')`,
      [
        subdomain,
        userId,
        storeKey,
        cleanName,
        cleanDescription,
        cleanTagline,
        decorativeText,
        videoUrl,
        bannerUrl,
        (truemoney_phone || "0812345678").trim(),
        (promptpay_number || "0812345678").trim(),
      ]
    );

    const newStoreId = insertResult.insertId;

    // สร้าง wallet เริ่มต้นสำหรับร้านใหม่
    try {
      await query<any>(
        "INSERT INTO wallets (store_id, balance) VALUES (?, 0.0000) ON DUPLICATE KEY UPDATE updated_at = NOW()",
        [newStoreId]
      );
    } catch (wErr) {
      console.warn("[Wallet Seed Warning]:", wErr);
    }

    // สร้างสินค้าตัวอย่างเริ่มต้น 1 ชิ้นในร้านใหม่ เพื่อให้หน้าร้านใช้งานได้ทันที
    try {
      await query<any>(
        `INSERT INTO products (store_id, name, description, price, stock, category, is_available, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newStoreId,
          `${cleanName} Dry-Carbon Aero Canard Kit`,
          "ชุดคานาร์ดคาร์บอนไฟเบอร์เกรดแห้ง Dry Carbon เพิ่ม Downforce ด้านหน้าและเสถียรภาพการเข้าโค้งความเร็วสูง",
          6900.0,
          10,
          "Aero & Carbon",
          1,
          "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80",
        ]
      );
    } catch (pErr) {
      console.warn("[Product Seed Warning]:", pErr);
    }

    // ดึงข้อมูลร้านค้าที่เพิ่งสร้าง
    const newStores = await query<any[]>(
      "SELECT id, subdomain, name, description, tagline, decorative_text, truemoney_phone, promptpay_number, expires_at, status FROM stores WHERE id = ? LIMIT 1",
      [newStoreId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "สร้างร้านค้าใหม่สำเร็จ พร้อมเริ่มสิทธิ์ทดลองใช้ฟรี 14 วัน",
        store: {
          ...newStores[0],
          is_active: true,
          is_expired: false,
          days_remaining: 14,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Create Merchant Store Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
