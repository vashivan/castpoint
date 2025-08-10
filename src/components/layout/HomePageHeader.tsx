'use client';

import styles from '../../styles/Navbar.module.scss';
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Briefcase, MessageSquare, Edit3, UserCircle, LogIn, Menu, Sparkles, CircleX, LogOut, LogOutIcon, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
  handlerLogOut: () => void
}

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/profile", label: "My profile", icon: User },
  { path: "/vacancies", label: "Vacancies", icon: Briefcase },
  { path: "/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/blog", label: "Blog", icon: Edit3 },
];

const HomePageHeader: React.FC<NavbarProps> = ({ onToggleSidebar, isOpen, handlerLogOut }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter((item) => {
    if (item.path === "/profile" && !user) {
      return false;
    }

    return true;
  })
  

  return (
    <nav className={`${styles.navbar} fixed top-0 left-0 z-10 w-full`}>
      <div className="container mx-auto flex space-x-1 justify-between items-center h-16 px-2">
        <Link href="/" className={`${styles.navbar_div_logo} text-2xl uppercase text-white font-extrabold flex items-center creative-gradient-text`}>
          <motion.div whileHover={{ scale: 1.15, rotate: -10 }} className="mr-2">
          </motion.div>
          Castpoint
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex space-x-2">
          {filteredNavItems.map(({ path, label, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <Link key={path} href={path} className="flex items-center px-3 py-2 rounded-md text-sm font-semibold">
                <Icon className={`mr-2 h-4 w-4 ${isActive ? "text-pink-800" : "text-primary/50"}`} />
                <p
                  className={`${isActive ? "text-pink-800" : "text-05xl"} `}
                >
                  {label}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Desktop login/signup */}
        {user ? (
          <div className="hidden md:flex items-center space-x-6n">
            <button className="flex flex-col items-center text-primary/80 hover:text-primary transition cursor-pointer" onClick={handlerLogOut}>
              <LogOutIcon className="h-5 w-5 mb-1" />
              <p className="text-xs" >Log out</p>
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/login" className="flex flex-col items-center text-primary/80 hover:text-primary transition">
              <LogIn className="h-5 w-5 mb-1" />
              <p className="text-xs">Log-in</p>
            </Link>

            <Link href="/signup" className="flex flex-col items-center text-primary/80 hover:text-primary transition">
              <UserCircle className="mr-1 h-5 w-5 mb-1" />
              <p className="text-xs">Sign up</p>
            </Link>
          </div>
        )}

        {/* Mobile hamburger */}
        <div className="md:hidden flex">
          <motion.button
            whileTap={{ scale: 0.7 }}
            onClick={onToggleSidebar}
          >
            {!isOpen ?
              <Menu size={30} className="text-pink-400 cursor-pointer" />
              :
              <CircleX size={30} className="text-pink-400 cursor-pointer" />
            }

          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default HomePageHeader;
