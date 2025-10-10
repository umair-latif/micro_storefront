'use client';
import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { serverPasswordSignIn, serverPasswordSignUp } from './actions';
import { User, Eye, EyeOff  } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = (search.get('next') || '/admin') as string;

  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();
  const [showPw, setShowPw] = useState(false);


  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    start(async () => {
      const supabase = createClient();

      // 1) Browser sign-in (gives JWT in localStorage so uploads are authenticated)
      const { error: e1 } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (e1) return setErr(e1.message);

      // 2) Server sign-in (sets httpOnly cookies for SSR/middleware)
      const res = await serverPasswordSignIn(email, pw);
      if (!res.ok) return setErr(res.error);

      router.replace(next);
    });
  }
  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    start(async () => {
      const supabase = createClient();

      // 1) client sign up (creates account + sets session if email confirmations are disabled)
      const { error: e1 } = await supabase.auth.signUp({ email, password: pw });
      if (e1) return setErr(e1.message);

      // 2) server sign up (sets cookies if a session exists; if email confirm is required,
      //    this may not set a session until the user confirms)
      const res = await serverPasswordSignUp(email, pw);
      if (!res.ok) return setErr(res.error);

      // If email confirmation is ON, tell the user to check their inbox.
      router.replace('/admin/login?m=check_email');
    });
  }

  return (
    <>
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto w-full max-w-5xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <User className="h-7 w-7" />
            <div className="text-lg text-gray-700">Admin</div>
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
          <div className="relative">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Password"
              type={showPw ? "text" : "password"}            
              value={pw}
              onChange={(e)=>setPw(e.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}
          <button disabled={pending} className="w-full bg-gray-900 text-white rounded py-2 hover:cursor-pointer">
            {pending ? 'Loading…' : 'Log in'}
          </button>
          
          <button
            type="button"
            disabled={pending}
            onClick={onSignup}
            className="w-full border rounded py-2 hover:cursor-pointer"
          >
            Create account
          </button>
        </form>
      </main>
    </>
  );
}
