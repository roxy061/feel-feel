import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded, seedStarterMotorsportProducts } from "@/lib/auto-seed";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลคำขอไม่ถูกต้อง (Invalid JSON body)" },
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
      user_id = "u-001",
    } = body;

    // 1. ตรวจสอบชื่อร้าน
    const cleanName = (name || "").trim();
    if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุชื่อร้านค้าความยาว 2 - 100 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // 2. ตรวจสอบ Subdomain
    const subdomain = (rawSubdomain || "").trim().toLowerCase();
    if (!subdomain) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ Subdomain ของร้านค้า" },
        { status: 400 }
      );
    }

    if (subdomain.length < 3 || subdomain.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Subdomain ต้องมีความยาวระหว่าง 3 - 30 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    const subdomainRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Subdomain ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) ตัวเลข (0-9) หรือขีดกลาง (-) และห้ามขึ้นต้น/ลงท้ายด้วยขีด",
        },
        { status: 400 }
      );
    }

    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      return NextResponse.json(
        {
          success: false,
          message: `คำว่า '${subdomain}' เป็นคำสงวนของระบบ ไม่สามารถนำมาตั้งเป็นชื่อร้านค้าได้`,
        },
        { status: 400 }
      );
    }

    // 3. ตรวจสอบความซ้ำของ Subdomain ในฐานข้อมูล
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
        {
          success: false,
          message: `Subdomain '${subdomain}' ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น`,
        },
        { status: 400 }
      );
    }

    // 4. บันทึกร้านใหม่พร้อม Trial 14 วัน (status = 'active', expires_at = NOW() + 14 days)
    const storeKey = `sk_${subdomain}_${Math.random().toString(36).substring(2, 8)}${Date.now().toString(36)}`;
    const cleanTagline =
      (tagline || "").trim() || `OFFICIAL STORE OF ${cleanName.toUpperCase()}`;
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
        user_id || "u-001",
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

    // 5. สร้างกระเป๋าเงิน (wallets) สำหรับร้านใหม่
    try {
      await query<any>(
        "INSERT INTO wallets (store_id, balance) VALUES (?, 0.0000) ON DUPLICATE KEY UPDATE updated_at = NOW()",
        [newStoreId]
      );
    } catch (walletErr) {
      console.warn("[Wallet Seed Warning]:", walletErr);
    }

    // 6. รันโมดูล auto-seed สร้างสินค้าตัวอย่างเริ่มต้นเกรดมอเตอร์สปอร์ตให้ร้านใหม่ทันที
    try {
      await seedStarterMotorsportProducts(newStoreId, cleanName);
    } catch (prodErr) {
      console.warn("[Starter Products Seed Warning]:", prodErr);
    }

    // ดึงข้อมูลวันหมดอายุที่บันทึกลงไป
    const storeRecord = await query<any[]>(
      "SELECT id, subdomain, name, expires_at, status FROM stores WHERE id = ? LIMIT 1",
      [newStoreId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "เปิดร้านค้าใหม่สำเร็จ พร้อมเริ่มใช้งานสิทธิ์ Free Trial 14 วัน",
        data: {
          store_id: newStoreId,
          subdomain,
          name: cleanName,
          store_url: `/${subdomain}`,
          expires_at: storeRecord[0]?.expires_at || null,
          status: storeRecord[0]?.status || "active",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[Store Registration Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "เกิดข้อผิดพลาดในการลงทะเบียนร้านค้าใหม่",
      },
      { status: 500 }
    );
  }
}
