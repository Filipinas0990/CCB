import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { pool } from "../src/db/client.js";
import { resetDb } from "./helpers/reset-db.js";
import { createProfessorAndAluno } from "./helpers/fixtures.js";

describe("avisos", () => {
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
      url: "/avisos",
      payload: { titulo: "Ensaio geral", mensagem: "Sábado às 14h" },
      headers: { cookie: alunoCookie },
    });

    expect(response.statusCode).toBe(403);
    await app.close();
  });

  it("rejects a payload without mensagem", async () => {
    const { professor } = await createProfessorAndAluno();
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/avisos",
      payload: { titulo: "Ensaio geral" },
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
      url: "/avisos",
      payload: { titulo: "Ensaio geral", mensagem: "Sábado às 14h" },
      headers: { cookie: professor.cookie },
    });
    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json() as { id: string };

    const listResponse = await app.inject({ method: "GET", url: "/avisos", headers: { cookie: alunoCookie } });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/avisos/${created.id}`,
      payload: { mensagem: "Sábado às 15h" },
      headers: { cookie: professor.cookie },
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({ mensagem: "Sábado às 15h" });

    const forbiddenDelete = await app.inject({
      method: "DELETE",
      url: `/avisos/${created.id}`,
      headers: { cookie: alunoCookie },
    });
    expect(forbiddenDelete.statusCode).toBe(403);

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/avisos/${created.id}`,
      headers: { cookie: professor.cookie },
    });
    expect(deleteResponse.statusCode).toBe(204);

    await app.close();
  });
});
