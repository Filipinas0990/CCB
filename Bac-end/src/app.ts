import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import { env } from "./config/env.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { perfisRoutes } from "./modules/perfis/perfis.routes.js";
import { frequenciaRoutes } from "./modules/frequencia/frequencia.routes.js";
import { avisosAusenciaRoutes } from "./modules/avisos-ausencia/avisos-ausencia.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: env.NODE_ENV !== "test" });

  await app.register(cookie, { secret: env.COOKIE_SECRET });
  app.decorateRequest("user", undefined);

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(authRoutes);
  await app.register(perfisRoutes);
  await app.register(frequenciaRoutes);
  await app.register(avisosAusenciaRoutes);

  return app;
}
