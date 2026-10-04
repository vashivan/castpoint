"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useEmployerAuth } from "../../context/EmployerAuthContext";

// Who sees a link: guests, signed-in artists, signed-in employers. No `show` = everyone.
type Audience = "guest" | "artist" | "employer";
type FooterLink = { href: string; label: string; show?: Audience[] };
type FooterColumn = { title: string; links: FooterLink[]; show?: Audience[] };

const columns: FooterColumn[] = [
  {
    title: "Artists",
    show: ["guest", "artist"],
    links: [
      { href: "/vacancies", label: "Contracts" },
      { href: "/reviews", label: "Reviews" },
      { href: "/signup", label: "Create profile", show: ["guest"] },
      { href: "/login", label: "Sign in", show: ["guest"] },
      { href: "/profile", label: "My profile", show: ["artist"] },
      { href: "/pricing", label: "Pricing" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Employers",
    show: ["guest", "employer"],
    links: [
      { href: "/employer/register", label: "Register company", show: ["guest"] },
      { href: "/employer/login", label: "Employer sign in", show: ["guest"] },
      { href: "/employer/dashboard", label: "Dashboard", show: ["employer"] },
      { href: "/employer/jobs/new", label: "Post a contract", show: ["employer"] },
      { href: "/employer/artists", label: "Find artists", show: ["employer"] },
      { href: "/pricing", label: "Pricing", show: ["employer"] },
    ],
  },
  {
    title: "Follow",
    links: [
      { href: "https://www.instagram.com/castpoint", label: "Instagram" },
      { href: "https://www.facebook.com/profile.php?id=61581139737398", label: "Facebook" },
    ],
  },
];

const visibleTo = (audience: Audience) => (item: { show?: Audience[] }) => !item.show || item.show.includes(audience);

/** CASTPOINT spelled out in tilted colour tiles. */
function LetterTiles() {
  return (
    <div className="mx-auto flex max-w-7xl justify-between gap-1 overflow-hidden px-4 pb-12 pt-4 sm:gap-2" aria-label="Castpoint">
      {"CASTPOINT".split("").map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className={`font-display grid flex-1 place-items-center text-[clamp(28px,9vw,140px)]`}
      >
          {ch}
        </span>
      ))}
    </div>
  );
}

const Footer = () => {
  const { user } = useAuth();
  const { employer } = useEmployerAuth();
  const [formEmail, setFormEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const audience: Audience = employer ? "employer" : user ? "artist" : "guest";

  const flash = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail) return flash("Please enter a valid email address.");

    setLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: formEmail }),
      });
      if (response.ok) {
        setFormEmail("");
        setMsg("Thank you for subscribing!");
      } else {
        flash("E-mail is already subscribed or an error occurred.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      flash("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="max-w-sm text-[17px] leading-relaxed text-paper/90">
            A platform for artists to find international jobs and share experience.
          </p>

          {!user && !employer && (
            <form onSubmit={handleSubmit} className="mt-6 max-w-sm">
              <label htmlFor="footer-email" className="label text-paper/60">Get new contracts by e-mail</label>
              <div className="mt-2 flex border border-paper/40">
                <input
                  id="footer-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-paper/40"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-lime px-4 text-[11px] font-bold uppercase tracking-widest text-ink disabled:opacity-50 cursor-pointer"
                >
                  →
                </button>
              </div>
              <p className="mt-2 h-4 text-xs text-lime">{msg}</p>
            </form>
          )}
        </div>

        {columns.filter(visibleTo(audience)).map((col) => (
          <div key={col.title}>
            <p className="label text-paper/60">{col.title}</p>
            <ul className="mt-4 space-y-2">
              {col.links.filter(visibleTo(audience)).map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-lime">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <LetterTiles />

      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-paper/50 md:flex-row md:justify-between">
          <p>&copy; {new Date().getFullYear()} Castpoint team. All rights reserved to shine.</p>
          <p>
            Designed by <a className="underline" href="https://www.instagram.com/a_little_surprise/">Kira Pryz</a>, crafted by{" "}
            <a className="underline" target="_blank" href="https://www.instagram.com/vash_ivan">Ivan Vashchuk</a> for the world&apos;s artists.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
