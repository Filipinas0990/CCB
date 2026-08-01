import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import { env } from "./config/env.js";
import { authRoutes } from "./modules/auth/auth.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: env.NODE_ENV !== "test" });

  await app.register(cookie, { secret: env.COOKIE_SECRET });
  app.decorateRequest("user", undefined);

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(authRoutes);

  return app;
}
