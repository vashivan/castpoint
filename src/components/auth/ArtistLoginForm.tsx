"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import TextInput from "../ui/input";
import { Button } from "../ds/Button";
import { useAuth } from "@/context/AuthContext";

/** Parses a response body that may be empty or not JSON. */
async function safeParse(res: Response) {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/** Artist sign-in form, used on /login and in the navbar modal. */
export default function ArtistLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await safeParse(res);

      if (res.ok) {
        await refreshUser();
        onSuccess?.();
        router.push("/");
      } else {
        setMessage((data && (data.error || data.message)) || "Wrong password or email. Try again, please.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("Sorry, caught trouble. Try again later or contact us.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="label text-ink/60">Artist account</p>
      <p className="font-display mt-2 text-[40px]">Sign in</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <TextInput label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(val) => setForm({ ...form, email: val })} />
        </div>
        <div>
          <TextInput type="password" label="Password" name="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={(val) => setForm({ ...form, password: val })} />
        </div>

        {message && <p className="border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold">{message}</p>}

        <Button type="submit" disabled={loading || !form.email || !form.password} arrow={!loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <Link href="/forgot-password" className="label block text-center text-ink/60 hover:text-ink">Forgot password?</Link>
      </form>

      <div className="mt-10 border-t-[1.5px] border-ink pt-6">
        <p className="text-[15px]">New to Castpoint? Create a free profile and start applying.</p>
        <Button href="/signup" variant="lime" arrow className="mt-4 w-full">Create profile</Button>
        <Link href="/employer/login" className="label mt-6 block text-center text-ink/60 hover:text-ink">Employer sign in →</Link>
      </div>
    </div>
  );
}
