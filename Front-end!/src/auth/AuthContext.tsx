import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { login as loginRequest, logout as logoutRequest, me as meRequest, type SessionUser } from "../api/auth";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (login: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meRequest()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(loginValue: string, senha: string) {
    const sessionUser = await loginRequest(loginValue, senha);
    setUser(sessionUser);
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
