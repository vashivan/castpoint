'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, MessageSquare, Edit3, UserCircle, LogIn, LogOutIcon, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
// import { motion, scale } from "framer-motion";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/profile", label: "My profile", icon: User },
  { path: "/vacancies", label: "Vacancies", icon: Briefcase },
  { path: "/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/blog", label: "Blog", icon: Edit3 },
];


export default function Sidebar({ isOpen, onClose, handlerLogOut }: { isOpen: boolean, onClose: () => void, handlerLogOut: () => void; }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const filteredNavItems = navItems.filter((item) => {
    if (item.path === "/profile" && !user) {
      return false;
    }

    return true;
  })
  

  return (
    <div className={`fixed top-16 left-0 h-full w-50 bg-gray-900 text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 z-40 bg-pink-100/50 backdrop-blur-xs shadow-md`}>
      <nav className="p-4">
        <div className="md:hidden space-x-5">
          {/* <motion.button
            className="right-10 mb-2.5 p-4 cursor-pointer"
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
          >
            <div>
              <ArrowLeftToLine />
            </div>
          </motion.button> */}
          <div className="mb-10">
            {filteredNavItems.map(({ path, label, icon: Icon }) => {
              const isActive = pathname === path;
              return (

                <Link
                  key={path}
                  href={path}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-semibold mb-2.5"
                  onClick={onClose}
                >
                  <Icon className={`mr-2 h-4 w-4 ${isActive ? "text-white" : "text-black/100"}`} />
                  <p
                    className={`${isActive ? "text-white" : "text-black/100"} text-1.5xl`}
                  >
                    {label}
                  </p>
                </Link>

              );
            })}
          </div>


          {user ? (
            <button
              className="flex items-center px-3 py-2 rounded-md text-black/100 font-semibold mb-2.5 cursor-pointer"
              onClick={() => {
                handlerLogOut(),
                onClose()
              }}
            >
              <LogOutIcon className="mr-2" />
              Log out
            </button>
          ) : (
            <div
              className="mt-10"
            >
              <Link
                href="/login"
                className="flex items-center px-3 py-2 rounded-md text-black/100 font-semibold mb-2.5"
                onClick={onClose}
              >
                <LogIn className="mr-3 h-5 w-5" />
                Login
              </Link>

              <Link
                href="/signup"
                className="flex items-center px-3 py-2 rounded-md text-black/100 font-semibold mb-2.5"
                onClick={onClose}
              >
                <UserCircle className="mr-3 h-5 w-5" />
                Sign in
              </Link>
            </div>

          )}

          <div className="mt-12 pt-10 border-t border-white/50 text-center text-white/70 text-xs relative z-10">
            <p>&copy; {new Date().getFullYear()} Artist Hub. All rights reserved to shine.</p>
            <p>Crafted with 💖 and 🤖 by Castpoint team for the world's artists.</p>
          </div>
        </div>
      </nav>
    </div>
  );
}