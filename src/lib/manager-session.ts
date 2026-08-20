import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "kitchen_manager_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h, same as cook sessions

export async function createManagerSession(managerId: string) {
  const session = await prisma.managerSession.create({
    data: {
      managerId,
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

export async function destroyManagerSession() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.managerSession.deleteMany({ where: { id: sessionId } });
  }
  jar.delete(COOKIE_NAME);
}

export async function getCurrentManager() {
  const jar = await cookies();
  const sessionId = jar.get(COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const session = await prisma.managerSession.findUnique({
    where: { id: sessionId },
    include: { manager: true },
  });
  if (!session || session.expiresAt < new Date() || !session.manager.active) {
    return null;
  }
  return session.manager;
}
