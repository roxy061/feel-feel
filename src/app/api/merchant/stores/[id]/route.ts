import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET: ดึงข้อมูลร้านค้าตาม ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const storeId = params.id;

    let stores = await query<any[]>(
      `SELECT id, subdomain, name, description, tagline, decorative_text, 
              video_url, banner_url, truemoney_phone, promptpay_number, 
              expires_at, status, created_at 
       FROM stores 
       WHERE id = ? LIMIT 1`,
      [storeId]
    );

    if (!stores || stores.length === 0) {
      await ensureDatabaseSeeded();
      stores = await query<any[]>(
        `SELECT id, subdomain, name, description, tagline, decorative_text, 
                video_url, banner_url, truemoney_phone, promptpay_number, 
                expires_at, status, created_at 
         FROM stores 
         WHERE id = ? LIMIT 1`,
        [storeId]
      );
    }

    if (!stores || stores.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลร้านค้า" },
        { status: 404 }
      );
    }

    const s = stores[0];
    const now = new Date();
    const expiresAt = s.expires_at ? new Date(s.expires_at) : null;
    const isExpired = s.status === "expired" || (expiresAt ? expiresAt < now : false);
    const daysRemaining = expiresAt
      ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return NextResponse.json({
      success: true,
      store: {
        ...s,
        is_expired: isExpired,
        is_active: !isExpired,
        days_remaining: daysRemaining,
      },
    });
  } catch (error: any) {
    console.error("[Get Single Merchant Store Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: อัปเดตข้อมูลร้านค้าตาม ID
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const storeId = params.id;
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลคำขอไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const {
      name,
      tagline,
      description,
      decorative_text,
      truemoney_phone,
      promptpay_number,
      video_url,
      banner_url,
    } = body;

    const existing = await query<any[]>(
      "SELECT id, subdomain FROM stores WHERE id = ? LIMIT 1",
      [storeId]
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
        storeId,
      ]
    );

    const updated = await query<any[]>(
      `SELECT id, subdomain, name, description, tagline, decorative_text, 
              video_url, banner_url, truemoney_phone, promptpay_number, 
              expires_at, status 
       FROM stores 
       WHERE id = ? LIMIT 1`,
      [storeId]
    );

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลร้านค้าเรียบร้อยแล้ว",
      store: updated[0],
    });
  } catch (error: any) {
    console.error("[Update Single Merchant Store Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
