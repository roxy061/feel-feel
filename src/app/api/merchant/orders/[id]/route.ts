import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// PATCH: อนุมัติหรือปฏิเสธคำสั่งซื้อ
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json().catch(() => null);

    if (!body || !body.action) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุ action (approve หรือ reject)" },
        { status: 400 }
      );
    }

    const { action } = body;

    // ดึงข้อมูลคำสั่งซื้อเดิม
    const orders = await query<any[]>(
      "SELECT id, product_id, quantity, payment_method, status FROM orders WHERE id = ? LIMIT 1",
      [orderId]
    );

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, message: "ไม่พบคำสั่งซื้อนี้ในระบบ" },
        { status: 404 }
      );
    }

    const order = orders[0];

    if (action === "approve") {
      // 1. ปรับสถานะเป็น completed
      await query(
        "UPDATE orders SET status = 'completed', payment_status = 'paid', updated_at = NOW() WHERE id = ?",
        [orderId]
      );

      // 2. ตัดสต็อกสินค้าหากเป็นการโอนเงิน (PromptPay) ที่ยังไม่ได้ตัดสต็อกตอนสร้างคำสั่งซื้อ
      if (order.payment_method === "bank_transfer" || order.payment_method === "promptpay") {
        await query(
          "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
          [order.quantity, order.product_id]
        );
      }

      return NextResponse.json({
        success: true,
        message: "อนุมัติคำสั่งซื้อเรียบร้อยแล้ว (ตัดสต็อกสินค้าแล้ว)",
        status: "completed",
      });
    } else if (action === "reject") {
      // ปรับสถานะเป็น failed
      await query(
        "UPDATE orders SET status = 'failed', payment_status = 'failed', updated_at = NOW() WHERE id = ?",
        [orderId]
      );

      return NextResponse.json({
        success: true,
        message: "ปฏิเสธคำสั่งซื้อเรียบร้อยแล้ว",
        status: "failed",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Action ต้องเป็น 'approve' หรือ 'reject' เท่านั้น" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("[Merchant Order Action Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to process order action" },
      { status: 500 }
    );
  }
}
