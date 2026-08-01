import { useQuery } from "@tanstack/react-query";
import { listarCronograma } from "../../api/cronograma";

export function CronogramaSection() {
  const { data, isLoading } = useQuery({ queryKey: ["cronograma"], queryFn: listarCronograma });

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-600">Cronograma de aula</h2>
      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {data?.map((item) => (
            <li key={item.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">
                {item.data} — {item.titulo}
              </p>
              {item.descricao && <p className="text-slate-500">{item.descricao}</p>}
            </li>
          ))}
          {data?.length === 0 && <li className="text-slate-400">Nenhum lançamento ainda.</li>}
        </ul>
      )}
    </section>
  );
}
