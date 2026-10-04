"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useEmployerAuth } from "@/context/EmployerAuthContext";
import { Button } from "../ds/Button";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  handlerLogOut: () => void | Promise<void>;
  isScrolled?: boolean;
};

const publicNavItems = [
  { path: "/vacancies", label: "Contracts" },
  { path: "/reviews", label: "Reviews" },
  { path: "/pricing", label: "Pricing" },
  { path: "/blog", label: "Blog" },
];

const artistNavItems = [
  { path: "/profile", label: "My profile" },
  ...publicNavItems,
];

const employerNavItems = [
  { path: "/employer/dashboard", label: "Dashboard" },
  { path: "/employer/jobs", label: "Job offers" },
  { path: "/employer/jobs/new", label: "Post a job" },
  { path: "/employer/applications", label: "Applications" },
  { path: "/employer/artists", label: "Find artists" },
  { path: "/employer/profile", label: "Company" },
];

/** Mobile menu: full-screen panel below the navbar. */
export default function Sidebar({ isOpen, onClose, handlerLogOut }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { employer, logoutEmployer } = useEmployerAuth();

  const isEmployer = Boolean(employer);
  const isArtist = Boolean(user);
  const navItems = isEmployer ? employerNavItems : isArtist ? artistNavItems : publicNavItems;

  const isActive = (path: string) => pathname === path || pathname?.startsWith(`${path}/`);

  async function handleLogout() {
    try {
      if (isEmployer) await logoutEmployer();
      else if (isArtist) await handlerLogOut();
    } catch (error) {
      console.error("[sidebar.logout.error]", error);
    } finally {
      onClose();
    }
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 top-13 z-40 flex flex-col overflow-y-auto bg-panel px-4 py-8 text-paper transition-[opacity,transform,visibility] duration-200 md:hidden",
        // Fade/slide vertically so the closed menu never widens the page
        isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
      )}
      aria-hidden={!isOpen}
    >
      <nav className="flex flex-col">
        {navItems.map(({ path, label }) => (
          <Link
            key={path}
            href={path}
            onClick={onClose}
            className={cn(
              "font-display border-b border-paper/15 py-4 text-[32px]",
              isActive(path) ? "text-lime" : "hover:text-lime"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-10 flex flex-col gap-3">
        {!isArtist && !isEmployer ? (
          <div className="flex flex-col gap-3" onClick={onClose}>
            <Button href="/signup" variant="lime" arrow className="w-full">Create profile</Button>
            <Button href="/login" variant="secondary" className="w-full border-paper text-paper">Sign in</Button>
            <Link href="/employer/login" className="label mt-4 text-center text-paper/60">
              Employer sign in →
            </Link>
          </div>
        ) : (
          <>
            <p className="label text-paper/50">{isEmployer ? "Employer account" : "Artist account"}</p>
            <p className="text-sm">{isEmployer ? employer?.company_name : user?.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              className="label mt-4 self-start border-b-2 border-lime pb-1 cursor-pointer"
            >
              Log out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
