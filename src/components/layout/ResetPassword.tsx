'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import TextInput from '../ui/input';
import AuthShell from '../auth/AuthShell';
import { Button } from '../ds/Button';

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
      const res = await fetch('/api/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Reset failed. Try again.');

      setOk(true);
      setMsg('Password updated. Taking you to sign in…');
      setTimeout(() => router.push(data?.user_type === 'employer' ? '/employer/login' : '/login'), 1500);
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Reset failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell tone="blue" kicker="Password help" title={<>New<br />password.</>}>
      {!token ? (
        <>
          <p className="font-display text-[32px]">Link not valid</p>
          <p className="mt-4 text-ink/70">The reset link is invalid or missing a token. Please request a new one.</p>
          <Button href="/forgot-password" arrow className="mt-8 w-full">Request new link</Button>
        </>
      ) : (
        <>
          <p className="label text-ink/60">Reset password</p>
          <p className="font-display mt-2 text-[36px]">Set a new one</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <TextInput type={show ? 'text' : 'password'} label="New password" name="password" autoComplete="new-password" placeholder="At least 8 characters" value={password} onChange={setPassword} />
            </div>
            <div>
              <TextInput type={show ? 'text' : 'password'} label="Repeat new password" name="password2" autoComplete="new-password" placeholder="Repeat password" value={password2} onChange={setPassword2} />
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-[14px]">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="h-4 w-4 accent-ink" />
              Show passwords
            </label>
            {msg && <p className={`border-[1.5px] border-ink px-4 py-3 text-[14px] font-semibold ${ok ? 'bg-lime' : 'bg-pink'}`}>{msg}</p>}
            <Button type="submit" disabled={!canSubmit} arrow={!loading} className="w-full">
              {loading ? 'Saving…' : 'Set new password'}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
