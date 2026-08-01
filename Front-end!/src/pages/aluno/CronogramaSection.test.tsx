import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CronogramaSection } from "./CronogramaSection";

describe("CronogramaSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify([{ id: "c1", data: "2026-07-20", titulo: "Escalas maiores", descricao: null }]),
            { status: 200 },
          ),
      ),
    );
  });

  it("renders cronograma entries", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CronogramaSection />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("2026-07-20 — Escalas maiores")).toBeInTheDocument();
  });
});
