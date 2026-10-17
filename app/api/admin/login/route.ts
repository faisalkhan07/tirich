import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/orders";

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0]?.trim() : "127.0.0.1";

    // Rate limiting: 6 attempts per 10 minutes per IP
    const isAllowed = await checkRateLimit(`admin_login_${ip}`, 6, 10 * 60 * 1000);
    if (!isAllowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait 10 minutes before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Please enter your email and password." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminUser = await db.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!adminUser) {
      // Intentionally generic message to avoid leaking user existence
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = verifyPassword(password, adminUser.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Set signed session cookie
    await setSessionCookie({
      userId: adminUser.id,
      email: adminUser.email,
      createdAt: Date.now(),
    });

    return NextResponse.json({ ok: true, email: adminUser.email });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error during login." }, { status: 500 });
  }
}
