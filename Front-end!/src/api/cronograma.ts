import { apiFetch } from "./client";

export interface CronogramaItem {
  id: string;
  data: string;
  titulo: string;
  descricao: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CronogramaPayload {
  data: string;
  titulo: string;
  descricao?: string;
}

export function criarCronograma(payload: CronogramaPayload): Promise<CronogramaItem> {
  return apiFetch<CronogramaItem>("/cronograma", { method: "POST", body: JSON.stringify(payload) });
}

export function listarCronograma(): Promise<CronogramaItem[]> {
  return apiFetch<CronogramaItem[]>("/cronograma");
}

export function excluirCronograma(id: string): Promise<void> {
  return apiFetch<void>(`/cronograma/${id}`, { method: "DELETE" });
}
