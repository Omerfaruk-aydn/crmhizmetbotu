'use client';

import React, { useState, useEffect } from 'react';
import {
  Camera,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  Terminal,
  Webhook,
  Key,
  Link2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Globe,
  Info,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Instagram Hesabını Business\'a Çevir', icon: Camera },
  { id: 2, title: 'Facebook Developer Uygulaması Oluştur', icon: Globe },
  { id: 3, title: 'Ngrok ile HTTPS Tünel Aç', icon: Terminal },
  { id: 4, title: 'Webhook URL\'ini Meta\'ya Kaydet', icon: Webhook },
  { id: 5, title: 'Access Token\'ı Sisteme Kaydet', icon: Key },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="ml-2 p-1 rounded text-zinc-500 hover:text-white transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="mt-2">
      {label && <p className="text-[10px] text-zinc-500 mb-1 uppercase font-semibold">{label}</p>}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-xs text-emerald-400 flex items-center justify-between gap-2">
        <span className="break-all">{code}</span>
        <CopyButton text={code} />
      </div>
    </div>
  );
}

function StepCard({
  step,
  isActive,
  isCompleted,
  onClick,
  children,
}: {
  step: typeof STEPS[0];
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const Icon = step.icon;
  return (
    <div className={`border rounded-2xl transition-all overflow-hidden ${
      isActive ? 'border-emerald-500/40 bg-zinc-950' :
      isCompleted ? 'border-emerald-500/20 bg-zinc-950/50' :
      'border-zinc-800 bg-zinc-950/30'
    }`}>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-zinc-900/30 transition-colors"
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
          isActive ? 'bg-zinc-800 text-white border border-zinc-600' :
          'bg-zinc-900 text-zinc-500 border border-zinc-800'
        }`}>
          {isCompleted ? <Check className="w-4 h-4" /> : step.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : isCompleted ? 'text-emerald-500' : 'text-zinc-600'}`} />
            <span className={`text-sm font-bold ${isActive ? 'text-white' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'}`}>
              {step.title}
            </span>
          </div>
        </div>
        {isActive ? <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />}
      </button>
      {isActive && (
        <div className="px-5 pb-5 pt-1 border-t border-zinc-800/50">
          {children}
        </div>
      )}
    </div>
  );
}

export default function InstagramSetupPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [businessId, setBusinessId] = useState('');
  const [ngrokUrl, setNgrokUrl] = useState('');
  const [verifyToken, setVerifyToken] = useState('MY_VERIFY_TOKEN_' + Math.random().toString(36).slice(2, 10).toUpperCase());
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/businesses/current')
      .then(r => r.json())
      .then(d => setBusinessId(d.id || ''))
      .catch(() => {});
  }, []);

  const webhookUrl = ngrokUrl
    ? `${ngrokUrl.replace(/\/$/, '')}/api/webhooks/instagram?businessId=${businessId}`
    : `https://SENİN-NGROK-URL/api/webhooks/instagram?businessId=${businessId}`;

  const completeStep = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    setActiveStep(Math.min(step + 1, 5));
  };

  const handleSaveToken = async () => {
    if (!pageAccessToken.trim()) {
      setSaveError('Page Access Token boş bırakılamaz.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/instagram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageAccessToken, verifyToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Kayıt başarısız.');
      setSaveSuccess(true);
      completeStep(5);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Camera className="w-5 h-5 text-pink-400" />
          Instagram DM Entegrasyonu
        </h1>
        <p className="text-zinc-500 text-xs mt-1">
          Bu kılavuzu adım adım takip ederek Instagram DM'lerini AI asistanınıza bağlayın. Toplam süre: ~20 dakika.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="flex-1 bg-zinc-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.length / 5) * 100}%` }}
          />
        </div>
        <span className="text-xs text-zinc-400 font-bold shrink-0">{completedSteps.length}/5 Adım</span>
      </div>

      {/* Info banner */}
      <div className="flex gap-3 items-start bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-400 leading-relaxed">
          Instagram resmi API kullanır. <strong className="text-white">Ücretsizdir</strong> ama bir kez doğrulama adımlarını geçmeniz gerekir. 
          Hesabınızı Business/Creator'a çevirmek 2 dakika sürer ve ücretsizdir.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3">

        {/* Step 1 */}
        <StepCard
          step={STEPS[0]}
          isActive={activeStep === 1}
          isCompleted={completedSteps.includes(1)}
          onClick={() => setActiveStep(1)}
        >
          <div className="space-y-4 mt-3">
            <p className="text-zinc-400 text-xs leading-relaxed">
              Instagram API'si sadece <strong className="text-white">Business</strong> veya <strong className="text-white">Creator</strong> hesaplarıyla çalışır. 
              Kişisel hesabınızı ücretsiz olarak dönüştürebilirsiniz.
            </p>
            <div className="space-y-2">
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Instagram uygulamasını açın → Profil → Sağ üst <strong className="text-white">☰</strong></span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span><strong className="text-white">Ayarlar ve gizlilik</strong> → <strong className="text-white">Hesap türü ve araçları</strong></span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span><strong className="text-white">Profesyonel hesaba geç</strong> → <strong className="text-white">İşletme</strong> seçin</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                <span>Facebook sayfanızla bağlayın (yoksa bu adımda oluşturabilirsiniz)</span>
              </div>
            </div>
            <button
              onClick={() => completeStep(1)}
              className="mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Business hesabım var, devam et
            </button>
          </div>
        </StepCard>

        {/* Step 2 */}
        <StepCard
          step={STEPS[1]}
          isActive={activeStep === 2}
          isCompleted={completedSteps.includes(2)}
          onClick={() => setActiveStep(2)}
        >
          <div className="space-y-4 mt-3">
            <p className="text-zinc-400 text-xs leading-relaxed">
              Meta Developer Console'da ücretsiz bir uygulama oluşturarak Instagram Graph API erişimi alırsınız.
            </p>
            <div className="space-y-2">
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Aşağıdaki linki açın, Facebook hesabınızla giriş yapın</span>
              </div>
              <a
                href="https://developers.facebook.com/apps/create/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/5 border border-blue-500/20 rounded-xl px-3 py-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                developers.facebook.com/apps/create/
              </a>
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Uygulama türü: <strong className="text-white">İşletme</strong> seçin → Devam</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span>Uygulama adı girin (örn: <em className="text-white">CRM Hizmet Botu</em>) → Oluştur</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                <span>Sol menü → <strong className="text-white">Instagram</strong> → <strong className="text-white">API with Instagram Login</strong> veya <strong className="text-white">Messenger API</strong> ekleyin</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                <span>Instagram hesabınızı uygulamaya bağlayın → Test kullanıcısı olarak ekleyin</span>
              </div>
            </div>
            <button
              onClick={() => completeStep(2)}
              className="mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Uygulamayı oluşturdum, devam et
            </button>
          </div>
        </StepCard>

        {/* Step 3 */}
        <StepCard
          step={STEPS[2]}
          isActive={activeStep === 3}
          isCompleted={completedSteps.includes(3)}
          onClick={() => setActiveStep(3)}
        >
          <div className="space-y-4 mt-3">
            <p className="text-zinc-400 text-xs leading-relaxed">
              Meta'nın webhook sistemi HTTPS URL gerektirir. Ngrok, bilgisayarınızı geçici olarak internete açan ücretsiz bir araçtır.
            </p>

            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">1. Ngrok'u İndir ve Kur</p>
              <a
                href="https://ngrok.com/download"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/5 border border-blue-500/20 rounded-xl px-3 py-2 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                ngrok.com/download — İndir (Windows)
              </a>

              <p className="text-[10px] text-zinc-500 uppercase font-semibold mt-3">2. PowerShell'de Çalıştır</p>
              <CodeBlock code="ngrok http 3000" label="Komut" />

              <p className="text-[10px] text-zinc-500 uppercase font-semibold mt-3">3. Çıktıdan URL'yi Kopyala</p>
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-[10px] text-zinc-400 space-y-0.5">
                <div><span className="text-zinc-600">Session Status</span>  <span className="text-emerald-400">online</span></div>
                <div><span className="text-zinc-600">Forwarding</span>      <span className="text-yellow-400">https://abc123.ngrok-free.app</span> → localhost:3000</div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">↑ <strong className="text-yellow-400">https://...</strong> ile başlayan URL'yi kopyalayın</p>

              <p className="text-[10px] text-zinc-500 uppercase font-semibold mt-3">4. URL'yi Buraya Yapıştırın</p>
              <input
                type="text"
                value={ngrokUrl}
                onChange={e => setNgrokUrl(e.target.value)}
                placeholder="https://abc123.ngrok-free.app"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-600 transition-colors font-mono"
              />
            </div>

            <button
              onClick={() => { if (ngrokUrl) completeStep(3); }}
              disabled={!ngrokUrl}
              className="mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Ngrok çalışıyor, devam et
            </button>
          </div>
        </StepCard>

        {/* Step 4 */}
        <StepCard
          step={STEPS[3]}
          isActive={activeStep === 4}
          isCompleted={completedSteps.includes(4)}
          onClick={() => setActiveStep(4)}
        >
          <div className="space-y-4 mt-3">
            <p className="text-zinc-400 text-xs leading-relaxed">
              Meta'ya oluşturduğunuz webhook URL'sini ve doğrulama token'ını verin.
            </p>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">Webhook URL (Meta'ya yapıştırın)</p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-[11px] text-emerald-400 flex items-center justify-between gap-2 break-all">
                  <span>{webhookUrl}</span>
                  <CopyButton text={webhookUrl} />
                </div>
              </div>

              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-semibold mb-1">Verify Token (Meta'ya yapıştırın)</p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 font-mono text-[11px] text-yellow-400 flex items-center justify-between gap-2">
                  <span>{verifyToken}</span>
                  <CopyButton text={verifyToken} />
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Meta Developer Console'da Adımlar</p>
                <div className="flex gap-2 items-start text-xs text-zinc-400">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Sol menü → <strong className="text-white">Webhooks</strong> → <strong className="text-white">Add Callback URL</strong></span>
                </div>
                <div className="flex gap-2 items-start text-xs text-zinc-400">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Yukarıdaki <strong className="text-white">Webhook URL</strong> ve <strong className="text-white">Verify Token</strong>'ı yapıştırın → <strong className="text-white">Verify and Save</strong></span>
                </div>
                <div className="flex gap-2 items-start text-xs text-zinc-400">
                  <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span><strong className="text-white">messages</strong> ve <strong className="text-white">messaging_postbacks</strong> alanlarını subscribe edin</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => completeStep(4)}
              className="mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Webhook doğrulandı, devam et
            </button>
          </div>
        </StepCard>

        {/* Step 5 */}
        <StepCard
          step={STEPS[4]}
          isActive={activeStep === 5}
          isCompleted={completedSteps.includes(5)}
          onClick={() => setActiveStep(5)}
        >
          <div className="space-y-4 mt-3">
            <p className="text-zinc-400 text-xs leading-relaxed">
              Meta Developer Console'dan aldığınız <strong className="text-white">Page Access Token</strong>'ı buraya yapıştırın.
            </p>

            <div className="space-y-2">
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Meta Developer Console → <strong className="text-white">Instagram</strong> → <strong className="text-white">Generate Token</strong></span>
              </div>
              <div className="flex gap-2 items-start text-xs text-zinc-400">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Instagram hesabınızı seçin → Token'ı kopyalayın</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">Page Access Token</label>
              <input
                type="password"
                value={pageAccessToken}
                onChange={e => setPageAccessToken(e.target.value)}
                placeholder="EAAxxxxxxxxxxxxxx..."
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-pink-500/40 transition-colors font-mono"
              />
            </div>

            {saveError && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Instagram entegrasyonu başarıyla kaydedildi!
              </div>
            )}

            <button
              onClick={handleSaveToken}
              disabled={saving || !pageAccessToken}
              className="mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
              {saving ? 'Kaydediliyor...' : 'Token\'ı Kaydet ve Aktifleştir'}
            </button>
          </div>
        </StepCard>
      </div>

      {/* Done state */}
      {completedSteps.length === 5 && (
        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-white font-bold">Instagram DM Aktif! 🎉</h3>
          <p className="text-zinc-400 text-xs">
            Artık Instagram DM'leriniz AI asistanı tarafından otomatik yanıtlanıyor. 
            Birinin size DM atmasını bekleyin veya kendiniz test edin.
          </p>
          <div className="flex gap-2 justify-center">
            <a
              href="/dashboard/conversations"
              className="px-4 py-2 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-all"
            >
              Konuşmaları Gör
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
