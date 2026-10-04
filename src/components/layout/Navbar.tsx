"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useEmployerAuth } from "../../context/EmployerAuthContext";

import Modal from "../ui/Modal";
import ArtistLoginForm from "../auth/ArtistLoginForm";
import { Button } from "../ds/Button";
import { Logo } from "../ds/primitives";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
  isScrolled: boolean;
  sidebarOpen: boolean;
}

const artistNavItems = [
  { path: "/vacancies", label: "Contracts" },
  { path: "/reviews", label: "Reviews" },
  { path: "/employer/login", label: "For employers" },
  { path: "/pricing", label: "Pricing" },
];

const employerNavItems = [
  { path: "/employer/dashboard", label: "Dashboard" },
  { path: "/employer/jobs", label: "Job offers" },
  { path: "/employer/applications", label: "Applications" },
  { path: "/employer/artists", label: "Find artists" },
];

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isOpen }) => {
  const pathname = usePathname();
  const { user, logoutArtist } = useAuth();
  const { employer, isLogged: isEmployerLogged, logoutEmployer } = useEmployerAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  // "For employers" is a sign-in link, so signed-in artists don't need it
  const navItems =
    isEmployerLogged && employer
      ? employerNavItems
      : user
        ? artistNavItems.filter((i) => i.path !== "/employer/login")
        : artistNavItems;

  async function handleLogout() {
    try {
      if (employer) return await logoutEmployer();
      if (user) await logoutArtist();
    } catch (error) {
      console.error("[navbar.logout.error]", error);
    }
  }

  const authLink = "label text-[11px] hover:underline underline-offset-4 decoration-2 cursor-pointer";

  return (
    <nav className="sticky top-0 z-50 h-13 w-full border-b border-ink bg-paper">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/" aria-label="Castpoint home">
          <Logo />
        </Link>

        <div className="hidden h-full items-center gap-6 md:flex">
          {navItems.map(({ path, label }) => {
            const active = pathname === path || pathname?.startsWith(`${path}/`);
            return (
              <Link
                key={path}
                href={path}
                className={cn(
                  "label flex items-center border-b-2 py-1 text-[11px]",
                  active ? "border-ink" : "border-transparent hover:border-ink/30"
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {employer ? (
            <>
              <Link href="/pricing" className="label border-[1.5px] border-ink px-2.5 py-1">Free plan</Link>
              <Link
                href="/employer/profile"
                title={employer.company_name}
                className="grid h-9 w-9 place-items-center bg-ink text-[13px] font-bold text-paper"
              >
                {employer.company_name?.[0]?.toUpperCase() ?? "E"}
              </Link>
              <button className={authLink} onClick={handleLogout}>Log out</button>
            </>
          ) : user ? (
            <>
              <Link href="/profile" className={authLink}>Profile</Link>
              <button className={authLink} onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <button className={authLink} onClick={() => setLoginOpen(true)}>Sign in</button>
              <Button href="/signup" variant="ink" className="px-5 py-2.5 text-[11px]">
                Create profile
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={onToggleSidebar} aria-label={isOpen ? "Close menu" : "Open menu"}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <Modal open={loginOpen} onClose={() => setLoginOpen(false)} widthClass="max-w-lg">
        <ArtistLoginForm onSuccess={() => setLoginOpen(false)} />
      </Modal>
    </nav>
  );
};

export default Navbar;
