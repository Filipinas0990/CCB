import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPerfis } from "../../api/perfis";
import { criarFrequencia, listarFrequencia, type CriarFrequenciaPayload } from "../../api/frequencia";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function FrequenciaPage() {
  const { data: perfis } = useQuery({ queryKey: ["perfis"], queryFn: listPerfis });
  const alunos = perfis?.filter((perfil) => perfil.tipo === "aluno") ?? [];

  const [alunoId, setAlunoId] = useState("");
  const [data, setData] = useState("");
  const [status, setStatus] = useState<CriarFrequenciaPayload["status"]>("presente");
  const [observacao, setObservacao] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const historicoQuery = useQuery({
    queryKey: ["frequencia", alunoId],
    queryFn: () => listarFrequencia(alunoId),
    enabled: alunoId.length > 0,
  });

  const mutation = useMutation({
    mutationFn: criarFrequencia,
    onSuccess: () => {
      setErrorMessage(null);
      setObservacao("");
      queryClient.invalidateQueries({ queryKey: ["frequencia", alunoId] });
    },
    onError: () => setErrorMessage("Não foi possível lançar a frequência."),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!alunoId || !data) return;
    mutation.mutate({ alunoId, data, status, observacao: observacao || undefined });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Lançar frequência</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label htmlFor="aluno" className="text-sm font-medium">
              Aluno
            </label>
            <select
              id="aluno"
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              required
            >
              <option value="">Selecione...</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nomeCompleto}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="data" className="text-sm font-medium">
                Data
              </label>
              <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CriarFrequenciaPayload["status"])}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="presente">Presente</option>
                <option value="falta">Falta</option>
                <option value="justificada">Justificada</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="observacao" className="text-sm font-medium">
              Observação
            </label>
            <Input id="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          </div>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : "Lançar frequência"}
          </Button>
        </form>
      </div>

      {alunoId && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600">Histórico</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {historicoQuery.data?.map((item) => (
              <li key={item.id} className="flex justify-between border-b border-slate-100 py-1">
                <span>{item.data}</span>
                <span className="capitalize">{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
