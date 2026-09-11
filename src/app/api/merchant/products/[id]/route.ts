import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// PUT: แก้ไขข้อมูลสินค้า
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
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

    await query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock = ?, category = ?, is_available = ?, image_url = ?
       WHERE id = ?`,
      [
        name.trim(),
        description.trim(),
        parseFloat(price),
        parseInt(stock, 10) || 0,
        category.trim(),
        is_available ? 1 : 0,
        image_url.trim() || null,
        productId,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: ลบสินค้า
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    await query("DELETE FROM products WHERE id = ?", [productId]);

    return NextResponse.json({
      success: true,
      message: "ลบสินค้าเรียบร้อยแล้ว",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
