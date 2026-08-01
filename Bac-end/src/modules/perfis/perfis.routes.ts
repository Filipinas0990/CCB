import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "../../db/client.js";
import { users, perfis } from "../../db/schema.js";
import { hashPassword } from "../../utils/password.js";
import { requireAuth, requireProfessor } from "../../middleware/auth.js";

const enderecoFieldsSchema = {
  nomePai: z.string().optional(),
  nomeMae: z.string().optional(),
  paiBatizado: z.boolean().optional(),
  maeBatizado: z.boolean().optional(),
  dataBatismo: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  telefone: z.string().optional(),
  comum: z.string().optional(),
  instrumento: z.string().optional(),
  anciao: z.string().optional(),
  cooperadorOficial: z.string().optional(),
  cooperadorJovens: z.string().optional(),
  encarregadoLocal: z.string().optional(),
  encarregadoRegional: z.string().optional(),
  examinadoraResponsavel: z.string().optional(),
};

const baseCadastroSchema = z.object({
  login: z.string().min(3),
  senha: z.string().min(6),
  nomeCompleto: z.string().min(1),
  dataNascimento: z.string().min(1),
  ...enderecoFieldsSchema,
});

const alunoCadastroSchema = baseCadastroSchema.extend({
  tipo: z.literal("aluno"),
  turma: z.enum(["irmaos", "irmas"]),
  dataInicioGem: z.string().min(1),
  necessidadeEspecial: z.string().optional(),
  instrutorResponsavel1Id: z.string().uuid().optional(),
  instrutorResponsavel2Id: z.string().uuid().optional(),
});

const professorCadastroSchema = baseCadastroSchema.extend({
  tipo: z.literal("professor"),
  cargo: z.enum(["instrutor", "instrutor_substituto", "encarregado"]),
});

const cadastroBodySchema = z.discriminatedUnion("tipo", [alunoCadastroSchema, professorCadastroSchema]);

export async function perfisRoutes(app: FastifyInstance): Promise<void> {
  app.post("/perfis", { preHandler: [requireAuth, requireProfessor] }, async (request, reply) => {
    const parseResult = cadastroBodySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.code(400).send({ error: "validation_error", details: parseResult.error.flatten() });
    }

    const data = parseResult.data;
    const criadoPor = request.user!.id;

    const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.login, data.login) });
    if (existing) {
      return reply.code(409).send({ error: "login_ja_existe" });
    }

    const senhaHash = await hashPassword(data.senha);

    const created = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          login: data.login,
          senhaHash,
          tipo: data.tipo,
          cargo: data.tipo === "professor" ? data.cargo : null,
        })
        .returning();

      const [perfil] = await tx
        .insert(perfis)
        .values({
          userId: user.id,
          nomeCompleto: data.nomeCompleto,
          dataNascimento: data.dataNascimento,
          nomePai: data.nomePai,
          nomeMae: data.nomeMae,
          paiBatizado: data.paiBatizado,
          maeBatizado: data.maeBatizado,
          dataBatismo: data.dataBatismo,
          endereco: data.endereco,
          cidade: data.cidade,
          uf: data.uf,
          telefone: data.telefone,
          comum: data.comum,
          instrumento: data.instrumento,
          anciao: data.anciao,
          cooperadorOficial: data.cooperadorOficial,
          cooperadorJovens: data.cooperadorJovens,
          encarregadoLocal: data.encarregadoLocal,
          encarregadoRegional: data.encarregadoRegional,
          examinadoraResponsavel: data.examinadoraResponsavel,
          turma: data.tipo === "aluno" ? data.turma : null,
          dataInicioGem: data.tipo === "aluno" ? data.dataInicioGem : null,
          necessidadeEspecial: data.tipo === "aluno" ? data.necessidadeEspecial : null,
          instrutorResponsavel1Id: data.tipo === "aluno" ? data.instrutorResponsavel1Id : null,
          instrutorResponsavel2Id: data.tipo === "aluno" ? data.instrutorResponsavel2Id : null,
          createdBy: criadoPor,
        })
        .returning();

      return { user, perfil };
    });

    return reply.code(201).send({
      id: created.user.id,
      login: created.user.login,
      tipo: created.user.tipo,
      cargo: created.user.cargo,
      nomeCompleto: created.perfil.nomeCompleto,
    });
  });
}
