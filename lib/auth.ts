import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE_NAME = "tirich_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("SESSION_SECRET must be at least 16 characters in .env");
  }
  return secret;
}

export type AdminSession = {
  userId: string;
  email: string;
  createdAt: number;
};

/**
 * Creates an HMAC-signed session token: base64(payload).signature
 */
export function signSession(payload: AdminSession): string {
  const secret = getSecret();
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const signature = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verifies and parses an HMAC-signed session token.
 */
export function verifySession(token: string): AdminSession | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    if (!data || !signature) return null;

    const secret = getSecret();
    const expected = createHmac("sha256", secret).update(data).digest("base64url");

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);

    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: AdminSession = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    const now = Date.now();
    // Expiration check (7 days)
    if (now - payload.createdAt > SESSION_MAX_AGE * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Sets the HTTP-only signed session cookie in Next.js response.
 */
export async function setSessionCookie(session: AdminSession): Promise<void> {
  const cookieStore = await cookies();
  const token = signSession(session);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Retrieves the currently authenticated admin session, or null if none/invalid.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  const session = verifySession(cookie.value);
  if (!session) return null;

  // Verify the admin user still exists in DB
  const user = await db.adminUser.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true },
  });

  if (!user || user.email !== session.email) {
    return null;
  }

  return session;
}

/**
 * Enforces admin authentication on server components/routes.
 * Redirects to /admin/login if not logged in.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
