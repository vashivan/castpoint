// app/reset-password/reset-form.tsx
'use client';

import { useState } from 'react';

export default function ResetForm({ token, email }: { token: string; email: string }) {
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const canSubmit =
    !loading && token && p1.length >= 8 && p1 === p2;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!token) return setMsg('Invalid or missing token.');
    if (p1.length < 8) return setMsg('Password must be at least 8 characters.');
    if (p1 !== p2) return setMsg('Passwords do not match.');

    try {
      setLoading(true);
      const res = await fetch('/api/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password: p1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Reset failed. Try again.');
      setOk(true);
      setMsg('Password updated. You can log in now.');
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md p-[2px] rounded-3xl bg-gradient-to-r from-[#AA0254] to-[#F5720D]">
        <form onSubmit={submit} className="rounded-3xl bg-white shadow-xl p-8">
          <h1 className="text-3xl font-semibold text-center mb-6">Reset password</h1>

          {!token ? (
            <p className="text-red-600">Invalid or missing reset link.</p>
          ) : (
            <>
              <label className="block mb-3">
                <span className="block text-sm font-medium mb-1">New password</span>
                <input
                  type="password"
                  className="w-full rounded-xl border px-4 py-2"
                  value={p1}
                  onChange={(e) => setP1(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </label>

              <label className="block">
                <span className="block text-sm font-medium mb-1">Repeat new password</span>
                <input
                  type="password"
                  className="w-full rounded-xl border px-4 py-2"
                  value={p2}
                  onChange={(e) => setP2(e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
              </label>

              {msg && (
                <div className={`mt-4 text-sm ${ok ? 'text-green-600' : 'text-red-600'}`}>
                  {msg}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className={`mt-6 w-full py-2 rounded-xl text-white font-semibold cursor-pointer
                  ${canSubmit ? 'bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {loading ? 'Saving…' : 'Set new password'}
              </button>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
