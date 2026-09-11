import { NextRequest, NextResponse } from "next/server";
import { authenticateAndBillApiRequest } from "@/lib/api-gateway";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const auth = await authenticateAndBillApiRequest(req, 0.35);
  if (auth.errorResponse) return auth.errorResponse;

  const { storeId, deductCost } = auth.context!;
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category");

  try {
    const where: any = { storeId, isActive: true };
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }
    if (category) {
      where.category = category;
    }

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const latency = Date.now() - startTime;
    await deductCost(200, latency);

    return NextResponse.json({
      success: true,
      meta: {
        total: products.length,
        costDeducted: 0.35,
        currency: "THB",
        latencyMs: latency,
      },
      data: products,
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
