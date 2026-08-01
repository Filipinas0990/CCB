import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { db } from "../../db/client.js";
import { avisosAusencia } from "../../db/schema.js";
import { requireAuth, requireProfessor } from "../../middleware/auth.js";

const criarAvisoAusenciaSchema = z.object({
  dataAula: z.string().optional(),
  mensagem: z.string().min(1),
});

export async function avisosAusenciaRoutes(app: FastifyInstance): Promise<void> {
  app.post("/avisos-ausencia", { preHandler: [requireAuth] }, async (request, reply) => {
    if (request.user!.tipo !== "aluno") {
      return reply.code(403).send({ error: "forbidden" });
    }

    const parseResult = criarAvisoAusenciaSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const [created] = await db
      .insert(avisosAusencia)
      .values({
        alunoId: request.user!.id,
        dataAula: parseResult.data.dataAula,
        mensagem: parseResult.data.mensagem,
      })
      .returning();

    return reply.code(201).send(created);
  });

  app.get("/avisos-ausencia", { preHandler: [requireAuth, requireProfessor] }, async (_request, reply) => {
    const rows = await db.select().from(avisosAusencia).orderBy(desc(avisosAusencia.createdAt));
    return reply.send(rows);
  });
}
