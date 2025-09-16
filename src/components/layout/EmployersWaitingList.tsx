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
    <main className="max-w-md h-[100vh] flex flex-col justify-center mx-auto p-6 pt-25">
      <h1 className="text-2xl font-semibold">Castpoint for Employers</h1>
      <p className="text-black/70 mt-2">Join the waitlist to get early access.</p>

      <div className="mt-6 grid gap-3">
        <input
          value={company}
          onChange={e=>setCompany(e.target.value)}
          placeholder="Company name"
          className="w-full rounded-xl border px-4 py-3"
        />
        <input
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="w-full rounded-xl border px-4 py-3"
        />
        <button
          onClick={submit}
          className="rounded-xl bg-black text-white py-3 font-medium"
        >
          Join Waitlist
        </button>
      </div>

      {status === 'ok' && <p className="mt-3 text-green-600">{msg}</p>}
      {status === 'err' && <p className="mt-3 text-red-600">{msg}</p>}
    </main>
  );
}
