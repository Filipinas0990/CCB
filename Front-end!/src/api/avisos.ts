import { apiFetch } from "./client";

export interface AvisoGeral {
  id: string;
  titulo: string;
  mensagem: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvisoGeralPayload {
  titulo: string;
  mensagem: string;
}

export function criarAviso(payload: AvisoGeralPayload): Promise<AvisoGeral> {
  return apiFetch<AvisoGeral>("/avisos", { method: "POST", body: JSON.stringify(payload) });
}

export function listarAvisos(): Promise<AvisoGeral[]> {
  return apiFetch<AvisoGeral[]>("/avisos");
}

export function excluirAviso(id: string): Promise<void> {
  return apiFetch<void>(`/avisos/${id}`, { method: "DELETE" });
}
