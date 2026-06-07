import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Database,
  Bot
} from 'lucide-react';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  // Get current user session via JWT auth context
  const authCtx = await getAuthContext();
  if (!authCtx || !authCtx.user) {
    return (
      <div className="p-8 border border-red-500/30 rounded-2xl bg-red-500/10 text-xs text-red-400">
        Oturum doğrulanırken hata oluştu. Lütfen tekrar giriş yapın.
      </div>
    );
  }

  const businessId = authCtx.businessId;

  if (!businessId) {
    return (
      <div className="p-8 border border-zinc-800 rounded-2xl bg-zinc-950/40 text-center">
        <h2 className="text-sm font-bold text-white">İşletme ilişkisi bulunamadı.</h2>
        <p className="text-zinc-500 text-xs mt-1">Lütfen hesabınıza bir işletme eklemek için onboarding adımını tamamlayın.</p>
        <div className="mt-4">
          <Link href="/onboarding" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold inline-block">
            Onboarding Başlat
          </Link>
        </div>
      </div>
    );
  }

  // Query actual metrics from DB using Prisma
  const appointments = await db.appointment.findMany({
    where: { businessId },
    take: 10,
    orderBy: { createdAt: 'desc' }
  });

  const handoffs = await db.handoff.findMany({
    where: { businessId, status: 'open' },
    include: {
      customer: {
        select: { name: true, phone: true }
      }
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  const msgCount = await db.message.count({
    where: { businessId }
  });

  const custCount = await db.customer.count({
    where: { businessId, deletedAt: null }
  });

  const apptCount = await db.appointment.count({
    where: { businessId }
  });

  const hotLeadCount = await db.customer.count({
    where: {
      businessId,
      deletedAt: null,
      leadScore: { gte: 60 }
    }
  });

  const handoffCount = await db.handoff.count({
    where: { businessId, status: 'open' }
  });

  const isEmpty = !custCount && !msgCount && !apptCount;

  return (
    <div className="space-y-8">
      
      {/* Upper Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">İşletme Özeti</h1>
          <p className="text-zinc-500 text-xs mt-1">Yapay zekanın performansı ve müşteri kazanım durumu.</p>
        </div>
      </div>

      {isEmpty ? (
        /* EMPTY STATE - DEMO SEED OFFER */
        <div className="p-8 md:p-12 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/40 text-center flex flex-col items-center max-w-2xl mx-auto my-10">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">İşletmeniz İçin Henüz Veri Bulunmuyor</h2>
          <p className="text-zinc-400 text-xs mt-2 leading-relaxed max-w-md">
            Assistora AI asistanınız hazır. Dilerseniz dashboard panelini test etmek için anında örnek müşteriler, konuşmalar ve randevu talepleri yükleyebilirsiniz.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full justify-center">
            <DashboardClient businessId={businessId} isSeeded={false} />
            <Link 
              href="/dashboard/knowledge-base" 
              className="px-6 py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>Manuel Bilgi Ekle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* METRICS & CHARTS GRID */
        <div className="space-y-8">
          
          {/* DashboardClient executes seeding if needed and handles state updates */}
          <DashboardClient businessId={businessId} isSeeded={true} />

          {/* Cards metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Toplam Mesaj</span>
                <span className="text-lg font-bold text-white mt-0.5">{msgCount || 0}</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Yeni Müşteri (CRM)</span>
                <span className="text-lg font-bold text-white mt-0.5">{custCount || 0}</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Randevu Talepleri</span>
                <span className="text-lg font-bold text-white mt-0.5">{apptCount || 0}</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-500 block uppercase tracking-wider">Sıcak Lead (Score &gt; 60)</span>
                <span className="text-lg font-bold text-white mt-0.5">{hotLeadCount || 0}</span>
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Messages Trend Graph (SVG placeholder with dynamic elements) */}
            <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Günlük Mesaj Trendi</h3>
                <span className="text-[10px] text-zinc-500">Son 7 günün mesaj etkileşimi.</span>
              </div>
              <div className="h-48 w-full mt-6 relative flex items-end">
                <svg className="w-full h-full text-purple-500/20" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,8 L100,30 L0,30 Z" fill="currentColor" />
                  <path d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,8" fill="none" stroke="#a855f7" strokeWidth="1" />
                </svg>
                <div className="absolute inset-0 flex justify-between items-end px-2 pointer-events-none">
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, idx) => (
                    <span key={idx} className="text-[9px] text-zinc-600 font-semibold mb-[-20px]">{day}</span>
                  ))}
                </div>
              </div>
              <div className="h-4" />
            </div>

            {/* AI Performance Card */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Yapay Zeka Performansı</h3>
                <span className="text-[10px] text-zinc-500">Otomasyon oranları.</span>
              </div>
              <div className="flex flex-col items-center justify-center py-4 space-y-4">
                {/* Circular indicator */}
                <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 flex items-center justify-center relative rotate-45">
                  <span className="text-lg font-black text-white -rotate-45">92%</span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-white">AI Başarı Oranı</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">İnsan temsilci devri olmadan tamamlanan sohbetler.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Lists Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Open Handoffs list */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                    Bekleyen İnsan Temsilci Devirleri ({handoffCount || 0})
                  </h3>
                  <p className="text-[10px] text-zinc-500">AI tarafından durdurulan ve insan kontrolü bekleyen konuşmalar.</p>
                </div>
                {handoffCount && handoffCount > 0 ? (
                  <Link href="/dashboard/conversations?filter=handoff" className="text-purple-400 hover:text-purple-300 text-xs font-semibold">Tümünü Gör</Link>
                ) : null}
              </div>

              <div className="space-y-3 mt-4">
                {handoffs.length === 0 ? (
                  <div className="text-center p-6 border border-zinc-900 border-dashed rounded-xl text-xs text-zinc-500">
                    Mükemmel! Şu anda devredilmiş konuşma bulunmuyor.
                  </div>
                ) : (
                  handoffs.map((hd: any, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white">{hd.customer?.name || 'Müşteri'}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Neden: {hd.reason || 'Bilinmiyor'}</p>
                      </div>
                      <Link 
                        href={`/dashboard/conversations?id=${hd.conversationId}`} 
                        className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 font-bold rounded-lg text-[10px] hover:bg-red-500/20 transition-all"
                      >
                        Sohbete Git
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending appointments */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Bekleyen Randevu Talepleri
                  </h3>
                  <p className="text-[10px] text-zinc-500">Onaylanmayı bekleyen ön randevular.</p>
                </div>
                {appointments && appointments.length > 0 ? (
                  <Link href="/dashboard/appointments" className="text-purple-400 hover:text-purple-300 text-xs font-semibold">Yönet</Link>
                ) : null}
              </div>

              <div className="space-y-3 mt-4">
                {appointments.length === 0 ? (
                  <div className="text-center p-6 border border-zinc-900 border-dashed rounded-xl text-xs text-zinc-500">
                    Henüz yeni randevu talebi bulunmuyor.
                  </div>
                ) : (
                  appointments.filter(a => a.status === 'new').slice(0, 5).map((appt: any, idx) => (
                    <div key={idx} className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white">{appt.customerName || 'İsimsiz Müşteri'}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Tarih: {appt.requestedDate} - Saat: {appt.requestedTime}</p>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                          href={`/dashboard/appointments`} 
                          className="px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold rounded-lg text-[10px]"
                        >
                          İncele
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
