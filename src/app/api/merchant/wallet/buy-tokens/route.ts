import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const TOKEN_PACKAGES: Record<string, { tokens: number; cost: number; name: string }> = {
  pkg_1: { tokens: 1, cost: 50.0, name: "Starter: 1 Token" },
  pkg_5: { tokens: 5, cost: 225.0, name: "Pro: 5 Tokens (ลด 10%)" },
  pkg_10: { tokens: 10, cost: 400.0, name: "Business: 10 Tokens (ลด 20%)" },
  pkg_25: { tokens: 25, cost: 900.0, name: "Enterprise: 25 Tokens (ลด 28%)" },
};

export async function POST(req: NextRequest) {
  try {
    const storeId = 1;
    const userId = "u-001";
    const body = await req.json().catch(() => null);

    if (!body || !body.package_id) {
      return NextResponse.json(
        { success: false, message: "กรุณาเลือกแพ็กเกจโทเคนที่ต้องการซื้อ" },
        { status: 400 }
      );
    }

    const pkg = TOKEN_PACKAGES[body.package_id];
    if (!pkg) {
      return NextResponse.json(
        { success: false, message: "แพ็กเกจโทเคนไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // 1. ตรวจสอบยอดเงินคงเหลือใน Wallet
    const wallets = await query<any[]>(
      "SELECT id, balance FROM wallets WHERE store_id = ? LIMIT 1",
      [storeId]
    );

    if (!wallets || wallets.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบกระเป๋าเงิน" }, { status: 404 });
    }

    const wallet = wallets[0];
    const currentBalance = parseFloat(wallet.balance);

    if (currentBalance < pkg.cost) {
      return NextResponse.json(
        {
          success: false,
          message: `ยอดเงินในกระเป๋าไม่เพียงพอ (ต้องการ ${pkg.cost.toFixed(2)} บาท, คงเหลือ ${currentBalance.toFixed(2)} บาท) กรุณาเติมเงินก่อนทำรายการ`,
        },
        { status: 400 }
      );
    }

    // 2. หักเงินใน Wallet
    await query(
      "UPDATE wallets SET balance = balance - ?, updated_at = NOW() WHERE id = ?",
      [pkg.cost, wallet.id]
    );

    // 3. เพิ่มโทเคนให้ User
    await query(
      "UPDATE users SET tokens = tokens + ? WHERE id = ?",
      [pkg.tokens, userId]
    );

    // 4. บันทึกประวัติใน wallet_transactions
    const refId = `TOK-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await query(
      `INSERT INTO wallet_transactions 
        (wallet_id, amount, type, description, status, reference_id) 
       VALUES (?, ?, 'TOKEN_PURCHASE', ?, 'completed', ?)`,
      [
        wallet.id,
        -pkg.cost,
        `ซื้อโทเคนแพ็กเกจ: ${pkg.name} (+${pkg.tokens} Tokens)`,
        refId,
      ]
    );

    // 5. ดึงค่าล่าสุดตอบกลับ
    const updatedUsers = await query<any[]>(
      "SELECT tokens FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    const newBalance = currentBalance - pkg.cost;
    const newTokens = updatedUsers[0]?.tokens || 0;

    return NextResponse.json({
      success: true,
      message: `ซื้อโทเคนสำเร็จ! ได้รับ +${pkg.tokens} โทเคน เรียบร้อยแล้ว`,
      data: {
        tokens_added: pkg.tokens,
        cost: pkg.cost,
        new_balance: newBalance,
        total_tokens: newTokens,
        reference_id: refId,
      },
    });
  } catch (error: any) {
    console.error("[Buy Tokens Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to purchase tokens" },
      { status: 500 }
    );
  }
}
