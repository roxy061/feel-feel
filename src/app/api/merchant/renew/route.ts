import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const userId = "u-001";

    // 1. ตรวจสอบโทเคนคงเหลือของ User
    const users = await query<any[]>(
      "SELECT id, tokens FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลผู้ใช้งาน" },
        { status: 404 }
      );
    }

    const user = users[0];
    const currentTokens = user.tokens || 0;

    if (currentTokens < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "จำนวนโทเคนไม่เพียงพอสำหรับการต่ออายุร้านค้า (ต้องการอย่างน้อย 1 โทเคน)",
        },
        { status: 400 }
      );
    }

    // 2. ดึงร้านค้าของ User
    const stores = await query<any[]>(
      "SELECT id, expires_at FROM stores WHERE user_id = ? OR id = 1 LIMIT 1",
      [userId]
    );

    if (!stores || stores.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบร้านค้าที่ต้องการต่ออายุ" },
        { status: 404 }
      );
    }

    const store = stores[0];

    // 3. หัก 1 โทเคนจากตาราง users
    await query(
      "UPDATE users SET tokens = tokens - 1 WHERE id = ?",
      [userId]
    );

    // 4. บวกเวลา expires_at เพิ่ม 30 วันในตาราง stores
    // หากยังไม่หมดอายุ ให้บวกต่อจาก expires_at เดิม หากหมดอายุแล้วให้เริ่มนับจากวันนี้
    await query(
      `UPDATE stores 
       SET expires_at = IF(expires_at > NOW(), DATE_ADD(expires_at, INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY))
       WHERE id = ?`,
      [store.id]
    );

    // 5. ดึงข้อมูลใหม่เพื่อตอบกลับ
    const updatedStore = await query<any[]>(
      "SELECT expires_at FROM stores WHERE id = ? LIMIT 1",
      [store.id]
    );

    const newExpiresAt = new Date(updatedStore[0].expires_at);
    const newTokens = currentTokens - 1;

    return NextResponse.json({
      success: true,
      message: "ต่ออายุร้านค้าสำเร็จ (+30 วัน)",
      data: {
        tokens: newTokens,
        expires_at: newExpiresAt.toISOString(),
        status: "Active",
      },
    });
  } catch (error: any) {
    console.error("[Store Renew Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
