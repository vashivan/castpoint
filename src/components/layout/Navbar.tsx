"use client";

import styles from "../../styles/Navbar.module.scss";

import React, { useState } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { motion } from "framer-motion";

import {
  Briefcase,
  MessageSquare,
  Edit3,
  Menu,
  CircleX,
  LogOutIcon,
  User,
  Building2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useEmployerAuth } from "../../context/EmployerAuthContext";

import Modal from "../ui/Modal";
import DesktopLogin from "./DesktopLogin";

interface NavbarProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
  isScrolled: boolean;
  sidebarOpen: boolean;
}

const artistNavItems = [
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
    path: "/employer/jobs",
    label: "My Jobs",
    icon: Briefcase,
  },
  {
    path: "/employer/dashboard",
    label: "Application dashboard",
    icon: Building2,
  },
];

const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isOpen,
  isScrolled,
  sidebarOpen,
}) => {
  const pathname = usePathname();

  const {
    user,
    logoutArtist,
  } = useAuth();

  const {
    employer,
    isLogged: isEmployerLogged,
    logoutEmployer,
  } = useEmployerAuth();

  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  const isAuthenticated =
    Boolean(user) || Boolean(employer);

  const textColor =
    !isHome || isAuthenticated || isScrolled
      ? "black"
      : "white";

  const baseColor = isScrolled
    ? "text-black"
    : textColor === "black"
      ? "text-black"
      : "text-white";

  const activeColor = "underline";

  const currentNavItems =
    isEmployerLogged && employer
      ? employerNavItems
      : artistNavItems;

  async function handleLogout() {
    try {
      if (employer) {
        await logoutEmployer();
        return;
      }

      if (user) {
        await logoutArtist();
      }
    } catch (error) {
      console.error("[navbar.logout.error]", error);
    }
  }

  return (
    <nav
      className={`
        ${styles.navbar}
        fixed top-0 left-0 w-full z-10
        transition-all duration-300
        ${isScrolled
          ? "bg-white/5 backdrop-blur z-999 shadow-sm"
          : "bg-transparent"
        }
        ${sidebarOpen ? "hidden" : ""}
      `}
    >
      <div className="container mx-auto flex space-x-1 justify-between items-center h-16 px-3">

        <Link
          href="/"
          className={`
            ${styles.navbar_div_logo}
            text-2xl uppercase font-extrabold
            flex items-center creative-gradient-text
          `}
          style={{ color: textColor }}
        >
          Castpoint
        </Link>

        <div className="hidden md:flex gap-5 space-x-2">
          {currentNavItems.map(
            ({ path, label }) => {
              const isActive =
                pathname === path ||
                pathname?.startsWith(`${path}/`);

              return (
                <Link
                  key={path}
                  href={path}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-semibold"
                >
                  <p
                    className={`
                      ${isActive
                        ? activeColor
                        : baseColor
                      }
                      ${styles.link}
                    `}
                  >
                    {label}
                  </p>
                </Link>
              );
            }
          )}
        </div>

        {/* DESKTOP AUTH */}

        {user || employer ? (
          <div className="hidden md:flex items-center gap-4">

            {/* Employer profile shortcut */}

            {employer && (
              <Link
                href="/employer/profile"
                className="flex flex-col items-center text-primary/80 hover:text-primary transition"
              >
                <Building2 className="h-5 w-5 mb-1" />

                <p className="text-xs">
                  {employer.company_name}
                </p>
              </Link>
            )}

            {/* Artist profile shortcut */}

            {user && !employer && (
              <Link
                href="/profile"
                className="flex flex-col items-center text-primary/80 hover:text-primary transition"
              >
                <User className="h-5 w-5 mb-1" />

                <p className="text-xs">
                  Profile
                </p>
              </Link>
            )}

            <button
              className="flex flex-col items-center text-primary/80 hover:text-primary transition cursor-pointer"
              onClick={handleLogout}
            >
              <LogOutIcon className="h-5 w-5 mb-1" />

              <p className="text-xs">
                Log out
              </p>
            </button>

          </div>
        ) : (
          <div className="hidden md:flex items-center">
            <button
              className="flex flex-col items-center text-primary/80 hover:text-primary transition cursor-pointer"
              onClick={() =>
                setOpen(true)
              }
            >
              <User
                color={textColor}
                width={45}
                height={30}
              />
            </button>
          </div>
        )}

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          widthClass="max-w-lg"
        >
          <DesktopLogin
            onSuccess={() =>
              setOpen(false)
            }
          />
        </Modal>

        {/* MOBILE */}

        <div className="md:hidden flex">
          <motion.button
            whileTap={{ scale: 0.7 }}
            onClick={onToggleSidebar}
          >
            {!isOpen ? (
              <Menu
                size={35}
                className={`
                  ${baseColor}
                  cursor-pointer
                `}
              />
            ) : (
              <CircleX
                size={35}
                className="text-white cursor-pointer"
              />
            )}
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;