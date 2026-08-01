import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { horarioAula } from "../../db/schema.js";
import { requireAuth, requireProfessor } from "../../middleware/auth.js";

const idParamSchema = z.object({ id: z.string().uuid() });

const horarioBodySchema = z.object({
  diaSemana: z.string().min(1),
  horaInicio: z.string().min(1),
  horaFim: z.string().min(1),
  descricao: z.string().optional(),
});

export async function horarioRoutes(app: FastifyInstance): Promise<void> {
  app.post("/horario", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const parseResult = horarioBodySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [created] = await db
      .insert(horarioAula)
      .values({ ...parseResult.data, createdBy: request.user!.id })
      .returning();

    return reply.code(201).send(created);
  });

  app.get("/horario", { preHandler: [requireAuth] }, async (_request, reply) => {
    const rows = await db.select().from(horarioAula).orderBy(asc(horarioAula.diaSemana));
    return reply.send(rows);
  });

  app.patch("/horario/:id", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }

    const parseResult = horarioBodySchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [updated] = await db
      .update(horarioAula)
      .set({ ...parseResult.data, updatedAt: new Date() })
      .where(eq(horarioAula.id, paramsResult.data.id))
      .returning();

    if (!updated) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.send(updated);
  });

  app.delete("/horario/:id", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }

    const [deleted] = await db.delete(horarioAula).where(eq(horarioAula.id, paramsResult.data.id)).returning();

    if (!deleted) {
      return reply.code(404).send({ error: "not_found" });
    }

    return reply.code(204).send();
  });
}
