'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  MessageCircle, 
  Calendar, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Shield, 
  Zap, 
  Scissors, 
  Stethoscope, 
  Home as HomeIcon, 
  Dumbbell, 
  Wrench, 
  AlertTriangle, 
  Clock, 
  Menu, 
  X,
  Phone,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  ZapOff,
  UserCheck,
  Utensils
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

// Types for Simulated Chat
interface DemoMessage {
  id: string;
  sender: 'customer' | 'ai' | 'system';
  content: string;
  timestamp: string;
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'instagram'>('whatsapp');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [isTyping, setIsTyping] = useState(false);

  // Simulated CRM / Dashboard State based on Chat
  const [crmLeadScore, setCrmLeadScore] = useState(15);
  const [crmStatus, setCrmStatus] = useState('Yeni Arama');
  const [crmTags, setCrmTags] = useState<string[]>(['Potansiyel Müşteri']);
  const [crmAppointment, setCrmAppointment] = useState<string | null>(null);
  const [crmHandoff, setCrmHandoff] = useState<boolean>(false);

  // Simulated Chat Histories
  const [whatsappMessages, setWhatsappMessages] = useState<DemoMessage[]>([
    {
      id: 'w1',
      sender: 'ai',
      content: 'Merhaba! Bella Güzellik Salonu WhatsApp hattına hoş geldiniz. Size nasıl yardımcı olabilirim? 🌸',
      timestamp: '14:02'
    }
  ]);

  const [instagramMessages, setInstagramMessages] = useState<DemoMessage[]>([
    {
      id: 'i1',
      sender: 'ai',
      content: 'Merhaba! Bella Güzellik Salonu Instagram DM asistanına hoş geldiniz. Hizmetlerimiz, fiyatlarımız veya randevu talepleriniz hakkında bilgi alabilirsiniz. ✨',
      timestamp: '14:02'
    }
  ]);

  // Scroll Reveal Hooks
  const heroReveal = useScrollReveal({ threshold: 0.05 });
  const problemReveal = useScrollReveal({ threshold: 0.1 });
  const solutionReveal = useScrollReveal({ threshold: 0.1 });
  const sectorsReveal = useScrollReveal({ threshold: 0.1 });
  const demoReveal = useScrollReveal({ threshold: 0.1 });
  const pricingReveal = useScrollReveal({ threshold: 0.1 });

  // Interactive Demo Scenarios
  const demoScenarios = {
    whatsapp: [
      {
        label: 'Hizmet & Fiyat Sor',
        customerMessage: 'Merhaba, cilt bakımı fiyatı ne kadar ve ne kadar sürüyor?',
        aiReply: 'Cilt Bakımı seansımız 60 dakika sürmektedir. Derin gözenek temizliği, nemlendirici maske ve masajı içerir. Güncel fiyatımız 1200 TL\'dir. Sizin için ön rezervasyon oluşturmamı ister misiniz?',
        updates: {
          score: 35,
          status: 'Bilgi İstiyor',
          tags: ['Fiyat Sordu', 'Cilt Bakımı'],
          appointment: null,
          handoff: false
        }
      },
      {
        label: 'Randevu Rezervasyonu',
        customerMessage: 'Evet, yarın saat 15:00 için randevu oluşturabilir misiniz? Adım Merve Yılmaz, numaram 0532 999 8877.',
        aiReply: 'Merve Hanım, yarın saat 15:00 için Cilt Bakımı ön randevunuz kaydedilmiştir. Ekibimiz kesin onay için sizinle 0532 999 8877 numaranızdan iletişime geçecektir. Harika bir gün dileriz! 🗓️',
        updates: {
          score: 95,
          status: 'Randevu Talebi',
          tags: ['Sıcak Fırsat', 'Telefon Bıraktı', 'Randevu İstiyor'],
          appointment: 'Cilt Bakımı - Yarın 15:00',
          handoff: false
        }
      },
      {
        label: 'Şikayet / Destek (İnsana Devir)',
        customerMessage: 'Geçen haftaki seanstan sonra yüzüm kızardı, yetkili biriyle acil görüşmek istiyorum!',
        aiReply: 'Çok geçmiş olsun Merve Hanım, bu durumu derhal yetkililerimize iletiyorum. Müşteri memnuniyeti bizim için çok önemlidir. Yapay zeka asistanını durdurup bu görüşmeyi şu an yetkili temsilcimize aktarıyorum. En kısa sürede buradan sizinle yazışacaktır.',
        updates: {
          score: 45,
          status: 'Müşteri Şikayeti',
          tags: ['Destek Talebi', 'Müşteri Temsilcisi Bekliyor'],
          appointment: null,
          handoff: true
        }
      }
    ],
    instagram: [
      {
        label: 'Salon Konumu & Otopark',
        customerMessage: 'Merhaba, Kadıköy şubenizin adresi nedir? Otoparkınız var mı?',
        aiReply: 'Merhaba! Kadıköy şubemiz Caferağa Mah. Moda Cad. No:12 D:3 adresindedir. Salonumuzun önünde misafirlerimize özel 2 araçlık ücretsiz otoparkımız mevcuttur. Yol tarifi için harita linkimiz: https://maps.google.com/?q=Moda+Kadikoy+Istanbul 📍',
        updates: {
          score: 25,
          status: 'Konum Sordu',
          tags: ['Konum/Adres'],
          appointment: null,
          handoff: false
        }
      },
      {
        label: 'Hizmet Detayı & Randevu',
        customerMessage: 'Manikür ve pedikür fiyatları nedir? Bugün saat 17:00 için yer var mı?',
        aiReply: 'Manikür & Pedikür paketimiz 600 TL\'dir. Bugün saat 17:00 için şu an salonumuzda uygunluk mevcuttur. Ön randevunuzu oluşturmak için adınızı ve telefon numaranızı rica edebilir miyim?',
        updates: {
          score: 70,
          status: 'Hizmet Sordu',
          tags: ['Fiyat Sordu', 'Manikür/Pedikür'],
          appointment: null,
          handoff: false
        }
      },
      {
        label: 'Temsilciye Aktarma İsteği',
        customerMessage: 'Yapay zeka ile konuşmak istemiyorum, doğrudan yetkili bir insan yazabilir mi?',
        aiReply: 'Elbette, sizi anlıyorum. Görüşmeyi hemen canlı bir müşteri temsilcimize aktarıyorum. Yetkilimiz en kısa sürede bu sohbet üzerinden sizinle iletişime geçecektir. İyi günler dileriz.',
        updates: {
          score: 40,
          status: 'İnsan Temsilci İstedi',
          tags: ['Müşteri Temsilcisi Bekliyor'],
          appointment: null,
          handoff: true
        }
      }
    ]
  };

  const handleScenarioClick = (scenario: any) => {
    if (isTyping) return;
    
    const timestamp = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: DemoMessage = {
      id: Date.now().toString(),
      sender: 'customer',
      content: scenario.customerMessage,
      timestamp
    };

    if (activeTab === 'whatsapp') {
      setWhatsappMessages(prev => [...prev, userMsg]);
    } else {
      setInstagramMessages(prev => [...prev, userMsg]);
    }
    
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: DemoMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: scenario.aiReply,
        timestamp
      };

      if (activeTab === 'whatsapp') {
        setWhatsappMessages(prev => {
          const list = [...prev, aiMsg];
          if (scenario.updates.handoff) {
            list.push({
              id: (Date.now() + 2).toString(),
              sender: 'system',
              content: '⚠️ Sohbet Canlı Müşteri Temsilcisine Aktarıldı (AI Durduruldu)',
              timestamp
            });
          }
          return list;
        });
      } else {
        setInstagramMessages(prev => {
          const list = [...prev, aiMsg];
          if (scenario.updates.handoff) {
            list.push({
              id: (Date.now() + 2).toString(),
              sender: 'system',
              content: '⚠️ Canlı Temsilci Devri Aktif (AI Duraklatıldı)',
              timestamp
            });
          }
          return list;
        });
      }

      setIsTyping(false);
      setCrmLeadScore(scenario.updates.score);
      setCrmStatus(scenario.updates.status);
      setCrmTags(scenario.updates.tags);
      setCrmAppointment(scenario.updates.appointment);
      setCrmHandoff(scenario.updates.handoff);
    }, 1200);
  };

  const resetSimulator = () => {
    setWhatsappMessages([
      {
        id: 'w1',
        sender: 'ai',
        content: 'Merhaba! Bella Güzellik Salonu WhatsApp hattına hoş geldiniz. Size nasıl yardımcı olabilirim? 🌸',
        timestamp: '14:02'
      }
    ]);
    setInstagramMessages([
      {
        id: 'i1',
        sender: 'ai',
        content: 'Merhaba! Bella Güzellik Salonu Instagram DM asistanına hoş geldiniz. Hizmetlerimiz, fiyatlarımız veya randevu talepleriniz hakkında bilgi alabilirsiniz. ✨',
        timestamp: '14:02'
      }
    ]);
    setCrmLeadScore(15);
    setCrmStatus('Yeni Arama');
    setCrmTags(['Potansiyel Müşteri']);
    setCrmAppointment(null);
    setCrmHandoff(false);
    setIsTyping(false);
  };

  return (
    <div className="bg-[#09090b] text-zinc-100 min-h-screen selection:bg-emerald-600 selection:text-white font-sans overflow-x-hidden">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#09090b]/85 backdrop-blur-md border-b border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 transition-transform group-hover:scale-105">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">OtoCevap</span>
              <span className="text-[10px] font-bold text-zinc-400 -mt-1 block uppercase tracking-widest">WhatsApp & Instagram Botu</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <a href="#problem" className="hover:text-white transition-colors">Sorunlar</a>
            <a href="#solution" className="hover:text-white transition-colors">Çözüm</a>
            <a href="#sectors" className="hover:text-white transition-colors">Sektörler</a>
            <a href="#demo" className="hover:text-white transition-colors">Canlı Simülatör</a>
            <a href="#pricing" className="hover:text-white transition-colors">Fiyatlandırma</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold hover:text-white transition-colors px-4 py-2">
              Giriş Yap
            </Link>
            <Link 
              href="/register" 
              className="text-sm font-bold bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Ücretsiz Başla
            </Link>
          </div>

          {/* Mobile Menu Btn */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white md:hidden"
            aria-label="Menüyü aç"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-zinc-800 bg-[#09090b] px-6 py-8 flex flex-col gap-6"
            >
              <nav className="flex flex-col gap-4 text-base font-semibold text-zinc-400">
                <a href="#problem" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Sorunlar</a>
                <a href="#solution" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Çözüm</a>
                <a href="#sectors" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Sektörler</a>
                <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Canlı Simülatör</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Fiyatlandırma</a>
              </nav>
              <div className="h-px bg-zinc-800 w-full" />
              <div className="flex flex-col gap-3">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-sm font-semibold bg-white text-black rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Ücretsiz Başla
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO SECTION */}
      <section ref={heroReveal.ref} className="relative z-10 pt-16 pb-20 md:pt-28 md:pb-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <motion.div
            animate={heroReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide uppercase mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>WHATSAPP & INSTAGRAM OTOMASYONu</span>
          </motion.div>

          <motion.h1
            animate={heroReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl text-white leading-[1.08] mb-8"
          >
            Uyurken bile <br/>
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
              satış yapın.
            </span>
          </motion.h1>

          <motion.p
            animate={heroReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed mb-12"
          >
            WhatsApp ve Instagram DM'lerinize gelen müşteri mesajlarını 7/24 anında yanıtlayın. Randevuları otomatik toplayın, sıcak fırsatları kaçırmayın.
          </motion.p>

          <motion.div
            animate={heroReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full max-w-sm sm:max-w-none animate-fade-in"
          >
            <Link 
              href="/register" 
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 group transition-all"
            >
              <span>Ücretsiz Kurulum Başlat</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#demo" 
              className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white font-semibold rounded-xl border border-zinc-800 flex items-center justify-center gap-2 transition-all"
            >
              <span>Nasıl Çalışır?</span>
            </a>
          </motion.div>

          {/* Quick Metrics */}
          <motion.div
            animate={heroReveal.inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">7/24 Anında Yanıt</h4>
                <p className="text-zinc-400 text-xs">Gece, tatil veya yoğun saatlerde müşterileri bekletmeden yanıtlayın.</p>
              </div>
            </div>
            <div className="h-px md:h-12 w-full md:w-px bg-zinc-800" />
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Otomatik Randevu Kaydı</h4>
                <p className="text-zinc-400 text-xs">Hizmet, saat ve telefon bilgilerini otomatik alarak kayıt oluşturur.</p>
              </div>
            </div>
            <div className="h-px md:h-12 w-full md:w-px bg-zinc-800" />
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-bold text-base">Entegre B2B CRM</h4>
                <p className="text-zinc-400 text-xs">Konuşan her kullanıcıyı rehbere kaydeder, sıcak fırsatları etiketler.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="problem" ref={problemReveal.ref} className="py-24 px-6 border-t border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">ÇÖZÜLMESİ GEREKEN PROBLEMLER</h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">İşletmeler mesajlaşma kanallarında neden müşteri kaçırıyor?</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "DM ve WhatsApp'ta Geç Dönüş Kayıpları",
                desc: "Müşteriler hizmet veya fiyat sormak için yazar. 10 dakika içinde yanıt alamazlarsa anında başka bir salona veya işletmeye geçerler."
              },
              {
                title: "Gereksiz Zaman Alan Rutin Sorular",
                desc: "\"Neredesiniz?\", \"Hizmet fiyatlarınız nedir?\", \"Bugün saat kaçta açılıyorsunuz?\" gibi yüzlerce soruyu elle tek tek yazmak vakit kaybettirir."
              },
              {
                title: "Sohbet Geçmişinde Kaybolan Randevular",
                desc: "WhatsApp yazışmalarında unutulan, defterlere yanlış not edilen rezervasyonlar müşteri memnuniyetsizliğine ve iptallere yol açar."
              }
            ].map((prob, i) => (
              <motion.div
                key={i}
                animate={problemReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/20 transition-all flex flex-col gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-white mt-2">{prob.title}</h4>
                <p className="text-zinc-400 text-sm leading-relaxed">{prob.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section id="solution" ref={solutionReveal.ref} className="py-24 px-6 border-t border-zinc-800/60 bg-[#09090b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">ÇÖZÜMÜMÜZ</h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">Akıllı Mesajlaşma ve CRM Çözümü</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: MessageCircle, title: "Resmi Entegrasyon", desc: "WhatsApp Business API ve Instagram Professional DM üzerinden doğrudan ve güvenli entegrasyon." },
              { icon: ShieldCheck, title: "Bilgi Bankası Kontrolü", desc: "Sohbet robotu yalnızca sizin girdiğiniz hizmet, fiyat ve konum bilgilerine göre cevap verir." },
              { icon: Calendar, title: "Otomatik Rezervasyon", desc: "Tarih, saat ve telefon onayını alıp onay bekleyen randevu talebini panelinize işler." },
              { icon: UserCheck, title: "Ekibe Canlı Aktarım", desc: "Kritik destek, şikayet veya fiyat pazarlığı mesajlarında yapay zeka durur, görüşmeyi ekibinize devreder." }
            ].map((sol, i) => (
              <motion.div
                key={i}
                animate={solutionReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/20 transition-all flex flex-col gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <sol.icon className="w-5 h-5" />
                </div>
                <h4 className="text-md font-bold text-white mt-2">{sol.title}</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">{sol.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTORS SECTION */}
      <section id="sectors" ref={sectorsReveal.ref} className="py-24 px-6 border-t border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">SEKTÖREL UYGULAMALAR</h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">Farklı Sektörler İçin Yanıt Senaryoları</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Scissors, name: "Güzellik Salonları & Klinikler", desc: "Müşterilerin saç, tırnak veya cilt bakımı fiyat sorularını veritabanına göre yanıtlar. Boş saatleri sorgulayıp randevu talebini panelinize kaydeder." },
              { icon: Stethoscope, name: "Özel Muayenehane & Sağlık", desc: "Tıbbi tanı koymadan, yalnızca çalışma saatleri, konum, uzmanlık alanları ve ön muayene rezervasyon prosedürlerini açıklar." },
              { icon: HomeIcon, name: "Emlak & Gayrimenkul", desc: "Mesaj atan müşterilere portföy konumlarını atar. İlgilenilen fiyat aralığı, oda sayısı ve bütçe bilgilerini alarak danışmanlara aktarır." },
              { icon: Dumbbell, name: "Spor Salonları & Pilates", desc: "Üyelik paketleri, grup seansı saatleri, eğitmen detayları hakkında bilgi verir. İlk ücretsiz deneme seansı randevusunu toplar." },
              { icon: Utensils, name: "Restoran & Kafe Rezervasyon", desc: "Menü içeriğini, özel günler için grup rezervasyon kurallarını açıklar ve masa rezervasyonu talebi toplar." },
              { icon: Wrench, name: "Oto Servis & Teknik Bakım", desc: "Araç marka/modeline göre periyodik bakım fiyatlarını sunar ve servis randevusu organize eder." }
            ].map((sec, i) => (
              <motion.div
                key={i}
                animate={sectorsReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center text-emerald-400">
                  <sec.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">{sec.name}</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">{sec.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DUAL ACTION INTERACTIVE SIMULATOR */}
      <section id="demo" ref={demoReveal.ref} className="py-24 px-6 border-t border-zinc-800/60 bg-[#09090b]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">CANLI SİMÜLATÖR</h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">Otomasyonu Şimdi Test Edin</h3>
            <p className="text-zinc-400 max-w-2xl mx-auto text-xs sm:text-sm">
              Aşağıdaki kanallardan birini seçin ve örnek müşteri senaryolarına tıklayarak telefon ekranındaki **otomatik yanıtı** ve yanındaki **CRM paneli** güncellemelerini eş zamanlı izleyin.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => { setActiveTab('whatsapp'); resetSimulator(); }}
              className={`px-6 py-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'whatsapp' 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Hattı</span>
            </button>
            <button
              onClick={() => { setActiveTab('instagram'); resetSimulator(); }}
              className={`px-6 py-3 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'instagram' 
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/10' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Instagram DM</span>
            </button>
          </div>

          {/* Scenarios selection */}
          <div className="flex flex-wrap gap-2.5 justify-center mb-10">
            {demoScenarios[activeTab].map((sc, idx) => (
              <button
                key={idx}
                onClick={() => handleScenarioClick(sc)}
                disabled={isTyping}
                className="px-4 py-2.5 text-xs font-bold bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-white rounded-xl transition-all disabled:opacity-50 active:scale-98"
              >
                {sc.label}
              </button>
            ))}
            <button
              onClick={resetSimulator}
              className="px-4 py-2.5 text-xs font-semibold border border-dashed border-zinc-800 text-zinc-500 hover:text-white rounded-xl transition-all"
            >
              Sıfırla
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* COLUMN 1: MOBILE DEVICE FRAME */}
            <div className="flex justify-center">
              <div className="w-full max-w-[360px] h-[580px] rounded-[36px] border-[8px] border-zinc-800 bg-zinc-950 shadow-2xl flex flex-col overflow-hidden relative">
                
                {/* Mobile Notch Area */}
                <div className="h-6 bg-zinc-900 w-full flex items-center justify-between px-6 text-[10px] text-zinc-500 font-semibold select-none">
                  <span>14:02</span>
                  <div className="w-20 h-4 rounded-full bg-black flex items-center justify-center border border-zinc-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span>5G</span>
                    <span className="w-4 h-2 rounded-sm bg-zinc-600" />
                  </div>
                </div>

                {/* Simulated Header */}
                <div className={`px-4 py-3 flex items-center justify-between text-white border-b border-zinc-800/80 ${
                  activeTab === 'whatsapp' ? 'bg-[#075e54]' : 'bg-gradient-to-r from-[#8a3ab9] to-[#cd486b]'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
                      B
                    </div>
                    <div>
                      <h4 className="text-xs font-bold block leading-tight">Bella Güzellik</h4>
                      <span className="text-[9px] text-white/80 block -mt-0.5">Asistan Çevrimiçi</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                </div>

                {/* Simulated Chat Messages Panel */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0d0e12] flex flex-col justify-start">
                  {(activeTab === 'whatsapp' ? whatsappMessages : instagramMessages).map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${
                        msg.sender === 'customer' ? 'self-end items-end' : 'self-start items-start'
                      }`}
                    >
                      <div 
                        className={`px-3.5 py-2.5 rounded-2xl text-[12px] leading-snug ${
                          msg.sender === 'customer' 
                            ? (activeTab === 'whatsapp' ? 'bg-[#128c7e] text-white rounded-tr-none' : 'bg-purple-600 text-white rounded-tr-none')
                            : msg.sender === 'system'
                            ? 'bg-zinc-800/60 border border-zinc-800 text-yellow-500 text-[10px] italic rounded-lg w-full text-center py-2 self-center'
                            : 'bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[8px] text-zinc-600 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="self-start flex flex-col items-start max-w-[80%]">
                      <div className="bg-zinc-900 border border-zinc-850 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Chat Input */}
                <div className="p-3 border-t border-zinc-900 bg-zinc-950 flex items-center gap-2">
                  <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-[10px] text-zinc-500">
                    Mesaj yazmak için senaryolara tıklayın...
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: SIMULATED CRM METRICS */}
            <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl p-6 justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Müşteri CRM Entegrasyonu</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold">
                    CANLI EŞLEŞME
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Lead Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Müşteri Durumu</span>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {crmStatus}
                      </span>
                    </div>

                    <div className="bg-zinc-900/50 border border-zinc-800/80 p-4 rounded-xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Sıcaklık Skoru</span>
                      <span className="text-xs font-extrabold text-white block">{crmLeadScore} / 100</span>
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-2">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-500" 
                          style={{ width: `${crmLeadScore}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Auto Tags */}
                  <div>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Otomatik Atanan Etiketler</span>
                    <div className="flex flex-wrap gap-1.5">
                      {crmTags.map((tg, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-emerald-400">
                          {tg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions log */}
                  <div className="space-y-2.5">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Tetiklenen CRM Kararları</span>
                    
                    {/* Booking Request Status */}
                    <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      crmAppointment 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                        : 'bg-zinc-900/20 border-zinc-850 text-zinc-500'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <Calendar className="w-4.5 h-4.5" />
                        <span className="font-medium">
                          {crmAppointment ? `Randevu Kaydı: ${crmAppointment}` : 'Rezervasyon talebi bekleniyor...'}
                        </span>
                      </div>
                      {crmAppointment && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>

                    {/* Handoff Status */}
                    <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      crmHandoff 
                        ? 'bg-red-500/10 border-red-500/20 text-red-300' 
                        : 'bg-zinc-900/20 border-zinc-850 text-zinc-500'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <Shield className="w-4.5 h-4.5" />
                        <span className="font-medium">
                          {crmHandoff ? 'Müşteri Temsilcisi Çağrıldı (AI kapatıldı)' : 'Canlı ekibe devir şartları pasif.'}
                        </span>
                      </div>
                      {crmHandoff && <Check className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-900 text-[10px] text-zinc-500 leading-relaxed text-center">
                Müşteri yazışmaya başladığı anda AI arka planda CRM profilini oluşturur ve niyet analizi (intent classification) yaparak aksiyon alır.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" ref={pricingReveal.ref} className="py-24 px-6 border-t border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-3">ŞEFFAF FİYATLANDIRMA</h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">Her Ölçekte İşletme İçin Paketler</h3>
            
            {/* Billing toggle switch */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-xs sm:text-sm font-semibold ${billingPeriod === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>Aylık</span>
              <button 
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6 rounded-full bg-zinc-800 p-1 flex items-center relative transition-all"
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-emerald-500 transition-all ${
                    billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                  }`} 
                />
              </button>
              <span className={`text-xs sm:text-sm font-semibold ${billingPeriod === 'yearly' ? 'text-white' : 'text-zinc-500'} flex items-center gap-1.5`}>
                Yıllık
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                  -20% İndirim
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* PLAN 1 */}
            <motion.div
              animate={pricingReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-4">Başlangıç</span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {billingPeriod === 'monthly' ? '990 TL' : '790 TL'}
                  </span>
                  <span className="text-zinc-500 text-xs font-medium">/ aylık</span>
                </div>
                <p className="text-zinc-400 text-xs mb-8">Yeni başlayan butik işletmeler ve otomasyonu denemek isteyenler için.</p>
                <div className="h-px bg-zinc-800 w-full mb-8" />
                <ul className="space-y-4 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 1 WhatsApp & Instagram Kanalı</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Aylık 1.000 Otomatik Yanıt</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 150 CRM Kayıt Kartı</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Temel Randevu Toplama</li>
                </ul>
              </div>
              <Link 
                href="/register" 
                className="w-full mt-8 py-3.5 text-center text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-750 transition-colors rounded-xl block"
              >
                Hemen Başla
              </Link>
            </motion.div>

            {/* PLAN 2: RECOMMENDED */}
            <motion.div
              animate={pricingReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-2xl bg-zinc-900 border-2 border-emerald-500 relative flex flex-col justify-between shadow-2xl"
            >
              <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded bg-emerald-500 text-[9px] font-extrabold text-white uppercase tracking-wider">
                Popüler
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-4">Profesyonel</span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {billingPeriod === 'monthly' ? '2.490 TL' : '1.990 TL'}
                  </span>
                  <span className="text-zinc-500 text-xs font-medium">/ aylık</span>
                </div>
                <p className="text-zinc-400 text-xs mb-8">Aktif randevu ve mesaj hacmi yüksek, büyümek isteyen salon ve klinikler için.</p>
                <div className="h-px bg-zinc-800/60 w-full mb-8" />
                <ul className="space-y-4 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> WhatsApp Business API Desteği</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Instagram DM Entegrasyonu</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Aylık 8.000 Otomatik Yanıt</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Sınırsız CRM Kaydı</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Canlı Temsilciye Devir Kuralları</li>
                </ul>
              </div>
              <Link 
                href="/register" 
                className="w-full mt-8 py-3.5 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-500/10 transition-all rounded-xl block"
              >
                Satın Al
              </Link>
            </motion.div>

            {/* PLAN 3 */}
            <motion.div
              animate={pricingReveal.inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-4">Enterprise</span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">İletişime Geçin</span>
                </div>
                <p className="text-zinc-400 text-xs mb-8">Çoklu şubeler, özel entegrasyonlar ve dedike sunucu altyapısı gerekenler için.</p>
                <div className="h-px bg-zinc-800 w-full mb-8" />
                <ul className="space-y-4 text-xs text-zinc-300">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Çoklu Şube Yönetimi</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Sınırsız Mesaj & CRM</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Dedike Sunucu Barındırma</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Custom API & Entegrasyon Desteği</li>
                </ul>
              </div>
              <a 
                href="mailto:destek@OtoCevap.ai" 
                className="w-full mt-8 py-3.5 text-center text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-750 transition-colors rounded-xl block"
              >
                Bize Ulaşın
              </a>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/60 bg-zinc-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white">OtoCevap AI</span>
          </div>
          <div className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} OtoCevap AI. Tüm hakları saklıdır.
          </div>
          <div className="flex gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-zinc-300">Gizlilik Politikası</a>
            <a href="#" className="hover:text-zinc-300">KVKK Bildirgesi</a>
            <a href="#" className="hover:text-zinc-300">Şartlar ve Koşullar</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

