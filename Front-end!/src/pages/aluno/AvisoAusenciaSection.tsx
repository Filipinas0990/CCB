import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { enviarAvisoAusencia } from "../../api/avisosAusencia";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function AvisoAusenciaSection() {
  const [dataAula, setDataAula] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: enviarAvisoAusencia,
    onSuccess: () => {
      setSuccessMessage("Aviso enviado para a equipe.");
      setMensagem("");
      setDataAula("");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mensagem) return;
    mutation.mutate({ dataAula: dataAula || undefined, mensagem });
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-slate-600">Avisar ausência</h2>
      <form onSubmit={handleSubmit} className="mt-2 max-w-md space-y-3">
        <div className="space-y-1">
          <label htmlFor="dataAula" className="text-sm font-medium">
            Data da aula (opcional)
          </label>
          <Input id="dataAula" type="date" value={dataAula} onChange={(e) => setDataAula(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="mensagem" className="text-sm font-medium">
            Mensagem
          </label>
          <Input id="mensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)} required />
        </div>
        {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Enviando..." : "Enviar aviso"}
        </Button>
      </form>
    </section>
  );
}
