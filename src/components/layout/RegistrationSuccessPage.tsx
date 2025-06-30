import Link from "next/link";
import { LogIn, Sparkle, Sparkles } from "lucide-react";

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-500 via-pink-400 to-orange-300">
      <div className="flex flex-col items-center backdrop-blur-md rounded-2xl p-10 max-w-md text-center animate-fade-in">
        <h1 className="text-3xl font-bold mb-4 text-white/60">Registration Successful!</h1>
        <h1 className="text-3xl font-bold mb-4">🎉 </h1>
        <p className="mb-2 text-gray-700 text-xl">
          Welcome! <br /> You’re now a part of
        </p>
        <p className="flex items-center text-2xl font-extrabold mb-6 text-pink-800 text-center">
            <Sparkles size={28} className="mr-2 text-pink-800" />
            Castpoint
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 text-white bg-pink-400 hover:bg-pink-500 transition-all px-6 py-3 rounded-full font-semibold shadow-lg"
        >
          <LogIn className="h-5 w-5" />
          <span>Log in to your account</span>
        </Link>
      </div>
    </div>
  );
}
