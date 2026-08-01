import { useQuery } from "@tanstack/react-query";
import { listarFrequencia } from "../../api/frequencia";

export function FrequenciaSection({ alunoId }: { alunoId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["frequencia", alunoId],
    queryFn: () => listarFrequencia(alunoId),
  });

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-600">Frequência</h2>
      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <ul className="mt-2 space-y-1 text-sm">
          {data?.map((item) => (
            <li key={item.id} className="flex justify-between border-b border-slate-100 py-1">
              <span>{item.data}</span>
              <span className="capitalize">{item.status}</span>
            </li>
          ))}
          {data?.length === 0 && <li className="text-slate-400">Nenhum registro ainda.</li>}
        </ul>
      )}
    </section>
  );
}
