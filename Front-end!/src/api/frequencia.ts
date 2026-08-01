import { apiFetch } from "./client";

export interface Frequencia {
  id: string;
  alunoId: string;
  data: string;
  status: "presente" | "falta" | "justificada";
  observacao: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CriarFrequenciaPayload {
  alunoId: string;
  data: string;
  status: "presente" | "falta" | "justificada";
  observacao?: string;
}

export function criarFrequencia(payload: CriarFrequenciaPayload): Promise<Frequencia> {
  return apiFetch<Frequencia>("/frequencia", { method: "POST", body: JSON.stringify(payload) });
}

export function listarFrequencia(alunoId: string): Promise<Frequencia[]> {
  return apiFetch<Frequencia[]>(`/frequencia/${alunoId}`);
}
