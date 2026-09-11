import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET: ดึงรายการสินค้าทั้งหมดของร้านค้า
export async function GET(req: NextRequest) {
  try {
    const storeId = 1; // Default store Apex/3nfm for u-001

    const products = await query<any[]>(
      "SELECT id, store_id, name, description, price, stock, category, is_available, image_url, created_at FROM products WHERE store_id = ? ORDER BY id DESC",
      [storeId]
    );

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
    const storeId = 1;
    const body = await req.json().catch(() => null);

    if (!body || !body.name || body.price === undefined) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุชื่อสินค้าและราคาให้ถูกต้อง" },
        { status: 400 }
      );
    }

    const {
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

    const result = await query<any>(
      `INSERT INTO products (store_id, name, description, price, stock, category, is_available, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        storeId,
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
