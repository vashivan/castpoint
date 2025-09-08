// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!email) return;

    try {
      setLoading(true);
      // ← якщо твій ендпоінт називається інакше, заміни шлях
      const res = await fetch('/api/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to send email');

      setMsg('If this email exists, we sent a reset link.');
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md p-[2px] rounded-3xl bg-gradient-to-r from-[#AA0254] to-[#F5720D]">
        <form onSubmit={submit} className="rounded-3xl bg-white shadow-xl p-8">
          <h1 className="text-3xl font-semibold text-center mb-6">Forgot password</h1>

          <label className="block mb-4">
            <span className="block text-sm font-medium text-gray-900 mb-1">Your email</span>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </label>

          {msg && <p className="text-sm mt-2 text-gray-700">{msg}</p>}

          <button
            type="submit"
            disabled={loading || !email}
            className={`mt-4 w-full py-2 rounded-xl text-white font-semibold transition cursor-pointer
              ${loading || !email ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#AA0254] to-[#F5720D] hover:opacity-90'}`}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>
    </main>
  );
}
