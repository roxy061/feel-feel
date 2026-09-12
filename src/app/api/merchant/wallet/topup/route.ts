import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const storeId = body?.store_id ? parseInt(body.store_id, 10) || 1 : 1;

    if (!body || !body.amount) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุจำนวนเงินที่ต้องการเติม" },
        { status: 400 }
      );
    }

    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "จำนวนเงินต้องมากกว่า 0 บาท" },
        { status: 400 }
      );
    }

    let slipUrl: string | null = null;
    if (body.slip_image && typeof body.slip_image === "string") {
      slipUrl = body.slip_image.startsWith("data:image/")
        ? body.slip_image
        : `data:image/jpeg;base64,${body.slip_image}`;
    }

    // 1. ดึง Wallet ID ของร้านค้า (พร้อม Auto-Seed หากยังไม่มี)
    let wallets = await query<any[]>(
      "SELECT id, balance FROM wallets WHERE store_id = ? LIMIT 1",
      [storeId]
    );

    if (!wallets || wallets.length === 0) {
      await ensureDatabaseSeeded();
      wallets = await query<any[]>(
        "SELECT id, balance FROM wallets WHERE store_id = ? LIMIT 1",
        [storeId]
      );
    }

    if (!wallets || wallets.length === 0) {
      await query("INSERT INTO wallets (store_id, balance) VALUES (?, 150.00)", [storeId]);
      wallets = [{ id: 1, balance: "150.0000" }];
    }

    const walletId = wallets[0].id;
    const refId = `TOPUP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 2. ปรับปรุงยอดเงินคงเหลือใน wallets ทันทีสำหรับการทดสอบและใช้งานแบบสมบูรณ์
    await query(
      "UPDATE wallets SET balance = balance + ?, updated_at = NOW() WHERE id = ?",
      [amount, walletId]
    );

    // 3. บันทึกคำขอเติมเงินลง wallet_transactions
    await query(
      `INSERT INTO wallet_transactions 
        (wallet_id, amount, type, description, status, slip_url, reference_id) 
       VALUES (?, ?, 'TOPUP', ?, 'completed', ?, ?)`,
      [
        walletId,
        amount,
        `เติมเงินเข้ากระเป๋าเงิน (PromptPay QR)`,
        slipUrl,
        refId,
      ]
    );

    const updatedWallets = await query<any[]>(
      "SELECT balance FROM wallets WHERE id = ? LIMIT 1",
      [walletId]
    );

    const newBalance = parseFloat(updatedWallets[0]?.balance || "0");

    return NextResponse.json({
      success: true,
      message: `เติมเงินเข้ากระเป๋าสำเร็จ! ยอดเงินคงเหลือใหม่: ${newBalance.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`,
      data: {
        reference_id: refId,
        amount,
        status: "completed",
        slip_url: slipUrl,
        new_balance: newBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to submit topup" },
      { status: 500 }
    );
  }
}
