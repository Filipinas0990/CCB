import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { FrequenciaPage } from "./FrequenciaPage";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("FrequenciaPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString();

        if (url.endsWith("/perfis")) {
          return new Response(
            JSON.stringify([
              { id: "aluno-1", login: "aluno1", tipo: "aluno", cargo: null, turma: "irmaos", nomeCompleto: "Aluno Um" },
            ]),
            { status: 200 },
          );
        }
        if (url.endsWith("/frequencia") && init?.method === "POST") {
          return new Response(
            JSON.stringify({ id: "f1", alunoId: "aluno-1", data: "2026-07-20", status: "presente", observacao: null }),
            { status: 201 },
          );
        }
        if (url.endsWith("/frequencia/aluno-1")) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        throw new Error(`unexpected fetch to ${url}`);
      }),
    );
  });

  it("lets a professor lançar frequência for a selected aluno", async () => {
    renderWithQueryClient(<FrequenciaPage />);

    await screen.findByRole("option", { name: "Aluno Um" });
    fireEvent.change(screen.getByLabelText("Aluno"), { target: { value: "aluno-1" } });
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-07-20" } });
    fireEvent.click(screen.getByRole("button", { name: /lançar frequência/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/frequencia"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
