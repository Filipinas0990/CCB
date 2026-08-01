import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ApiError } from "../api/client";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={user.tipo === "aluno" ? "/aluno" : "/professor"} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(loginValue, senha);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Login ou senha inválidos.");
      } else {
        setError("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow">
        <div>
          <h1 className="text-lg font-semibold">GEM Jardim Floresta</h1>
          <p className="text-sm text-slate-500">Entre com seu login e senha.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="login" className="text-sm font-medium">
            Login
          </label>
          <Input id="login" value={loginValue} onChange={(e) => setLoginValue(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <label htmlFor="senha" className="text-sm font-medium">
            Senha
          </label>
          <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
