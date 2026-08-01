import { useQuery } from "@tanstack/react-query";
import { listarAvisosAusencia } from "../../api/avisosAusencia";
import { listPerfis } from "../../api/perfis";

export function AvisosAusenciaPage() {
  const { data: avisos, isLoading } = useQuery({ queryKey: ["avisos-ausencia"], queryFn: listarAvisosAusencia });
  const { data: perfis } = useQuery({ queryKey: ["perfis"], queryFn: listPerfis });

  const nomesPorId = new Map((perfis ?? []).map((perfil) => [perfil.id, perfil.nomeCompleto]));

  if (isLoading) {
    return <p className="text-slate-500">Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Avisos de ausência</h2>
      <ul className="space-y-2 text-sm">
        {avisos?.map((aviso) => (
          <li key={aviso.id} className="rounded-md border border-slate-200 p-3">
            <p className="font-medium">{nomesPorId.get(aviso.alunoId) ?? aviso.alunoId}</p>
            {aviso.dataAula && <p className="text-slate-500">Aula de {aviso.dataAula}</p>}
            <p>{aviso.mensagem}</p>
          </li>
        ))}
        {avisos?.length === 0 && <li className="text-slate-400">Nenhum aviso.</li>}
      </ul>
    </div>
  );
}
