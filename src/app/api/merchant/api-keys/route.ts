import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET: ดึงรายการ API Keys และ API Logs ล่าสุด
export async function GET(req: NextRequest) {
  try {
    const storeId = 1;

    // 1. ดึงรายการ API Keys ทั้งหมด
    const keys = await query<any[]>(
      `SELECT id, store_id, key_name, api_key, rate_limit, is_active, created_at, last_used_at 
       FROM api_keys 
       WHERE store_id = ? 
       ORDER BY id DESC`,
      [storeId]
    );

    // 2. ดึงประวัติการเรียกใช้งาน (API Logs) ล่าสุด 50 รายการ
    const logs = await query<any[]>(
      `SELECT id, api_key_id, endpoint, method, ip_address, status_code, cost, response_message, created_at 
       FROM api_logs 
       WHERE store_id = ? 
       ORDER BY id DESC 
       LIMIT 50`,
      [storeId]
    );

    return NextResponse.json({
      success: true,
      keys,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch API keys and logs" },
      { status: 500 }
    );
  }
}

// POST: สร้าง API Key ใหม่แบบสุ่ม 64 ตัวอักษร
export async function POST(req: NextRequest) {
  try {
    const storeId = 1;
    const body = await req.json().catch(() => ({}));
    const keyName = body.key_name?.trim() || "Production API Key";

    // สุ่มคีย์ความยาว 64 ตัวอักษร (Prefix 'sk_live_' ตามด้วย random hex)
    const randomBytes = crypto.randomBytes(28).toString("hex"); // 56 hex chars
    const newApiKey = `sk_live_${randomBytes}`; // รวมเป็น 64 chars

    const result = await query<any>(
      `INSERT INTO api_keys (store_id, key_name, api_key, rate_limit, is_active) 
       VALUES (?, ?, ?, 30, 1)`,
      [storeId, keyName, newApiKey]
    );

    return NextResponse.json(
      {
        success: true,
        message: "สร้าง API Key ใหม่เรียบร้อยแล้ว",
        key: {
          id: result.insertId,
          key_name: keyName,
          api_key: newApiKey,
          rate_limit: 30,
          is_active: 1,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to generate API Key" },
      { status: 500 }
    );
  }
}
