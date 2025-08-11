import styles from '../../styles/Footer.module.scss';
import React, { useState } from "react";
import Link from "next/link";

const Footer = () => {
  const [formEmail, setFormEmail] = useState("");

  return (
    <footer className={`${styles.footer} bg-transparent text-black px-4 sm:px-6 lg:px-8`}>
      <div className={styles.footer_border} />

      <div className={styles.footer_social}>
        <a href="#" aria-label="Facebook">
          <img className="w-10 h-10 transition-transform duration-300 hover:scale-110" src="/images/icons/facebook.svg" alt="Facebook" />
        </a>
        <a href="#" aria-label="Instagram">
          <img className="w-10 h-10 transition-transform duration-300 hover:scale-110" src="/images/icons/instagram.svg" alt="Instagram" />
        </a>
      </div>

      <div className={styles.footer_links}>
        <Link href="/vacancies" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Vacancies</Link>
        <Link href="/reviews" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Reviews</Link>
        <Link href="/blog" className={` $styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Blog</Link>
        <Link href="/contact" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Contact us</Link>
      </div>

      <div className={styles.footer_subscribe}>
        <p className="text-sm text-gray-600">One click and you're closer to your dream job!</p>
        <form className={styles.footer_subscribe_form}>
          <input
            type="email"
            placeholder="Your Email"
            className="w-95  rounded-l-3xl rounded-r-3xl flex-grow p-2.5 text-sm bg-white/10 text-black border border-black/20 focus:ring-orange-400 focus:border-orange-400 outline-none placeholder-gray-500 backdrop-blur-sm"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />
          <button
            type="submit"
            className="bg-gradient-to-r rounded-3xl from-yellow-400 via-orange-400 to-pink-500 font-semibold px-4 py-2 shadow-md hover:from-yellow-500 hover:to-pink-600 cursor-pointer"
          >
            Subscribe
          </button>
        </form>
      </div>

      <div className={styles.footer_copyright}>
        <h1 className="text-bold uppercase text-4xl text-black mb-5">Castpoint</h1>
        <p>&copy; {new Date().getFullYear()} Castpoint team. All rights reserved to shine.</p>
        <p>Crafted with 💖 and 🤖 by Castpoint team for the world's artists.</p>
      </div>
    </footer>
  );
};

export default Footer;
