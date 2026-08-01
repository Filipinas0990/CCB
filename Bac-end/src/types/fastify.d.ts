import type { User } from "../db/schema.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
  }
}
