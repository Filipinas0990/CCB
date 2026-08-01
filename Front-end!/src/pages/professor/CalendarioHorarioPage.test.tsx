import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CalendarioHorarioPage } from "./CalendarioHorarioPage";

describe("CalendarioHorarioPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString();
        if (url.endsWith("/calendario") && init?.method === "POST") {
          return new Response(
            JSON.stringify({ id: "ev1", titulo: "Início do semestre", dataInicio: "2026-08-03" }),
            { status: 201 },
          );
        }
        if (url.endsWith("/calendario")) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        if (url.endsWith("/horario")) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        throw new Error(`unexpected fetch to ${url}`);
      }),
    );
  });

  it("creates a calendário event", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CalendarioHorarioPage />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Início do semestre" } });
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-08-03" } });
    fireEvent.click(screen.getByRole("button", { name: /adicionar evento/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/calendario"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
