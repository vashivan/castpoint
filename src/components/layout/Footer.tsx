import styles from '../../styles/Footer.module.scss';
import { useAuth } from '../../context/AuthContext';
import Image from 'next/image'
import React, { useState } from "react";
import Link from "next/link";
import TextInput from '../ui/input';


const Footer = () => {
  const { user } = useAuth();
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
        setMsg('E-mail is already subscribed or an error occurred.');
        setTimeout((() => setMsg('')), 3000);
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
        <a href="https://www.facebook.com/profile.php?id=61581139737398" aria-label="Facebook">
          <Image width={0} height={0} className="w-10 h-10 transition-transform duration-300 hover:scale-110" src="/images/icons/facebook.svg" alt="Facebook" />
        </a>
        <a href="https://www.instagram.com/castpoint" aria-label="Instagram">
          <Image width={0} height={0} className="w-10 h-10 transition-transform duration-300 hover:scale-110" src="/images/icons/instagram.svg" alt="Instagram" />
        </a>
      </div>

      <div className={styles.footer_links}>
        <Link href="/vacancies" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Vacancies</Link>
        <Link href="/reviews" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Reviews</Link>
        <Link href="/blog" className={` ${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Blog</Link>
        {/* <Link href="/contact" className={`${styles.footer_links_link} text-black hover:text-orange-500 transition-colors text-2xl`}>Contact us</Link> */}
      </div>


      {user ? ('') : (
        <div className={styles.footer_subscribe}>
          <p className="text-sm text-gray-600">One click and you are closer to your dream job!</p>
          <form className={styles.footer_subscribe_form}>
            <label className='relative border-rounded-3xl w-full' htmlFor="">
              <TextInput
                classname="text-left bg-white/100 border border-orange-400 mb-4 placeholder:text-black/50"
                type='email'
                name="email"
                placeholder="e-mail here"
                value={formEmail}
                onChange={(val: string) => setFormEmail(val)}
              />
              <p className='text-red text-xs mt-0 p-0 h-10'>
                {msg ? `${msg}` : ""}</p>
              <button
                type="submit"
                onClick={handleSubmit}
                className="text-black/30 text-sm font-semibold px-4 py-2 cursor-pointer absolute right-1 top-4.5 flex items-center justify-center"
                disabled={loading}
              >
                <svg width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.07112 8.07088C8.46164 7.68035 8.46164 7.04719 8.07112 6.65666L1.70716 0.292702C1.31664 -0.0978227 0.68347 -0.0978227 0.292946 0.292702C-0.0975785 0.683226 -0.0975785 1.31639 0.292946 1.70692L5.9498 7.36377L0.292946 13.0206C-0.0975785 13.4111 -0.0975785 14.0443 0.292946 14.4348C0.68347 14.8254 1.31664 14.8254 1.70716 14.4348L8.07112 8.07088ZM6.36401 7.36377V8.36377H7.36401V7.36377V6.36377H6.36401V7.36377Z" fill="gray" />
                </svg>
              </button>
            </label>
          </form>
        </div>
      )}


      <div className={styles.footer_copyright}>
        <h1 className="text-bold uppercase text-4xl text-black mb-5">Castpoint</h1>
        <p>&copy; {new Date().getFullYear()} Castpoint team. All rights reserved to shine.</p>
        <p>Designed by <a className='underline' href="https://www.instagram.com/a_little_surprise/">Kira Pryz</a>, crafted with 💖 and 🤖 by <a className='underline' target='_blank' href="https://ndgg.space/">ndgg.lab</a> for the world&apos;s artists.</p>
      </div>
    </footer>
  );
};

export default Footer;
