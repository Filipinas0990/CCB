import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { AlunoHomePage } from "./pages/aluno/AlunoHomePage";
import { ProfessorLayout } from "./pages/professor/ProfessorLayout";

const queryClient = new QueryClient();

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={user.tipo === "aluno" ? "/aluno" : "/professor"} replace />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/aluno"
              element={
                <ProtectedRoute tipo="aluno">
                  <AlunoHomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/professor"
              element={
                <ProtectedRoute tipo="professor">
                  <ProfessorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<div className="text-slate-600">Selecione uma opção no menu.</div>} />
            </Route>
            <Route path="/" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
