"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Review } from "@/utils/Types";

export type CompanySummary = {
  name: string;
  slug: string;
  reviews: Review[];
  places: string[];
  positions: string[];
  latest: Review;
};

export const companySlug = (name: string) => encodeURIComponent(name.trim());

/** Loads all reviews once and groups them by company. */
export function useReviews() {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const res = await fetch("/api/get_reviews", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load reviews");
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
      setError(null);
    } catch (e) {
      setReviews([]);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const companies = useMemo<CompanySummary[]>(() => {
    const map = new Map<string, Review[]>();
    for (const r of reviews ?? []) {
      const key = (r.company_name || "Unknown").trim();
      map.set(key, [...(map.get(key) ?? []), r]);
    }
    return [...map.entries()].map(([name, list]) => {
      const sorted = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      return {
        name,
        slug: companySlug(name),
        reviews: sorted,
        places: [...new Set(sorted.map((r) => r.place_of_work).filter(Boolean))],
        positions: [...new Set(sorted.map((r) => r.position).filter(Boolean))],
        latest: sorted[0],
      };
    });
  }, [reviews]);

  return { reviews, companies, error, reload };
}
