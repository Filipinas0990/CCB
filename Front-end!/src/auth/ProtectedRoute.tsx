import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  tipo: "aluno" | "professor";
  children: ReactNode;
}

export function ProtectedRoute({ tipo, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.tipo !== tipo) {
    return <Navigate to={user.tipo === "aluno" ? "/aluno" : "/professor"} replace />;
  }

  return <>{children}</>;
}
