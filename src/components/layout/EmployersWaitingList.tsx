'use client';
import { useState } from 'react';

export default function EmployersLanding() {
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'ok'|'err'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    setStatus('idle'); setMsg('');
    try {
      const res = await fetch('/api/emp_waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: company, email })
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) throw new Error(data.error || 'Failed');
      setStatus('ok');
      setMsg(data.message);
      setCompany(''); setEmail('');
    } catch (error) {
      setStatus('err');
      setMsg(error instanceof Error ? error.message : 'Error occurred');
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-20">
      <p className="label">Castpoint for employers</p>
      <h1 className="font-display mt-6 text-[clamp(40px,8vw,96px)]">Join the<br />waitlist.</h1>
      <p className="mt-4 text-[17px] text-ink/70">Get early access to new employer features.</p>

      <div className="mt-10 grid gap-4">
        <input
          value={company}
          onChange={e=>setCompany(e.target.value)}
          placeholder="Company name"
          className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
        />
        <input
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="w-full border-[1.5px] border-ink bg-white px-4 py-3 text-[15px] outline-none placeholder:text-ink/40 focus:shadow-[4px_4px_0_0_var(--color-ink)]"
        />
        <button
          onClick={submit}
          className="bg-ink px-6 py-4 text-[12px] font-bold uppercase tracking-[0.1em] text-paper shadow-[6px_6px_0_0_var(--color-pink)] cursor-pointer"
        >
          Join Waitlist
        </button>
      </div>

      {status === 'ok' && <p className="mt-4 border-[1.5px] border-ink bg-lime px-4 py-3 font-semibold">{msg}</p>}
      {status === 'err' && <p className="mt-4 border-[1.5px] border-ink bg-pink px-4 py-3 font-semibold">{msg}</p>}
    </main>
  );
}
