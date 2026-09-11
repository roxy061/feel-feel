import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

// GET: ดึงรายการสินค้าทั้งหมดของร้านค้า
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeIdParam = searchParams.get("store_id");

    const sql = storeIdParam
      ? `SELECT p.id, p.store_id, p.name, p.description, p.price, p.stock, p.category, p.is_available, p.image_url, p.created_at, s.name as store_name, s.subdomain 
         FROM products p 
         LEFT JOIN stores s ON p.store_id = s.id 
         WHERE p.store_id = ? 
         ORDER BY p.id DESC`
      : `SELECT p.id, p.store_id, p.name, p.description, p.price, p.stock, p.category, p.is_available, p.image_url, p.created_at, s.name as store_name, s.subdomain 
         FROM products p 
         LEFT JOIN stores s ON p.store_id = s.id 
         ORDER BY p.id DESC`;

    let products: any[] = [];
    try {
      products = await query<any[]>(sql, storeIdParam ? [storeIdParam] : []);
    } catch {
      await ensureDatabaseSeeded();
      products = await query<any[]>(sql, storeIdParam ? [storeIdParam] : []);
    }

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: เพิ่มสินค้าใหม่เข้าสู่ร้านค้า
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.name || body.price === undefined) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุชื่อสินค้าและราคาให้ถูกต้อง" },
        { status: 400 }
      );
    }

    const {
      store_id = 1,
      name,
      description = "",
      price,
      stock = 0,
      category = "General",
      is_available = 1,
      image_url = "",
    } = body;

    const numPrice = parseFloat(price);
    const numStock = parseInt(stock, 10) || 0;

    let targetStoreId = store_id;
    // ตรวจสอบว่า store_id มีอยู่จริงหรือไม่ ถ้าไม่พบให้ใช้ store แรก
    const stores = await query<any[]>("SELECT id FROM stores WHERE id = ? LIMIT 1", [targetStoreId]);
    if (!stores || stores.length === 0) {
      const fallbackStore = await query<any[]>("SELECT id FROM stores ORDER BY id ASC LIMIT 1");
      targetStoreId = fallbackStore[0]?.id || 1;
    }

    const result = await query<any>(
      `INSERT INTO products (store_id, name, description, price, stock, category, is_available, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        targetStoreId,
        name.trim(),
        description.trim(),
        numPrice,
        numStock,
        category.trim(),
        is_available ? 1 : 0,
        image_url.trim() || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "เพิ่มสินค้าใหม่เรียบร้อยแล้ว",
        product_id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
