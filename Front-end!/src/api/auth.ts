import { apiFetch } from "./client";

export interface SessionUser {
  id: string;
  login: string;
  tipo: "aluno" | "professor";
  cargo: "instrutor" | "instrutor_substituto" | "encarregado" | null;
}

export function me(): Promise<SessionUser> {
  return apiFetch<SessionUser>("/auth/me");
}

export function login(loginValue: string, senha: string): Promise<SessionUser> {
  return apiFetch<SessionUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ login: loginValue, senha }),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>("/auth/logout", { method: "POST" });
}
