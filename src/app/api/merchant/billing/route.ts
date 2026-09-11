import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePromptPayQR } from "@/lib/promptpay";

export async function GET(req: NextRequest) {
  const subdomain = req.nextUrl.searchParams.get("subdomain") || "techstore";

  const store = await db.store.findUnique({
    where: { subdomain },
    include: {
      wallet: {
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      },
    },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      status: store.status,
      expireAt: store.expireAt,
      tokenBalance: store.tokenBalance,
    },
    wallet: store.wallet,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, subdomain, amount, promptpayNumber } = body;

    const targetSubdomain = subdomain || "techstore";
    const store = await db.store.findUnique({
      where: { subdomain: targetSubdomain },
      include: { wallet: true },
    });

    if (!store || !store.wallet) {
      return NextResponse.json({ error: "Store or wallet not found" }, { status: 404 });
    }

    if (action === "generate-qr") {
      const topupAmount = Number(amount) || 300;
      const ppTarget = promptpayNumber || "0812345678"; // System PromptPay recipient
      const qrDataUrl = await generatePromptPayQR(ppTarget, topupAmount);
      return NextResponse.json({
        success: true,
        qrCode: qrDataUrl,
        amount: topupAmount,
        promptpayNumber: ppTarget,
      });
    }

    if (action === "topup") {
      const topupAmount = Number(amount) || 300;
      const ref = `TOPUP-${Date.now().toString().slice(-6)}`;

      await db.$transaction([
        db.wallet.update({
          where: { id: store.wallet.id },
          data: { balance: { increment: topupAmount } },
        }),
        db.walletTransaction.create({
          data: {
            walletId: store.wallet.id,
            amount: topupAmount,
            type: "TOPUP",
            description: `เติมเงินเข้ากระเป๋าผ่าน PromptPay QR (${topupAmount} THB)`,
            reference: ref,
          },
        }),
      ]);

      const updated = await db.wallet.findUnique({
        where: { id: store.wallet.id },
        include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } },
      });

      return NextResponse.json({
        success: true,
        message: `เติมเงินสำเร็จจำนวน ${topupAmount} บาท`,
        wallet: updated,
      });
    }

    if (action === "renew") {
      // Renew Store for 30 Days (Cost: 1 Token or 300 THB)
      const COST_THB = 300;
      let usedToken = false;

      if (store.tokenBalance >= 1) {
        // Use token
        usedToken = true;
      } else if (store.wallet.balance >= COST_THB) {
        // Deduct from wallet balance
        usedToken = false;
      } else {
        return NextResponse.json(
          {
            error: "ยอดเงินหรือโทเคนไม่เพียงพอ",
            message: `ต้องการ 1 Token หรือยอดเงินคงเหลืออย่างน้อย ${COST_THB} บาท (ปัจจุบันมี ${store.wallet.balance.toFixed(
              2
            )} บาท)`,
          },
          { status: 400 }
        );
      }

      // Calculate new expiration date (if current expireAt > now, extend from expireAt, else from now)
      const currentExpire = new Date(store.expireAt);
      const baseDate = currentExpire > new Date() ? currentExpire : new Date();
      const newExpire = new Date(baseDate);
      newExpire.setDate(newExpire.getDate() + 30);

      if (usedToken) {
        await db.$transaction([
          db.store.update({
            where: { id: store.id },
            data: {
              tokenBalance: { decrement: 1 },
              expireAt: newExpire,
              status: "ACTIVE",
            },
          }),
          db.walletTransaction.create({
            data: {
              walletId: store.wallet.id,
              amount: 0,
              type: "SUBSCRIPTION_RENEWAL",
              description: "ต่ออายุร้านค้า 30 วัน ด้วย 1 Token สำเร็จ",
              reference: `RENEW-${Date.now()}`,
            },
          }),
        ]);
      } else {
        await db.$transaction([
          db.wallet.update({
            where: { id: store.wallet.id },
            data: { balance: { decrement: COST_THB } },
          }),
          db.store.update({
            where: { id: store.id },
            data: {
              expireAt: newExpire,
              status: "ACTIVE",
            },
          }),
          db.walletTransaction.create({
            data: {
              walletId: store.wallet.id,
              amount: -COST_THB,
              type: "SUBSCRIPTION_RENEWAL",
              description: `ต่ออายุร้านค้า 30 วัน (หักค่าบริการ ${COST_THB} บาท)`,
              reference: `RENEW-${Date.now()}`,
            },
          }),
        ]);
      }

      const updatedStore = await db.store.findUnique({
        where: { id: store.id },
        include: { wallet: true },
      });

      return NextResponse.json({
        success: true,
        message: "ต่ออายุร้านค้าสำเร็จ 30 วันเรียบร้อยแล้ว!",
        expireAt: updatedStore?.expireAt,
        tokenBalance: updatedStore?.tokenBalance,
        walletBalance: updatedStore?.wallet?.balance,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
