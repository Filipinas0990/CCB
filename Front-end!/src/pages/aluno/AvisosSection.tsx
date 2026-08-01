import { useQuery } from "@tanstack/react-query";
import { listarAvisos } from "../../api/avisos";

export function AvisosSection() {
  const { data, isLoading } = useQuery({ queryKey: ["avisos"], queryFn: listarAvisos });

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-600">Avisos</h2>
      {isLoading ? (
        <p className="text-sm text-slate-500">Carregando...</p>
      ) : (
        <ul className="mt-2 space-y-2 text-sm">
          {data?.map((aviso) => (
            <li key={aviso.id} className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">{aviso.titulo}</p>
              <p className="text-slate-500">{aviso.mensagem}</p>
            </li>
          ))}
          {data?.length === 0 && <li className="text-slate-400">Nenhum aviso ainda.</li>}
        </ul>
      )}
    </section>
  );
}
