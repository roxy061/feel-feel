import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const subdomain = req.nextUrl.searchParams.get("subdomain") || "techstore";

  const store = await db.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const [apiKeys, usageLogs] = await Promise.all([
    db.apiKey.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
    }),
    db.apiUsageLog.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return NextResponse.json({ apiKeys, usageLogs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subdomain, name, rateLimit } = body;

    const targetSubdomain = subdomain || "techstore";
    const store = await db.store.findUnique({
      where: { subdomain: targetSubdomain },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Generate secret key sk_live_...
    const randomHex = crypto.randomBytes(16).toString("hex");
    const rawKey = `sk_live_${randomHex}`;
    const keyPrefix = rawKey.substring(0, 14);

    const apiKey = await db.apiKey.create({
      data: {
        storeId: store.id,
        name: name || "New Live API Key",
        keyPrefix,
        keyHash: rawKey, // store key
        rateLimit: Number(rateLimit) || 60,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        ...apiKey,
        rawKey, // returned once upon creation
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Key id is required" }, { status: 400 });
    }

    await db.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
