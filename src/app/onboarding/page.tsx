'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Sparkles, 
  Clock, 
  Scissors, 
  HelpCircle, 
  ShieldAlert, 
  MessageSquare, 
  Code, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  Bot, 
  Copy,
  AlertCircle,
  Phone,
  Smartphone,
  Send,
  CheckCheck,
  RefreshCw,
  MessageCircle
} from 'lucide-react';

interface ServiceItem {
  name: string;
  description: string;
  duration: string;
  price: string;
  displayPrice: boolean;
  isBookable: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  
  // Wizard steps
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Business Info
  const [name, setName] = useState('');
  const [sector, setSector] = useState('Güzellik salonu');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');

  // Step 2: Brand Tone
  const [brandTone, setBrandTone] = useState('Profesyonel');

  // Step 3: Working Hours
  const [workHours, setWorkHours] = useState({
    start: '10:00',
    end: '20:00',
    closedDays: ['Pazar']
  });

  // Step 4: Services Catalog
  const [services, setServices] = useState<ServiceItem[]>([
    { name: 'Cilt Bakımı', description: 'Komple cilt bakımı seansı', duration: '60', price: '1200', displayPrice: true, isBookable: true }
  ]);
  const [newSvc, setNewSvc] = useState<ServiceItem>({
    name: '', description: '', duration: '30', price: '', displayPrice: true, isBookable: true
  });

  // Step 5: FAQs
  const [faqs, setFaqs] = useState<FAQItem[]>([
    { question: 'Nerede bulunuyorsunuz?', answer: 'Kadıköy merkezde hizmet vermekteyiz.', category: 'Konum' }
  ]);
  const [newFaq, setNewFaq] = useState<FAQItem>({ question: '', answer: '', category: 'Genel' });

  // Step 6: Handoff Rules
  const [handoffRules, setHandoffRules] = useState({
    complaint: true,
    refund: true,
    sensitive: true
  });

  // Step 7: Test Chat (Local simulation)
  const [testMessages, setTestMessages] = useState<Array<{ sender: 'user' | 'bot', text: string, time: string }>>([
    { 
      sender: 'bot', 
      text: 'Merhaba! Ben sizin için özelleştirilen WhatsApp AI temsilciniz. Bana hizmetlerinizi, saatlerinizi sorarak veya şikayet senaryosu yazarak beni test edebilirsiniz!',
      time: '14:02'
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [botTyping, setBotTyping] = useState(false);

  // Step 8: Integration States
  const [businessSlug, setBusinessSlug] = useState('bella-guzellik');
  const [copied, setCopied] = useState(false);
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false);
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);
  const [connectingWs, setConnectingWs] = useState(false);
  const [connectingIg, setConnectingIg] = useState(false);

  // Add a service
  const addService = () => {
    if (!newSvc.name || !newSvc.price) return;
    setServices([...services, newSvc]);
    setNewSvc({ name: '', description: '', duration: '30', price: '', displayPrice: true, isBookable: true });
  };

  // Remove a service
  const removeService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  // Add FAQ
  const addFaq = () => {
    if (!newFaq.question || !newFaq.answer) return;
    setFaqs([...faqs, newFaq]);
    setNewFaq({ question: '', answer: '', category: 'Genel' });
  };

  // Remove FAQ
  const removeFaq = (idx: number) => {
    setFaqs(faqs.filter((_, i) => i !== idx));
  };

  // Simulate Bot Responses in Step 7
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setTestMessages(prev => [...prev, { sender: 'user', text: inputMsg, time }]);
    const currentInput = inputMsg;
    setInputMsg('');
    setBotTyping(true);

    setTimeout(() => {
      let reply = '';
      const lowerInput = currentInput.toLowerCase();
      
      if (lowerInput.includes('fiyat') || lowerInput.includes('hizmet')) {
        const svcNames = services.map(s => `${s.name} (${s.price} TL)`).join(', ');
        reply = `Hizmetlerimiz ve fiyatlarımız şu şekildedir: ${svcNames || 'Henüz fiyat girilmedi.'} Yardımcı olabileceğimiz başka bir konu var mıdır?`;
      } else if (lowerInput.includes('saat') || lowerInput.includes('zaman')) {
        reply = `Haftanın ${workHours.closedDays.includes('Pazar') ? 'Pazartesi - Cumartesi' : 'her günü'} günleri ${workHours.start} - ${workHours.end} saatleri arasında açığız.`;
      } else if (lowerInput.includes('şikayet') || lowerInput.includes('yetkili')) {
        reply = `⚠️ İnsan devri kuralı tetiklendi. Sizden gelen bu mesajı hemen yönetici arkadaşlarıma aktarıyorum, size en kısa sürede dönüş sağlayacaklardır.`;
      } else {
        reply = `Bella Güzellik Salonu adına yanıt veriyorum: Sorunuz için teşekkür ederiz! Sektörümüzün marka tonuna uygun şekilde size yardımcı olmak isteriz. Randevu talebi oluşturmak ister misiniz?`;
      }

      setTestMessages(prev => [...prev, { sender: 'bot', text: reply, time }]);
      setBotTyping(false);
    }, 1000);
  };

  // Submit onboarding to API
  const handleSubmitOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessInfo: { name, sector, phone, whatsapp, instagram, website, address },
          brandTone,
          workingHours: workHours,
          services,
          faqs,
          handoffRules
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'İşletme kaydedilirken bir sorun çıktı.');
      }

      setBusinessSlug(data.slug);
      setStep(8); // Go to final step
    } catch (err: any) {
      setError(err.message || 'Onboarding sırasında beklenmeyen bir hata oldu.');
    } finally {
      setLoading(false);
    }
  };

  // Simulate WhatsApp connect
  const connectWhatsapp = () => {
    if (connectingWs || isWhatsappConnected) return;
    setConnectingWs(true);
    setTimeout(() => {
      setConnectingWs(false);
      setIsWhatsappConnected(true);
    }, 1500);
  };

  // Simulate Instagram connect
  const connectInstagram = () => {
    if (connectingIg || isInstagramConnected) return;
    setConnectingIg(true);
    setTimeout(() => {
      setConnectingIg(false);
      setIsInstagramConnected(true);
    }, 1500);
  };

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen py-10 px-4 md:px-6 relative select-none">
      <div className="max-w-4xl mx-auto">
        
        {/* Logo & Slogan Header */}
        <div className="flex items-center justify-between mb-8 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">Assistora</span>
              <span className="text-[10px] font-semibold block text-zinc-400 -mt-1 uppercase tracking-wider">Kurulum Sihirbazı</span>
            </div>
          </div>
          <div className="text-xs text-zinc-500 font-semibold">
            Adım {step} / 8
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-zinc-900 h-1.5 rounded-full mb-10 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-600 to-indigo-600 h-full transition-all duration-300"
            style={{ width: `${(step / 8) * 100}%` }}
          />
        </div>

        {/* Step Container */}
        <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-6 md:p-10 shadow-2xl relative">
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: BUSINESS INFO */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  İşletme Bilgileri
                </h2>
                <p className="text-zinc-500 text-xs mt-1">İşletmenizin genel ve iletişim bilgilerini tanımlayın.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">İşletme Adı *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Örn: Bella Güzellik Salonu" 
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Sektör *</label>
                  <select 
                    value={sector} 
                    onChange={e => setSector(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                  >
                    <option>Güzellik salonu</option>
                    <option>Klinik & Muayenehane</option>
                    <option>Emlak Ofisi</option>
                    <option>Spor Salonu</option>
                    <option>Oto Servis</option>
                    <option>Diğer</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Telefon Numarası</label>
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="+90 216 123 4567" 
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">WhatsApp Numarası</label>
                  <input 
                    type="text" 
                    value={whatsapp} 
                    onChange={e => setWhatsapp(e.target.value)} 
                    placeholder="+90 532 123 4567" 
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Instagram Kullanıcı Adı</label>
                  <input 
                    type="text" 
                    value={instagram} 
                    onChange={e => setInstagram(e.target.value)} 
                    placeholder="bellaguzellik" 
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">Web Sitesi</label>
                  <input 
                    type="text" 
                    value={website} 
                    onChange={e => setWebsite(e.target.value)} 
                    placeholder="https://bellaguzellik.com" 
                    className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400">Açık Adres</label>
                <textarea 
                  value={address} 
                  onChange={e => setAddress(e.target.value)} 
                  placeholder="Caferağa Mah. Moda Cad. No:12 D:3 Kadıköy / İstanbul" 
                  rows={2}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: BRAND TONE */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  Yapay Zekâ Marka Tonu (Persona)
                </h2>
                <p className="text-zinc-500 text-xs mt-1">Müşteri temsilcinizin müşterilerle kuracağı diyaloğun havasını belirleyin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'Samimi', title: 'Samimi & Nazik', desc: 'Cana yakın, cana yakın ve sıcak bir dil kullanır. Empati odaklıdır.' },
                  { id: 'Profesyonel', title: 'Profesyonel', desc: 'Resmiyetten uzak ancak net, saygılı ve yardımsever bir tonda konuşur.' },
                  { id: 'Kurumsal', title: 'Kurumsal & Ciddi', desc: 'Tamamen kurumsal dil kurallarına uyan, mesafeli ve ciddi bir dil.' },
                  { id: 'Lüks', title: 'Lüks & Seçkin', desc: 'Premium kelimeler seçen, yüksek kaliteyi yansıtan özel bir üslup.' },
                  { id: 'Genç ve enerjik', title: 'Genç & Dinamik', desc: 'Daha dinamik, enerjik, emojileri aktif kullanan eğlenceli bir ton.' },
                  { id: 'Kış ve net', title: 'Pratik, Kısa & Net', desc: 'Cevapları uzatmadan, doğrudan bilgi veren minimalist yaklaşım.' }
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setBrandTone(tone.id)}
                    className={`p-5 rounded-2xl border text-left flex flex-col gap-2 transition-all ${
                      brandTone === tone.id 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-bold text-sm text-white">{tone.title}</span>
                      {brandTone === tone.id && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">✓</span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-xs leading-relaxed">{tone.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: WORKING HOURS */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  Çalışma Saatleri
                </h2>
                <p className="text-zinc-500 text-xs mt-1">İşletmenizin açık ve kapalı olduğu saatleri AI temsilcisine öğretin.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Açılış Saati</label>
                    <input 
                      type="time" 
                      value={workHours.start} 
                      onChange={e => setWorkHours({ ...workHours, start: e.target.value })}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-zinc-400">Kapanış Saati</label>
                    <input 
                      type="time" 
                      value={workHours.end} 
                      onChange={e => setWorkHours({ ...workHours, end: e.target.value })}
                      className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-zinc-400 block">Kapalı Günler (Çalışılmayan Günler)</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => {
                      const isClosed = workHours.closedDays.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            setWorkHours({
                              ...workHours,
                              closedDays: isClosed 
                                ? workHours.closedDays.filter(d => d !== day) 
                                : [...workHours.closedDays, day]
                            });
                          }}
                          className={`p-2.5 rounded-lg border text-xs font-medium transition-all ${
                            isClosed 
                              ? 'bg-emerald-900/30 border-emerald-500 text-emerald-300' 
                              : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SERVICES CATALOG */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-emerald-400" />
                  Hizmetler & Fiyat Listesi
                </h2>
                <p className="text-zinc-500 text-xs mt-1">İşletmenizin sunduğu ana hizmetleri ve fiyatları ekleyin.</p>
              </div>

              {/* Add service form */}
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex flex-col gap-4">
                <span className="text-xs font-bold text-white">Yeni Hizmet Tanımla</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <input 
                    type="text" 
                    value={newSvc.name} 
                    onChange={e => setNewSvc({ ...newSvc, name: e.target.value })} 
                    placeholder="Hizmet Adı (Örn: Manikür)" 
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                  <input 
                    type="number" 
                    value={newSvc.price} 
                    onChange={e => setNewSvc({ ...newSvc, price: e.target.value })} 
                    placeholder="Fiyat (Örn: 450)" 
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                  <input 
                    type="number" 
                    value={newSvc.duration} 
                    onChange={e => setNewSvc({ ...newSvc, duration: e.target.value })} 
                    placeholder="Süre (Dakika)" 
                    className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <input 
                  type="text" 
                  value={newSvc.description} 
                  onChange={e => setNewSvc({ ...newSvc, description: e.target.value })} 
                  placeholder="Kısa Açıklama (Opsiyonel)" 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none w-full"
                />
                
                <div className="flex gap-6 items-center">
                  <label className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <input 
                      type="checkbox" 
                      checked={newSvc.displayPrice} 
                      onChange={e => setNewSvc({ ...newSvc, displayPrice: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    Fiyat Temsilci Tarafından Gösterilebilsin
                  </label>
                  <label className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                    <input 
                      type="checkbox" 
                      checked={newSvc.isBookable} 
                      onChange={e => setNewSvc({ ...newSvc, isBookable: e.target.checked })}
                      className="accent-emerald-500"
                    />
                    Randevu Alınabilsin
                  </label>
                </div>

                <button
                  type="button"
                  onClick={addService}
                  className="self-end px-5 py-2.5 bg-white text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Listeye Ekle</span>
                </button>
              </div>

              {/* Services List Table */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-zinc-400 block">Eklenen Hizmetler ({services.length})</span>
                {services.length === 0 ? (
                  <div className="text-center p-8 border border-zinc-800 border-dashed rounded-2xl text-xs text-zinc-500">
                    Henüz hizmet eklenmedi. Lütfen yukarıdaki formu doldurup ekleyin.
                  </div>
                ) : (
                  <div className="border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold">
                          <th className="p-3">Hizmet Adı</th>
                          <th className="p-3">Süre</th>
                          <th className="p-3">Fiyat</th>
                          <th className="p-3">Görünüm/Randevu</th>
                          <th className="p-3 text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((svc, idx) => (
                          <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-900/20 text-zinc-300">
                            <td className="p-3 font-semibold text-white">{svc.name}</td>
                            <td className="p-3">{svc.duration} dk</td>
                            <td className="p-3 font-bold">{svc.price} TL</td>
                            <td className="p-3 text-zinc-500 flex gap-2">
                              {svc.displayPrice ? 'Fiyat Açık' : 'Fiyat Gizli'} • {svc.isBookable ? 'Randevu Açık' : 'Randevu Kapalı'}
                            </td>
                            <td className="p-3 text-right">
                              <button 
                                onClick={() => removeService(idx)} 
                                className="text-red-400 hover:text-red-300 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: FAQS (KNOWLEDGE BASE) */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                  Sık Sorulan Sorular (Bilgi Bankası)
                </h2>
                <p className="text-zinc-500 text-xs mt-1">İşletmenizin konumu, kuralları veya en popüler müşteri sorularını girin.</p>
              </div>

              {/* Add FAQ form */}
              <div className="p-5 rounded-2xl bg-zinc-900/30 border border-zinc-800 flex flex-col gap-4">
                <span className="text-xs font-bold text-white">Soru & Cevap Ekle</span>
                <input 
                  type="text" 
                  value={newFaq.question} 
                  onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} 
                  placeholder="Soru (Örn: Otoparkınız var mı?)" 
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none w-full"
                />
                <textarea 
                  value={newFaq.answer} 
                  onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })} 
                  placeholder="Cevap (Örn: Evet, salonumuzun önünde müşterilerimize özel ücretsiz otopark alanı mevcuttur.)" 
                  rows={2}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 outline-none w-full resize-none"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Kategori</label>
                    <select 
                      value={newFaq.category} 
                      onChange={e => setNewFaq({ ...newFaq, category: e.target.value })}
                      className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none"
                    >
                      <option>Genel</option>
                      <option>Konum</option>
                      <option>Çalışma Saati</option>
                      <option>Randevu</option>
                      <option>Hizmet Detay</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addFaq}
                  className="self-end px-5 py-2.5 bg-white text-black font-semibold rounded-lg text-xs flex items-center gap-1.5 hover:bg-zinc-200 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Listeye Ekle</span>
                </button>
              </div>

              {/* FAQs list */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-zinc-400 block">Eklenen Q&A ({faqs.length})</span>
                {faqs.length === 0 ? (
                  <div className="text-center p-8 border border-zinc-800 border-dashed rounded-2xl text-xs text-zinc-500">
                    Henüz soru eklenmedi. Lütfen formu doldurup ekleyin.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/10 flex justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 inline-block">
                            {faq.category}
                          </span>
                          <h5 className="font-bold text-white">S: {faq.question}</h5>
                          <p className="text-zinc-400 leading-relaxed">C: {faq.answer}</p>
                        </div>
                        <button 
                          onClick={() => removeFaq(idx)} 
                          className="text-red-400 hover:text-red-300 self-start p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 6: HANDOFF RULES */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  İnsan Temsilciye Devir Kuralları
                </h2>
                <p className="text-zinc-500 text-xs mt-1">Yapay zekanın hangi durumlarda otomatik yanıtı durdurup sohbeti yetkililere aktaracağını seçin.</p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { id: 'complaint', label: 'Şikayet & Olumsuz Geri Bildirimler', desc: 'Müşteri herhangi bir hizmet, personel veya ödeme konusunda şikayette bulunduğunda AI devreden çıkar.' },
                  { id: 'refund', label: 'Ödeme Sorunları & İade Talepleri', desc: 'Ödeme hataları, iade istekleri veya fiyat indirim pazarlıklarında konuşma temsilciye yönlendirilir.' },
                  { id: 'sensitive', label: 'Sağlık / Hassas Tıbbi Sorular', desc: 'Tıbbi teşhis gerektiren hassas sorularda veya riskli durumlarda doğrudan insana el-devri (handoff) yapılır.' }
                ].map((rule) => {
                  const val = (handoffRules as any)[rule.id];
                  return (
                    <label 
                      key={rule.id} 
                      className={`p-5 rounded-2xl border flex items-start gap-4 cursor-pointer select-none transition-all ${
                        val ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/20'
                      }`}
                    >
                      <input 
                        type="checkbox"
                        checked={val}
                        onChange={() => setHandoffRules({ ...handoffRules, [rule.id]: !val })}
                        className="w-5 h-5 rounded border-zinc-800 text-emerald-600 focus:ring-emerald-500 mt-0.5 accent-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-sm text-white block">{rule.label}</span>
                        <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{rule.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: TEST CHAT (WhatsApp Simulated Style) */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  WhatsApp Yapay Zekâ Temsilcisini Test Edin
                </h2>
                <p className="text-zinc-500 text-xs mt-1">Oluşturduğunuz kuralları ve marka tonunu test etmek için asistanınızla WhatsApp simülasyonu üzerinde yazışın.</p>
              </div>

              <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#0d0e12] h-[360px] overflow-hidden max-w-md mx-auto shadow-xl">
                {/* Simulated Header */}
                <div className="bg-[#075e54] px-4 py-3 flex items-center justify-between text-white select-none">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                      {name ? name.substring(0, 1).toUpperCase() : 'B'}
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold block leading-tight">{name || 'Bella Güzellik'} (AI)</h4>
                      <span className="text-[9px] text-white/80 block">Çevrimiçi</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>

                {/* Messages panel */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col justify-start">
                  {testMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div 
                        className={`px-3.5 py-2 rounded-2xl text-xs leading-snug ${
                          msg.sender === 'user' 
                            ? 'bg-[#128c7e] text-white rounded-tr-none' 
                            : 'bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[8px] text-zinc-500 mt-1 px-1 flex items-center gap-0.5">
                        {msg.time}
                        {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-sky-400" />}
                      </span>
                    </div>
                  ))}
                  {botTyping && (
                    <div className="self-start px-4 py-2 bg-zinc-900 border border-zinc-850 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>

                {/* Input panel */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-900 bg-zinc-950 flex gap-2">
                  <input 
                    type="text" 
                    value={inputMsg} 
                    onChange={e => setInputMsg(e.target.value)} 
                    placeholder="Deneme mesajı yazın... (Örn: Fiyat listesi nedir?)" 
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-xs outline-none text-white focus:border-emerald-500"
                  />
                  <button 
                    type="submit" 
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                💡 **Test İpuçları:**
                - Hizmetlerinizi test etmek için *"Hizmetleriniz ve fiyatları nedir?"* yazın.
                - Şikayet / devir kurallarını test etmek için *"Yetkili temsilciyle görüşmek istiyorum"* veya *"şikayetim var"* yazın.
              </div>
            </div>
          )}

          {/* STEP 8: INTEGRATION & CHANNEL CONNECTION (WhatsApp/Instagram API) */}
          {step === 8 && (
            <div className="space-y-8 flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-white">Yapay Zekâ Asistanınız Hazır!</h2>
                <p className="text-zinc-400 text-sm mt-2 max-w-md">
                  Tebrikler, **{name}** işletme profiliniz oluşturuldu. Şimdi asistanınızı mesajlaşma kanallarınıza bağlayın.
                </p>
              </div>

              {/* Channels Connections Grid */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* WhatsApp Connection */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Phone className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">WhatsApp Business API</h4>
                      <span className="text-[10px] text-zinc-500 font-semibold block">Müşteri Hattı Entegrasyonu</span>
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Yapay zeka asistanını resmi WhatsApp Business numaranıza bağlayarak gelen mesajları otomatik yanıtlayın.
                  </p>

                  <div className="pt-2">
                    {isWhatsappConnected ? (
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Bağlandı (Aktif)
                        </span>
                        <button 
                          onClick={() => setIsWhatsappConnected(false)}
                          className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-medium"
                        >
                          Bağlantıyı Kes
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={connectWhatsapp}
                        disabled={connectingWs}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        {connectingWs ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>QR Kod Oluşturuluyor...</span>
                          </>
                        ) : (
                          <>
                            <span>WhatsApp'ı QR Kod ile Bağla</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Instagram Connection */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <MessageSquare className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Instagram Direct Message</h4>
                      <span className="text-[10px] text-zinc-500 font-semibold block">Instagram DM Entegrasyonu</span>
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    İşletme Instagram hesabınızı bağlayarak DM üzerinden gelen fiyat ve randevu sorularını yanıtlayın.
                  </p>

                  <div className="pt-2">
                    {isInstagramConnected ? (
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Bağlandı (Aktif)
                        </span>
                        <button 
                          onClick={() => setIsInstagramConnected(false)}
                          className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-medium"
                        >
                          Bağlantıyı Kes
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={connectInstagram}
                        disabled={connectingIg}
                        className="w-full py-2.5 bg-[#8a3ab9] hover:bg-[#a855f7] disabled:bg-zinc-800 text-white disabled:text-zinc-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        {connectingIg ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Meta'ya Bağlanıyor...</span>
                          </>
                        ) : (
                          <>
                            <span>Instagram Meta Hesabını Bağla</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              </div>

              <div className="text-[11px] text-zinc-500 w-full max-w-md">
                💡 Bağlantıları şimdi kurabilir veya herhangi bir aşamada doğrudan **İşletme Ayarları** menüsünden güncelleyebilirsiniz.
              </div>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl flex items-center justify-center gap-2 group transition-all"
              >
                <span>Dashboard Paneline Git</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Navigation Buttons (Except Step 8) */}
          {step < 8 && (
            <div className="flex items-center justify-between mt-10 border-t border-zinc-800/80 pt-6">
              <button
                type="button"
                disabled={step === 1}
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-xl border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/50 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Geri</span>
              </button>

              {step === 7 ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmitOnboarding}
                  className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-800" />
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Kurulumu Tamamla</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={step === 1 && !name.trim()}
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>Devam Et</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
