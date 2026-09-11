import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const subdomain = req.nextUrl.searchParams.get("subdomain") || "techstore";

  const store = await db.store.findUnique({
    where: { subdomain },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json({ store });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      currentSubdomain,
      name,
      description,
      primaryColor,
      promptpayNumber,
      promptpayName,
      logoUrl,
      bannerUrl,
      customDomain,
    } = body;

    const targetSubdomain = currentSubdomain || "techstore";

    const updated = await db.store.update({
      where: { subdomain: targetSubdomain },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(primaryColor && { primaryColor }),
        ...(promptpayNumber && { promptpayNumber }),
        ...(promptpayName && { promptpayName }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(customDomain !== undefined && { customDomain }),
      },
    });

    return NextResponse.json({ success: true, store: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
