'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Settings, 
  Building, 
  Save, 
  Loader2, 
  AlertCircle, 
  Check,
  Phone,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Bot,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';

type WaStatus = 'disconnected' | 'connecting' | 'qr_pending' | 'connected';

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

  // Instagram (Meta Graph - SaaS OAuth connection)
  const [igLinked, setIgLinked] = useState(false);
  const [igHandle, setIgHandle] = useState<string | null>(null);
  const [igDisconnecting, setIgDisconnecting] = useState(false);
  const [showIgModal, setShowIgModal] = useState(false);
  const [igUsername, setIgUsername] = useState('');
  const [igPassword, setIgPassword] = useState('');
  const [igConnecting, setIgConnecting] = useState(false);
  const [igError, setIgError] = useState<string | null>(null);

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
      const res = await fetch('/api/instagram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: igUsername, password: igPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Instagram bağlantısı kurulamadı.');
      
      setIgLinked(true);
      setIgHandle(`@${igUsername}`);
      setShowIgModal(false);
      setIgUsername('');
      setIgPassword('');
    } catch (err: any) {
      setIgError(err.message);
    } finally {
      setIgConnecting(false);
    }
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

      {/* Instagram Credentials Modal */}
      {showIgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => {
                setShowIgModal(false);
                setIgError(null);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleConnectInstagram} className="space-y-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto">
                  <Wifi className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Instagram Hesabını Bağla</h3>
                  <p className="text-zinc-500 text-[10px] mt-1">
                    Instagram kullanıcı adınızı ve şifrenizi girerek asistanınızı bağlayın.
                  </p>
                </div>
              </div>

              {igError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-[10px] text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{igError}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-semibold">Kullanıcı Adı</label>
                  <input
                    type="text"
                    required
                    value={igUsername}
                    onChange={(e) => setIgUsername(e.target.value)}
                    placeholder="kullanici_adi"
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-zinc-700 w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-semibold">Şifre</label>
                  <input
                    type="password"
                    required
                    value={igPassword}
                    onChange={(e) => setIgPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-zinc-700 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowIgModal(false);
                    setIgError(null);
                  }}
                  className="w-1/2 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={igConnecting}
                  className="w-1/2 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  {igConnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{igConnecting ? 'Bağlanıyor...' : 'Bağlantıyı Kur'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5.5 h-5.5 text-emerald-400" />
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
          <span>Ayarlarınız başarıyla kaydedildi ve yapay zeka asistanı güncellendi!</span>
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
          
          {/* WhatsApp Connection Card */}
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
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
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
                  <p className="text-[10px] text-zinc-400">
                    Bağlı Hesap: <strong className="text-white">{igHandle || 'Instagram Hesabı'}</strong>
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Gelen DM'ler yapay zeka asistanı tarafından otomatik olarak yanıtlanmaktadır.
                  </p>
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
                    Müşterilerinizin Instagram DM'lerine yapay zeka ile otomatik cevap vermek için tek tıkla bağlanın.
                  </p>
                  <button
                    onClick={() => setShowIgModal(true)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 text-center"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Instagram ile Bağlan
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Simulator Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
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
