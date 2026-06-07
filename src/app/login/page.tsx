'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bot, Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
// Removed Supabase Client import

export default function LoginPage() {
  const router = useRouter();
  // Removed Supabase Client initialization

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Giriş yapılırken bir hata oluştu.');
        setLoading(false);
        return;
      }

      if (data.hasBusiness) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError('Giriş yapılırken beklenmedik bir hata oluştu.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#030712] text-zinc-100 min-h-screen flex items-center justify-center p-6 relative select-none overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-[400px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 w-full h-full rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-8 backdrop-blur-md relative z-10 shadow-2xl flex flex-col gap-6">
        
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot className="w-5.5 h-5.5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Assistora AI</span>
          </Link>
          <h1 className="text-lg font-bold mt-4 text-white">Hesabınıza Giriş Yapın</h1>
          <p className="text-zinc-500 text-xs">Yapay zekalı müşteri temsilcinizi yönetmeye başlayın.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-zinc-400">E-Posta Adresi</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@sirket.com"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-xs font-semibold text-zinc-400">Şifre</label>
              <a href="#" className="text-[11px] text-purple-400 hover:text-purple-300 font-medium">Şifremi Unuttum</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none transition-all placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-600 font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-white/5 active:scale-98 flex items-center justify-center gap-2 mt-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                <span>Giriş Yapılıyor...</span>
              </>
            ) : (
              <>
                <span>Giriş Yap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="h-px bg-zinc-900 w-full" />

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500">
          Bir hesabınız yok mu?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
            Ücretsiz Hesap Oluştur
          </Link>
        </p>

      </div>
    </div>
  );
}
