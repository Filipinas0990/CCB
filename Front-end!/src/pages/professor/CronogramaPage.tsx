import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { criarCronograma, excluirCronograma, listarCronograma } from "../../api/cronograma";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function CronogramaPage() {
  const queryClient = useQueryClient();
  const { data: cronogramaItems, isLoading } = useQuery({ queryKey: ["cronograma"], queryFn: listarCronograma });

  const [data, setData] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const createMutation = useMutation({
    mutationFn: criarCronograma,
    onSuccess: () => {
      setData("");
      setTitulo("");
      setDescricao("");
      queryClient.invalidateQueries({ queryKey: ["cronograma"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: excluirCronograma,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cronograma"] }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data || !titulo) return;
    createMutation.mutate({ data, titulo, descricao: descricao || undefined });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Cronograma de aula</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="cronogramaData" className="text-sm font-medium">
                Data
              </label>
              <Input id="cronogramaData" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label htmlFor="cronogramaTitulo" className="text-sm font-medium">
                Título
              </label>
              <Input id="cronogramaTitulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="cronogramaDescricao" className="text-sm font-medium">
              Descrição
            </label>
            <Input id="cronogramaDescricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Salvando..." : "Adicionar ao cronograma"}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600">Lançamentos</h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {cronogramaItems?.map((item) => (
              <li key={item.id} className="flex items-start justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="font-medium">
                    {item.data} — {item.titulo}
                  </p>
                  {item.descricao && <p className="text-slate-500">{item.descricao}</p>}
                </div>
                <Button
                  type="button"
                  onClick={() => deleteMutation.mutate(item.id)}
                  className="bg-slate-200 text-slate-900 hover:bg-slate-300"
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
