import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userId = "u-001";
    const { searchParams } = new URL(req.url);
    const selectedStoreId = searchParams.get("store_id");

    // 1. ดึงข้อมูล User และ Token (พร้อม Fallback Auto-Seed)
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

    // 2. ดึงรายการร้านค้าทั้งหมดของผู้ใช้
    let allStores = await query<any[]>(
      "SELECT id, subdomain, name, tagline, expires_at, truemoney_phone FROM stores WHERE user_id = ? OR id IN (1, 2, 3) ORDER BY id ASC",
      [userId]
    );

    if (!allStores || allStores.length === 0) {
      await ensureDatabaseSeeded();
      allStores = await query<any[]>(
        "SELECT id, subdomain, name, tagline, expires_at, truemoney_phone FROM stores WHERE user_id = ? OR id IN (1, 2, 3) ORDER BY id ASC",
        [userId]
      );
    }

    if (!allStores || allStores.length === 0) {
      return NextResponse.json({ success: false, message: "Store not found" }, { status: 404 });
    }

    // เลือกร้านค้าที่ต้องการแสดงผล (ตาม selectedStoreId หรือร้านแรก)
    const store = selectedStoreId
      ? allStores.find((s) => String(s.id) === String(selectedStoreId)) || allStores[0]
      : allStores[0];

    const now = new Date();
    const expiresAt = store.expires_at ? new Date(store.expires_at) : new Date(Date.now() + 30 * 86400000);
    const isExpired = expiresAt < now;
    const diffTime = expiresAt.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // 3. ดึงสถิติคำสั่งซื้อ (รวมทุกร้านค้าของเจ้าของร้าน หรือกรองตามร้าน)
    const storeIds = allStores.map((s) => s.id);
    const inClause = storeIds.join(",");

    const stats = await query<any[]>(
      `SELECT 
        COUNT(*) as total_orders,
        IFNULL(SUM(CASE WHEN status IN ('paid', 'completed') THEN total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
       FROM orders WHERE store_id IN (${inClause})`
    );

    const productStats = await query<any[]>(
      `SELECT COUNT(*) as total_products FROM products WHERE store_id IN (${inClause})`
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
        all_stores: allStores.map((s) => ({
          id: s.id,
          name: s.name,
          subdomain: s.subdomain,
          expires_at: s.expires_at,
          is_active: new Date(s.expires_at || Date.now() + 86400000) > new Date(),
        })),
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
