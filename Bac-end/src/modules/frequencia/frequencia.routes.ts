import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { users, frequencia } from "../../db/schema.js";
import { requireAuth, requireProfessor } from "../../middleware/auth.js";

const idParamSchema = z.object({ alunoId: z.string().uuid() });

const criarFrequenciaSchema = z.object({
  alunoId: z.string().uuid(),
  data: z.string().min(1),
  status: z.enum(["presente", "falta", "justificada"]),
  observacao: z.string().optional(),
});

export async function frequenciaRoutes(app: FastifyInstance): Promise<void> {
  app.post("/frequencia", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const parseResult = criarFrequenciaSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const data = parseResult.data;

    const [aluno] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, data.alunoId), eq(users.tipo, "aluno")));
    if (!aluno) {
      return reply.code(404).send({ error: "aluno_not_found" });
    }

    const [created] = await db
      .insert(frequencia)
      .values({
        alunoId: data.alunoId,
        data: data.data,
        status: data.status,
        observacao: data.observacao,
        createdBy: request.user!.id,
      })
      .returning();

    return reply.code(201).send(created);
  });

  app.get("/frequencia/:alunoId", { preHandler: [requireAuth] }, async (request, reply) => {
    const paramsResult = idParamSchema.safeParse(request.params);
    if (!paramsResult.success) {
      return reply.code(400).send({ error: "validation_error" });
    }
    const { alunoId } = paramsResult.data;

    if (request.user!.tipo === "aluno" && request.user!.id !== alunoId) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const rows = await db
      .select()
      .from(frequencia)
      .where(eq(frequencia.alunoId, alunoId))
      .orderBy(desc(frequencia.data));

    return reply.send(rows);
  });
}
