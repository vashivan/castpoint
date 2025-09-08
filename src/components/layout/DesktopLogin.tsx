'use client'

import { useRouter } from "next/navigation"
import TextInput from "../ui/input"
import { useState } from "react"
import { motion } from 'framer-motion';
import Link from "next/link";
import CastpointLoader from "../ui/loader";
import { useAuth } from "../../context/AuthContext";
import { usePathname } from "next/navigation";

type LoginPageProps = {
  onSuccess?: () => void; // ← якщо відкриваєш у модалці, закриємо її після успіху
};

export default function DesktopLogin({ onSuccess }: LoginPageProps) {
  const pathname = usePathname();

  const { refreshUser } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  // ✅ Безпечний парсер відповіді (підтримує 204, пусте тіло, не-JSON)
  const safeParse = async (res: Response) => {
    if (res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    // якщо не JSON — спробуємо text
    if (!ct.includes('application/json')) {
      const text = await res.text();
      try { return text ? JSON.parse(text) : null; } catch { return { raw: text }; }
    }
    // якщо JSON
    const text = await res.text(); // інколи body порожнє, .json() кине помилку
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/login', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ← якщо ставиш кукі (httpOnly) на бекенді
        body: JSON.stringify(form),
      });

      const data = await safeParse(res);

      if (res.ok) {
        await refreshUser();
        onSuccess?.();            // ← закрити модалку, якщо передали проп
        router.push('/');         // або лишай на тій же сторінці, якщо це модалка
      } else {
        const errMsg =
          (data && (data.error || data.message)) ||
          'Wrong password or email. Try again, please.';
        setMessage(errMsg);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage('Sorry, caught trouble. Try again later or contact us.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col w-120 items-center aling-text-center border border-white/20 rounded-3xl p-8 shadow-xl overflow-hidden justify-center
    ${pathname === '/login' ? "bg-transparent" : "bg-white/30 backdrop-blur-md "}`}>
      {/* <section className="h-90 w-90 px-6 py-20 flex flex-col items-center justify-center text-center bg-transparent"> */}
      <h1 className="text-2xl md:text-3xl uppercase bg-clip-text mb-5 py-6">
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
          className="flex flex-col items-center w-full max-w-md space-y-2 relative"
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
            disabled={loading || !form.email || !form.password}
            className={`w-full py-2 text-white font-semibold rounded-xl transition 
                          bg-gradient-to-r from-green-500 to-yellow-300 hover:opacity-90 
                          cursor-pointer mt-6 items-center disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? <CastpointLoader /> : <p>Sign in</p>}
          </button>

          {message && (
            <div className="flex flex-col items-center">
              <p className="px-3 py-3 flex flex-col items-center text-red-600 text-xl">{message}</p>
              <button className="border p-2 rounded-xl cursor-pointer">
                <Link href="/forgot-password">Forgot password</Link></button>
            </div>
          )}
        </form>

        {/* w-50 → у Tailwind нема. Використай w-1/2 або точне значення w-[200px] */}
        <hr className="w-1/2 border-t border-black mt-7" />

        <div className="px-3 py-3 flex flex-col items-center justify-center text-justify">
          <p className="flex items-center text-center text-black mb-6">
            or signup now <br /> and become a part of Castpoint
          </p>
          <Link
            href="/signup"
            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white 
                         hover:from-yellow-500 hover:via-orange-500 hover:to-pink-600 
                         font-semibold whitespace-nowrap shadow-md rounded-2xl px-2.5 py-2.5 
                         cursor-pointer w-full flex justify-center"
          >
            Sign up
          </Link>
        </div>
      </motion.div>
      {/* </section> */}
    </div>
  );
}
