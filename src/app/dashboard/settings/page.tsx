'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Building, 
  Save, 
  Loader2, 
  AlertCircle, 
  Check,
  Phone,
  Smartphone,
  Bot,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  Camera,
  Copy,
  ChevronRight,
  ExternalLink,
  Shield,
  Info,
  ArrowRight,
  Globe,
  Globe2,
  Key,
  Monitor,
  Zap,
} from 'lucide-react';

type WaStatus = 'disconnected' | 'connecting' | 'qr_pending' | 'connected';
type IgStep = 'method' | 'cookie_guide' | 'cookie_input' | 'credentials' | 'twofa' | 'success';
type BrowserJobStatus = 'starting' | 'waiting_login' | 'collecting' | 'saving' | 'done' | 'error';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Business Info
  const [id, setId] = useState('');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [phone, setPhone] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [brandTone, setBrandTone] = useState('Professional');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');

  // WhatsApp Baileys State
  const [waStatus, setWaStatus] = useState<WaStatus>('disconnected');
  const [waQr, setWaQr] = useState<string | null>(null);
  const [waConnecting, setWaConnecting] = useState(false);
  const [waDisconnecting, setWaDisconnecting] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Instagram State
  const [igLinked, setIgLinked] = useState(false);
  const [igHandle, setIgHandle] = useState<string | null>(null);
  const [igDisconnecting, setIgDisconnecting] = useState(false);
  const [showIgModal, setShowIgModal] = useState(false);
  const [igStep, setIgStep] = useState<IgStep>('method');
  const [igUsername, setIgUsername] = useState('');
  const [igPassword, setIgPassword] = useState('');
  const [igSessionJson, setIgSessionJson] = useState('');
  const [igConnecting, setIgConnecting] = useState(false);
  const [igError, setIgError] = useState<string | null>(null);
  const [ig2faIdentifier, setIg2faIdentifier] = useState('');
  const [ig2faCode, setIg2faCode] = useState('');
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  // Browser-connect state
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [browserJobId, setBrowserJobId] = useState<string | null>(null);
  const [browserJobStatus, setBrowserJobStatus] = useState<BrowserJobStatus>('starting');
  const [browserJobMessage, setBrowserJobMessage] = useState('');
  const [browserJobProgress, setBrowserJobProgress] = useState(0);
  const [browserJobError, setBrowserJobError] = useState<string | null>(null);
  const [browserJobUsername, setBrowserJobUsername] = useState<string | null>(null);

  // QR-connect state
  const [showQrConnectModal, setShowQrConnectModal] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrAuthUrl, setQrAuthUrl] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<'loading' | 'ready' | 'scanned' | 'done' | 'error' | 'expired'>('loading');
  const [qrCountdown, setQrCountdown] = useState(600);
  const [qrUsername, setQrUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/businesses/current');
        if (!res.ok) throw new Error('İşletme ayarları alınamadı.');
        const data = await res.json();
        setId(data.id);
        setSlug(data.slug);
        setName(data.name || '');
        setSector(data.sector || '');
        setPhone(data.phone || '');
        setInstagramHandle(data.instagramHandle || '');
        setWebsite(data.website || '');
        setAddress(data.address || '');
        setBrandTone(data.brandTone || 'Professional');
        setPrimaryColor(data.primaryColor || '#4f46e5');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
    checkWaStatus();
    checkIgStatus();
  }, []);

  // Poll WA status every 3 seconds when in qr_pending or connecting state
  useEffect(() => {
    if (waStatus === 'qr_pending' || waStatus === 'connecting') {
      const interval = setInterval(checkWaStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [waStatus]);

  const checkWaStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/connect');
      if (!res.ok) return;
      const data = await res.json();
      setWaStatus(data.status || 'disconnected');
      if (data.qr) setWaQr(data.qr);
      if (data.status === 'connected') {
        setWaQr(null);
        setShowQrModal(false);
      }
    } catch {
      // silently ignore
    }
  };

  const checkIgStatus = async () => {
    try {
      const res = await fetch('/api/instagram/setup');
      if (!res.ok) return;
      const data = await res.json();
      setIgLinked(data.connected);
      setIgHandle(data.instagramHandle);
    } catch {
      // silently ignore
    }
  };

  const handleDisconnectInstagram = async () => {
    setIgDisconnecting(true);
    try {
      const res = await fetch('/api/instagram/disconnect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bağlantı kesilemedi.');
      setIgLinked(false);
      setIgHandle(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIgDisconnecting(false);
    }
  };

  const handleConnectInstagram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIgConnecting(true);
    setIgError(null);
    try {
      const payload: any = { username: igUsername };

      if (igStep === 'twofa') {
        payload.twoFactorCode = ig2faCode;
        payload.twoFactorIdentifier = ig2faIdentifier;
        payload.password = igPassword;
      } else if (igStep === 'cookie_input') {
        payload.sessionJson = igSessionJson;
      } else if (igStep === 'credentials') {
        payload.password = igPassword;
      }

      const res = await fetch('/api/instagram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Instagram bağlantısı kurulamadı.');
      
      if (data.twoFactorRequired) {
        setIg2faIdentifier(data.twoFactorIdentifier);
        setIg2faCode('');
        setIgStep('twofa');
        return;
      }
      
      setIgLinked(true);
      setIgHandle(`@${igUsername}`);
      setIgStep('success');
      setTimeout(() => {
        setShowIgModal(false);
        resetIgModal();
      }, 2500);
    } catch (err: any) {
      setIgError(err.message);
    } finally {
      setIgConnecting(false);
    }
  };

  const resetIgModal = () => {
    setIgStep('method');
    setIgUsername('');
    setIgPassword('');
    setIgSessionJson('');
    setIgError(null);
    setIg2faIdentifier('');
    setIg2faCode('');
  };

  // ── Browser Connect ──────────────────────────────────────────────
  const handleBrowserConnect = async () => {
    setShowIgModal(false);
    resetIgModal();
    setBrowserJobId(null);
    setBrowserJobStatus('starting');
    setBrowserJobMessage('Başlatılıyor...');
    setBrowserJobProgress(0);
    setBrowserJobError(null);
    setBrowserJobUsername(null);
    setShowBrowserModal(true);

    try {
      const res = await fetch('/api/instagram/browser-connect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Başlatılamadı.');
      setBrowserJobId(data.jobId);
    } catch (err: any) {
      setBrowserJobStatus('error');
      setBrowserJobError(err.message);
      setBrowserJobMessage('Başlatma hatası.');
    }
  };

  // Poll browser job status
  useEffect(() => {
    if (!browserJobId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/instagram/browser-connect?jobId=${browserJobId}`);
        if (!res.ok) return;
        const data = await res.json();
        setBrowserJobStatus(data.status);
        setBrowserJobMessage(data.message || '');
        setBrowserJobProgress(data.progress || 0);
        if (data.username) setBrowserJobUsername(data.username);
        if (data.error) setBrowserJobError(data.error);
        if (data.status === 'done') {
          clearInterval(interval);
          setIgLinked(true);
          setIgHandle(`@${data.username || 'instagram'}`);
          setTimeout(() => {
            setShowBrowserModal(false);
          }, 3000);
        }
        if (data.status === 'error') clearInterval(interval);
      } catch {}
    }, 1500);
    return () => clearInterval(interval);
  }, [browserJobId]);

  // ── QR Connect ──────────────────────────────────────────────
  const handleQrConnect = async () => {
    setShowIgModal(false);
    resetIgModal();
    setQrToken(null);
    setQrDataUrl(null);
    setQrStatus('loading');
    setQrCountdown(600);
    setQrUsername(null);
    setShowQrConnectModal(true);

    try {
      const res = await fetch('/api/instagram/qr-connect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'QR oluşturulamadı.');
      setQrToken(data.token);
      setQrDataUrl(data.qrDataUrl);
      setQrAuthUrl(data.authUrl);
      setQrStatus('ready');
    } catch (err: any) {
      setQrStatus('error');
    }
  };

  // Poll QR session
  useEffect(() => {
    if (!qrToken || qrStatus === 'done' || qrStatus === 'error' || qrStatus === 'expired') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/instagram/qr-connect?t=${qrToken}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'done') {
          setQrStatus('done');
          setQrUsername(data.username || null);
          setIgLinked(true);
          setIgHandle(`@${data.username || 'instagram'}`);
          clearInterval(interval);
          setTimeout(() => setShowQrConnectModal(false), 4000);
        } else if (data.status === 'expired') {
          setQrStatus('expired');
          clearInterval(interval);
        } else if (data.status === 'scanned' || data.status === 'collecting' || data.status === 'saving') {
          setQrStatus('scanned');
        }
      } catch {}
    }, 2000);
    return () => clearInterval(interval);
  }, [qrToken, qrStatus]);

  // QR countdown
  useEffect(() => {
    if (!showQrConnectModal || qrStatus !== 'ready') return;
    const timer = setInterval(() => {
      setQrCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); setQrStatus('expired'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showQrConnectModal, qrStatus]);

  const copyToClipboard = async (text: string, stepIndex: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedStep(stepIndex);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleConnectWhatsApp = async () => {
    setWaConnecting(true);
    setError(null);
    try {
      const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bağlantı başlatılamadı.');
      
      setWaStatus(data.status || 'connecting');
      if (data.qr) {
        setWaQr(data.qr);
        setShowQrModal(true);
      } else if (data.status === 'connected') {
        setShowQrModal(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWaConnecting(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    setWaDisconnecting(true);
    try {
      const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bağlantı kesilemedi.');
      setWaStatus('disconnected');
      setWaQr(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWaDisconnecting(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/businesses/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, sector, phone, instagramHandle, website, address, brandTone, primaryColor
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ayarlar kaydedilemedi.');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const waStatusLabel = {
    disconnected: 'Bağlı Değil',
    connecting: 'Bağlanıyor...',
    qr_pending: 'QR Bekleniyor',
    connected: 'Bağlı',
  };
  const waStatusColor = {
    disconnected: 'bg-zinc-600',
    connecting: 'bg-yellow-500 animate-pulse',
    qr_pending: 'bg-yellow-500 animate-pulse',
    connected: 'bg-emerald-500',
  };
  const waStatusBadge = {
    disconnected: 'bg-zinc-800 text-zinc-500',
    connecting: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    qr_pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    connected: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  };

  // Cookie guide steps
  const cookieSteps = [
    {
      icon: <Globe2 className="w-4 h-4" />,
      title: 'Chrome/Firefox\'u açın',
      desc: 'instagram.com adresine gidin ve hesabınıza giriş yapın.',
      action: null,
    },
    {
      icon: <Globe className="w-4 h-4" />,
      title: '"Cookie-Editor" Eklentisini Yükleyin',
      desc: 'Chrome Web Mağazası\'ndan ücretsiz "Cookie-Editor" eklentisini yükleyin.',
      action: { label: 'Eklentiyi İndir', url: 'https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm' },
    },
    {
      icon: <Key className="w-4 h-4" />,
      title: 'Çerezleri Dışa Aktarın',
      desc: 'Instagram açıkken eklenti ikonuna tıklayın → "Export" → "Export as JSON" seçeneğini seçin.',
      action: null,
    },
    {
      icon: <Copy className="w-4 h-4" />,
      title: 'Kopyalayıp Yapıştırın',
      desc: 'Kopyalanan JSON metnini aşağıdaki alana yapıştırın ve bağlayın.',
      action: null,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6 text-emerald-400" />
              </div>
              
              <div>
                <h3 className="text-white font-bold text-sm">WhatsApp'ı Bağla</h3>
                <p className="text-zinc-500 text-[11px] mt-1">
                  Telefonunuzda WhatsApp'ı açın → <strong className="text-zinc-300">Bağlı Cihazlar</strong> → <strong className="text-zinc-300">Cihaz Bağla</strong>
                </p>
              </div>

              {waStatus === 'connected' ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  <p className="text-emerald-400 font-bold text-sm">Başarıyla Bağlandı!</p>
                </div>
              ) : waQr ? (
                <div className="bg-white p-3 rounded-xl mx-auto w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={waQr} alt="WhatsApp QR Code" className="w-52 h-52" />
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-zinc-500 text-xs">QR kod oluşturuluyor...</p>
                </div>
              )}

              {waStatus === 'qr_pending' && waQr && (
                <div className="flex items-center gap-2 text-[11px] text-yellow-400 bg-yellow-500/5 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>QR kodu 60 saniye içinde geçersiz olur. Hızlı okutun.</span>
                </div>
              )}

              <button
                onClick={checkWaStatus}
                className="w-full py-2 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Durumu Yenile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          QR CONNECT MODAL
          ============================================ */}
      {showQrConnectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Top gradient bar */}
            <div className={`h-1 w-full transition-all duration-700 ${
              qrStatus === 'done' ? 'bg-gradient-to-r from-emerald-500 to-green-400' :
              qrStatus === 'expired' || qrStatus === 'error' ? 'bg-red-500' :
              qrStatus === 'scanned' ? 'bg-gradient-to-r from-amber-500 to-orange-400 animate-pulse' :
              'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400'
            }`} />

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">QR ile Bağlan</p>
                    <p className="text-zinc-500 text-[10px]">Telefonunuzdan tara</p>
                  </div>
                </div>
                {(qrStatus === 'done' || qrStatus === 'expired' || qrStatus === 'error') && (
                  <button
                    onClick={() => setShowQrConnectModal(false)}
                    className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* QR Code display */}
              {qrStatus === 'loading' && (
                <div className="flex flex-col items-center py-8 gap-3">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  <p className="text-zinc-400 text-xs">QR oluşturuluyor...</p>
                </div>
              )}

              {qrStatus === 'ready' && qrDataUrl && (
                <div className="space-y-4">
                  {/* QR Image */}
                  <div className="bg-white rounded-2xl p-4 mx-auto w-fit shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} alt="Instagram QR Kodu" className="w-48 h-48" />
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2 text-center">
                    <p className="text-white text-xs font-bold">Nasıl kullanılır?</p>
                    <div className="space-y-1.5">
                      {[
                        '📱 Telefonunuzda bu QR\'ı kameranızla okutun',
                        '🔗 Açılan sayfada Instagram\'a giriş yapın',
                        '✅ Bu ekran otomatik güncellenecek',
                      ].map((step, i) => (
                        <p key={i} className="text-zinc-400 text-[11px]">{step}</p>
                      ))}
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span className="text-zinc-500 text-[10px]">
                      {Math.floor(qrCountdown / 60)}:{String(qrCountdown % 60).padStart(2, '0')} kaldı
                    </span>
                  </div>

                  {/* Or copy link */}
                  {qrAuthUrl && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(qrAuthUrl); }}
                      className="w-full py-2 text-[10px] text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3 h-3" />
                      QR tarayamıyor musunuz? Linki kopyalayın
                    </button>
                  )}
                </div>
              )}

              {qrStatus === 'scanned' && (
                <div className="flex flex-col items-center py-6 gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold text-sm">QR Okundu!</p>
                    <p className="text-zinc-400 text-xs mt-1">Giriş tamamlanıyor...</p>
                  </div>
                </div>
              )}

              {qrStatus === 'done' && (
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="text-4xl">🎉</div>
                  <div className="text-center">
                    <p className="text-emerald-400 font-bold text-sm">Başarıyla Bağlandı!</p>
                    {qrUsername && (
                      <p className="text-zinc-400 text-xs mt-1">Hesap: <strong className="text-white">@{qrUsername}</strong></p>
                    )}
                  </div>
                </div>
              )}

              {qrStatus === 'expired' && (
                <div className="flex flex-col items-center py-4 gap-3">
                  <div className="text-3xl">⏰</div>
                  <p className="text-red-400 text-sm font-bold">QR Süresi Doldu</p>
                  <button
                    onClick={handleQrConnect}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Yeni QR Oluştur
                  </button>
                </div>
              )}

              {qrStatus === 'error' && (
                <div className="flex flex-col items-center py-4 gap-3">
                  <p className="text-red-400 text-sm">Hata oluştu.</p>
                  <button
                    onClick={handleQrConnect}
                    className="text-xs text-zinc-400 hover:text-white underline"
                  >
                    Tekrar dene
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          BROWSER CONNECT PROGRESS MODAL
          ============================================ */}
      {showBrowserModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Animated top bar */}
            <div className={`h-1 w-full transition-all duration-700 ${
              browserJobStatus === 'done'
                ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                : browserJobStatus === 'error'
                ? 'bg-red-500'
                : 'bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 animate-pulse'
            }`} />

            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    browserJobStatus === 'done' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                    browserJobStatus === 'error' ? 'bg-red-500/20 border border-red-500/30' :
                    'bg-purple-500/20 border border-purple-500/30'
                  }`}>
                    {browserJobStatus === 'done' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : browserJobStatus === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    ) : (
                      <Monitor className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Tarayıcı Bağlantısı</p>
                    <p className="text-zinc-500 text-[10px]">Instagram oturum yakalayıcı</p>
                  </div>
                </div>
                {(browserJobStatus === 'done' || browserJobStatus === 'error') && (
                  <button
                    onClick={() => setShowBrowserModal(false)}
                    className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <p className="text-zinc-300 text-xs font-medium">{browserJobMessage}</p>
                  <span className="text-zinc-500 text-[10px]">{browserJobProgress}%</span>
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      browserJobStatus === 'done' ? 'bg-emerald-500' :
                      browserJobStatus === 'error' ? 'bg-red-500' :
                      'bg-gradient-to-r from-purple-600 to-pink-500'
                    }`}
                    style={{ width: `${browserJobProgress}%` }}
                  />
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2">
                {[
                  { key: ['starting'],         label: 'Tarayıcı açılıyor',           icon: <Monitor className="w-3 h-3" /> },
                  { key: ['waiting_login'],     label: 'Siz giriş yapıyorsunuz',      icon: <Globe2 className="w-3 h-3" /> },
                  { key: ['collecting'],        label: 'Çerezler toplanıyor',         icon: <Shield className="w-3 h-3" /> },
                  { key: ['saving'],            label: 'Veritabanına kaydediliyor',   icon: <Check className="w-3 h-3" /> },
                  { key: ['done'],              label: 'Bağlantı tamamlandı!',        icon: <Zap className="w-3 h-3" /> },
                ].map((step, idx) => {
                  const statusOrder = ['starting','waiting_login','collecting','saving','done'];
                  const currentIdx = statusOrder.indexOf(browserJobStatus);
                  const stepIdx = statusOrder.indexOf(step.key[0]);
                  const isDone = currentIdx > stepIdx || browserJobStatus === 'done';
                  const isActive = step.key.includes(browserJobStatus);
                  return (
                    <div key={idx} className={`flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg transition-all ${
                      isActive ? 'bg-purple-950/30 border border-purple-800/30' :
                      isDone ? 'opacity-60' : 'opacity-30'
                    }`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-emerald-500/20 text-emerald-400' :
                        isActive ? 'bg-purple-500/20 text-purple-400' :
                        'bg-zinc-800 text-zinc-600'
                      }`}>
                        {isDone ? <Check className="w-2.5 h-2.5" /> : isActive ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : step.icon}
                      </div>
                      <span className={`text-[11px] font-medium ${
                        isActive ? 'text-white' : isDone ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Waiting login instruction */}
              {browserJobStatus === 'waiting_login' && (
                <div className="bg-amber-950/20 border border-amber-800/30 rounded-xl p-3 space-y-1">
                  <p className="text-amber-400 text-[11px] font-bold">📺 Açılan tarayıcıya geçin!</p>
                  <p className="text-amber-400/70 text-[10px] leading-relaxed">
                    Chromium penceresinde Instagram'a giriş yapın. Ana sayfaya geçince sistem otomatik devam eder.
                  </p>
                </div>
              )}

              {/* Success */}
              {browserJobStatus === 'done' && (
                <div className="text-center py-2 space-y-1">
                  <p className="text-emerald-400 font-bold text-sm">🎉 Başarıyla Bağlandı!</p>
                  {browserJobUsername && (
                    <p className="text-zinc-400 text-xs">Hesap: <strong className="text-white">@{browserJobUsername}</strong></p>
                  )}
                </div>
              )}

              {/* Error */}
              {browserJobStatus === 'error' && browserJobError && (
                <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-3">
                  <p className="text-red-400 text-[10px] leading-relaxed break-all">{browserJobError}</p>
                  <button
                    onClick={() => { setShowBrowserModal(false); setShowIgModal(true); }}
                    className="mt-2 text-[10px] text-zinc-400 hover:text-white underline"
                  >
                    Çerez yöntemiyle dene
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          INSTAGRAM CONNECTION MODAL — PREMIUM UX
          ============================================ */}
      {showIgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl relative w-full max-w-md overflow-hidden">
            
            {/* Gradient top bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                  <Camera className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Instagram DM Bağlantısı</h3>
                  <p className="text-zinc-500 text-[10px]">
                    {igStep === 'method' && 'Bağlantı yöntemini seçin'}
                    {igStep === 'cookie_guide' && 'Adım adım rehber'}
                    {igStep === 'cookie_input' && 'Çerez bilgilerini girin'}
                    {igStep === 'credentials' && 'Hesap bilgilerini girin'}
                    {igStep === 'twofa' && '2 adımlı doğrulama'}
                    {igStep === 'success' && 'Başarıyla bağlandı!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowIgModal(false); resetIgModal(); }}
                className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6">

              {/* ── STEP: METHOD SELECTION ── */}
              {igStep === 'method' && (
                <div className="space-y-3">
                  <p className="text-zinc-400 text-[11px] leading-relaxed mb-4">
                    Instagram hesabınızı bağlamak için bir yöntem seçin.
                  </p>

                  {/* QR Method — TOP RECOMMENDED */}
                  <button
                    onClick={handleQrConnect}
                    className="w-full group flex items-center gap-4 p-4 bg-gradient-to-r from-purple-950/60 to-pink-950/40 hover:from-purple-950/80 hover:to-pink-950/60 border border-purple-600/50 hover:border-purple-500/70 rounded-xl transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-bold text-xs">QR ile Bağlan</span>
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">Önerilen</span>
                      </div>
                      <p className="text-zinc-400 text-[10px] leading-relaxed">Telefonunuzla QR okutun → Açılan sayfada giriş yapın → Otomatik bağlandı.</p>
                    </div>
                    <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                  </button>

                  {/* Browser Method */}
                  <button
                    onClick={handleBrowserConnect}
                    className="w-full group flex items-center gap-4 p-4 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-purple-800/50 rounded-xl transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center shrink-0 group-hover:bg-purple-900/20 transition-colors">
                      <Monitor className="w-5 h-5 text-zinc-400 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-bold text-xs">Tarayıcı ile Bağlan</span>
                      </div>
                      <p className="text-zinc-500 text-[10px] leading-relaxed">Bilgisayarda Chromium açılır, siz giriş yaparsınız.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-400 transition-colors shrink-0" />
                  </button>

                  {/* Cookie Method */}
                  <button
                    onClick={() => setIgStep('cookie_guide')}
                    className="w-full group flex items-center gap-4 p-4 bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700 rounded-xl transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-800/30 border border-zinc-700/50 flex items-center justify-center shrink-0 group-hover:bg-zinc-800 transition-colors">
                      <Shield className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-white font-bold text-xs">Çerez JSON ile Bağlan</span>
                      </div>
                      <p className="text-zinc-500 text-[10px] leading-relaxed">Cookie-Editor ile çerez JSON'unu kopyalayıp yapıştırın.</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0" />
                  </button>

                  <div className="flex items-start gap-2 p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/50 mt-2">
                    <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-zinc-500 text-[10px] leading-relaxed">
                      Verileriniz şifreli olarak saklanır ve yalnızca mesaj yanıtlama amacıyla kullanılır.
                    </p>
                  </div>
                </div>
              )}

              {/* ── STEP: COOKIE GUIDE ── */}
              {igStep === 'cookie_guide' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {cookieSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5 text-purple-400">
                          {step.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold">{step.title}</p>
                          <p className="text-zinc-500 text-[10px] leading-relaxed mt-0.5">{step.desc}</p>
                          {step.action && (
                            <a
                              href={step.action.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                            >
                              {step.action.label}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="w-5 h-5 rounded-full border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-zinc-500 shrink-0">
                          {idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIgStep('method')}
                      className="flex-1 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Geri
                    </button>
                    <button
                      onClick={() => setIgStep('cookie_input')}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      Devam Et
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: COOKIE INPUT ── */}
              {igStep === 'cookie_input' && (
                <form onSubmit={handleConnectInstagram} className="space-y-4">
                  {igError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] text-red-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="break-all">{igError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Instagram Kullanıcı Adı</label>
                    <input
                      type="text"
                      required
                      value={igUsername}
                      onChange={(e) => setIgUsername(e.target.value)}
                      placeholder="kullanici_adi (@ olmadan)"
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/20 w-full transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Çerez JSON</label>
                      <span className="text-[9px] text-zinc-600">Cookie-Editor &gt; Export as JSON</span>
                    </div>
                    <textarea
                      required
                      rows={5}
                      value={igSessionJson}
                      onChange={(e) => setIgSessionJson(e.target.value)}
                      placeholder={`[{"name": "sessionid", "value": "..."}, {"name": "ds_user_id", "value": "..."}, ...]`}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[10px] text-zinc-300 font-mono outline-none focus:border-purple-600/50 focus:ring-1 focus:ring-purple-600/20 w-full resize-none transition-all"
                    />
                    <p className="text-[9px] text-zinc-600 leading-relaxed">
                      instagram.com açıkken Cookie-Editor ile dışa aktarın. Tüm JSON metnini yapıştırın.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setIgStep('cookie_guide'); setIgError(null); }}
                      className="flex-1 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      disabled={igConnecting}
                      className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      {igConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
                      {igConnecting ? 'Bağlanıyor...' : 'Bağlantıyı Kur'}
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP: CREDENTIALS ── */}
              {igStep === 'credentials' && (
                <form onSubmit={handleConnectInstagram} className="space-y-4">
                  {igError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] text-red-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="break-all">{igError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Kullanıcı Adı</label>
                    <input
                      type="text"
                      required
                      value={igUsername}
                      onChange={(e) => setIgUsername(e.target.value)}
                      placeholder="kullanici_adi"
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-zinc-700 w-full transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Şifre</label>
                    <input
                      type="password"
                      required
                      value={igPassword}
                      onChange={(e) => setIgPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-zinc-700 w-full transition-all"
                    />
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-500/80 text-[10px] leading-relaxed">
                      Instagram bazen bilinen olmayan cihazlardan girişlerde güvenlik doğrulaması isteyebilir. Bu durumda çerez yöntemini deneyin.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setIgStep('method'); setIgError(null); }}
                      className="flex-1 py-2.5 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                    >
                      Geri
                    </button>
                    <button
                      type="submit"
                      disabled={igConnecting}
                      className="flex-1 py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      {igConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      {igConnecting ? 'Bağlanıyor...' : 'Giriş Yap'}
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP: 2FA ── */}
              {igStep === 'twofa' && (
                <form onSubmit={handleConnectInstagram} className="space-y-4">
                  <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="w-6 h-6 text-purple-400" />
                    </div>
                    <p className="text-white font-bold text-sm">İki Adımlı Doğrulama</p>
                    <p className="text-zinc-500 text-[10px] mt-1 leading-relaxed">
                      Telefonunuza veya doğrulama uygulamanıza gelen 6 haneli kodu girin.
                    </p>
                  </div>

                  {igError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{igError}</span>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={ig2faCode}
                    onChange={(e) => setIg2faCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-2xl text-center font-bold text-white tracking-[0.5em] outline-none focus:border-purple-600/50 w-full transition-all"
                  />

                  <button
                    type="submit"
                    disabled={igConnecting || ig2faCode.length !== 6}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    {igConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    {igConnecting ? 'Doğrulanıyor...' : 'Doğrula ve Bağlan'}
                  </button>
                </form>
              )}

              {/* ── STEP: SUCCESS ── */}
              {igStep === 'success' && (
                <div className="text-center py-6 space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-xl">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">Başarıyla Bağlandı!</p>
                    <p className="text-zinc-400 text-xs mt-1">
                      <strong className="text-purple-400">@{igUsername}</strong> hesabı artık bağlı.
                    </p>
                    <p className="text-zinc-500 text-[10px] mt-1">DM'leriniz otomatik yanıtlanmaya başlandı.</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          İşletme & Kanal Ayarları
        </h1>
        <p className="text-zinc-500 text-xs mt-1">İletişim bilgilerinizi, AI asistan marka tonunu ve WhatsApp / Instagram kanal entegrasyonlarını yönetin.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Ayarlarınız başarıyla kaydedildi!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Editor Form Panel */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Building className="w-4 h-4 text-emerald-400" />
                Genel İşletme Profili
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">İşletme Adı</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Sektör</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">İş Telefonu</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Instagram Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={instagramHandle}
                    onChange={e => setInstagramHandle(e.target.value)}
                    placeholder="@kullaniciadi"
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Web Sitesi</label>
                  <input
                    type="text"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-500 uppercase font-semibold">Adres</label>
                <textarea
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={2}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-600 resize-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                Yapay Zekâ Marka Persona Ayarları
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Ses Tonu / Persona</label>
                  <select
                    value={brandTone}
                    onChange={e => setBrandTone(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
                  >
                    <option>Samimi</option>
                    <option>Profesyonel</option>
                    <option>Kurumsal</option>
                    <option>Lüks</option>
                    <option>Genç ve enerjik</option>
                    <option>Kısa ve net</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Asistan Accent Rengi</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl w-14 h-11 p-1 cursor-pointer outline-none shrink-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-zinc-900 pt-4 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Değişiklikleri Kaydet</span>
              </button>
            </div>

          </form>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Channel Connections */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              Kanal Bağlantıları
            </span>

            {/* WhatsApp Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${waStatusColor[waStatus]}`} />
                  WhatsApp
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${waStatusBadge[waStatus]}`}>
                  {waStatusLabel[waStatus]}
                </span>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed">
                {waStatus === 'connected'
                  ? 'WhatsApp bağlı. Gelen mesajlar AI tarafından otomatik yanıtlanıyor.'
                  : 'Normal WhatsApp hesabınızla bağlanın. Business hesabı gerekmez.'}
              </p>

              {waStatus === 'connected' ? (
                <button
                  onClick={handleDisconnectWhatsApp}
                  disabled={waDisconnecting}
                  className="w-full py-2 bg-zinc-950 hover:bg-red-950/50 border border-zinc-800 hover:border-red-900/50 text-zinc-400 hover:text-red-400 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                >
                  {waDisconnecting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  {waDisconnecting ? 'Bağlantı Kesiliyor...' : 'Bağlantıyı Kes'}
                </button>
              ) : (
                <button
                  onClick={handleConnectWhatsApp}
                  disabled={waConnecting || waStatus === 'qr_pending'}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                >
                  {waConnecting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : waStatus === 'qr_pending' ? (
                    <QrCode className="w-3 h-3" />
                  ) : (
                    <Wifi className="w-3 h-3" />
                  )}
                  {waConnecting ? 'Başlatılıyor...' : waStatus === 'qr_pending' ? 'QR Kodu Göster' : 'WhatsApp Bağla'}
                </button>
              )}

              {waStatus === 'qr_pending' && (
                <button
                  onClick={() => setShowQrModal(true)}
                  className="w-full py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-yellow-500/20 transition-all"
                >
                  <QrCode className="w-3 h-3" />
                  QR Kodu Görüntüle
                </button>
              )}
            </div>

            {/* Instagram Card */}
            <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3 overflow-hidden">
              {/* Instagram gradient accent */}
              {igLinked && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400" />
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${igLinked ? 'bg-purple-500' : 'bg-zinc-600'}`} />
                  Instagram DM
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${igLinked ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                  {igLinked ? 'Aktif' : 'Pasif'}
                </span>
              </div>
              
              {igLinked ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-xs">{igHandle || 'Instagram Hesabı'}</p>
                      <p className="text-zinc-500 text-[9px]">DM'ler otomatik yanıtlanıyor</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDisconnectInstagram}
                    disabled={igDisconnecting}
                    className="w-full py-2 bg-zinc-950 hover:bg-red-950/50 border border-zinc-800 hover:border-red-900/50 text-zinc-400 hover:text-red-400 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                  >
                    {igDisconnecting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <WifiOff className="w-3 h-3" />
                    )}
                    {igDisconnecting ? 'Bağlantı Kesiliyor...' : 'Bağlantıyı Kes'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Müşterilerinizin Instagram DM'lerine yapay zeka ile otomatik cevap verin.
                  </p>
                  <button
                    onClick={() => { resetIgModal(); setShowIgModal(true); }}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-900/30"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Instagram Hesabını Bağla
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Simulator Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block border-b border-zinc-900 pb-2">
              Test Simülatörü
            </span>
            <p className="text-zinc-500 text-[10px] leading-relaxed">
              AI asistanınızı bağlamadan önce simülatör ile test edebilirsiniz.
            </p>
            <Link
              href={`/widget?slug=${slug}`}
              target="_blank"
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <span>Simülatörü Aç</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
