import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const storeId = 1;
    const body = await req.json().catch(() => null);

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

    // 1. ดึง Wallet ID ของร้านค้า
    const wallets = await query<any[]>(
      "SELECT id FROM wallets WHERE store_id = ? LIMIT 1",
      [storeId]
    );

    if (!wallets || wallets.length === 0) {
      return NextResponse.json({ success: false, message: "ไม่พบกระเป๋าเงิน" }, { status: 404 });
    }

    const walletId = wallets[0].id;
    const refId = `TOPUP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 2. บันทึกคำขอเติมเงินลง wallet_transactions ในสถานะ pending
    await query(
      `INSERT INTO wallet_transactions 
        (wallet_id, amount, type, description, status, slip_url, reference_id) 
       VALUES (?, ?, 'TOPUP', ?, 'pending', ?, ?)`,
      [
        walletId,
        amount,
        `เติมเงินเข้ากระเป๋าเงิน (PromptPay QR)`,
        slipUrl,
        refId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "ส่งคำขอเติมเงินและหลักฐานสลิปเรียบร้อยแล้ว ระบบจะตรวจสอบยอดเงินให้ท่านโดยเร็ว",
      data: {
        reference_id: refId,
        amount,
        status: "pending",
        slip_url: slipUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to submit topup" },
      { status: 500 }
    );
  }
}
