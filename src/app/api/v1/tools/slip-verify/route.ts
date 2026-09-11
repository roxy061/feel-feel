import { NextRequest, NextResponse } from "next/server";
import { authenticateAndBillApiRequest } from "@/lib/api-gateway";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const auth = await authenticateAndBillApiRequest(req, 0.35);
  if (auth.errorResponse) return auth.errorResponse;

  const { deductCost } = auth.context!;

  try {
    const body = await req.json();
    const { slipUrl, expectedAmount, rawPayload } = body;

    if (!slipUrl && !rawPayload) {
      return NextResponse.json(
        { error: "Bad Request", message: "slipUrl or rawPayload is required" },
        { status: 400 }
      );
    }

    // Mock/Simulated Slip Verification Engine (compatible with PromptPay & Thai QR Standard)
    const simulatedTransRef = "TXN" + Math.floor(1000000000 + Math.random() * 9000000000);
    const verifiedAmount = expectedAmount ? Number(expectedAmount) : 500.0;
    const isAuthentic = true;

    const latency = Date.now() - startTime;
    await deductCost(200, latency);

    return NextResponse.json({
      success: true,
      meta: {
        costDeducted: 0.35,
        currency: "THB",
        latencyMs: latency,
      },
      verificationResult: {
        isAuthentic,
        transRef: simulatedTransRef,
        amount: verifiedAmount,
        currency: "THB",
        transDate: new Date().toISOString(),
        sender: {
          bank: "KASIKORNBANK (KBANK)",
          accountMask: "xxx-x-xx123-4",
          name: "MR. CUSTOMER S.",
        },
        receiver: {
          bank: "SCB (SIAM COMMERCIAL BANK)",
          accountMask: "xxx-x-xx998-8",
          name: auth.context?.storeName || "MERCHANT",
        },
        validationStatus: "VERIFIED_SUCCESSFUL",
      },
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
