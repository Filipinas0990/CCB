import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/ui/Button";
import { FrequenciaSection } from "./FrequenciaSection";
import { AvisoAusenciaSection } from "./AvisoAusenciaSection";
import { CronogramaSection } from "./CronogramaSection";
import { AvisosSection } from "./AvisosSection";

export function AlunoHomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-sm text-slate-500">GEM Jardim Floresta</p>
          <p className="font-semibold">{user?.login}</p>
        </div>
        <Button onClick={() => logout()}>Sair</Button>
      </header>
      <main className="space-y-6 p-6">
        {user && <FrequenciaSection alunoId={user.id} />}
        <AvisoAusenciaSection />
        <CronogramaSection />
        <AvisosSection />
      </main>
    </div>
  );
}
