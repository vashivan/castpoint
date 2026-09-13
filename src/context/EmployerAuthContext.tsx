// src/context/EmployerAuthContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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

  status: "pending" | "verified" | "blocked";

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
  createContext<EmployerAuthContextType | undefined>(
    undefined
  );

export function EmployerAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [employer, setEmployer] =
    useState<Employer | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLogged, setIsLogged] =
    useState(false);

  async function refreshEmployer() {
    setIsLoading(true);

    try {
      const res = await fetch(
        "/api/employer/me",
        {
          credentials: "include",
          cache: "no-store",
        }
      );

      if (!res.ok) {
        setEmployer(null);
        setIsLogged(false);
        return;
      }

      const data = await res.json();

      const employerData =
        data.employer ?? null;

      setEmployer(employerData);
      setIsLogged(Boolean(employerData));
    } catch (error) {
      console.error(
        "[employer.auth]",
        error
      );

      setEmployer(null);
      setIsLogged(false);
    } finally {
      setIsLoading(false);
    }
  }

  function updateEmployer(
    updatedEmployerData: Partial<Employer>
  ) {
    setEmployer((prev) =>
      prev
        ? {
            ...prev,
            ...updatedEmployerData,
          }
        : null
    );
  }

  const logoutEmployer = async () => {
  await fetch("/api/employer/logout", {
    method: "POST",
    credentials: "include",
  });

  setEmployer(null);

  router.push("/");
  router.refresh();
};

  useEffect(() => {
    refreshEmployer();
  }, []);

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