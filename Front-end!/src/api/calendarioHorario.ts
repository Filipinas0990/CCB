import { apiFetch } from "./client";

export interface CalendarioEvento {
  id: string;
  titulo: string;
  dataInicio: string;
  dataFim: string | null;
  descricao: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarioPayload {
  titulo: string;
  dataInicio: string;
  dataFim?: string;
  descricao?: string;
}

export function criarEventoCalendario(payload: CalendarioPayload): Promise<CalendarioEvento> {
  return apiFetch<CalendarioEvento>("/calendario", { method: "POST", body: JSON.stringify(payload) });
}

export function listarCalendario(): Promise<CalendarioEvento[]> {
  return apiFetch<CalendarioEvento[]>("/calendario");
}

export function excluirEventoCalendario(id: string): Promise<void> {
  return apiFetch<void>(`/calendario/${id}`, { method: "DELETE" });
}

export interface HorarioAula {
  id: string;
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  descricao: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HorarioPayload {
  diaSemana: string;
  horaInicio: string;
  horaFim: string;
  descricao?: string;
}

export function criarHorario(payload: HorarioPayload): Promise<HorarioAula> {
  return apiFetch<HorarioAula>("/horario", { method: "POST", body: JSON.stringify(payload) });
}

export function listarHorario(): Promise<HorarioAula[]> {
  return apiFetch<HorarioAula[]>("/horario");
}

export function excluirHorario(id: string): Promise<void> {
  return apiFetch<void>(`/horario/${id}`, { method: "DELETE" });
}
