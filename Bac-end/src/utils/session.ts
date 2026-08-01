import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { sessions, users, type User } from "../db/schema.js";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

export async function createSession(userId: string): Promise<{ id: string; expiresAt: Date }> {
  const id = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessions).values({ id, userId, expiresAt });

  return { id, expiresAt };
}

export async function getSessionUser(sessionId: string): Promise<User | null> {
  const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));

  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId));

  return user ?? null;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
