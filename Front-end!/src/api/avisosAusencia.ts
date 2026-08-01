import { apiFetch } from "./client";

export interface AvisoAusencia {
  id: string;
  alunoId: string;
  dataAula: string | null;
  mensagem: string;
  createdAt: string;
}

export interface CriarAvisoAusenciaPayload {
  dataAula?: string;
  mensagem: string;
}

export function enviarAvisoAusencia(payload: CriarAvisoAusenciaPayload): Promise<AvisoAusencia> {
  return apiFetch<AvisoAusencia>("/avisos-ausencia", { method: "POST", body: JSON.stringify(payload) });
}

export function listarAvisosAusencia(): Promise<AvisoAusencia[]> {
  return apiFetch<AvisoAusencia[]>("/avisos-ausencia");
}
