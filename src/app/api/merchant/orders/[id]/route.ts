import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

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

    const { action, tracking_number, courier, shipping_status } = body;

    // ดึงข้อมูลคำสั่งซื้อเดิม
    const orders = await query<any[]>(
      "SELECT id, product_id, quantity, payment_method, status, items_json FROM orders WHERE id = ? LIMIT 1",
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
      const newShippingStatus = shipping_status || (tracking_number ? "shipped" : "preparing");

      // 1. ปรับสถานะเป็น completed และบันทึกข้อมูลจัดส่ง
      await query(
        `UPDATE orders 
         SET status = 'completed', 
             payment_status = 'paid', 
             tracking_number = COALESCE(?, tracking_number),
             courier = COALESCE(?, courier),
             shipping_status = ?,
             updated_at = NOW() 
         WHERE id = ?`,
        [tracking_number || null, courier || null, newShippingStatus, orderId]
      );

      // 2. ตัดสต็อกสินค้าหากเป็นการโอนเงิน (PromptPay) ที่ยังไม่ได้ตัดสต็อกตอนสร้างคำสั่งซื้อ
      if (order.payment_method === "bank_transfer" || order.payment_method === "promptpay") {
        if (order.items_json) {
          try {
            const items = typeof order.items_json === "string" ? JSON.parse(order.items_json) : order.items_json;
            if (Array.isArray(items)) {
              for (const it of items) {
                await query(
                  "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
                  [it.quantity || 1, it.product_id]
                );
              }
            }
          } catch {
            await query(
              "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
              [order.quantity, order.product_id]
            );
          }
        } else {
          await query(
            "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
            [order.quantity, order.product_id]
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: "อนุมัติคำสั่งซื้อเรียบร้อยแล้ว (ตัดสต็อกสินค้าและอัปเดตสถานะจัดส่งแล้ว)",
        status: "completed",
        shipping_status: newShippingStatus,
        tracking_number: tracking_number || null,
        courier: courier || null,
      });
    } else if (action === "fulfill") {
      // อัปเดตเลขพัสดุและการจัดส่ง
      await query(
        `UPDATE orders 
         SET tracking_number = ?,
             courier = ?,
             shipping_status = 'shipped',
             updated_at = NOW()
         WHERE id = ?`,
        [tracking_number || "", courier || "Flash Express", orderId]
      );

      return NextResponse.json({
        success: true,
        message: "อัปเดตข้อมูลพัสดุและเลข Tracking เรียบร้อยแล้ว",
        shipping_status: "shipped",
        tracking_number,
        courier,
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
        { success: false, message: "Action ต้องเป็น 'approve', 'fulfill' หรือ 'reject' เท่านั้น" },
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
