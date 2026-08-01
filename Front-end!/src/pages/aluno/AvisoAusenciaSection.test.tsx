import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AvisoAusenciaSection } from "./AvisoAusenciaSection";

describe("AvisoAusenciaSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ id: "a1", alunoId: "aluno-1", dataAula: null, mensagem: "Vou faltar" }),
            { status: 201 },
          ),
      ),
    );
  });

  it("sends an aviso de ausência", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AvisoAusenciaSection />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("Mensagem"), { target: { value: "Vou faltar" } });
    fireEvent.click(screen.getByRole("button", { name: /enviar aviso/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/avisos-ausencia"),
        expect.objectContaining({ method: "POST" }),
      );
    });
    expect(await screen.findByText("Aviso enviado para a equipe.")).toBeInTheDocument();
  });
});
