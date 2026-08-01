import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { PessoasPage } from "./PessoasPage";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("PessoasPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([
              { id: "1", login: "aluno1", tipo: "aluno", cargo: null, turma: "irmaos", nomeCompleto: "Aluno Um" },
            ]),
            { status: 200 },
          ),
      ),
    );
  });

  it("lists cadastro entries", async () => {
    renderWithQueryClient(<PessoasPage />);

    expect(await screen.findByText("Aluno Um")).toBeInTheDocument();
    expect(screen.getByText("aluno1")).toBeInTheDocument();
  });
});
