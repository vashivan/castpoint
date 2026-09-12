"use client";

import { useEffect, useState, useCallback } from "react";

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
};

/**
 * Lightweight, page-local session hook for the employer dashboard.
 * Kept separate from the artist AuthContext on purpose — employer
 * and artist sessions are independent (see src/lib/employerAuth.ts).
 */
export function useEmployerSession() {
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/employer/me", { credentials: "include" });
      if (!res.ok) throw new Error("not authenticated");
      const data = await res.json();
      setEmployer(data.employer);
    } catch {
      setEmployer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { employer, isLoading, isLogged: !!employer, refresh };
}
