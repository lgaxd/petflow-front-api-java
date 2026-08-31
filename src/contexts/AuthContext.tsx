import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '@/services/authService';
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY, getErrorMessage } from '@/services/api';
import type { LoginResponse, UserRole } from '@/types';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Mantém estado sincronizado caso o token seja removido em outra aba/interceptor
    const handleStorage = () => {
      setToken(localStorage.getItem(TOKEN_STORAGE_KEY));
      setUser(readStoredUser());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    setIsLoading(true);
    try {
      const response: LoginResponse = await authService.login({ email, password });
      const loggedUser: AuthUser = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      };
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
      setToken(response.token);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Não foi possível entrar. Verifique suas credenciais.'));
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return ctx;
}
