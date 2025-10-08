'use client';

import { useState } from 'react';
import { supabaseClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pw });
    setLoading(false);
    if (error) return setErr(error.message);
    router.replace('/admin');
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    const { error } = await supabaseClient.auth.signUp({ email, password: pw });
    setLoading(false);
    if (error) return setErr(error.message);
    router.replace('/admin');
  }

  return (
    <>
      {/* BRAND BAR */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto w-full max-w-5xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded bg-gray-900" aria-hidden />
            <div className="text-sm text-gray-700">Admin</div>
          </div>
        </div>
      </div>

      <main className="max-w-sm mx-auto p-6 w-full">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <form className="space-y-3" onSubmit={onLogin}>
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Password"
            type="password"
            value={pw}
            onChange={(e)=>setPw(e.target.value)}
            autoComplete="current-password"
          />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button disabled={loading} className="w-full bg-gray-900 text-white rounded py-2">
            {loading ? 'Loading…' : 'Log in'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onSignup}
            className="w-full border rounded py-2"
          >
            Create account
          </button>
        </form>
      </main>
    </>
  );
}
