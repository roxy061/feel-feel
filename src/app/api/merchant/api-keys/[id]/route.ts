import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// PATCH: เปลี่ยนสถานะเปิด/ปิดการใช้งาน API Key
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const keyId = params.id;
    const body = await req.json().catch(() => ({}));

    if (body.is_active === undefined) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุสถานะ is_active" },
        { status: 400 }
      );
    }

    const isActive = body.is_active ? 1 : 0;
    await query("UPDATE api_keys SET is_active = ? WHERE id = ?", [isActive, keyId]);

    return NextResponse.json({
      success: true,
      message: `ปรับสถานะ API Key เป็น ${isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"} เรียบร้อยแล้ว`,
      is_active: isActive,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to update API key status" },
      { status: 500 }
    );
  }
}

// DELETE: ลบ API Key
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const keyId = params.id;
    await query("DELETE FROM api_keys WHERE id = ?", [keyId]);

    return NextResponse.json({
      success: true,
      message: "ลบ API Key เรียบร้อยแล้ว",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to delete API key" },
      { status: 500 }
    );
  }
}
