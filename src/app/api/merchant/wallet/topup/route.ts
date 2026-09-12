import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";
import { sendTelegramAlert } from "@/lib/telegram";

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

    // ส่งข้อความแจ้งเตือนผ่าน Telegram Bot API (Non-blocking Asynchronous)
    try {
      const stores = await query<any[]>(
        "SELECT name, subdomain FROM stores WHERE id = ? LIMIT 1",
        [storeId]
      );
      const storeInfo =
        stores && stores.length > 0
          ? `${stores[0].name} (<code>@${stores[0].subdomain}</code>)`
          : `Store ID: ${storeId}`;

      const rootDomain = process.env.ROOT_DOMAIN || "localhost:3000";
      const protocol = rootDomain.includes("localhost") ? "http" : "https";
      const baseUrl = `${protocol}://${rootDomain}`;

      const topupMsg = [
        `<b>[ WALLET TOPUP ] แจ้งเตือนการเติมเงินเข้ากระเป๋าเงิน</b>`,
        `<b>ผู้ดำเนินการ:</b> ${storeInfo}`,
        `<b>รหัสอ้างอิง:</b> <code>${refId}</code>`,
        `<b>เวลา:</b> <code>${new Date().toLocaleString("th-TH")}</code>`,
        ``,
        `<b>จำนวนเงินที่เติม:</b> <code>${amount.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
        })} THB</code>`,
        `<b>ยอดเงินคงเหลือใหม่:</b> <code>${newBalance.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
        })} THB</code>`,
        `<b>ช่องทาง:</b> โอนเงิน PromptPay QR (แนบสลิป)`,
        ``,
        `<b>ลิงก์ด่วน:</b>`,
        `  [->] <a href="${baseUrl}/dashboard/wallet">ตรวจสอบกระเป๋าเงินและสถิติ</a>`,
      ].join("\n");

      sendTelegramAlert({
        message: topupMsg,
        base64Photo: slipUrl || null,
      }).catch((tgErr) => {
        console.warn("[Telegram Wallet Topup Alert Warning]:", tgErr?.message);
      });
    } catch (err: any) {
      console.warn("[Telegram Topup Formatting Warning]:", err?.message);
    }

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
