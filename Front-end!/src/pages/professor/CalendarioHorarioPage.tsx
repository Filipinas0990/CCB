import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  criarEventoCalendario,
  criarHorario,
  excluirEventoCalendario,
  excluirHorario,
  listarCalendario,
  listarHorario,
} from "../../api/calendarioHorario";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function CalendarioHorarioPage() {
  const queryClient = useQueryClient();

  const { data: eventos } = useQuery({ queryKey: ["calendario"], queryFn: listarCalendario });
  const { data: horarios } = useQuery({ queryKey: ["horario"], queryFn: listarHorario });

  const [tituloEvento, setTituloEvento] = useState("");
  const [dataInicio, setDataInicio] = useState("");

  const criarEventoMutation = useMutation({
    mutationFn: criarEventoCalendario,
    onSuccess: () => {
      setTituloEvento("");
      setDataInicio("");
      queryClient.invalidateQueries({ queryKey: ["calendario"] });
    },
  });

  const excluirEventoMutation = useMutation({
    mutationFn: excluirEventoCalendario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calendario"] }),
  });

  const [diaSemana, setDiaSemana] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");

  const criarHorarioMutation = useMutation({
    mutationFn: criarHorario,
    onSuccess: () => {
      setDiaSemana("");
      setHoraInicio("");
      setHoraFim("");
      queryClient.invalidateQueries({ queryKey: ["horario"] });
    },
  });

  const excluirHorarioMutation = useMutation({
    mutationFn: excluirHorario,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["horario"] }),
  });

  function handleSubmitEvento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tituloEvento || !dataInicio) return;
    criarEventoMutation.mutate({ titulo: tituloEvento, dataInicio });
  }

  function handleSubmitHorario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!diaSemana || !horaInicio || !horaFim) return;
    criarHorarioMutation.mutate({ diaSemana, horaInicio, horaFim });
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h2 className="text-lg font-semibold">Calendário escolar</h2>
        <form onSubmit={handleSubmitEvento} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label htmlFor="tituloEvento" className="text-sm font-medium">
              Título
            </label>
            <Input id="tituloEvento" value={tituloEvento} onChange={(e) => setTituloEvento(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label htmlFor="dataInicio" className="text-sm font-medium">
              Data
            </label>
            <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
          </div>
          <Button type="submit" disabled={criarEventoMutation.isPending}>
            {criarEventoMutation.isPending ? "Salvando..." : "Adicionar evento"}
          </Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {eventos?.map((evento) => (
            <li key={evento.id} className="flex items-start justify-between rounded-md border border-slate-200 p-3">
              <span>
                {evento.dataInicio} — {evento.titulo}
              </span>
              <Button
                type="button"
                onClick={() => excluirEventoMutation.mutate(evento.id)}
                className="bg-slate-200 text-slate-900 hover:bg-slate-300"
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Horário de aula</h2>
        <form onSubmit={handleSubmitHorario} className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label htmlFor="diaSemana" className="text-sm font-medium">
                Dia da semana
              </label>
              <Input id="diaSemana" value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label htmlFor="horaInicio" className="text-sm font-medium">
                Início
              </label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="horaFim" className="text-sm font-medium">
                Fim
              </label>
              <Input id="horaFim" type="time" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" disabled={criarHorarioMutation.isPending}>
            {criarHorarioMutation.isPending ? "Salvando..." : "Adicionar horário"}
          </Button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {horarios?.map((horario) => (
            <li key={horario.id} className="flex items-start justify-between rounded-md border border-slate-200 p-3">
              <span>
                {horario.diaSemana}: {horario.horaInicio} às {horario.horaFim}
              </span>
              <Button
                type="button"
                onClick={() => excluirHorarioMutation.mutate(horario.id)}
                className="bg-slate-200 text-slate-900 hover:bg-slate-300"
              >
                Remover
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
