import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users, perfis, type User, type Perfil } from "../../db/schema.js";

export async function findPerfilByUserId(
  userId: string,
): Promise<{ user: User; perfil: Perfil } | null> {
  const [row] = await db
    .select({ user: users, perfil: perfis })
    .from(users)
    .innerJoin(perfis, eq(perfis.userId, users.id))
    .where(eq(users.id, userId));

  return row ?? null;
}

export async function listPerfis(): Promise<{ user: User; perfil: Perfil }[]> {
  return db.select({ user: users, perfil: perfis }).from(users).innerJoin(perfis, eq(perfis.userId, users.id));
}
