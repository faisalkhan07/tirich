import { randomBytes } from "node:crypto";
import { db } from "./db";

/**
 * Generates collision-resistant reference numbers like JAM-20261016-A7B2.
 */
export async function generateOrderReferenceNo(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // "20261016"

  for (let attempt = 0; attempt < 5; attempt++) {
    const randomHex = randomBytes(2).toString("hex").toUpperCase(); // 4 chars e.g. "9F2A"
    const ref = `JAM-${dateStr}-${randomHex}`;

    const existing = await db.order.findUnique({
      where: { referenceNo: ref },
      select: { id: true },
    });

    if (!existing) {
      return ref;
    }
  }

  // Fallback with timestamp suffix
  return `JAM-${dateStr}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

/**
 * Generates collision-resistant reference numbers like FRT-20261017-B9C1.
 */
export async function generateBulkRequestReferenceNo(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // e.g. "20261017"

  for (let attempt = 0; attempt < 5; attempt++) {
    const randomHex = randomBytes(2).toString("hex").toUpperCase(); // 4 chars e.g. "B9C1"
    const ref = `FRT-${dateStr}-${randomHex}`;

    const existing = await db.bulkRequest.findUnique({
      where: { referenceNo: ref },
      select: { id: true },
    });

    if (!existing) {
      return ref;
    }
  }

  return `FRT-${dateStr}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

/**
 * Simple database-backed rate limiter for serverless environment.
 * Allows `limit` actions per `windowMs`.
 */
export async function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 10 * 60 * 1000
): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  // Count recent requests
  const count = await db.rateLimit.count({
    where: {
      key,
      createdAt: { gte: windowStart },
    },
  });

  if (count >= limit) {
    return false;
  }

  // Record this request
  await db.rateLimit.create({
    data: { key },
  });

  // Periodically clean up old records (fire-and-forget)
  db.rateLimit
    .deleteMany({
      where: { createdAt: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) } },
    })
    .catch(() => {});

  return true;
}
