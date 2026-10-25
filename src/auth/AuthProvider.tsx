import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { login as loginApi } from "@/api/auth.api";
import {
  AUTH_SESSION_CHANGED_EVENT,
  clearAuthSession,
  getJwtExpirationTime,
  notifyAuthSessionChanged,
  readStoredAuthSession,
} from "@/auth/session";

import type { AuthUser, LoginInput } from "@/typings/api.typings";

const MAX_TIMER_DELAY = 2_147_483_647;

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let expirationTimer: number | undefined;

    const synchronizeSession = () => {
      window.clearTimeout(expirationTimer);

      const session = readStoredAuthSession();

      if (!session) {
        const hadStoredSession =
          localStorage.getItem("accessToken") !== null ||
          localStorage.getItem("user") !== null;

        setUser(null);

        if (hadStoredSession) {
          clearAuthSession();
        }
      } else {
        setUser(session.user);

        expirationTimer = window.setTimeout(
          synchronizeSession,
          Math.min(
            Math.max(session.expiresAt - Date.now(), 0),
            MAX_TIMER_DELAY,
          ),
        );
      }

      setIsLoading(false);
    };

    const synchronizeWhenVisible = () => {
      if (document.visibilityState === "visible") {
        synchronizeSession();
      }
    };

    synchronizeSession();
    window.addEventListener("focus", synchronizeSession);
    window.addEventListener("pageshow", synchronizeSession);
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, synchronizeSession);
    window.addEventListener("storage", synchronizeSession);
    document.addEventListener("visibilitychange", synchronizeWhenVisible);

    return () => {
      window.clearTimeout(expirationTimer);
      window.removeEventListener("focus", synchronizeSession);
      window.removeEventListener("pageshow", synchronizeSession);
      window.removeEventListener(
        AUTH_SESSION_CHANGED_EVENT,
        synchronizeSession,
      );
      window.removeEventListener("storage", synchronizeSession);
      document.removeEventListener(
        "visibilitychange",
        synchronizeWhenVisible,
      );
    };
  }, []);

  const login = async (input: LoginInput) => {
    const response = await loginApi(input);
    const expiresAt = getJwtExpirationTime(response.data.accessToken);

    if (expiresAt === null || expiresAt <= Date.now()) {
      throw new Error("The server returned an invalid or expired access token.");
    }

    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    setUser(response.data.user);
    notifyAuthSessionChanged();
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated:
          Boolean(user) && Boolean(readStoredAuthSession()),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
