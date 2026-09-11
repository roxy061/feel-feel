import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const storeId = 1;
    const userId = "u-001";

    // 1. ดึงข้อมูลกระเป๋าเงิน (Wallet)
    let wallets = await query<any[]>(
      "SELECT id, balance, updated_at FROM wallets WHERE store_id = ? LIMIT 1",
      [storeId]
    );

    if (!wallets || wallets.length === 0) {
      await query("INSERT INTO wallets (store_id, balance) VALUES (?, 100.00)", [storeId]);
      wallets = [{ id: 1, balance: "100.0000" }];
    }

    const wallet = wallets[0];

    // 2. ดึงข้อมูลโทเคนของผู้ใช้ (User Tokens)
    const users = await query<any[]>(
      "SELECT tokens FROM users WHERE id = ? LIMIT 1",
      [userId]
    );
    const tokens = users[0]?.tokens || 0;

    // 3. ดึงประวัติธุรกรรมกระเป๋าเงิน (Wallet Transactions)
    const transactions = await query<any[]>(
      `SELECT id, amount, type, description, status, slip_url, reference_id, created_at 
       FROM wallet_transactions 
       WHERE wallet_id = ? 
       ORDER BY id DESC 
       LIMIT 30`,
      [wallet.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        wallet_id: wallet.id,
        balance: parseFloat(wallet.balance),
        tokens: tokens,
        transactions,
      },
    });
  } catch (error: any) {
    console.error("[Wallet API Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load wallet data" },
      { status: 500 }
    );
  }
}
