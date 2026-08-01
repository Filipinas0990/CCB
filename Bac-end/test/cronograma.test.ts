import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { pool } from "../src/db/client.js";
import { resetDb } from "./helpers/reset-db.js";
import { createProfessorAndAluno } from "./helpers/fixtures.js";

describe("cronograma", () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  it("rejects creation from an aluno session", async () => {
    const { alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/cronograma",
      payload: { data: "2026-07-20", titulo: "Escalas maiores" },
      headers: { cookie: alunoCookie },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("rejects a payload without titulo", async () => {
    const { professor } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/cronograma",
      payload: { data: "2026-07-20" },
      headers: { cookie: professor.cookie },
    });

    expect(response.statusCode).toBe(400);
    await app.close();
  });

  it("lets a professor create, update and delete, and an aluno only read", async () => {
    const { professor, alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/cronograma",
      payload: { data: "2026-07-20", titulo: "Escalas maiores", descricao: "Dó, Ré, Mi" },
      headers: { cookie: professor.cookie },
    });
    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json() as { id: string };

    const listResponse = await app.inject({ method: "GET", url: "/cronograma", headers: { cookie: alunoCookie } });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/cronograma/${created.id}`,
      payload: { titulo: "Escalas menores" },
      headers: { cookie: professor.cookie },
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({ titulo: "Escalas menores" });

    const forbiddenUpdate = await app.inject({
      method: "PATCH",
      url: `/cronograma/${created.id}`,
      payload: { titulo: "Não deveria funcionar" },
      headers: { cookie: alunoCookie },
    });
    expect(forbiddenUpdate.statusCode).toBe(403);

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/cronograma/${created.id}`,
      headers: { cookie: professor.cookie },
    });
    expect(deleteResponse.statusCode).toBe(204);

    const emptyListResponse = await app.inject({ method: "GET", url: "/cronograma", headers: { cookie: alunoCookie } });
    expect(emptyListResponse.json()).toHaveLength(0);

    await app.close();
  });

  it("returns 404 when updating an unknown cronograma entry", async () => {
    const { professor } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "PATCH",
      url: "/cronograma/00000000-0000-0000-0000-000000000000",
      payload: { titulo: "x" },
      headers: { cookie: professor.cookie },
    });

    expect(response.statusCode).toBe(404);
    await app.close();
  });
});
