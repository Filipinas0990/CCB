import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FrequenciaSection } from "./FrequenciaSection";

describe("FrequenciaSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([{ id: "f1", alunoId: "aluno-1", data: "2026-07-20", status: "presente", observacao: null }]),
            { status: 200 },
          ),
      ),
    );
  });

  it("renders the aluno's own frequência history", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <FrequenciaSection alunoId="aluno-1" />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("2026-07-20")).toBeInTheDocument();
  });
});
