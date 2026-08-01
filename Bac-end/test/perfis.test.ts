import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { pool, db } from "../src/db/client.js";
import { perfis } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { resetDb } from "./helpers/reset-db.js";
import { createUserWithSession } from "./helpers/auth.js";
import { createProfessorAndAluno } from "./helpers/fixtures.js";

const alunoPayload = {
  tipo: "aluno" as const,
  login: "aluno.teste",
  senha: "senha123",
  nomeCompleto: "Aluno de Teste",
  dataNascimento: "2012-05-10",
  turma: "irmaos" as const,
  dataInicioGem: "2024-02-01",
};

const professorPayload = {
  tipo: "professor" as const,
  login: "professor.teste",
  senha: "senha123",
  nomeCompleto: "Professor de Teste",
  dataNascimento: "1985-03-20",
  cargo: "encarregado" as const,
};

afterAll(async () => {
  await pool.end();
});

describe("POST /perfis", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("rejects without a session", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "POST", url: "/perfis", payload: alunoPayload });
    expect(response.statusCode).toBe(401);
    await app.close();
  });

  it("rejects when the session belongs to an aluno", async () => {
    const { cookie } = await createUserWithSession({ tipo: "aluno" });
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/perfis",
      payload: alunoPayload,
      headers: { cookie },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("rejects an incomplete payload", async () => {
    const { cookie } = await createUserWithSession();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/perfis",
      payload: { tipo: "aluno", login: "aluno.incompleto" },
      headers: { cookie },
    });

    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("creates an aluno with turma and data de início no GEM", async () => {
    const { cookie, user: professor } = await createUserWithSession();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/perfis",
      payload: alunoPayload,
      headers: { cookie },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ tipo: "aluno", login: "aluno.teste" });

    const [row] = await db.select().from(perfis).where(eq(perfis.nomeCompleto, "Aluno de Teste"));
    expect(row.turma).toBe("irmaos");
    expect(row.createdBy).toBe(professor.id);

    await app.close();
  });

  it("creates a professor with cargo and no turma", async () => {
    const { cookie } = await createUserWithSession();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/perfis",
      payload: professorPayload,
      headers: { cookie },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ tipo: "professor", cargo: "encarregado" });

    const [row] = await db.select().from(perfis).where(eq(perfis.nomeCompleto, "Professor de Teste"));
    expect(row.turma).toBeNull();

    await app.close();
  });

  it("rejects a duplicate login", async () => {
    const { cookie } = await createUserWithSession();
    const app = await buildApp();

    await app.inject({ method: "POST", url: "/perfis", payload: alunoPayload, headers: { cookie } });
    const response = await app.inject({
      method: "POST",
      url: "/perfis",
      payload: alunoPayload,
      headers: { cookie },
    });

    expect(response.statusCode).toBe(409);
    await app.close();
  });
});

describe("GET /perfis/:id and GET /perfis", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("lets an aluno read their own perfil", async () => {
    const { alunoId, alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: `/perfis/${alunoId}`,
      headers: { cookie: alunoCookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ id: alunoId, nomeCompleto: "Aluno Fixture" });
    await app.close();
  });

  it("blocks an aluno from reading another perfil", async () => {
    const { professor, alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: `/perfis/${professor.user.id}`,
      headers: { cookie: alunoCookie },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("lets a professor read any perfil", async () => {
    const { professor, alunoId } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: `/perfis/${alunoId}`,
      headers: { cookie: professor.cookie },
    });

    expect(response.statusCode).toBe(200);
    await app.close();
  });

  it("blocks an aluno from listing all perfis", async () => {
    const { alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/perfis", headers: { cookie: alunoCookie } });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("lets a professor list all perfis", async () => {
    const { professor, alunoId } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/perfis", headers: { cookie: professor.cookie } });

    expect(response.statusCode).toBe(200);
    // createProfessorAndAluno only creates a `perfis` row for the aluno (via the
    // real POST /perfis flow); the professor actor comes from the raw test
    // helper and has no `perfis` row, so it's correctly excluded from this
    // inner-joined listing.
    expect(response.json()).toMatchObject([{ id: alunoId }]);
    await app.close();
  });
});
