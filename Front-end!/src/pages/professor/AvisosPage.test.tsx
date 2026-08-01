import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AvisosPage } from "./AvisosPage";

describe("AvisosPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = input.toString();
        if (url.endsWith("/avisos") && init?.method === "POST") {
          return new Response(
            JSON.stringify({ id: "av1", titulo: "Ensaio geral", mensagem: "Sábado às 14h" }),
            { status: 201 },
          );
        }
        if (url.endsWith("/avisos")) {
          return new Response(JSON.stringify([]), { status: 200 });
        }
        throw new Error(`unexpected fetch to ${url}`);
      }),
    );
  });

  it("creates an aviso geral", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <AvisosPage />
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Ensaio geral" } });
    fireEvent.change(screen.getByLabelText("Mensagem"), { target: { value: "Sábado às 14h" } });
    fireEvent.click(screen.getByRole("button", { name: /publicar aviso/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/avisos"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });
});
