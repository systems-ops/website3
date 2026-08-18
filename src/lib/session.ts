import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "kitchen_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h — long enough for a shift

export async function createSession(cookId: string) {
  const session = await prisma.session.create({
    data: {
      cookId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  const jar = await cookies();
  jar.set(COOKIE_NAME, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt,
  });
  return session;
}

export async function destroySession() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }
  jar.delete(COOKIE_NAME);
}

export async function getCurrentCook() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { cook: { include: { locations: { include: { location: true } } } } },
  });
  if (!session || session.expiresAt < new Date() || !session.cook.active) {
    return null;
  }
  return session.cook;
}
