import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { calendarioEscolar } from "../../db/schema.js";
import { requireAuth, requireProfessor } from "../../middleware/auth.js";

const idParamSchema = z.object({ id: z.string().uuid() });

const calendarioBodySchema = z.object({
  titulo: z.string().min(1),
  dataInicio: z.string().min(1),
  dataFim: z.string().optional(),
  descricao: z.string().optional(),
});

export async function calendarioRoutes(app: FastifyInstance): Promise<void> {
  app.post("/calendario", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const parseResult = calendarioBodySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [created] = await db
      .insert(calendarioEscolar)
      .values({ ...parseResult.data, createdBy: request.user!.id })
      .returning();

    return reply.code(201).send(created);
  });

  app.get("/calendario", { preHandler: [requireAuth] }, async (_request, reply) => {
    const rows = await db.select().from(calendarioEscolar).orderBy(asc(calendarioEscolar.dataInicio));
    return reply.send(rows);
  });

  app.patch("/calendario/:id", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }

    const parseResult = calendarioBodySchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [updated] = await db
      .update(calendarioEscolar)
      .set({ ...parseResult.data, updatedAt: new Date() })
      .where(eq(calendarioEscolar.id, paramsResult.data.id))
      .returning();

    if (!updated) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.send(updated);
  });

  app.delete("/calendario/:id", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }

    const [deleted] = await db
      .delete(calendarioEscolar)
      .where(eq(calendarioEscolar.id, paramsResult.data.id))
      .returning();

    if (!deleted) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.code(204).send();
  });
}
