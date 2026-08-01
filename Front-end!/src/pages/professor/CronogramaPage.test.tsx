import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CronogramaPage } from "./CronogramaPage";

describe("CronogramaPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString();
        if (url.endsWith("/cronograma") && init?.method === "POST") {
          return new Response(
            JSON.stringify({ id: "c1", data: "2026-07-20", titulo: "Escalas maiores", descricao: null }),
            { status: 201 },
          );
        }
        if (url.endsWith("/cronograma")) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        throw new Error(`unexpected fetch to ${url}`);
      }),
    );
  });

  it("creates a cronograma entry", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CronogramaPage />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-07-20" } });
    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Escalas maiores" } });
    fireEvent.click(screen.getByRole("button", { name: /adicionar ao cronograma/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/cronograma"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
