import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/auto-seed";

export const dynamic = "force-dynamic";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "dashboard",
  "root",
  "app",
  "dev",
  "onboarding",
  "settings",
  "mail",
  "superadmin",
  "status",
  "auth",
  "login",
  "register",
  "static",
  "media",
  "assets",
  "null",
  "undefined",
  "system",
  "support",
  "billing",
]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSubdomain = searchParams.get("subdomain") || "";
    const subdomain = rawSubdomain.trim().toLowerCase();

    if (!subdomain) {
      return NextResponse.json(
        {
          available: false,
          reason: "กรุณาระบุชื่อ Subdomain ที่ต้องการตรวจสอบ",
        },
        { status: 400 }
      );
    }

    // 1. ตรวจสอบความยาว
    if (subdomain.length < 3 || subdomain.length > 30) {
      return NextResponse.json({
        available: false,
        reason: "Subdomain ต้องมีความยาวระหว่าง 3 - 30 ตัวอักษร",
      });
    }

    // 2. ตรวจสอบรูปแบบ (เฉพาะตัวพิมพ์เล็ก ตัวเลข และขีดกลาง ไม่ขึ้นต้นหรือลงท้ายด้วยขีด)
    const subdomainRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json({
        available: false,
        reason:
          "Subdomain ต้องประกอบด้วยตัวอักษรภาษาอังกฤษพิมพ์เล็ก (a-z) ตัวเลข (0-9) หรือขีดกลาง (-) และห้ามขึ้นต้น/ลงท้ายด้วยขีด",
      });
    }

    // 3. ตรวจสอบคำสงวน (Reserved Subdomains)
    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      return NextResponse.json({
        available: false,
        reason: `คำว่า '${subdomain}' เป็นคำสงวนของระบบ ไม่สามารถนำมาตั้งเป็นชื่อร้านค้าได้`,
      });
    }

    // 4. ตรวจสอบในฐานข้อมูลว่าชื่อซ้ำหรือไม่
    let existing: any[] = [];
    try {
      existing = await query<any[]>(
        "SELECT id, name FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
        [subdomain]
      );
    } catch {
      await ensureDatabaseSeeded();
      existing = await query<any[]>(
        "SELECT id, name FROM stores WHERE LOWER(subdomain) = ? LIMIT 1",
        [subdomain]
      );
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({
        available: false,
        reason: `Subdomain '${subdomain}' ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น`,
      });
    }

    return NextResponse.json({
      available: true,
      subdomain,
      message: `สามารถใช้งาน Subdomain '${subdomain}' ได้`,
    });
  } catch (error: any) {
    console.error("[Check Subdomain Error]:", error);
    return NextResponse.json(
      {
        available: false,
        reason: error?.message || "เกิดข้อผิดพลาดในการตรวจสอบ Subdomain",
      },
      { status: 500 }
    );
  }
}
