import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = "u-001";
    const storeKey = "store-3nfm";

    // 1. ดึงข้อมูล User และ Token (พร้อม Fallback Auto-Seed หากยังไม่มีข้อมูล)
    let users: any[] = [];
    try {
      users = await query<any[]>(
        "SELECT id, name, email, tokens FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
    } catch {
      await ensureDatabaseSeeded();
      users = await query<any[]>(
        "SELECT id, name, email, tokens FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
    }

    if (!users || users.length === 0) {
      await ensureDatabaseSeeded();
      users = await query<any[]>(
        "SELECT id, name, email, tokens FROM users WHERE id = ? LIMIT 1",
        [userId]
      );
    }

    const user = users[0] || { id: userId, name: "3NFM Owner", tokens: 10 };

    // 2. ดึงข้อมูลร้านค้าและวันหมดอายุ
    let stores = await query<any[]>(
      "SELECT id, subdomain, name, tagline, expires_at, truemoney_phone FROM stores WHERE user_id = ? OR store_key = ? OR id = 1 LIMIT 1",
      [userId, storeKey]
    );

    if (!stores || stores.length === 0) {
      await ensureDatabaseSeeded();
      stores = await query<any[]>(
        "SELECT id, subdomain, name, tagline, expires_at, truemoney_phone FROM stores WHERE user_id = ? OR store_key = ? OR id = 1 LIMIT 1",
        [userId, storeKey]
      );
    }

    if (!stores || stores.length === 0) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    const store = stores[0];
    const now = new Date();
    const expiresAt = store.expires_at ? new Date(store.expires_at) : new Date(Date.now() + 30 * 86400000);
    const isExpired = expiresAt < now;
    const diffTime = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // 3. ดึงสถิติคำสั่งซื้อ
    const stats = await query<any[]>(
      `SELECT 
        COUNT(*) as total_orders,
        IFNULL(SUM(CASE WHEN status IN ('paid', 'completed') THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
       FROM orders WHERE store_id = ?`,
      [store.id]
    );

    const productStats = await query<any[]>(
      "SELECT COUNT(*) as total_products FROM products WHERE store_id = ?",
      [store.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          tokens: user.tokens || 0,
        },
        store: {
          id: store.id,
          name: store.name,
          subdomain: store.subdomain,
          expires_at: expiresAt.toISOString(),
          status: isExpired ? "Expired" : "Active",
          days_remaining: daysRemaining,
        },
        stats: {
          total_orders: stats[0]?.total_orders || 0,
          total_revenue: parseFloat(stats[0]?.total_revenue || "0"),
          pending_orders: stats[0]?.pending_orders || 0,
          total_products: productStats[0]?.total_products || 0,
        },
      },
    });
  } catch (error: any) {
    console.error("[Merchant Overview Error]:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
