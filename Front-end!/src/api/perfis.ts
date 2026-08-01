import { apiFetch } from "./client";

export interface Perfil {
  id: string;
  login: string;
  tipo: "aluno" | "professor";
  cargo: "instrutor" | "instrutor_substituto" | "encarregado" | null;
  ativo: boolean;
  nomeCompleto: string;
  dataNascimento: string;
  turma: "irmaos" | "irmas" | null;
}

export interface CadastroPayload {
  tipo: "aluno" | "professor";
  login: string;
  senha: string;
  nomeCompleto: string;
  dataNascimento: string;
  nomePai?: string;
  nomeMae?: string;
  paiBatizado?: boolean;
  maeBatizado?: boolean;
  dataBatismo?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  telefone?: string;
  comum?: string;
  instrumento?: string;
  anciao?: string;
  cooperadorOficial?: string;
  cooperadorJovens?: string;
  encarregadoLocal?: string;
  encarregadoRegional?: string;
  examinadoraResponsavel?: string;
  cargo?: "instrutor" | "instrutor_substituto" | "encarregado";
  turma?: "irmaos" | "irmas";
  dataInicioGem?: string;
  necessidadeEspecial?: string;
}

export function createPerfil(payload: CadastroPayload): Promise<Perfil> {
  return apiFetch<Perfil>("/perfis", { method: "POST", body: JSON.stringify(payload) });
}

export function listPerfis(): Promise<Perfil[]> {
  return apiFetch<Perfil[]>("/perfis");
}

export function resetSenha(id: string, senha: string): Promise<void> {
  return apiFetch<void>(`/perfis/${id}/senha`, { method: "PATCH", body: JSON.stringify({ senha }) });
}
