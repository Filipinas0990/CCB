import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { createPerfil, type CadastroPayload } from "../../api/perfis";
import { ApiError } from "../../api/client";

type Tipo = "aluno" | "professor";

interface FormState {
  tipo: Tipo;
  login: string;
  senha: string;
  nomeCompleto: string;
  dataNascimento: string;
  nomePai: string;
  nomeMae: string;
  paiBatizado: boolean;
  maeBatizado: boolean;
  dataBatismo: string;
  endereco: string;
  cidade: string;
  uf: string;
  telefone: string;
  comum: string;
  instrumento: string;
  anciao: string;
  cooperadorOficial: string;
  cooperadorJovens: string;
  encarregadoLocal: string;
  encarregadoRegional: string;
  examinadoraResponsavel: string;
  cargo: "instrutor" | "instrutor_substituto" | "encarregado";
  turma: "irmaos" | "irmas";
  dataInicioGem: string;
  necessidadeEspecial: string;
}

const initialState: FormState = {
  tipo: "aluno",
  login: "",
  senha: "",
  nomeCompleto: "",
  dataNascimento: "",
  nomePai: "",
  nomeMae: "",
  paiBatizado: false,
  maeBatizado: false,
  dataBatismo: "",
  endereco: "",
  cidade: "",
  uf: "",
  telefone: "",
  comum: "",
  instrumento: "",
  anciao: "",
  cooperadorOficial: "",
  cooperadorJovens: "",
  encarregadoLocal: "",
  encarregadoRegional: "",
  examinadoraResponsavel: "",
  cargo: "instrutor",
  turma: "irmaos",
  dataInicioGem: "",
  necessidadeEspecial: "",
};

function toPayload(form: FormState): CadastroPayload {
  const base = {
    login: form.login,
    senha: form.senha,
    nomeCompleto: form.nomeCompleto,
    dataNascimento: form.dataNascimento,
    nomePai: form.nomePai || undefined,
    nomeMae: form.nomeMae || undefined,
    paiBatizado: form.paiBatizado,
    maeBatizado: form.maeBatizado,
    dataBatismo: form.dataBatismo || undefined,
    endereco: form.endereco || undefined,
    cidade: form.cidade || undefined,
    uf: form.uf || undefined,
    telefone: form.telefone || undefined,
    comum: form.comum || undefined,
    instrumento: form.instrumento || undefined,
    anciao: form.anciao || undefined,
    cooperadorOficial: form.cooperadorOficial || undefined,
    cooperadorJovens: form.cooperadorJovens || undefined,
    encarregadoLocal: form.encarregadoLocal || undefined,
    encarregadoRegional: form.encarregadoRegional || undefined,
    examinadoraResponsavel: form.examinadoraResponsavel || undefined,
  };

  if (form.tipo === "aluno") {
    return {
      ...base,
      tipo: "aluno",
      turma: form.turma,
      dataInicioGem: form.dataInicioGem,
      necessidadeEspecial: form.necessidadeEspecial || undefined,
    };
  }

  return { ...base, tipo: "professor", cargo: form.cargo };
}

export function CadastroPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createPerfil,
    onSuccess: (created) => {
      setSuccessMessage(`Cadastro criado para ${created.login}.`);
      setErrorMessage(null);
      setForm(initialState);
    },
    onError: (error) => {
      setSuccessMessage(null);
      if (error instanceof ApiError && error.status === 409) {
        setErrorMessage("Já existe um cadastro com esse login.");
      } else {
        setErrorMessage("Não foi possível salvar o cadastro. Confira os campos.");
      }
    },
  });

  function update<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(toPayload(form));
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <h2 className="text-lg font-semibold">Cadastro</h2>

      <div className="space-y-1">
        <label htmlFor="tipo" className="text-sm font-medium">
          Tipo de cadastro
        </label>
        <select
          id="tipo"
          value={form.tipo}
          onChange={(e) => update("tipo", e.target.value as Tipo)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="aluno">Aluno(a)</option>
          <option value="professor">Instrutor(a) / Encarregado</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="login" className="text-sm font-medium">
            Login
          </label>
          <Input id="login" value={form.login} onChange={(e) => update("login", e.target.value)} required />
        </div>
        <div className="space-y-1">
          <label htmlFor="senha" className="text-sm font-medium">
            Senha inicial
          </label>
          <Input
            id="senha"
            type="password"
            value={form.senha}
            onChange={(e) => update("senha", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="nomeCompleto" className="text-sm font-medium">
          Nome completo
        </label>
        <Input
          id="nomeCompleto"
          value={form.nomeCompleto}
          onChange={(e) => update("nomeCompleto", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="dataNascimento" className="text-sm font-medium">
            Nascimento
          </label>
          <Input
            id="dataNascimento"
            type="date"
            value={form.dataNascimento}
            onChange={(e) => update("dataNascimento", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="dataBatismo" className="text-sm font-medium">
            Data de batismo
          </label>
          <Input
            id="dataBatismo"
            type="date"
            value={form.dataBatismo}
            onChange={(e) => update("dataBatismo", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="nomePai" className="text-sm font-medium">
            Nome do pai
          </label>
          <Input id="nomePai" value={form.nomePai} onChange={(e) => update("nomePai", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="nomeMae" className="text-sm font-medium">
            Nome da mãe
          </label>
          <Input id="nomeMae" value={form.nomeMae} onChange={(e) => update("nomeMae", e.target.value)} />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.paiBatizado}
            onChange={(e) => update("paiBatizado", e.target.checked)}
          />
          Pai batizado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.maeBatizado}
            onChange={(e) => update("maeBatizado", e.target.checked)}
          />
          Mãe batizada
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label htmlFor="cidade" className="text-sm font-medium">
            Cidade
          </label>
          <Input id="cidade" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="uf" className="text-sm font-medium">
            UF
          </label>
          <Input id="uf" value={form.uf} onChange={(e) => update("uf", e.target.value)} maxLength={2} />
        </div>
        <div className="space-y-1">
          <label htmlFor="telefone" className="text-sm font-medium">
            Telefone
          </label>
          <Input id="telefone" value={form.telefone} onChange={(e) => update("telefone", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="endereco" className="text-sm font-medium">
          Endereço
        </label>
        <Input id="endereco" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="comum" className="text-sm font-medium">
            Comum
          </label>
          <Input id="comum" value={form.comum} onChange={(e) => update("comum", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label htmlFor="instrumento" className="text-sm font-medium">
            Instrumento
          </label>
          <Input id="instrumento" value={form.instrumento} onChange={(e) => update("instrumento", e.target.value)} />
        </div>
      </div>

      <fieldset className="space-y-4 rounded-md border border-slate-200 p-4">
        <legend className="px-1 text-sm font-medium text-slate-600">Referências da igreja (opcional)</legend>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="anciao" className="text-sm font-medium">
              Ancião
            </label>
            <Input id="anciao" value={form.anciao} onChange={(e) => update("anciao", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label htmlFor="cooperadorOficial" className="text-sm font-medium">
              Cooperador oficial
            </label>
            <Input
              id="cooperadorOficial"
              value={form.cooperadorOficial}
              onChange={(e) => update("cooperadorOficial", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="cooperadorJovens" className="text-sm font-medium">
              Cooperador de jovens
            </label>
            <Input
              id="cooperadorJovens"
              value={form.cooperadorJovens}
              onChange={(e) => update("cooperadorJovens", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="encarregadoLocal" className="text-sm font-medium">
              Encarregado local
            </label>
            <Input
              id="encarregadoLocal"
              value={form.encarregadoLocal}
              onChange={(e) => update("encarregadoLocal", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="encarregadoRegional" className="text-sm font-medium">
              Encarregado regional
            </label>
            <Input
              id="encarregadoRegional"
              value={form.encarregadoRegional}
              onChange={(e) => update("encarregadoRegional", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="examinadoraResponsavel" className="text-sm font-medium">
              Examinadora responsável
            </label>
            <Input
              id="examinadoraResponsavel"
              value={form.examinadoraResponsavel}
              onChange={(e) => update("examinadoraResponsavel", e.target.value)}
            />
          </div>
        </div>
      </fieldset>

      {form.tipo === "aluno" ? (
        <fieldset className="space-y-4 rounded-md border border-slate-200 p-4">
          <legend className="px-1 text-sm font-medium text-slate-600">Dados do aluno</legend>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="turma" className="text-sm font-medium">
                Turma
              </label>
              <select
                id="turma"
                value={form.turma}
                onChange={(e) => update("turma", e.target.value as FormState["turma"])}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="irmaos">Irmãos</option>
                <option value="irmas">Irmãs</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="dataInicioGem" className="text-sm font-medium">
                Início no GEM
              </label>
              <Input
                id="dataInicioGem"
                type="date"
                value={form.dataInicioGem}
                onChange={(e) => update("dataInicioGem", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="necessidadeEspecial" className="text-sm font-medium">
              Necessidade especial (se houver)
            </label>
            <Input
              id="necessidadeEspecial"
              value={form.necessidadeEspecial}
              onChange={(e) => update("necessidadeEspecial", e.target.value)}
            />
          </div>
        </fieldset>
      ) : (
        <div className="space-y-1">
          <label htmlFor="cargo" className="text-sm font-medium">
            Cargo
          </label>
          <select
            id="cargo"
            value={form.cargo}
            onChange={(e) => update("cargo", e.target.value as FormState["cargo"])}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="instrutor">Instrutor(a)</option>
            <option value="instrutor_substituto">Instrutor(a) Substituto(a)</option>
            <option value="encarregado">Encarregado</option>
          </select>
        </div>
      )}

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
      {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Salvando..." : "Salvar cadastro"}
      </Button>
    </form>
  );
}
