import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { cronograma } from "../../db/schema.js";
import { requireAuth, requireProfessor } from "../../middleware/auth.js";

const idParamSchema = z.object({ id: z.string().uuid() });

const cronogramaBodySchema = z.object({
  data: z.string().min(1),
  titulo: z.string().min(1),
  descricao: z.string().optional(),
});

export async function cronogramaRoutes(app: FastifyInstance): Promise<void> {
  app.post("/cronograma", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const parseResult = cronogramaBodySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [created] = await db
      .insert(cronograma)
      .values({ ...parseResult.data, createdBy: request.user!.id })
      .returning();

    return reply.code(201).send(created);
  });

  app.get("/cronograma", { preHandler: [requireAuth] }, async (_request, reply) => {
    const rows = await db.select().from(cronograma).orderBy(desc(cronograma.data));
    return reply.send(rows);
  });

  app.patch("/cronograma/:id", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }

    const parseResult = cronogramaBodySchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [updated] = await db
      .update(cronograma)
      .set({ ...parseResult.data, updatedAt: new Date() })
      .where(eq(cronograma.id, paramsResult.data.id))
      .returning();

    if (!updated) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.send(updated);
  });

  app.delete("/cronograma/:id", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }

    const [deleted] = await db.delete(cronograma).where(eq(cronograma.id, paramsResult.data.id)).returning();

    if (!deleted) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.code(204).send();
  });
}
