import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AvisosSection } from "./AvisosSection";

describe("AvisosSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify([{ id: "av1", titulo: "Ensaio geral", mensagem: "Sábado às 14h" }]), {
            status: 200,
          }),
      ),
    );
  });

  it("renders published avisos", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AvisosSection />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("Ensaio geral")).toBeInTheDocument();
  });
});
