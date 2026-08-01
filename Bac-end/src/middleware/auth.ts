import type { FastifyReply, FastifyRequest } from "fastify";
import { getSessionUser } from "../utils/session.js";
import { env } from "../config/env.js";

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const sessionId = request.cookies[env.SESSION_COOKIE_NAME];

  if (!sessionId) {
    return reply.code(401).send({ error: "not_authenticated" });
  }

  const user = await getSessionUser(sessionId);

  if (!user || !user.ativo) {
    return reply.code(401).send({ error: "not_authenticated" });
  }

  request.user = user;
}

export async function requireProfessor(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (request.user?.tipo !== "professor") {
    return reply.code(403).send({ error: "forbidden" });
  }
}
