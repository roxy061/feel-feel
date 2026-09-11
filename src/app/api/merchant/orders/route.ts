import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: ดึงรายการคำสั่งซื้อทั้งหมดของร้านค้า
export async function GET(req: NextRequest) {
  try {
    const storeId = 1;

    const orders = await query<any[]>(
      `SELECT 
        o.id,
        o.order_number,
        o.store_id,
        o.product_id,
        p.name as product_name,
        p.image_url as product_image,
        o.customer_name,
        o.customer_contact,
        o.customer_address,
        o.quantity,
        o.total_amount,
        o.payment_method,
        o.voucher_code,
        o.voucher_amount,
        o.slip_url,
        o.payment_status,
        o.status,
        o.created_at
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       WHERE o.store_id = ?
       ORDER BY o.id DESC`,
      [storeId]
    );

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
