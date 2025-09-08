'use client';

import styles from '../../styles/Sidebar.module.scss';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, MessageSquare, Edit3, UserCircle, LogIn, LogOutIcon, User, Menu, CircleX } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { path: "/", label: "CASTPOINT" },
  { path: "/profile", label: "My profile", icon: User },
  { path: "/vacancies", label: "Vacancies", icon: Briefcase },
  { path: "/reviews", label: "Reviews", icon: MessageSquare },
  { path: "/blog", label: "Blog", icon: Edit3 },
];


export default function Sidebar({ isOpen, onClose, handlerLogOut }: { isOpen: boolean, onClose: () => void, handlerLogOut: () => void; isScrolled: boolean; }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // const [screenWidth, setScreenWidth] = useState(0);

  // useEffect(() => {
  //   setScreenWidth(window.innerWidth);
  //   const handleResize = () => setScreenWidth(window.innerWidth);
  //   window.addEventListener('resize', handleResize);
  //   return () => window.removeEventListener('resize', handleResize);
  // }, []);

  const filteredNavItems = navItems.filter((item) => {
    if (item.path === "/profile" && !user) {
      return false;
    }
    return true;
  })

  // const sidebarTop = isScrolled
  //   ? screenWidth >= 678
  //     ? 'top-[84px]'
  //     : 'top-[-16px]'
  //   : 'top-[-16px]';


  return (
    <div className={`fixed top-0 left-0 h-full w-full bg-gray-900 text-black transform ${isOpen ? 'translate-x-0 overflow-hidden overflow-x-hidden' : '-translate-x-full'} transition-transform duration-300 bg-white/5 backdrop-blur-sm shadow-md z-999`}>
      <nav className="p-4">
        <div className="md:hidden space-x-5">
          <div className="mb-10 flex flex-col text-center items-center">
            {filteredNavItems.map(({ path, label }) => {
              const isActive = pathname === path;
              return (

                <Link
                  key={path}
                  href={path}
                  className="flex items-center px-3 py-2 rounded-md mb-2.5"
                  onClick={onClose}
                >
                  <p
                    className={
                      `${isActive ? "underline" : ""} text-2xl
                      ${path === "/" ? `${styles.sidebar_link_logo}` : ""}`
                    }
                  >
                    {label}
                  </p>
                </Link>
              );
            })}
          </div>


          {user ? (
            <div
              className="mb-10 flex flex-col text-center items-center"
            >
              <button
                className="flex items-center px-3 py-2 rounded-md text-black/100 font-semibold mb-2.5 cursor-pointer"
                onClick={() => {
                  handlerLogOut();
                  onClose();
                }}
              >
                <LogOutIcon className="mr-2" />
                Log out
              </button>
            </div>
          ) : (
            <div
              className="mb-10 flex flex-col text-center items-center"
            >
              <Link
                href="/login"
                className="flex items-center px-3 py-2 rounded-md text-black font-semibold mb-2.5 text-2xl"
                onClick={onClose}
              >
                <LogIn className="mr-3 h-5 w-5" />
                Sing in
              </Link>

              <Link
                href="/signup"
                className="flex items-center px-3 py-2 rounded-md text-black font-semibold mb-2.5 text-2xl"
                onClick={onClose}
              >
                <UserCircle className="mr-3 h-5 w-5" />
                Sign up
              </Link>
            </div>
          )}

          <div className="mb-10 flex flex-col text-center items-center">
            <motion.button
              whileTap={{ scale: 0.7 }}
              onClick={onClose}
            >
              {!isOpen ?
                <Menu size={45} className="text-black cursor-pointer" />
                :
                <CircleX size={45} className="text-black cursor-pointer" />
              }

            </motion.button>
          </div>

          <div className="mt-12 pt-10 border-t border-gray text-center text-black text-m relative z-10">
            <p>&copy; {new Date().getFullYear()} Castpoint team. All rights reserved to shine.</p>
            <p>Crafted with 💖 and 🤖 by Castpoint team for the world&apos;s artists.</p>
          </div>
        </div>
      </nav>
    </div>
  );
}