"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User, StoredAnalysis } from "@/types";
import * as api from "@/services/api";

interface AuthContextValue {
  user: User | null;
  analyses: StoredAnalysis[];
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAnalyses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);

  const refreshAnalyses = useCallback(async () => {
    try {
      const data = await api.getUserAnalyses();
      setAnalyses(data);
    } catch {
      setAnalyses([]);
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    (async () => {
      try {
        const localUser = localStorage.getItem("user");
        if (localUser) {
          const parsed = JSON.parse(localUser);
          setUser(parsed);
          // Fetch analyses from backend
          const data = await api.getUserAnalyses();
          setAnalyses(data);
          return;
        }
        const u = await api.getCurrentUser();
        if (u) {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          const data = await api.getUserAnalyses();
          setAnalyses(data);
        }
      } catch {
        setUser(null);
      }
    })();
  }, []);

  const loginHandler = useCallback(
    async (email: string, password: string) => {
      const u = await api.login(email, password);
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      await refreshAnalyses();
    },
    [refreshAnalyses],
  );

  const signupHandler = useCallback(
    async (username: string, email: string, password: string) => {
      const u = await api.signup(username, email, password);
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      await refreshAnalyses();
    },
    [refreshAnalyses],
  );

  const logoutHandler = useCallback(async () => {
    await api.logout();
    localStorage.removeItem("user");
    setUser(null);
    setAnalyses([]);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        analyses,
        login: loginHandler,
        signup: signupHandler,
        logout: logoutHandler,
        refreshAnalyses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
