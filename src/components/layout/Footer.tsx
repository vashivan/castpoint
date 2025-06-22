import React from "react";
import Link from "next/link"; // Імпорт Link з Next.js
import { Facebook, Twitter, Instagram, Linkedin, Sparkles } from "lucide-react"; // Імпорт кнопки з твоїх UI компонентів

const Footer = () => {
  return (
    <footer className="bg-gradient-to-tr from-gray-900 via-purple-900 to-pink-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t-1">
      <div
        className="absolute inset-0 opacity-10 zigzag-bg"
        style={{ backgroundSize: "30px 30px" }}
      ></div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
        <div>
          <Link href="/" className="flex items-center text-2xl font-extrabold mb-4 creative-gradient-text text-pink-400">
            <Sparkles size={28} className="mr-2 text-pink-400" />
            Castpoint
          </Link>
          <p className="text-sm text-gray-300 mb-4">
            Unleash your talent. Conquer the world.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors" aria-label="Facebook">
              <Facebook size={22} />
            </a>
            <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors" aria-label="Instagram">
              <Instagram size={22} />
            </a>
          </div>
        </div>
        <div>
          <p className="font-semibold text-lg text-purple-400 mb-4">Explore</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/vacancies" className="text-gray-300 hover:text-purple-400 transition-colors">
                Vacancies
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="text-gray-300 hover:text-purple-400 transition-colors">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-gray-300 hover:text-purple-400 transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-colors">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        {/* <div>
          <p className="font-semibold text-lg text-purple-400 mb-4">Company</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-300  hover:text-purple-400 transition-colors">
                Press
              </a>
            </li>
          </ul>
        </div> */}
        <div>
          <p className="font-semibold text-lg text-yellow-400 mb-4">Stay Connected</p>
          <p className="text-sm text-gray-300 mb-3">
            Get exclusive updates & opportunities.
          </p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your Email"
              className="flex-grow p-2.5 text-sm rounded-md bg-white/10 text-white border border-white/20 focus:ring-yellow-400 focus:border-yellow-400 outline-none placeholder-gray-400 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-black hover:from-yellow-500 hover:via-orange-500 hover:to-pink-600 font-semibold whitespace-nowrap shadow-md rounded-2xl px-2.5 py-2.5 cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className="mt-12 pt-10 border-t border-white/20 text-center text-gray-400 text-xs relative z-10">
        <p>&copy; {new Date().getFullYear()} Castpoint team. All rights reserved to shine.</p>
        <p>Crafted with 💖 and 🤖 by Castpoint team for the world's artists.</p>
      </div>
    </footer>
  );
};

export default Footer;
