import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users } from "../../db/schema.js";
import { verifyPassword } from "../../utils/password.js";
import { createSession, deleteSession } from "../../utils/session.js";
import { env } from "../../config/env.js";
import { requireAuth } from "../../middleware/auth.js";

const loginBodySchema = z.object({
  login: z.string().min(1),
  senha: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post("/auth/login", async (request, reply) => {
    const parseResult = loginBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const { login, senha } = parseResult.data;
    const [user] = await db.select().from(users).where(eq(users.login, login));

    if (!user || !user.ativo || !(await verifyPassword(senha, user.senhaHash))) {
      return reply.code(401).send({ error: "invalid_credentials" });
    }

    const session = await createSession(user.id);

    reply.setCookie(env.SESSION_COOKIE_NAME, session.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      expires: session.expiresAt,
    });

    return reply.send({ id: user.id, login: user.login, tipo: user.tipo, cargo: user.cargo });
  });

  app.post("/auth/logout", { preHandler: [requireAuth] }, async (request, reply) => {
    const sessionId = request.cookies[env.SESSION_COOKIE_NAME];

    if (sessionId) {
      await deleteSession(sessionId);
    }

    reply.clearCookie(env.SESSION_COOKIE_NAME, { path: "/" });

    return reply.code(204).send();
  });

  app.get("/auth/me", { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!;
    return reply.send({ id: user.id, login: user.login, tipo: user.tipo, cargo: user.cargo });
  });
}
