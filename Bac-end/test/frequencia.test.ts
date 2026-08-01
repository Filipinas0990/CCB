import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { pool } from "../src/db/client.js";
import { resetDb } from "./helpers/reset-db.js";
import { createProfessorAndAluno } from "./helpers/fixtures.js";

describe("frequência", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("rejects POST from an aluno session", async () => {
    const { alunoId, alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/frequencia",
      payload: { alunoId, data: "2026-07-20", status: "presente" },
      headers: { cookie: alunoCookie },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("returns 404 when alunoId does not exist", async () => {
    const { professor } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/frequencia",
      payload: { alunoId: "00000000-0000-0000-0000-000000000000", data: "2026-07-20", status: "presente" },
      headers: { cookie: professor.cookie },
    });

    expect(response.statusCode).toBe(404);
    await app.close();
  });

  it("lets a professor lançar frequência and the aluno read their own history", async () => {
    const { professor, alunoId, alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/frequencia",
      payload: { alunoId, data: "2026-07-20", status: "falta", observacao: "não avisou" },
      headers: { cookie: professor.cookie },
    });
    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json()).toMatchObject({ status: "falta", alunoId });

    const listResponse = await app.inject({
      method: "GET",
      url: `/frequencia/${alunoId}`,
      headers: { cookie: alunoCookie },
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);
    expect(listResponse.json()[0]).toMatchObject({ status: "falta" });

    await app.close();
  });

  it("blocks an aluno from reading another aluno's frequência", async () => {
    const { alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/frequencia/00000000-0000-0000-0000-000000000000",
      headers: { cookie: alunoCookie },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });
});
