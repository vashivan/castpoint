"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { User } from "../utils/Types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLogged: boolean;

  updateUser: (
    updatedUserData: Partial<User>
  ) => void;

  refreshUser: () => Promise<void>;
  logoutArtist: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  // Є user = авторизований артист.
  // Окремий state для isLogged не потрібен.
  const isLogged = user !== null;

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth", {
        credentials: "include",
        cache: "no-store",
      });

      // 401 — це нормальний стан:
      // артист просто не авторизований.
      if (res.status === 401) {
        setUser(null);
        return;
      }

      // 500 / 503 / DB error тощо
      // не трактуємо як logout.
      if (!res.ok) {
        throw new Error(
          `Failed to fetch artist: ${res.status}`
        );
      }

      const data = await res.json();

      setUser(data.user ?? null);
    } catch (error) {
      console.error(
        "[artist.auth.fetch.error]",
        error
      );

      // Не очищаємо user через тимчасову
      // серверну / DB помилку.
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);

    try {
      await fetchUser();
    } finally {
      setIsLoading(false);
    }
  }, [fetchUser]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const updateUser = (
    updatedUserData: Partial<User>
  ) => {
    setUser((prev) => {
      if (!prev) {
        return null;
      }

      return {
        ...prev,
        ...updatedUserData,
      };
    });
  };

  const logoutArtist = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(
          `Failed to logout artist: ${res.status}`
        );
      }

      setUser(null);
    } catch (error) {
      console.error(
        "[artist.logout.error]",
        error
      );

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLogged,
        updateUser,
        refreshUser,
        logoutArtist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}