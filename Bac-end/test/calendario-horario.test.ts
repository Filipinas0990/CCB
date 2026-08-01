import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { pool } from "../src/db/client.js";
import { resetDb } from "./helpers/reset-db.js";
import { createProfessorAndAluno } from "./helpers/fixtures.js";

afterAll(async () => {
  await pool.end();
});

describe("calendário escolar", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("lets a professor manage events and an aluno only read", async () => {
    const { professor, alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/calendario",
      payload: { titulo: "Início do semestre", dataInicio: "2026-08-03" },
      headers: { cookie: professor.cookie },
    });
    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json() as { id: string };

    const forbiddenCreate = await app.inject({
      method: "POST",
      url: "/calendario",
      payload: { titulo: "Não deveria", dataInicio: "2026-08-03" },
      headers: { cookie: alunoCookie },
    });
    expect(forbiddenCreate.statusCode).toBe(403);

    const listResponse = await app.inject({ method: "GET", url: "/calendario", headers: { cookie: alunoCookie } });
    expect(listResponse.json()).toHaveLength(1);

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/calendario/${created.id}`,
      headers: { cookie: professor.cookie },
    });
    expect(deleteResponse.statusCode).toBe(204);

    await app.close();
  });
});

describe("horário de aula", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("lets a professor manage horários and an aluno only read", async () => {
    const { professor, alunoCookie } = await createProfessorAndAluno();
    const app = await buildApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/horario",
      payload: { diaSemana: "sabado", horaInicio: "14:00", horaFim: "16:00", descricao: "Turma Irmãs" },
      headers: { cookie: professor.cookie },
    });
    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json() as { id: string };

    const updateResponse = await app.inject({
      method: "PATCH",
      url: `/horario/${created.id}`,
      payload: { horaFim: "17:00" },
      headers: { cookie: professor.cookie },
    });
    expect(updateResponse.statusCode).toBe(200);
    expect((updateResponse.json() as { horaFim: string }).horaFim).toContain("17:00");

    const forbiddenUpdate = await app.inject({
      method: "PATCH",
      url: `/horario/${created.id}`,
      payload: { horaFim: "18:00" },
      headers: { cookie: alunoCookie },
    });
    expect(forbiddenUpdate.statusCode).toBe(403);

    const listResponse = await app.inject({ method: "GET", url: "/horario", headers: { cookie: alunoCookie } });
    expect(listResponse.json()).toHaveLength(1);

    await app.close();
  });
});
