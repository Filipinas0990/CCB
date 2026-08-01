import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/ui/Button";

const navItems: { to: string; label: string }[] = [];

export function ProfessorLayout() {
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
      <nav className="flex gap-4 border-b border-slate-200 bg-white px-6 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `text-sm ${isActive ? "font-semibold text-slate-900" : "text-slate-500"}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
