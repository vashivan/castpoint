"use client";

import styles from "../../styles/Sidebar.module.scss";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Briefcase,
  MessageSquare,
  Edit3,
  UserCircle,
  LogIn,
  LogOutIcon,
  User,
  Menu,
  CircleX,
  LayoutDashboard,
  Building2,
  FileText,
  PlusCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { useEmployerAuth } from "@/context/EmployerAuthContext";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;

  handlerLogOut: () => void;

  handlerEmployerLogOut?: () => void;

  isScrolled?: boolean;
};

const publicNavItems = [
  {
    path: "/",
    label: "CASTPOINT",
  },
  {
    path: "/vacancies",
    label: "Vacancies",
    icon: Briefcase,
  },
  {
    path: "/reviews",
    label: "Reviews",
    icon: MessageSquare,
  },
  {
    path: "/blog",
    label: "Blog",
    icon: Edit3,
  },
];

const artistNavItems = [
  {
    path: "/profile",
    label: "My profile",
    icon: User,
  },
  {
    path: "/vacancies",
    label: "Vacancies",
    icon: Briefcase,
  },
  {
    path: "/reviews",
    label: "Reviews",
    icon: MessageSquare,
  },
  {
    path: "/blog",
    label: "Blog",
    icon: Edit3,
  },
];

const employerNavItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/employer/profile",
    label: "Company profile",
    icon: Building2,
  },
  {
    path: "/employer/jobs",
    label: "My jobs",
    icon: Briefcase,
  },
  {
    path: "/employer/jobs/new",
    label: "Post a job",
    icon: PlusCircle,
  },
  {
    path: "/employer/applications",
    label: "Applications",
    icon: FileText,
  },
];

export default function Sidebar({
  isOpen,
  onClose,
  handlerLogOut,
  handlerEmployerLogOut,
}: SidebarProps) {
  const pathname = usePathname();

  const { user } = useAuth();

  const {
    employer,
  } = useEmployerAuth();

  const isEmployer = Boolean(employer);
  const isArtist = Boolean(user);

  let navItems = publicNavItems;

  if (isEmployer) {
    navItems = employerNavItems;
  } else if (isArtist) {
    navItems = [
      {
        path: "/",
        label: "CASTPOINT",
      },
      ...artistNavItems,
    ];
  }

  function isActivePath(path: string) {
    if (path === "/") {
      return pathname === "/";
    }

    if (path === "/employer") {
      return pathname === "/employer";
    }

    return pathname?.startsWith(path);
  }

  function handleLogout() {
    if (isEmployer) {
      handlerEmployerLogOut?.();
    } else if (isArtist) {
      handlerLogOut();
    }

    onClose();
  }

  return (
    <div
      className={`
        fixed left-0 top-0 z-[999]
        h-full w-full
        transform
        bg-white/90
        text-black
        backdrop-blur-md
        shadow-md
        transition-transform
        duration-300

        ${
          isOpen
            ? "translate-x-0 overflow-hidden"
            : "-translate-x-full"
        }
      `}
    >
      <nav className="p-4">
        <div className="space-x-5 md:hidden">

          {/* NAVIGATION */}

          <div className="mb-10 flex flex-col items-center text-center">
            {navItems.map(
              ({
                path,
                label,
                icon: Icon,
              }) => {
                const active =
                  isActivePath(path);

                return (
                  <Link
                    key={path}
                    href={path}
                    onClick={onClose}
                    className="
                      mb-2.5
                      flex
                      items-center
                      rounded-md
                      px-3
                      py-2
                    "
                  >
                    {Icon && (
                      <Icon
                        className="mr-3 h-5 w-5"
                      />
                    )}

                    <p
                      className={`
                        text-2xl

                        ${
                          active
                            ? "underline"
                            : ""
                        }

                        ${
                          path === "/"
                            ? styles.sidebar_link_logo
                            : ""
                        }
                      `}
                    >
                      {label}
                    </p>
                  </Link>
                );
              }
            )}
          </div>

          {/* NOT LOGGED */}

          {!isArtist && !isEmployer && (
            <div className="mb-10 flex flex-col items-center text-center">
              <Link
                href="/login"
                className="
                  mb-2.5
                  flex
                  items-center
                  rounded-md
                  px-3
                  py-2
                  text-2xl
                  font-semibold
                "
                onClick={onClose}
              >
                <LogIn className="mr-3 h-5 w-5" />

                Sign in
              </Link>

              <Link
                href="/signup"
                className="
                  mb-2.5
                  flex
                  items-center
                  rounded-md
                  px-3
                  py-2
                  text-2xl
                  font-semibold
                "
                onClick={onClose}
              >
                <UserCircle className="mr-3 h-5 w-5" />

                Sign up
              </Link>

              <Link
                href="/employer/login"
                className="
                  mt-4
                  flex
                  items-center
                  rounded-md
                  px-3
                  py-2
                  text-sm
                  text-neutral-500
                  transition
                  hover:text-black
                "
                onClick={onClose}
              >
                <Building2 className="mr-2 h-4 w-4" />

                Employer sign in
              </Link>
            </div>
          )}

          {/* USER INFO */}

          {isArtist && (
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-widest text-neutral-400">
                Artist account
              </p>

              {user?.email && (
                <p className="mt-1 text-sm text-neutral-600">
                  {user.email}
                </p>
              )}
            </div>
          )}

          {/* EMPLOYER INFO */}

          {isEmployer && (
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-widest text-neutral-400">
                Employer account
              </p>

              {employer?.company_name && (
                <p className="mt-1 text-lg font-medium">
                  {employer.company_name}
                </p>
              )}

              {employer?.email && (
                <p className="mt-1 text-sm text-neutral-500">
                  {employer.email}
                </p>
              )}
            </div>
          )}

          {/* LOGOUT */}

          {(isArtist || isEmployer) && (
            <div className="mb-10 flex flex-col items-center text-center">
              <button
                type="button"
                className="
                  flex
                  cursor-pointer
                  items-center
                  rounded-md
                  px-3
                  py-2
                  font-semibold
                  text-black
                "
                onClick={handleLogout}
              >
                <LogOutIcon className="mr-2 h-5 w-5" />

                Log out
              </button>
            </div>
          )}

          {/* CLOSE */}

          <div className="mb-10 flex flex-col items-center text-center">
            <motion.button
              type="button"
              whileTap={{
                scale: 0.7,
              }}
              onClick={onClose}
            >
              {!isOpen ? (
                <Menu
                  size={45}
                  className="cursor-pointer text-black"
                />
              ) : (
                <CircleX
                  size={45}
                  className="cursor-pointer text-black"
                />
              )}
            </motion.button>
          </div>

          {/* FOOTER */}

          <div
            className="
              relative
              z-10
              mt-12
              border-t
              border-gray-200
              pt-10
              text-center
              text-sm
              text-black
            "
          >
            <p>
              &copy; {new Date().getFullYear()} Castpoint team.
              All rights reserved to shine.
            </p>

            <p className="mt-2">
              Crafted with 💖 and 🤖 by Castpoint team
              for the world&apos;s artists.
            </p>
          </div>
        </div>
      </nav>
    </div>
  );
}