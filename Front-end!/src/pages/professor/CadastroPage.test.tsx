import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { CadastroPage } from "./CadastroPage";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CadastroPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ id: "1", login: "aluno.novo", tipo: "aluno" }), { status: 201 }),
      ),
    );
  });

  it("submits the aluno cadastro payload", async () => {
    renderWithQueryClient(<CadastroPage />);

    fireEvent.change(screen.getByLabelText("Login"), { target: { value: "aluno.novo" } });
    fireEvent.change(screen.getByLabelText("Senha inicial"), { target: { value: "senha123" } });
    fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Novo Aluno" } });
    fireEvent.change(screen.getByLabelText("Nascimento"), { target: { value: "2012-01-01" } });
    fireEvent.change(screen.getByLabelText("Início no GEM"), { target: { value: "2026-02-01" } });

    fireEvent.click(screen.getByRole("button", { name: /salvar cadastro/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/perfis"),
        expect.objectContaining({ method: "POST" }),
      );
    });
    expect(await screen.findByText("Cadastro criado para aluno.novo.")).toBeInTheDocument();
  });
});
