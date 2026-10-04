"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useEmployerAuth } from "@/context/EmployerAuthContext";
import TextInput from "../ui/input";
import AuthShell from "../auth/AuthShell";
import { Button } from "../ds/Button";

export default function EmployerLoginForm() {
  const router = useRouter();
  const { refreshEmployer } = useEmployerAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/employer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");

      // The cookie is set by the server; refresh the context before navigating.
      await refreshEmployer();
      router.replace("/employer/dashboard");
      router.refresh();
    } catch (err) {
      console.error("[employer.login.error]", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      tone="blue"
      kicker="For venues, producers & agencies"
      title={<>Cast<br />your next<br /><span className="text-lime">show.</span></>}
      aside={<span className="text-paper">Post contracts, receive full artist profiles and download them as PDF.</span>}
    >
      <p className="label text-ink/60">Employer account</p>
      <p className="font-display mt-2 text-[40px]">Sign in</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <TextInput type="email" label="Email" name="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
        </div>
        <div>
          <TextInput type="password" label="Password" name="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} />
        </div>

        {error && <p className="border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">{error}</p>}

        <Button type="submit" disabled={loading} arrow={!loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <Link href="/employer/forgot-password" className="label block text-center text-ink/60 hover:text-ink">Forgot password?</Link>
      </form>

      <div className="mt-10 border-t-[1.5px] border-ink pt-6">
        <p className="text-[15px]">No employer account yet?</p>
        <Button href="/employer/register" variant="lime" arrow className="mt-4 w-full">Register company</Button>
        <Link href="/login" className="label mt-6 block text-center text-ink/60 hover:text-ink">Artist sign in →</Link>
      </div>
    </AuthShell>
  );
}
