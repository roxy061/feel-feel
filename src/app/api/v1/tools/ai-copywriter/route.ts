import { NextRequest, NextResponse } from "next/server";
import { authenticateAndBillApiRequest } from "@/lib/api-gateway";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const auth = await authenticateAndBillApiRequest(req, 0.35);
  if (auth.errorResponse) return auth.errorResponse;

  const { deductCost } = auth.context!;

  try {
    const body = await req.json();
    const { productName, category, highlights } = body;

    if (!productName) {
      return NextResponse.json(
        { error: "Bad Request", message: "productName is required" },
        { status: 400 }
      );
    }

    // AI Copy Generation Logic
    const catchyHeadlines = [
      `🔥 ไอเทมเด็ดห้ามพลาด! ${productName} ตอบโจทย์ทุกไลฟ์สไตล์`,
      `✨ ยกระดับชีวิตให้โปรยิ่งขึ้นกับ ${productName} ที่ทุกคนตามหา`,
      `⚡ คุ้มค่าที่สุดในรุ่น! ${productName} พร้อมโปรโมชั่นพิเศษวันนี้`,
    ];

    const sellingPoints = [
      `💎 วัสดุเกรดพรีเมียม ดีไซน์สวยสะกดทุกสายตา`,
      `🚀 ประสิทธิภาพเหนือชั้น ใช้งานง่าย ตอบสนองรวดเร็วทันใจ`,
      `🛡️ มั่นใจในคุณภาพ รับประกันความพึงพอใจ บริการหลังการขายประทับใจ`,
    ];

    const longDescription = `ค้นพบประสบการณ์ใหม่ที่เหนือกว่าด้วย ${productName} ${
      highlights ? `ที่มาพร้อมกับฟีเจอร์เด่น: ${highlights}` : ""
    } เหมาะสำหรับผู้ที่ต้องการความสมบูรณ์แบบ ทั้งการใช้งานในชีวิตประจำวันและการทำงานอย่างมืออาชีพ สั่งซื้อวันนี้ส่งฟรีทั่วประเทศ!`;

    const hashtags = [
      `#${productName.replace(/[^a-zA-Z0-9ก-๙]/g, "")}`,
      `#ของมันต้องมี`,
      `#ช้อปออนไลน์`,
      `#${category || "โปรโมชั่นเด็ด"}`,
      `#สินค้าขายดี`,
    ];

    const latency = Date.now() - startTime;
    await deductCost(200, latency);

    return NextResponse.json({
      success: true,
      meta: {
        costDeducted: 0.35,
        currency: "THB",
        latencyMs: latency,
      },
      result: {
        productName,
        headline: catchyHeadlines[Math.floor(Math.random() * catchyHeadlines.length)],
        sellingPoints,
        description: longDescription,
        hashtags,
        generatedAt: new Date().toISOString(),
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
