// auth.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cleanToken,
  authApi,
  setToken,
  type RegisterPayload,
} from "../api/auth";

export type AuthUser = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  onAuthError: () => void;
  error: string | null;
  register: (payload: RegisterPayload) => Promise<boolean>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>();

  const logout = useCallback(() => {
    cleanToken();
    setUser(null);
    window.location.href = "/login";
  }, []);

  const onAuthError = useCallback(() => {
    logout();
  }, [logout]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const me = await authApi.currentUser();
      setUser(me);
    } catch {
      setUser(null);
      cleanToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function postLogin(token: string) {
    setToken(token);
    await refresh();
  }

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setError("");
      setIsLoading(true);
      try {
        const { token } = await authApi.login(username, password);
        await postLogin(token);
        return true;
      } catch (err) {
        setUser(null);
        cleanToken();
        setError(err instanceof Error ? err.message : "Login failed");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = async ({
    email,
    first_name,
    last_name,
    password,
    username,
  }: RegisterPayload): Promise<boolean> => {
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({
        username: username.trim(),
        email: email.trim(),
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        password,
      });
      await postLogin(response.token);
      return true;
    } catch (err) {
      setUser(null);
      cleanToken();
      setError(
        err instanceof Error ? err.message : "Could not create your account"
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      refresh,
      logout,
      login,
      onAuthError,
      error,
      register,
    }),
    [user, isLoading, refresh, logout, onAuthError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}

export function useAuthUser() {
  return useAuth().user;
}

export function useIsAuthenticated() {
  return useAuth().isAuthenticated;
}

export function useAuthActions() {
  const { logout, onAuthError, refresh, isLoading } = useAuth();
  return { logout, onAuthError, refresh, isLoading };
}
