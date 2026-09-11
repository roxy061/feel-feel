import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { redeemVoucher, extractVoucherCode } from "@/lib/truemoney";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

const API_FEE = 0.35; // ค่าธรรมเนียม 0.35 บาทต่อรายการสำเร็จ

export async function POST(req: NextRequest) {
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  // 1. ตรวจสอบ API Key จาก Header x-api-key
  const apiKeyHeader = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");

  if (!apiKeyHeader) {
    return NextResponse.json(
      {
        status: "error",
        code: "UNAUTHORIZED",
        message: "Missing required 'x-api-key' header",
      },
      { status: 401 }
    );
  }

  // ดึงข้อมูล API Key จากฐานข้อมูล
  let keyRecords = await query<any[]>(
    "SELECT id, store_id, key_name, rate_limit, is_active FROM api_keys WHERE api_key = ? LIMIT 1",
    [apiKeyHeader]
  );

  if (!keyRecords || keyRecords.length === 0) {
    await ensureDatabaseSeeded();
    keyRecords = await query<any[]>(
      "SELECT id, store_id, key_name, rate_limit, is_active FROM api_keys WHERE api_key = ? LIMIT 1",
      [apiKeyHeader]
    );
  }

  if (!keyRecords || keyRecords.length === 0 || !keyRecords[0].is_active) {
    return NextResponse.json(
      {
        status: "error",
        code: "INVALID_API_KEY",
        message: "Invalid or inactive API Key",
      },
      { status: 401 }
    );
  }

  const apiKey = keyRecords[0];
  const maxRateLimit = apiKey.rate_limit || 30;

  // 2. ตรวจสอบ Rate Limit (30 req/min)
  const rateCheck = await query<any[]>(
    `SELECT COUNT(*) as request_count 
     FROM api_logs 
     WHERE api_key_id = ? 
       AND created_at >= NOW() - INTERVAL 1 MINUTE`,
    [apiKey.id]
  );

  const requestCount = rateCheck[0]?.request_count || 0;
  if (requestCount >= maxRateLimit) {
    return NextResponse.json(
      {
        status: "error",
        code: "RATE_LIMIT_EXCEEDED",
        message: `Rate limit exceeded. Maximum ${maxRateLimit} requests per minute allowed.`,
      },
      { status: 429 }
    );
  }

  // 3. ตรวจสอบยอดเงินคงเหลือในตาราง wallets (พร้อมสร้างให้อัตโนมัติหากยังไม่มี)
  let walletRecords = await query<any[]>(
    "SELECT id, balance FROM wallets WHERE store_id = ? LIMIT 1",
    [apiKey.store_id]
  );

  if (!walletRecords || walletRecords.length === 0) {
    await query("INSERT INTO wallets (store_id, balance) VALUES (?, 150.00)", [apiKey.store_id]);
    walletRecords = await query<any[]>(
      "SELECT id, balance FROM wallets WHERE store_id = ? LIMIT 1",
      [apiKey.store_id]
    );
  }

  const wallet = walletRecords[0];
  const currentBalance = parseFloat(wallet.balance);

  if (currentBalance < API_FEE) {
    return NextResponse.json(
      {
        status: "error",
        code: "INSUFFICIENT_BALANCE",
        message: `Insufficient wallet balance. Current balance is ${currentBalance.toFixed(2)} THB, required at least ${API_FEE.toFixed(2)} THB.`,
      },
      { status: 402 }
    );
  }

  // 4. รับค่า Body
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      {
        status: "error",
        code: "BAD_REQUEST",
        message: "Invalid JSON request body",
      },
      { status: 400 }
    );
  }

  const voucherUrl = body.voucher_url || body.voucher_hash || body.url;
  const targetPhone = body.phone_number || body.target_phone || body.phone;

  if (!voucherUrl || !targetPhone) {
    return NextResponse.json(
      {
        status: "error",
        code: "MISSING_PARAMETERS",
        message: "Both 'voucher_url' and 'phone_number' are required.",
      },
      { status: 400 }
    );
  }

  // 5. ดำเนินการ Redeem Voucher ผ่าน TrueMoney Service
  const redeemResult = await redeemVoucher(voucherUrl, targetPhone);

  if (!redeemResult.success) {
    // บันทึก Log กรณีล้มเหลว (ไม่หักค่าธรรมเนียม)
    await query(
      `INSERT INTO api_logs 
        (api_key_id, store_id, endpoint, method, ip_address, status_code, cost, response_message) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        apiKey.id,
        apiKey.store_id,
        "/api/v1/angpao/redeem",
        "POST",
        ipAddress,
        400,
        0,
        `Redeem Failed: ${redeemResult.message} (${redeemResult.code})`,
      ]
    );

    return NextResponse.json(
      {
        status: "error",
        code: redeemResult.code || "REDEEM_FAILED",
        message: redeemResult.message,
      },
      { status: 400 }
    );
  }

  // 6. เมื่อ redeemVoucher สำเร็จ:
  // 6.1 หักเงิน 0.35 บาทจาก wallets
  await query(
    "UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE id = ?",
    [API_FEE, wallet.id]
  );

  const remainingBalance = Math.max(0, currentBalance - API_FEE);

  // 6.2 บันทึกประวัติลง wallet_transactions
  await query(
    `INSERT INTO wallet_transactions 
      (wallet_id, amount, type, description, reference_id) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      wallet.id,
      -API_FEE,
      "API_DEDUCTION",
      `TrueMoney Angpao Redeem Fee (${redeemResult.voucherCode})`,
      redeemResult.voucherCode,
    ]
  );

  // 6.3 บันทึก Log ลง api_logs
  await query(
    `INSERT INTO api_logs 
      (api_key_id, store_id, endpoint, method, ip_address, status_code, cost, response_message) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      apiKey.id,
      apiKey.store_id,
      "/api/v1/angpao/redeem",
      "POST",
      ipAddress,
      200,
      API_FEE,
      `Success: ${redeemResult.amount} THB redeemed`,
    ]
  );

  // 6.4 อัปเดตเวลาใช้งานล่าสุดของ API Key
  await query(
    "UPDATE api_keys SET last_used_at = NOW() WHERE id = ?",
    [apiKey.id]
  );

  // 6.5 ส่ง JSON Response กลับตามรูปแบบมาตรฐาน
  return NextResponse.json(
    {
      status: "success",
      code: "SUCCESS",
      message: "Redeemed TrueMoney voucher successfully",
      data: {
        voucher_code: redeemResult.voucherCode,
        amount: redeemResult.amount,
        owner_name: redeemResult.ownerName,
        target_phone: redeemResult.targetPhone,
        redeemed_at: new Date().toISOString(),
      },
      billing: {
        cost: API_FEE,
        currency: "THB",
        remaining_balance: parseFloat(remainingBalance.toFixed(4)),
      },
    },
    { status: 200 }
  );
}
