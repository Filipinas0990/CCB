import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { criarAviso, excluirAviso, listarAvisos } from "../../api/avisos";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function AvisosPage() {
  const queryClient = useQueryClient();
  const { data: avisos, isLoading } = useQuery({ queryKey: ["avisos"], queryFn: listarAvisos });

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");

  const createMutation = useMutation({
    mutationFn: criarAviso,
    onSuccess: () => {
      setTitulo("");
      setMensagem("");
      queryClient.invalidateQueries({ queryKey: ["avisos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: excluirAviso,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["avisos"] }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!titulo || !mensagem) return;
    createMutation.mutate({ titulo, mensagem });
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Avisos</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1">
            <label htmlFor="avisoTitulo" className="text-sm font-medium">
              Título
            </label>
            <Input id="avisoTitulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label htmlFor="avisoMensagem" className="text-sm font-medium">
              Mensagem
            </label>
            <Input id="avisoMensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)} required />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Publicando..." : "Publicar aviso"}
          </Button>
        </form>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-600">Publicados</h3>
        {isLoading ? (
          <p className="text-sm text-slate-500">Carregando...</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {avisos?.map((aviso) => (
              <li key={aviso.id} className="flex items-start justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="font-medium">{aviso.titulo}</p>
                  <p className="text-slate-500">{aviso.mensagem}</p>
                </div>
                <Button
                  type="button"
                  onClick={() => deleteMutation.mutate(aviso.id)}
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
