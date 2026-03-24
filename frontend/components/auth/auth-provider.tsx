"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  clearToken,
  getStoredUser,
  getToken,
  isTokenExpired,
  setStoredUser,
  setToken,
  type AuthUser,
} from "@/lib/auth";

type AuthContextValue = {
  hydrated: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setLocalToken] = useState<string | null>(null);

  useEffect(() => {
    const existingToken = getToken();
    const existingUser = getStoredUser();

    if (existingToken && existingUser && !isTokenExpired(existingToken)) {
      setLocalToken(existingToken);
      setUser(existingUser);
    } else {
      clearToken();
    }

    setHydrated(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated,
      isAuthenticated: Boolean(token && user),
      user,
      login: (nextToken, nextUser) => {
        setToken(nextToken);
        setStoredUser(nextUser);
        setLocalToken(nextToken);
        setUser(nextUser);
      },
      logout: () => {
        clearToken();
        setLocalToken(null);
        setUser(null);
        router.push("/login");
      },
      hasRole: (...roles) => Boolean(user && roles.includes(user.role)),
    }),
    [hydrated, token, user, router]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: string[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, isAuthenticated, hasRole } = useAuth();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (roles && !hasRole(...roles)) {
      router.replace("/dashboard");
    }
  }, [pathname, router, hydrated, isAuthenticated, roles, hasRole]);

  if (!hydrated || !isAuthenticated || (roles && !hasRole(...roles))) {
    return null;
  }

  return <>{children}</>;
}
