import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AvisosAusenciaPage } from "./AvisosAusenciaPage";

describe("AvisosAusenciaPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.endsWith("/avisos-ausencia")) {
          return new Response(
            JSON.stringify([{ id: "a1", alunoId: "aluno-1", dataAula: "2026-07-20", mensagem: "Vou faltar" }]),
            { status: 200 },
          );
        }
        if (url.endsWith("/perfis")) {
          return new Response(
            JSON.stringify([
              { id: "aluno-1", login: "aluno1", tipo: "aluno", cargo: null, turma: "irmaos", nomeCompleto: "Aluno Um" },
            ]),
            { status: 200 },
          );
        }
        throw new Error(`unexpected fetch to ${url}`);
      }),
    );
  });

  it("lists avisos de ausência with the aluno's name", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AvisosAusenciaPage />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Aluno Um")).toBeInTheDocument();
    expect(screen.getByText("Vou faltar")).toBeInTheDocument();
  });
});
