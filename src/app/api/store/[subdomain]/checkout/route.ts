import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatePromptPayQR } from "@/lib/promptpay";

export async function POST(
  req: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const { subdomain } = params;
    const body = await req.json();
    const { customerName, customerPhone, customerAddress, items, slipUploaded } = body;

    const store = await db.store.findUnique({
      where: { subdomain },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    if (store.status === "EXPIRED" || store.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Store is currently closed or subscription expired" },
        { status: 403 }
      );
    }

    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลและเลือกสินค้าให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // Calculate total
    let total = 0;
    for (const item of items) {
      total += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    const order = await db.order.create({
      data: {
        storeId: store.id,
        orderNumber,
        customerName,
        customerPhone,
        customerAddress: customerAddress || "",
        totalAmount: total,
        status: slipUploaded ? "PAID" : "PENDING",
        paymentMethod: "PROMPTPAY",
        slipUrl: slipUploaded
          ? "https://placehold.co/400x600/10b981/ffffff?text=PromptPay+Transfer+Success"
          : null,
        slipRef: slipUploaded ? `SLIP-SIM-${Date.now().toString().slice(-4)}` : null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Generate Dynamic PromptPay QR
    const qrCode = await generatePromptPayQR(store.promptpayNumber, total);

    return NextResponse.json({
      success: true,
      order,
      qrCode,
      promptpay: {
        number: store.promptpayNumber,
        name: store.promptpayName,
        amount: total,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
