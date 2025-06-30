'use client'

import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthenticatedHome() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen px-15 py-20 bg-gradient-to-tr from-purple-500 via-pink-400 to-orange-300 text-white">
      <h2 className="text-3xl font-bold mb-10 text-center">Welcome back, {user?.name} 👋</h2>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-6">

        {/* New Job Offers */}
        <div className="bg-white/10 rounded-2xl p-6 col-span-4 row-span-7 md:col-span-3">
          <h3 className="text-2xl font-semibold mb-3">🧾 New Job Offers</h3>
          <p className="text-white/70">New job cards will be shown here</p>
        </div>

        {/* Latest Blog Posts */}
        <div className="bg-white/10 rounded-2xl p-6 col-span-4 row-span-7 md:col-span-3">
          <h3 className="text-2xl font-semibold mb-3">📰 Latest Blog Posts</h3>
          <p className="text-white/70">Latest blog post previews here</p>
        </div>

        {/* Feedback on Applications */}
        <div className="bg-white/10 rounded-2xl p-6 col-span-4 md:col-span-4 row-span-5">
          <h3 className="text-xl font-semibold mb-2">💬 Feedback</h3>
          <p className="text-white/70">Feedback section placeholder</p>
        </div>

        {/* Go to Profile */}
        <div className="bg-white/10 text-black rounded-2xl p-6 col-span-4 md:col-span-2 row-span-5 flex flex-col justify-between">
          <h3 className="text-xl font-bold mb-4">👤 My Profile</h3>
          <a
            href="/profile"
            className="mt-auto bg-white/30 text-pink-400 font-semibold py-2 px-4 rounded-lg text-center hover:bg-opacity-80 transition"
          >
            View Profile
          </a>
        </div>
      </div>
    </div>
  );
}
