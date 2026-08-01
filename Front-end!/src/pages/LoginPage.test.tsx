import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";
import { LoginPage } from "./LoginPage";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = input.toString();

        if (url.endsWith("/auth/me")) {
          return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401 });
        }
        if (url.endsWith("/auth/login")) {
          return new Response(JSON.stringify({ id: "1", login: "aluno1", tipo: "aluno", cargo: null }), {
            status: 200,
          });
        }
        throw new Error(`unexpected fetch to ${url}`);
      }),
    );
  });

  it("submits login credentials on submit", async () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Login"), { target: { value: "aluno1" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "senha123" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("shows an error message on invalid credentials", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = input.toString();
        if (url.endsWith("/auth/me")) {
          return new Response(JSON.stringify({ error: "not_authenticated" }), { status: 401 });
        }
        return new Response(JSON.stringify({ error: "invalid_credentials" }), { status: 401 });
      }),
    );

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Login"), { target: { value: "aluno1" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "errada" } });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("Login ou senha inválidos.")).toBeInTheDocument();
  });
});
