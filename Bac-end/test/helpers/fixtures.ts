import { buildApp } from "../../src/app.js";
import { createSession } from "../../src/utils/session.js";
import { env } from "../../src/config/env.js";
import { createUserWithSession } from "./auth.js";

export async function createProfessorAndAluno() {
  const professor = await createUserWithSession({ tipo: "professor", cargo: "instrutor" });
  const app = await buildApp();

  const createResponse = await app.inject({
    method: "POST",
    url: "/perfis",
    headers: { cookie: professor.cookie },
    payload: {
      tipo: "aluno",
      login: "aluno.fixture",
      senha: "senha123",
      nomeCompleto: "Aluno Fixture",
      dataNascimento: "2011-01-15",
      turma: "irmas",
      dataInicioGem: "2023-06-01",
    },
  });
  const alunoBody = createResponse.json() as { id: string };
  await app.close();

  const alunoSession = await createSession(alunoBody.id);
  const alunoCookie = `${env.SESSION_COOKIE_NAME}=${alunoSession.id}`;

  return { professor, alunoId: alunoBody.id, alunoCookie };
}
