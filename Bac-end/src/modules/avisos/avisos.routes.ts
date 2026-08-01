import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { avisos } from "../../db/schema.js";
import { requireAuth, requireProfessor } from "../../middleware/auth.js";

const idParamSchema = z.object({ id: z.string().uuid() });

const avisoBodySchema = z.object({
  titulo: z.string().min(1),
  mensagem: z.string().min(1),
});

export async function avisosRoutes(app: FastifyInstance): Promise<void> {
  app.post("/avisos", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const parseResult = avisoBodySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [created] = await db
      .insert(avisos)
      .values({ ...parseResult.data, createdBy: request.user!.id })
      .returning();

    return reply.code(201).send(created);
  });

  app.get("/avisos", { preHandler: [requireAuth] }, async (_request, reply) => {
    const rows = await db.select().from(avisos).orderBy(desc(avisos.createdAt));
    return reply.send(rows);
  });

  app.patch("/avisos/:id", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }

    const parseResult = avisoBodySchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [updated] = await db
      .update(avisos)
      .set({ ...parseResult.data, updatedAt: new Date() })
      .where(eq(avisos.id, paramsResult.data.id))
      .returning();

    if (!updated) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.send(updated);
  });

  app.delete("/avisos/:id", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }

    const [deleted] = await db.delete(avisos).where(eq(avisos.id, paramsResult.data.id)).returning();

    if (!deleted) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.code(204).send();
  });
}
