import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

// GET: ดึงข้อมูลรายละเอียดร้านค้าและรายชื่อร้านค้าทั้งหมดของเจ้าของร้าน
export async function GET(req: NextRequest) {
  try {
    const userId = "u-001";
    const { searchParams } = new URL(req.url);
    const storeIdParam = searchParams.get("store_id");

    let allStores = await query<any[]>(
      "SELECT id, subdomain, name, description, tagline, decorative_text, video_url, banner_url, truemoney_phone, promptpay_number, expires_at, status, created_at FROM stores WHERE user_id = ? OR id IN (1, 2, 3) ORDER BY id ASC",
      [userId]
    );

    if (!allStores || allStores.length === 0) {
      await ensureDatabaseSeeded();
      allStores = await query<any[]>(
        "SELECT id, subdomain, name, description, tagline, decorative_text, video_url, banner_url, truemoney_phone, promptpay_number, expires_at, status, created_at FROM stores WHERE user_id = ? OR id IN (1, 2, 3) ORDER BY id ASC",
        [userId]
      );
    }

    if (!allStores || allStores.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบร้านค้าในระบบ" },
        { status: 404 }
      );
    }

    // เลือกร้านค้าตาม query param หรือร้านแรก
    const selectedStore = storeIdParam
      ? allStores.find((s) => String(s.id) === String(storeIdParam)) || allStores[0]
      : allStores[0];

    const now = new Date();
    const expiresAt = selectedStore.expires_at ? new Date(selectedStore.expires_at) : null;
    const isExpired = selectedStore.status === "expired" || (expiresAt ? expiresAt < now : false);
    const daysRemaining = expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return NextResponse.json({
      success: true,
      store: {
        ...selectedStore,
        is_expired: isExpired,
        days_remaining: daysRemaining,
      },
      all_stores: allStores.map((s) => ({
        id: s.id,
        name: s.name,
        subdomain: s.subdomain,
        status: s.status || "active",
        expires_at: s.expires_at,
      })),
    });
  } catch (error: any) {
    console.error("[Get Merchant Store Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: อัปเดตข้อมูลการตั้งค่าร้านค้า
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.store_id) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ store_id ของร้านค้าที่ต้องการอัปเดต" },
        { status: 400 }
      );
    }

    const {
      store_id,
      name,
      tagline,
      description,
      decorative_text,
      truemoney_phone,
      promptpay_number,
      video_url,
      banner_url,
    } = body;

    // ตรวจสอบว่าร้านนี้มีอยู่จริง
    const existing = await query<any[]>(
      "SELECT id, subdomain FROM stores WHERE id = ? LIMIT 1",
      [store_id]
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบร้านค้าที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    const cleanName = (name || "").trim();
    if (!cleanName) {
      return NextResponse.json(
        { success: false, message: "ชื่อร้านค้าต้องไม่ว่างเปล่า" },
        { status: 400 }
      );
    }

    await query<any>(
      `UPDATE stores SET
        name = ?,
        tagline = ?,
        description = ?,
        decorative_text = ?,
        truemoney_phone = ?,
        promptpay_number = ?,
        video_url = ?,
        banner_url = ?
       WHERE id = ?`,
      [
        cleanName,
        (tagline || "").trim(),
        (description || "").trim(),
        (decorative_text || cleanName.toUpperCase()).trim(),
        (truemoney_phone || "").trim(),
        (promptpay_number || "").trim(),
        video_url || null,
        banner_url || null,
        store_id,
      ]
    );

    // ดึงข้อมูลที่อัปเดตแล้วกลับไป
    const updated = await query<any[]>(
      "SELECT id, subdomain, name, description, tagline, decorative_text, video_url, banner_url, truemoney_phone, promptpay_number, expires_at, status FROM stores WHERE id = ? LIMIT 1",
      [store_id]
    );

    return NextResponse.json({
      success: true,
      message: "อัปเดตการตั้งค่าร้านค้าเรียบร้อยแล้ว",
      store: updated[0],
    });
  } catch (error: any) {
    console.error("[Update Merchant Store Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
