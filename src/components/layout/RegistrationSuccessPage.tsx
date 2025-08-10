import Link from "next/link";
import { LogIn, Sparkle, Sparkles } from "lucide-react";

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="flex flex-col items-center  rounded-2xl p-10 max-w-md text-center animate-fade-in">
        <h1 className="text-3xl font-bold mb-4 text-white/60">Registration Successful!</h1>
        <h1 className="text-3xl font-bold mb-4">🎉 </h1>
        <p className="mb-2 text-gray-700 text-xl">
          Welcome! <br /> You’re now a part of
        </p>
        <h2 className="flex items-center text-3xl  mb-6 text-black text-center uppercase">
            Castpoint
        </h2>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-90 cursor-pointer transition-all px-6 py-3 rounded-full shadow-lg"
        >
          <LogIn className="h-5 w-5" />
          <span>Log in to your account</span>
        </Link>
      </div>
    </div>
  );
}
