import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPerfis, resetSenha, type Perfil } from "../../api/perfis";
import { Button } from "../../components/ui/Button";

export function PessoasPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data: perfis, isLoading } = useQuery({ queryKey: ["perfis"], queryFn: listPerfis });

  const resetMutation = useMutation({
    mutationFn: ({ id, senha }: { id: string; senha: string }) => resetSenha(id, senha),
    onSuccess: () => {
      setFeedback("Senha atualizada com sucesso.");
      queryClient.invalidateQueries({ queryKey: ["perfis"] });
    },
    onError: () => {
      setFeedback("Não foi possível atualizar a senha.");
    },
  });

  function handleResetSenha(perfil: Perfil) {
    const novaSenha = window.prompt(`Nova senha para ${perfil.nomeCompleto}:`);
    if (novaSenha) {
      resetMutation.mutate({ id: perfil.id, senha: novaSenha });
    }
  }

  if (isLoading) {
    return <p className="text-slate-500">Carregando...</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pessoas cadastradas</h2>
      {feedback && <p className="text-sm text-slate-600">{feedback}</p>}
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2">Nome</th>
            <th className="py-2">Login</th>
            <th className="py-2">Tipo</th>
            <th className="py-2">Turma</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {perfis?.map((perfil) => (
            <tr key={perfil.id} className="border-b border-slate-100">
              <td className="py-2">{perfil.nomeCompleto}</td>
              <td className="py-2">{perfil.login}</td>
              <td className="py-2">{perfil.tipo === "aluno" ? "Aluno" : perfil.cargo}</td>
              <td className="py-2">{perfil.turma ?? "-"}</td>
              <td className="py-2 text-right">
                <Button
                  type="button"
                  onClick={() => handleResetSenha(perfil)}
                  className="bg-slate-200 text-slate-900 hover:bg-slate-300"
                >
                  Redefinir senha
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
