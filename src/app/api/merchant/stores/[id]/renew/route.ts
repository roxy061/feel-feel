import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const userId = "u-001";
    const rawStoreId = params?.id;
    const storeId = parseInt(rawStoreId, 10);

    if (isNaN(storeId) || storeId <= 0) {
      return NextResponse.json(
        { success: false, message: "รหัสร้านค้าไม่ถูกต้อง (Invalid store ID)" },
        { status: 400 }
      );
    }

    // 1. ตรวจสอบโทเคนคงเหลือของผู้ใช้ในตาราง users
    let users = await query<any[]>(
      "SELECT id, name, tokens FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (!users || users.length === 0) {
      await ensureDatabaseSeeded();
      users = await query<any[]>(
        "SELECT id, name, tokens FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบข้อมูลบัญชีผู้ใช้งานในระบบ" },
        { status: 404 }
      );
    }

    const user = users[0];
    const currentTokens = typeof user.tokens === "number" ? user.tokens : 0;

    if (currentTokens < 1) {
      return NextResponse.json(
        {
          success: false,
          message: "จำนวนโทเคนไม่เพียงพอสำหรับการต่ออายุร้านค้า (ต้องการอย่างน้อย 1 โทเคน)",
        },
        { status: 400 }
      );
    }

    // 2. ตรวจสอบร้านค้าที่ต้องการต่ออายุ
    const stores = await query<any[]>(
      "SELECT id, name, subdomain, expires_at, status FROM stores WHERE id = ? LIMIT 1",
      [storeId]
    );

    if (!stores || stores.length === 0) {
      return NextResponse.json(
        { success: false, message: `ไม่พบข้อมูลร้านค้ารหัส #${storeId} ในระบบ` },
        { status: 404 }
      );
    }

    const store = stores[0];

    // 3. หักลบ 1 โทเคนจากบัญชีกองกลางในตาราง users
    await query(
      "UPDATE users SET tokens = tokens - 1 WHERE id = ?",
      [userId]
    );

    // 4. คำนวณวันหมดอายุใหม่: หากร้านยังไม่หมดอายุบวกเพิ่ม 30 วันจากเดิม, หากหมดอายุแล้วบวกเพิ่ม 30 วันนับจาก NOW()
    await query(
      `UPDATE stores 
       SET expires_at = IF(expires_at IS NOT NULL AND expires_at > NOW(), 
                           DATE_ADD(expires_at, INTERVAL 30 DAY), 
                           DATE_ADD(NOW(), INTERVAL 30 DAY)),
           status = 'active'
       WHERE id = ?`,
      [storeId]
    );

    // 5. บันทึกประวัติการใช้โทเคนลงใน wallet_transactions
    try {
      let wallets = await query<any[]>(
        "SELECT id FROM wallets WHERE store_id = ? LIMIT 1",
        [storeId]
      );

      let walletId: number;
      if (!wallets || wallets.length === 0) {
        const insWallet = await query<any>(
          "INSERT INTO wallets (store_id, balance) VALUES (?, 0.0000)",
          [storeId]
        );
        walletId = insWallet.insertId;
      } else {
        walletId = wallets[0].id;
      }

      const referenceId = `RENEW-${Date.now()}-${storeId}`;
      await query(
        `INSERT INTO wallet_transactions (
          wallet_id, amount, type, description, reference_id, status
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          walletId,
          1.0,
          "token_deduction",
          `ต่ออายุร้านค้า ${store.name} (+30 วัน) หัก 1 โทเคน`,
          referenceId,
          "completed",
        ]
      );
    } catch (txErr) {
      console.warn("[Wallet Transaction Log Warning]:", txErr);
    }

    // 6. ดึงข้อมูลวันหมดอายุและโทเคนล่าสุดเพื่อส่งกลับ
    const updatedStore = await query<any[]>(
      "SELECT id, name, subdomain, expires_at, status FROM stores WHERE id = ? LIMIT 1",
      [storeId]
    );
    const updatedUser = await query<any[]>(
      "SELECT tokens FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const newExpiresAt = updatedStore[0]?.expires_at
      ? new Date(updatedStore[0].expires_at).toISOString()
      : null;
    const remainingTokens = updatedUser[0]?.tokens ?? (currentTokens - 1);

    return NextResponse.json({
      success: true,
      message: `ต่ออายุร้านค้า ${store.name} สำเร็จ (+30 วัน) หัก 1 โทเคนเรียบร้อยแล้ว`,
      data: {
        store_id: store.id,
        name: store.name,
        subdomain: store.subdomain,
        tokens: remainingTokens,
        expires_at: newExpiresAt,
        status: updatedStore[0]?.status || "active",
      },
    });
  } catch (error: any) {
    console.error("[Store Renew API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "เกิดข้อผิดพลาดในการต่ออายุร้านค้า",
      },
      { status: 500 }
    );
  }
}
