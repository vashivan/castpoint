'use client';

import styles from '../../styles/Navbar.module.scss';
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Briefcase, MessageSquare, Edit3, UserCircle, LogIn, Menu, Sparkles, CircleX, LogOut, LogOutIcon, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import LoginPage from './LoginPage';
import Modal from '../ui/Modal';

interface NavbarProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
  handlerLogOut: () => void;
  isScrolled: boolean;
  sidebarOpen: boolean;
}

const navItems = [
  { path: "/vacancies", label: "Vacancies", icon: Briefcase },
  { path: "/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/blog", label: "Blog", icon: Edit3 },
];

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isOpen, handlerLogOut, isScrolled, sidebarOpen }) => {
  const pathname = usePathname();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const isHome = pathname === "/";
  const textColor = !isHome || user || isScrolled ? 'text-black' : 'text-white';

  const filteredNavItems = navItems.filter((item) => {
    if (item.path === "/profile" && !user) {
      return false;
    }
    return true;
  })

  const baseColor = isScrolled ? "text-black" : textColor;
  const activeColor = "underline";


  return (
    <nav className={`
      ${styles.navbar} fixed top-0 left-0 w-full z-10 transition-all duration-300 
      ${isScrolled ? 'bg-white/5 backdrop-blur z-999 shadow-sm' : 'bg-transparent'}
      ${sidebarOpen ? `hidden` : ``}
    `}
    >
      <div className="container mx-auto flex space-x-1 justify-between items-center h-16 px-3">
        <Link href="/" className={`
          ${styles.navbar_div_logo} 
          text-2xl uppercase font-extrabold flex items-center creative-gradient-text
          ${textColor}
        `}>
          Castpoint
        </Link>

        <div className="hidden md:flex gap-5 space-x-2">
          {filteredNavItems.map(({ path, label }) => {
            const isActive = pathname === path;

            return (
              <Link
                key={path}
                href={path}
                className="flex items-center px-3 py-2 rounded-md text-sm font-semibold"
              >
                <p className={`${isActive ? activeColor : baseColor} ${styles.link}`}>
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
              <p className="text-xs">Log out</p>
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center space-x-6n">
            <button className={`flex flex-col items-center text-primary/80 hover:text-primary transition cursor-pointer`} onClick={() => setOpen(!open)}>
              <img src="/images/icons/person.svg" alt=""
                className={`h-7 w-7 mb-1 ${textColor}`}
              />
            </button>
          </div>
        )}

        <Modal open={open} onClose={() => setOpen(false)} widthClass="max-w-lg">
          <LoginPage onSuccess={() => setOpen(false)} />
        </Modal>

        {/* Mobile hamburger */}
        <div className="md:hidden flex">
          <motion.button
            whileTap={{ scale: 0.7 }}
            onClick={onToggleSidebar}
          >
            {!isOpen ?
              <Menu
                size={35}
                className={`
                ${textColor} 
                cursor-pointer
                `} />
              :
              <CircleX size={35} className="text-white cursor-pointer" />
            }
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
