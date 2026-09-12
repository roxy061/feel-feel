import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // กระเป๋าเงิน (Wallet) และโทเคน (Tokens) เป็นกองกลางของบัญชีผู้ใช้ (u-001)
    const userId = "u-001";
    const masterStoreId = 1; // บัญชีกระเป๋าเงินหลักของ User

    // 1. ดึงข้อมูลกระเป๋าเงิน (Wallet) พร้อม Auto-Seed หากยังไม่มี
    let wallets: any[] = [];
    try {
      wallets = await query<any[]>(
        "SELECT id, balance, updated_at FROM wallets WHERE store_id = ? LIMIT 1",
        [masterStoreId]
      );
    } catch {
      await ensureDatabaseSeeded();
      wallets = await query<any[]>(
        "SELECT id, balance, updated_at FROM wallets WHERE store_id = ? LIMIT 1",
        [masterStoreId]
      );
    }

    if (!wallets || wallets.length === 0) {
      await ensureDatabaseSeeded();
      wallets = await query<any[]>(
        "SELECT id, balance, updated_at FROM wallets WHERE store_id = ? LIMIT 1",
        [masterStoreId]
      );
    }

    if (!wallets || wallets.length === 0) {
      await query("INSERT INTO wallets (store_id, balance) VALUES (?, 150.00)", [masterStoreId]);
      wallets = [{ id: 1, balance: "150.0000" }];
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
