import { db } from "../../src/db/client.js";
import { users, type NewUser, type User } from "../../src/db/schema.js";
import { hashPassword } from "../../src/utils/password.js";
import { createSession } from "../../src/utils/session.js";
import { env } from "../../src/config/env.js";

export async function createUserWithSession(
  overrides: Partial<NewUser> & { senha?: string } = {},
): Promise<{ user: User; cookie: string }> {
  const { senha = "senha123", ...rest } = overrides;

  const [user] = await db
    .insert(users)
    .values({
      login: rest.login ?? `user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      senhaHash: await hashPassword(senha),
      tipo: rest.tipo ?? "professor",
      cargo: rest.cargo ?? (rest.tipo === "aluno" ? undefined : "instrutor"),
      ativo: rest.ativo ?? true,
    })
    .returning();

  const session = await createSession(user.id);

  return { user, cookie: `${env.SESSION_COOKIE_NAME}=${session.id}` };
}
