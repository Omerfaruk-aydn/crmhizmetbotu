'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

type Step = 'loading' | 'form' | 'verify' | 'submitting' | 'done' | 'error' | 'expired';

export default function IgAuthPage() {
  const params = useParams();
  const token = params.token as string;
  const searchParams = useSearchParams();
  const queryError = searchParams ? searchParams.get('error') : null;

  const [step, setStep] = useState<Step>('loading');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [challengeType, setChallengeType] = useState<'2fa' | 'sms'>('sms');
  const [pendingSessionJson, setPendingSessionJson] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [connectedUser, setConnectedUser] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  // Token doğrula
  useEffect(() => {
    fetch(`/api/instagram/qr-connect?t=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === 'expired' || data.status === 'error') {
          setStep('expired');
        } else if (data.status === 'done') {
          setConnectedUser(data.username || null);
          setStep('done');
        } else {
          setStep('form');
        }
      })
      .catch(() => setStep('error'));
  }, [token]);

  useEffect(() => {
    if (queryError === 'auth_failed') {
      setError('Bağlantı onaylanamadı. Lütfen tekrar deneyin.');
    }
  }, [queryError]);

  // ─── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setStep('submitting');
    setError(null);

    const res = await fetch('/api/instagram/qr-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, username: username.trim(), password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Giriş başarısız.');
      setStep('form');
      return;
    }

    if (data.requiresVerification) {
      // 2FA veya SMS challenge
      setChallengeType(data.challengeType || 'sms');
      setPendingSessionJson(data.pendingSessionJson || '');
      setError(data.message || null);
      setStep('verify');
      return;
    }

    setConnectedUser(data.username || username.trim());
    setStep('done');
  };

  // ─── Verify code submit ──────────────────────────────────────────────────────
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCode.trim()) return;
    setStep('submitting');
    setError(null);

    const res = await fetch('/api/instagram/qr-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        username: username.trim(),
        verifyCode: verifyCode.trim(),
        challengeType,
        pendingSessionJson,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Kod doğrulanamadı.');
      setStep('verify');
      return;
    }

    setConnectedUser(data.username || username.trim());
    setStep('done');
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const wrap: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f0015 0%, #1a0a2e 50%, #0a0a0a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  };

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '40px 32px',
    maxWidth: '380px',
    width: '100%',
    backdropFilter: 'blur(20px)',
  };

  const inp: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '12px',
  };

  const btn: React.CSSProperties = {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    border: 'none',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.3px',
    boxShadow: '0 4px 24px rgba(225,48,108,0.4)',
    marginTop: '4px',
  };

  const gradBar: React.CSSProperties = {
    height: '3px',
    background: 'linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045)',
    borderRadius: '2px',
    marginBottom: '28px',
  };

  const logo: React.CSSProperties = {
    width: '56px', height: '56px',
    background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
    borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '24px',
    boxShadow: '0 8px 32px rgba(131,58,180,0.3)',
  };

  const errorBox: React.CSSProperties = {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '16px',
    color: '#f87171',
    fontSize: '13px',
    textAlign: 'left',
  };

  const label: React.CSSProperties = {
    display: 'block',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    marginBottom: '6px',
    textAlign: 'left',
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={gradBar} />
        <div style={logo}>📸</div>

        {/* ─── LOADING ─── */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>Doğrulanıyor...</p>
          </div>
        )}

        {/* ─── FORM ─── */}
        {(step === 'form' || (step === 'submitting' && !pendingSessionJson)) && (
          <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
            <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: '0 0 6px' }}>
              Instagram Hesabını Bağla
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 28px', lineHeight: 1.6 }}>
              Instagram kullanıcı adı ve şifrenizle girin
            </p>

            {error && <div style={errorBox}>{error}</div>}

            <div style={{ textAlign: 'left', marginBottom: '4px' }}>
              <label style={label}>Kullanıcı Adı</label>
              <input
                type="text"
                placeholder="@kullaniciadi"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inp}
                autoComplete="username"
                autoCapitalize="none"
                required
              />
            </div>

            <div style={{ textAlign: 'left', position: 'relative' }}>
              <label style={label}>Şifre</label>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inp, paddingRight: '48px' }}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '14px', top: '36px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.4)', fontSize: '16px',
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            <button
              type="submit"
              disabled={step === 'submitting'}
              style={{ ...btn, opacity: step === 'submitting' ? 0.7 : 1 }}
            >
              {step === 'submitting' ? '⏳ Bağlanıyor...' : '🔗 Hesabı Bağla'}
            </button>

            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '11px', margin: '16px 0 0', lineHeight: 1.5 }}>
              🛡️ Bilgileriniz yalnızca bu cihazda işlenir, üçüncü taraflarla paylaşılmaz.
            </p>
          </form>
        )}

        {/* ─── VERIFY (2FA / SMS CODE) ─── */}
        {(step === 'verify' || (step === 'submitting' && pendingSessionJson)) && (
          <form onSubmit={handleVerify} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>
              {challengeType === '2fa' ? '🔐' : '📱'}
            </div>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>
              {challengeType === '2fa' ? 'İki Faktörlü Doğrulama' : 'Güvenlik Kodu'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 24px', lineHeight: 1.6 }}>
              {challengeType === '2fa'
                ? 'Authenticator uygulamanızdaki 6 haneli kodu girin'
                : 'Instagram\'ın gönderdiği SMS/e-posta kodunu girin'}
            </p>

            {error && <div style={errorBox}>{error}</div>}

            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={{ ...inp, textAlign: 'center', fontSize: '24px', letterSpacing: '8px', marginBottom: '16px' }}
              maxLength={6}
              autoFocus
              required
            />

            <button
              type="submit"
              disabled={step === 'submitting'}
              style={{ ...btn, opacity: step === 'submitting' ? 0.7 : 1 }}
            >
              {step === 'submitting' ? '⏳ Doğrulanıyor...' : '✅ Kodu Onayla'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('form'); setError(null); setPendingSessionJson(''); setVerifyCode(''); }}
              style={{
                marginTop: '12px', background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.35)', fontSize: '13px', cursor: 'pointer',
              }}
            >
              ← Geri dön
            </button>
          </form>
        )}

        {/* ─── DONE ─── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{ color: '#4ade80', fontSize: '22px', fontWeight: 700, margin: '0 0 10px' }}>
              Başarıyla Bağlandı!
            </h1>
            {connectedUser && (
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 20px' }}>
                Hesap: <strong style={{ color: '#fff' }}>@{connectedUser.replace('@', '')}</strong>
              </p>
            )}
            <div style={{
              background: 'rgba(74,222,128,0.08)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: '12px',
              padding: '14px',
              color: '#4ade80',
              fontSize: '13px',
            }}>
              ✅ Bot artık DM&apos;lerinizi otomatik yanıtlayacak.<br />
              Bu sayfayı kapatabilirsiniz.
            </div>
          </div>
        )}

        {/* ─── EXPIRED ─── */}
        {step === 'expired' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>⏰</div>
            <h1 style={{ color: '#f87171', fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
              Bağlantı Süresi Doldu
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: 0 }}>
              Bu link artık geçerli değil. Lütfen dashboard&apos;dan yeni bir QR oluşturun.
            </p>
          </div>
        )}

        {/* ─── ERROR ─── */}
        {step === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '44px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ color: '#f87171', fontSize: '20px', fontWeight: 700, margin: '0 0 10px' }}>
              Bağlantı Hatası
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', margin: '0 0 20px' }}>
              Bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            <button
              onClick={() => { setError(null); setStep('form'); }}
              style={{
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Tekrar Dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
