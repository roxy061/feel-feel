import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

function getTrackingUrl(courier: string | null, trackingNumber: string | null): string | null {
  if (!trackingNumber) return null;
  const cleanNum = trackingNumber.trim();
  const c = (courier || "").toLowerCase();

  if (c.includes("flash")) {
    return `https://www.flashexpress.co.th/tracking/?se=${encodeURIComponent(cleanNum)}`;
  }
  if (c.includes("kerry") || c.includes("kex")) {
    return `https://th.kerryexpress.com/th/track/?track=${encodeURIComponent(cleanNum)}`;
  }
  if (c.includes("post") || c.includes("ems") || c.includes("ไปรษณีย์")) {
    return `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(cleanNum)}`;
  }
  if (c.includes("j&t") || c.includes("jt")) {
    return `https://www.jtexpress.co.th/trajectoryQuery?bills=${encodeURIComponent(cleanNum)}`;
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const subdomain = (searchParams.get("subdomain") || "").trim().toLowerCase();

    if (!q) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุหมายเลขคำสั่งซื้อ (ORD-...) หรือเบอร์โทรศัพท์" },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        o.id,
        o.order_number,
        o.store_id,
        o.product_id,
        o.customer_name,
        o.customer_contact,
        o.customer_address,
        o.quantity,
        o.total_amount,
        o.payment_method,
        o.voucher_code,
        o.voucher_amount,
        o.payment_status,
        o.status,
        o.tracking_number,
        o.courier,
        o.shipping_status,
        o.items_json,
        o.created_at,
        o.updated_at,
        s.name as store_name,
        s.subdomain,
        p.name as product_name,
        p.image_url as product_image,
        p.category as product_category
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE (o.order_number = ? OR o.customer_contact = ? OR o.customer_contact = ?)
    `;

    const cleanPhone = q.replace(/\D/g, "");
    const params: any[] = [q, q, cleanPhone];

    if (subdomain) {
      sql += " AND LOWER(s.subdomain) = ?";
      params.push(subdomain);
    }

    sql += " ORDER BY o.id DESC LIMIT 10";

    const rows = await query<any[]>(sql, params);

    const orders = rows.map((r) => {
      let items: any[] = [];
      if (r.items_json) {
        try {
          items = typeof r.items_json === "string" ? JSON.parse(r.items_json) : r.items_json;
        } catch {
          items = [];
        }
      }

      if (!items || items.length === 0) {
        items = [
          {
            product_id: r.product_id,
            name: r.product_name || "ชิ้นส่วนสมรรถนะสูง",
            price: parseFloat(r.total_amount) / (r.quantity || 1),
            quantity: r.quantity || 1,
            image_url: r.product_image,
            category: r.product_category || "General",
          },
        ];
      }

      const trackingUrl = getTrackingUrl(r.courier, r.tracking_number);

      return {
        id: r.id,
        order_number: r.order_number,
        customer_name: r.customer_name,
        customer_contact: r.customer_contact,
        customer_address: r.customer_address,
        quantity: r.quantity,
        total_amount: parseFloat(r.total_amount),
        payment_method: r.payment_method,
        payment_status: r.payment_status || "pending",
        status: r.status || "pending",
        shipping_status: r.shipping_status || "unfulfilled",
        tracking_number: r.tracking_number || null,
        courier: r.courier || null,
        tracking_url: trackingUrl,
        items,
        created_at: r.created_at,
        updated_at: r.updated_at,
        store: {
          id: r.store_id,
          name: r.store_name,
          subdomain: r.subdomain,
        },
      };
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("[Track Order Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
