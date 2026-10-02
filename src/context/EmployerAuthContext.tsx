"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export type Employer = {
  id: number;
  email: string;

  company_name: string;
  contact_name: string | null;

  country: string | null;
  phone: string | null;

  website: string | null;
  instagram: string | null;

  description: string | null;

  logo_url: string | null;
  logo_public_id: string | null;

  status:
    | "pending"
    | "verified"
    | "blocked";

  created_at: string;
  updated_at: string | null;
};

interface EmployerAuthContextType {
  employer: Employer | null;
  isLoading: boolean;
  isLogged: boolean;

  updateEmployer: (
    updatedEmployerData: Partial<Employer>
  ) => void;

  refreshEmployer: () => Promise<void>;
  logoutEmployer: () => Promise<void>;
}

const EmployerAuthContext =
  createContext<
    EmployerAuthContextType | undefined
  >(undefined);

export function EmployerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [employer, setEmployer] =
    useState<Employer | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  // Одне джерело правди.
  const isLogged = employer !== null;

  const fetchEmployer =
    useCallback(async () => {
      try {
        const res = await fetch(
          "/api/employer/me",
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        // Немає employer cookie / token
        if (res.status === 401) {
          setEmployer(null);
          return;
        }

        // Blocked employer
        if (res.status === 403) {
          setEmployer(null);
          return;
        }

        // 500 / DB timeout / server error
        // НЕ означає logout.
        if (!res.ok) {
          throw new Error(
            `Failed to fetch employer: ${res.status}`
          );
        }

        const data = await res.json();

        setEmployer(
          data.employer ?? null
        );
      } catch (error) {
        console.error(
          "[employer.auth.fetch.error]",
          error
        );

        // Тут спеціально НЕ:
        //
        // setEmployer(null)
        //
        // бо помилка сервера не означає,
        // що cookie стала невалідною.
      }
    }, []);

  const refreshEmployer =
    useCallback(async () => {
      setIsLoading(true);

      try {
        await fetchEmployer();
      } finally {
        setIsLoading(false);
      }
    }, [fetchEmployer]);

  useEffect(() => {
    void refreshEmployer();
  }, [refreshEmployer]);

  const updateEmployer = (
    updatedEmployerData: Partial<Employer>
  ) => {
    setEmployer((prev) => {
      if (!prev) {
        return null;
      }

      return {
        ...prev,
        ...updatedEmployerData,
      };
    });
  };

  const logoutEmployer = async () => {
    try {
      const res = await fetch(
        "/api/employer/logout",
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to logout employer: ${res.status}`
        );
      }

      setEmployer(null);

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error(
        "[employer.logout.error]",
        error
      );

      throw error;
    }
  };

  return (
    <EmployerAuthContext.Provider
      value={{
        employer,
        isLoading,
        isLogged,
        updateEmployer,
        refreshEmployer,
        logoutEmployer,
      }}
    >
      {children}
    </EmployerAuthContext.Provider>
  );
}

export function useEmployerAuth() {
  const context =
    useContext(EmployerAuthContext);

  if (!context) {
    throw new Error(
      "useEmployerAuth must be used inside EmployerAuthProvider"
    );
  }

  return context;
}