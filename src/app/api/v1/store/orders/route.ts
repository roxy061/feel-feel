import { NextRequest, NextResponse } from "next/server";
import { authenticateAndBillApiRequest } from "@/lib/api-gateway";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const auth = await authenticateAndBillApiRequest(req, 0.35);
  if (auth.errorResponse) return auth.errorResponse;

  const { storeId, deductCost } = auth.context!;

  try {
    const orders = await db.order.findMany({
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const latency = Date.now() - startTime;
    await deductCost(200, latency);

    return NextResponse.json({
      success: true,
      meta: {
        total: orders.length,
        costDeducted: 0.35,
        currency: "THB",
        latencyMs: latency,
      },
      data: orders,
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    await deductCost(500, latency);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const auth = await authenticateAndBillApiRequest(req, 0.35);
  if (auth.errorResponse) return auth.errorResponse;

  const { storeId, deductCost } = auth.context!;

  try {
    const body = await req.json();
    const { customerName, customerPhone, customerAddress, items } = body;

    if (!customerName || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Validation Error", message: "customerName, customerPhone and items are required" },
        { status: 400 }
      );
    }

    // Calculate total
    let total = 0;
    for (const it of items) {
      total += (it.price || 0) * (it.quantity || 1);
    }

    const orderNumber = `API-${Date.now().toString().slice(-6)}`;
    const order = await db.order.create({
      data: {
        storeId,
        orderNumber,
        customerName,
        customerPhone,
        customerAddress: customerAddress || "",
        totalAmount: total,
        status: "PENDING",
        paymentMethod: "API_DISPATCH",
        items: {
          create: items.map((it: any) => ({
            productId: it.productId || "custom",
            productName: it.productName || "Custom Item",
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
          })),
        },
      },
      include: { items: true },
    });

    const latency = Date.now() - startTime;
    await deductCost(201, latency);

    return NextResponse.json(
      {
        success: true,
        meta: {
          costDeducted: 0.35,
          currency: "THB",
          latencyMs: latency,
        },
        data: order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    const latency = Date.now() - startTime;
    await deductCost(500, latency);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
