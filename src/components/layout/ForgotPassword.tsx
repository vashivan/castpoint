'use client';

import { useState } from 'react';
import TextInput from '../ui/input';
import AuthShell from '../auth/AuthShell';
import { Button } from '../ds/Button';

export default function ForgotPasswordPage({ type = 'artist' }: { type?: 'artist' | 'employer' }) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!email) return;

    try {
      setLoading(true);
      const res = await fetch('/api/forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to send email');
      setSent(true);
      setMsg('If this email exists, we sent a reset link.');
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell tone={type === 'employer' ? 'pink' : 'blue'} kicker={type === 'employer' ? 'Employer password help' : 'Password help'} title={<>Lost<br />your<br />cue?</>} aside={<span className="text-paper">We&apos;ll e-mail you a link to set a new password.</span>}>
      <p className="label text-ink/60">Forgot password</p>
      <p className="font-display mt-2 text-[36px]">Reset link</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <TextInput type="email" label="Your email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={setEmail} />
        </div>
        {msg && <p className={`border-[1.5px] border-ink px-4 py-3 text-[14px] font-semibold ${sent ? 'bg-lime' : 'bg-pink'}`}>{msg}</p>}
        <Button type="submit" disabled={loading || !email} arrow={!loading} className="w-full">
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthShell>
  );
}
