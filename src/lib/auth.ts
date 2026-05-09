// Cookie-based admin session. The cookie holds a signed JWT; the row in
// AdminSession lets us revoke server-side (logout, expire) without waiting
// for the JWT exp to lapse.
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const SESSION_COOKIE = "nextwin_admin";
const SESSION_TTL_DAYS = 14;

function secret() {
  const raw = process.env.SESSION_SECRET ?? "nextwin-dev-secret-change-me-in-production";
  return new TextEncoder().encode(raw);
}

// Plain-text or bcrypt-hashed admin password from env.
//   ADMIN_PASSWORD            — plain text (dev convenience)
//   ADMIN_PASSWORD_HASH       — bcrypt hash (preferred for prod)
export async function verifyPassword(input: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (hash) {
    try {
      return await bcrypt.compare(input, hash);
    } catch {
      return false;
    }
  }
  const plain = process.env.ADMIN_PASSWORD ?? "nextwin-admin";
  return input === plain;
}

export async function createSession(): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(secret());

  await prisma.adminSession.create({
    data: { token, expiresAt },
  });

  return token;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await prisma.adminSession.deleteMany({ where: { token } }).catch(() => {});
}

export async function getCurrentSession(): Promise<{ valid: boolean }> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return { valid: false };
  try {
    await jwtVerify(token, secret());
  } catch {
    return { valid: false };
  }
  const row = await prisma.adminSession.findUnique({ where: { token } });
  if (!row) return { valid: false };
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.adminSession.delete({ where: { token } }).catch(() => {});
    return { valid: false };
  }
  return { valid: true };
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
};
