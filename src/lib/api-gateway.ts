import { NextRequest, NextResponse } from "next/server";
import { db } from "./db";

// In-memory rate limiting map: keyId -> { count, resetAt }
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

export interface ApiAuthContext {
  storeId: string;
  storeName: string;
  apiKeyId: string;
  subdomain: string;
  deductCost: (statusCode: number, latencyMs: number) => Promise<void>;
}

export async function authenticateAndBillApiRequest(
  req: NextRequest,
  cost: number = 0.35
): Promise<{ errorResponse?: NextResponse; context?: ApiAuthContext }> {
  const startTime = Date.now();
  const apiKeyHeader =
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!apiKeyHeader) {
    return {
      errorResponse: NextResponse.json(
        {
          error: "Unauthorized",
          message: "Header 'x-api-key' is required to access this API.",
          hint: "Generate an API key from the Merchant Console under API Management.",
        },
        { status: 401 }
      ),
    };
  }

  // Find API Key in Database
  const apiKey = await db.apiKey.findFirst({
    where: {
      keyHash: apiKeyHeader,
      isActive: true,
    },
    include: {
      store: {
        include: {
          wallet: true,
        },
      },
    },
  });

  if (!apiKey) {
    return {
      errorResponse: NextResponse.json(
        {
          error: "Invalid API Key",
          message: "The provided API key does not exist or has been revoked.",
        },
        { status: 401 }
      ),
    };
  }

  const { store } = apiKey;

  // Check store lifecycle status
  if (store.status === "EXPIRED" || store.status === "SUSPENDED") {
    return {
      errorResponse: NextResponse.json(
        {
          error: "Store Inactive",
          message: `Store subscription is ${store.status}. Please top up tokens to resume API access.`,
        },
        { status: 403 }
      ),
    };
  }

  // Rate Limiting Check (per minute sliding window)
  const now = Date.now();
  const limit = apiKey.rateLimit || 60;
  const rateRecord = rateLimitCache.get(apiKey.id);

  if (rateRecord && now < rateRecord.resetAt) {
    if (rateRecord.count >= limit) {
      return {
        errorResponse: NextResponse.json(
          {
            error: "Rate Limit Exceeded",
            message: `Limit of ${limit} requests per minute exceeded. Try again in ${Math.ceil(
              (rateRecord.resetAt - now) / 1000
            )} seconds.`,
          },
          {
            status: 429,
            headers: {
              "Retry-After": Math.ceil((rateRecord.resetAt - now) / 1000).toString(),
            },
          }
        ),
      };
    }
    rateRecord.count += 1;
  } else {
    rateLimitCache.set(apiKey.id, { count: 1, resetAt: now + 60 * 1000 });
  }

  // Check Wallet Balance for Pay-per-Use Billing
  if (!store.wallet || store.wallet.balance < cost) {
    return {
      errorResponse: NextResponse.json(
        {
          error: "Insufficient Wallet Balance",
          message: `This API requires ${cost.toFixed(2)} THB per call. Current balance: ${
            store.wallet?.balance?.toFixed(2) || "0.00"
          } THB. Please top up your wallet in Merchant Console.`,
        },
        { status: 402 }
      ),
    };
  }

  // Callback to deduct cost and log usage upon successful response
  const deductCost = async (statusCode: number, latencyMs: number) => {
    try {
      // Deduct from wallet if status is 200 OK or 201 Created
      if (statusCode >= 200 && statusCode < 300 && cost > 0 && store.wallet) {
        await db.$transaction([
          db.wallet.update({
            where: { id: store.wallet.id },
            data: {
              balance: {
                decrement: cost,
              },
            },
          }),
          db.walletTransaction.create({
            data: {
              walletId: store.wallet.id,
              amount: -cost,
              type: "API_DEDUCTION",
              description: `API Call: ${req.method} ${new URL(req.url).pathname}`,
              reference: apiKey.id,
            },
          }),
          db.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
          }),
          db.apiUsageLog.create({
            data: {
              storeId: store.id,
              apiKeyId: apiKey.id,
              endpoint: new URL(req.url).pathname,
              method: req.method,
              statusCode,
              latencyMs,
              cost,
              ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
            },
          }),
        ]);
      } else {
        // Just log without deducting if failed
        await db.apiUsageLog.create({
          data: {
            storeId: store.id,
            apiKeyId: apiKey.id,
            endpoint: new URL(req.url).pathname,
            method: req.method,
            statusCode,
            latencyMs,
            cost: 0,
            ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
          },
        });
      }
    } catch (err) {
      console.error("Error logging API usage or deducting wallet:", err);
    }
  };

  return {
    context: {
      storeId: store.id,
      storeName: store.name,
      apiKeyId: apiKey.id,
      subdomain: store.subdomain,
      deductCost,
    },
  };
}
