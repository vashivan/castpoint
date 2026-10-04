"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthShell from "../auth/AuthShell";
import { Button } from "../ds/Button";

type EmployerRegisterForm = {
  contact_name: string;
  company_name: string;
  country: string;
  phone: string;
  website: string;
  instagram: string;
  description: string;
  email: string;
  password: string;
  confirm_password: string;
};

const initialForm: EmployerRegisterForm = {
  contact_name: "",
  company_name: "",
  country: "",
  phone: "",
  website: "",
  instagram: "",
  description: "",
  email: "",
  password: "",
  confirm_password: "",
};

export default function EmployerRegisterForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EmployerRegisterForm>(initialForm);

  function updateField<K extends keyof EmployerRegisterForm>(
    field: K,
    value: EmployerRegisterForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const email = form.email.trim().toLowerCase();

    if (!form.contact_name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!form.company_name.trim()) {
      setError("Company name is required");
      return;
    }

    if (!form.country.trim()) {
      setError("Country is required");
      return;
    }

    if (!email) {
      setError("Work email is required");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/employer/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",

        body: JSON.stringify({
          contact_name: form.contact_name.trim(),
          company_name: form.company_name.trim(),
          country: form.country.trim(),

          phone: form.phone.trim() || null,
          website: form.website.trim() || null,
          instagram: form.instagram.trim() || null,
          description: form.description.trim() || null,

          email,
          password: form.password,
          confirm_password: form.confirm_password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Registration failed");
      }

      router.push("/employer/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      tone="blue"
      kicker="Castpoint for employers"
      title={<>Post a<br /><span className="text-lime">contract.</span></>}
      aside={<span className="text-paper">Create your company profile, post opportunities and manage applications from artists.</span>}
      wide
    >
      <p className="label text-ink/60">Employer account</p>
      <p className="font-display mt-2 text-[clamp(30px,3.4vw,44px)]">Register company</p>
      <form onSubmit={onSubmit} className="mt-10 space-y-10">
        {error && (
          <div
            role="alert"
            className="border-[1.5px] border-ink bg-pink px-4 py-3 text-[14px] font-semibold"
          >
            {error}
          </div>
        )}

        {/* CONTACT */}

        <section className="space-y-5">
          <div>
            <h2 className="font-display text-[24px]">Contact person</h2>
            <p className="mt-1 text-[14px] text-ink/60">
              Tell artists who represents the company.
            </p>
          </div>

          <Field label="Full name" required>
            <input
              type="text"
              autoComplete="name"
              value={form.contact_name}
              onChange={(e) =>
                updateField("contact_name", e.target.value)
              }
              className={inputClass}
              placeholder="Your full name"
              required
            />
          </Field>

          <Field label="Work email" required>
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={inputClass}
              placeholder="name@company.com"
              required
            />
          </Field>

          <Field label="Phone">
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className={inputClass}
              placeholder="+82 10 1234 5678"
            />
          </Field>
        </section>

        <div className="border-t-[1.5px] border-ink" />

        {/* COMPANY */}

        <section className="space-y-5">
          <div>
            <h2 className="font-display text-[24px]">Company</h2>
            <p className="mt-1 text-[14px] text-ink/60">
              Basic information about the company or organization you
              represent.
            </p>
          </div>

          <Field label="Company name" required>
            <input
              type="text"
              autoComplete="organization"
              value={form.company_name}
              onChange={(e) =>
                updateField("company_name", e.target.value)
              }
              className={inputClass}
              placeholder="Company name"
              required
            />
          </Field>

          <Field label="Country" required>
            <input
              type="text"
              autoComplete="country-name"
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
              className={inputClass}
              placeholder="South Korea"
              required
            />
          </Field>

          <Field label="Website">
            <input
              type="url"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              className={inputClass}
              placeholder="https://company.com"
            />
          </Field>

          <Field label="Instagram">
            <input
              type="text"
              value={form.instagram}
              onChange={(e) =>
                updateField("instagram", e.target.value)
              }
              className={inputClass}
              placeholder="@company"
            />
          </Field>

          <Field label="About company">
            <textarea
              value={form.description}
              onChange={(e) =>
                updateField("description", e.target.value)
              }
              className={`${inputClass} min-h-32 resize-y`}
              placeholder="Tell artists briefly about your company, productions or projects."
              maxLength={2000}
            />

            <div className="mt-2 text-right text-xs text-ink/50">
              {form.description.length}/2000
            </div>
          </Field>
        </section>

        <div className="border-t-[1.5px] border-ink" />

        {/* PASSWORD */}

        <section className="space-y-5">
          <div>
            <h2 className="font-display text-[24px]">Password</h2>
            <p className="mt-1 text-[14px] text-ink/60">
              Use at least 8 characters.
            </p>
          </div>

          <Field label="Password" required>
            <input
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) =>
                updateField("password", e.target.value)
              }
              minLength={8}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Confirm password" required>
            <input
              type="password"
              autoComplete="new-password"
              value={form.confirm_password}
              onChange={(e) =>
                updateField("confirm_password", e.target.value)
              }
              minLength={8}
              className={inputClass}
              required
            />
          </Field>
        </section>

        <Button type="submit" disabled={loading} arrow={!loading} className="w-full sm:w-auto">
          {loading ? "Creating account…" : "Create employer account"}
        </Button>

        <p className="text-[14px] text-ink/70">
          Already have an employer account?{" "}
          <Link
            href="/employer/login"
            className="font-bold underline underline-offset-4"
          >
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label mb-2 block text-ink/60">
        {label}
        {required && <span className="ml-1 text-pink">*</span>}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  "w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none transition-shadow placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]";