import styles from '../../styles/Footer.module.scss';
import Image from 'next/image'
import React, { useState } from "react";
import Link from "next/link";
import TextInput from '../ui/input';

const Footer = () => {
  const [formEmail, setFormEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail) {
      setMsg('Please enter a valid email address.');
      setTimeout((() => setMsg('')), 3000);
    }

    setLoading(true);
    try {
      const response = await fetch('api/subscribe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ email: formEmail }),
      });
      if (response.ok) {
        setFormEmail('');
        setMsg('Thank you for subscribing!');
      } else {
        setMsg('Subscription failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMsg('An error occurred. Please try again later.');
    };

    setLoading(false);
  };

  return (
    <footer className={`${styles.footer} bg-transparent text-black px-4 sm:px-6 lg:px-8 mt-5`}>
      <div className={styles.footer_border} />

      <div className={styles.footer_social}>
        <a href="#" aria-label="Facebook">
          <Image width={0} height={0} className="w-10 h-10 transition-transform duration-300 hover:scale-110" src="/images/icons/facebook.svg" alt="Facebook" />
        </a>
        <a href="#" aria-label="Instagram">
          <Image width={0} height={0} className="w-10 h-10 transition-transform duration-300 hover:scale-110" src="/images/icons/instagram.svg" alt="Instagram" />
        </a>
      </div>

      <div className={styles.footer_links}>
        <Link href="/vacancies" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Vacancies</Link>
        <Link href="/reviews" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Reviews</Link>
        <Link href="/blog" className={` ${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Blog</Link>
        <Link href="/contact" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Contact us</Link>
      </div>

      <div className={styles.footer_subscribe}>
        <p className="text-sm text-gray-600">One click and you are closer to your dream job!</p>
        <form className={styles.footer_subscribe_form}>
          <TextInput
            type='email'
            name="email"
            placeholder="Your email here"
            value={formEmail}
            onChange={(val: string) => setFormEmail(val)}
          />
          {msg && <p className='text-red text-xs m-0 p-o'>{msg}</p>}
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-50 bg-gradient-to-r text-sm rounded-3xl from-yellow-400 via-orange-400 to-pink-500 font-semibold px-4 py-2 shadow-md hover:from-yellow-500 hover:to-pink-600 cursor-pointer"
          >
            {loading ? 'Submitting...' : 'Subscribe'}
          </button>
        </form>
      </div>

      <div className={styles.footer_copyright}>
        <h1 className="text-bold uppercase text-4xl text-black mb-5">Castpoint</h1>
        <p>&copy; {new Date().getFullYear()} Castpoint team. All rights reserved to shine.</p>
        <p>Crafted with 💖 and 🤖 by Castpoint team for the world&apos;s artists.</p>
      </div>
    </footer>
  );
};

export default Footer;
