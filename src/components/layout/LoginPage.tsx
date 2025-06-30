'use client'

import { useRouter } from "next/navigation"
import TextInput from "../ui/input"
import { useState } from "react"
import { motion } from 'framer-motion';
import Link from "next/link";
import CastpointLoader from "../ui/loader";
import { useAuth } from "../../context/AuthContext";


export default function LoginPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await fetch('/api/login', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
  
      const data = await res.json(); // 👈 тут падає, якщо res body пусте
  
      if (res.ok) {
        await refreshUser(); 
        router.push('/');
        console.log("Entered");
        setLoading(false);
      } else {
        console.log("Server error:", data.error);
        setLoading(false);
        setMessage('Wrong password or email. Try again, please.');
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage('Sorry, caught trouble. Try again later or contact us.');
      setLoading(false);
    }
  };
  

  return (
    <div>
      <section className="min-h-screen px-6 py-20 flex flex-col items-center justify-center text-center bg-gradient-to-tr from-purple-500 via-pink-400 to-orange-300">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-800 via-purple-400 to-orange-500 text-transparent bg-clip-text mb-10 py-6">
          Log-in
        </h1>

        <motion.div
          variants={stepVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4 }}
          className="w-full flex flex-col justify-center items-center space-y-1"
        >

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-xl overflow-hidden space-y-6 relative"
          >

            <TextInput
              label="Email"
              name="email"
              placeholder="Your email here"
              value={form.email}
              onChange={(val) => setForm({ ...form, email: val })}
            />

            <TextInput
              type="password"
              label="Password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(val) => setForm({ ...form, password: val })}
            />
            <button
              type="submit"
              className="w-full py-2 text-white font-semibold rounded-xl transition bg-gradient-to-r from-green-500 to-yellow-300 hover:opacity-90 cursor-pointer mt-6 items-center"
            >
              {loading ? (
                <CastpointLoader />
              ) : (
                <p>Log-in</p>
              )}
            </button>

            {message && (
              <p className="px-3 py-3 flex flex-col items-center text-white/60">{message}</p>
            )}
          </form>

          <hr className="w-50 border-t border-white/40 mt-7" />

          <div className="px-3 py-3 flex flex-col items-center">
            <p className="text-white/60 mb-6">or signup now  <br /> and become a part of Castpoint</p>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white hover:from-yellow-500 hover:via-orange-500 hover:to-pink-600 font-semibold whitespace-nowrap shadow-md rounded-2xl px-2.5 py-2.5 cursor-pointer w-full"
            >
              Sign up
            </Link>
          </div>

        </motion.div>
      </section>
    </div>
  )
}