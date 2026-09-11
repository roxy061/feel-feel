import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  return handleSubscriptionCheck(req);
}

export async function POST(req: NextRequest) {
  return handleSubscriptionCheck(req);
}

async function handleSubscriptionCheck(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is configured, check authorization
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find stores that have passed expiration date and are still ACTIVE
  const expiredStores = await db.store.findMany({
    where: {
      expireAt: {
        lt: now,
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
      subdomain: true,
      name: true,
      expireAt: true,
    },
  });

  if (expiredStores.length > 0) {
    await db.store.updateMany({
      where: {
        id: {
          in: expiredStores.map((s) => s.id),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });
  }

  const allStoresCount = await db.store.count();

  return NextResponse.json({
    success: true,
    message: `Scanned ${allStoresCount} stores. Marked ${expiredStores.length} store(s) as EXPIRED.`,
    scannedAt: now.toISOString(),
    totalStores: allStoresCount,
    newlyExpiredCount: expiredStores.length,
    expiredStores: expiredStores.map((s) => ({
      subdomain: s.subdomain,
      name: s.name,
      expiredDate: s.expireAt,
    })),
  });
}
