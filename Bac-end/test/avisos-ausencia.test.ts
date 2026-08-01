import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { pool } from "../src/db/client.js";
import { resetDb } from "./helpers/reset-db.js";
import { createProfessorAndAluno } from "./helpers/fixtures.js";

describe("aviso de ausência", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("rejects POST from a professor session", async () => {
    const { professor } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/avisos-ausencia",
      payload: { mensagem: "Vou faltar" },
      headers: { cookie: professor.cookie },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("rejects an empty mensagem", async () => {
    const { alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/avisos-ausencia",
      payload: { mensagem: "" },
      headers: { cookie: alunoCookie },
    });

    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("lets an aluno send an aviso and a professor list it", async () => {
    const { professor, alunoId, alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/avisos-ausencia",
      payload: { dataAula: "2026-07-20", mensagem: "Vou faltar por motivo de saúde" },
      headers: { cookie: alunoCookie },
    });
    expect(createResponse.statusCode).toBe(201);
    expect(createResponse.json()).toMatchObject({ alunoId, mensagem: "Vou faltar por motivo de saúde" });

    const listResponse = await app.inject({
      method: "GET",
      url: "/avisos-ausencia",
      headers: { cookie: professor.cookie },
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    await app.close();
  });

  it("blocks an aluno from listing avisos de ausência", async () => {
    const { alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({ method: "GET", url: "/avisos-ausencia", headers: { cookie: alunoCookie } });

    expect(response.statusCode).toBe(403);
    await app.close();
  });
});
