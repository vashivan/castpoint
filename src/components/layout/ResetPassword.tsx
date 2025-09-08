'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPassword({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const canSubmit = useMemo(
    () => !loading && !!token && password.length >= 8 && password === password2,
    [loading, password, password2, token]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    if (!token) return setMsg('Invalid or missing token.');
    if (password.length < 8) return setMsg('Password must be at least 8 characters.');
    if (password !== password2) return setMsg('Passwords do not match.');

    try {
      setLoading(true);
      // узгодь із бекендом: /api/password/reset або /api/reset_password
      const res = await fetch('/api/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Reset failed. Try again.');

      setOk(true);
      setMsg('Password updated successfully. You can log in now.');
        setTimeout(() => router.push('/login'), 1500); 
      // за бажанням:
      // setTimeout(() => router.push('/login'), 1500);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-4">Reset password</h1>
          <p className="text-gray-700">
            The reset link is invalid or missing a token. Please request a new password reset.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md p-[2px] rounded-3xl bg-gradient-to-r from-[#AA0254] to-[#F5720D]">
        <form onSubmit={onSubmit} className="rounded-3xl bg-white shadow-xl p-8">
          <h1 className="text-3xl font-semibold text-center mb-6">Reset password</h1>

          <div className="space-y-4">
            <label className="block">
              <span className="block text-sm font-medium text-gray-900 mb-1">New password</span>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 cursor-pointer"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-gray-900 mb-1">Repeat new password</span>
              <input
                type={show ? 'text' : 'password'}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                autoComplete="new-password"
              />
            </label>
          </div>

          {msg && (
            <div className={`mt-4 text-sm ${ok ? 'text-green-600' : 'text-red-600'}`}>
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`mt-6 w-full py-2 rounded-xl text-white font-semibold transition cursor-pointer
              ${canSubmit ? 'bg-gradient-to-r from-[#AA0254] to-[#F5720D] hover:opacity-90' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {loading ? 'Saving…' : 'Set new password'}
          </button>
        </form>
      </div>
    </main>
  );
}
