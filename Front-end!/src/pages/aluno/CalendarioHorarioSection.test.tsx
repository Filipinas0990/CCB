import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CalendarioHorarioSection } from "./CalendarioHorarioSection";

describe("CalendarioHorarioSection", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.endsWith("/calendario")) {
          return new Response(
            JSON.stringify([{ id: "ev1", titulo: "Início do semestre", dataInicio: "2026-08-03" }]),
            { status: 200 },
          );
        }
        if (url.endsWith("/horario")) {
          return new Response(
            JSON.stringify([{ id: "h1", diaSemana: "sabado", horaInicio: "14:00:00", horaFim: "16:00:00" }]),
            { status: 200 },
          );
        }
        throw new Error(`unexpected fetch to ${url}`);
      }),
    );
  });

  it("renders calendário events and horários", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <CalendarioHorarioSection />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("2026-08-03 — Início do semestre")).toBeInTheDocument();
    expect(await screen.findByText("sabado: 14:00:00 às 16:00:00")).toBeInTheDocument();
  });
});
