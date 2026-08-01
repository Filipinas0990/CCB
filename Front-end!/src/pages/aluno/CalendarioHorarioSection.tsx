import { useQuery } from "@tanstack/react-query";
import { listarCalendario, listarHorario } from "../../api/calendarioHorario";

export function CalendarioHorarioSection() {
  const { data: eventos } = useQuery({ queryKey: ["calendario"], queryFn: listarCalendario });
  const { data: horarios } = useQuery({ queryKey: ["horario"], queryFn: listarHorario });

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-600">Calendário escolar</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {eventos?.map((evento) => (
            <li key={evento.id}>
              {evento.dataInicio} — {evento.titulo}
            </li>
          ))}
          {eventos?.length === 0 && <li className="text-slate-400">Nenhum evento ainda.</li>}
        </ul>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-600">Horário de aula</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {horarios?.map((horario) => (
            <li key={horario.id}>
              {horario.diaSemana}: {horario.horaInicio} às {horario.horaFim}
            </li>
          ))}
          {horarios?.length === 0 && <li className="text-slate-400">Nenhum horário ainda.</li>}
        </ul>
      </div>
    </section>
  );
}
