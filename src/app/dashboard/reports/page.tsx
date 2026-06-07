'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Calendar, 
  Zap, 
  Smartphone, 
  Globe, 
  Clock 
} from 'lucide-react';

const Instagram = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5.5 h-5.5 text-purple-400" />
          Analiz ve Raporlama
        </h1>
        <p className="text-zinc-500 text-xs mt-1">AI asistanınızın performansı, kanal yoğunluğu ve müşteri dönüşüm metrikleri.</p>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">AI Başarı Oranı</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-white">92.4%</span>
            <span className="text-green-400 text-[10px] font-bold">+1.2%</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">İnsan devri gerektirmeyen görüşmeler.</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Kazanılan Müşteri</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-white">48</span>
            <span className="text-green-400 text-[10px] font-bold">+8%</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">CRM\'de status=\'customer\' olanlar.</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Randevu Dönüşümü</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-white">76.5%</span>
            <span className="text-green-400 text-[10px] font-bold">+3.4%</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Alınan taleplerin onaylanma yüzdesi.</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Tahmini Zaman Kazancı</span>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-2xl font-black text-white">12.5 saat</span>
            <span className="text-purple-400 text-[10px] font-bold">Bu Ay</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">AI asistanın cevapladığı süre toplamı.</p>
        </div>

      </div>

      {/* Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Graph 1: Channels Distribution */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">Kanal Bazlı Görüşmeler</h3>
            <span className="text-[10px] text-zinc-500">Müşterilerin en çok tercih ettiği iletişim kanalları.</span>
          </div>

          <div className="space-y-4">
            {/* Channel 1: WhatsApp */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-green-400" />
                  <span className="font-bold text-white">WhatsApp</span>
                </div>
                <span className="text-zinc-400 font-semibold">65% (124 Sohbet)</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* Channel 2: Instagram */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-400" />
                  <span className="font-bold text-white">Instagram DM</span>
                </div>
                <span className="text-zinc-400 font-semibold">25% (48 Sohbet)</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div className="bg-pink-500 h-full rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            {/* Channel 3: Web Simülatör */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">Web Simülatör</span>
                </div>
                <span className="text-zinc-400 font-semibold">10% (19 Sohbet)</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '10%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Graph 2: Popular Services */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">En Çok Talep Edilen Hizmetler</h3>
            <span className="text-[10px] text-zinc-500">Müşterilerin yapay zekaya sorduğu veya randevu aldığı seanslar.</span>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Cilt Bakımı', pct: 45, count: 54 },
              { name: 'Lazer Epilasyon', pct: 30, count: 36 },
              { name: 'Manikür & Pedikür', pct: 15, count: 18 },
              { name: 'Kaş Tasarımı', pct: 10, count: 12 },
            ].map((svc, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{svc.name}</span>
                  <span className="text-zinc-400 font-semibold">{svc.count} Talep ({svc.pct}%)</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: `${svc.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Hourly peak volume charts */}
      <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-white">Saatlik Mesaj Yoğunluğu</h3>
          <span className="text-[10px] text-zinc-500">Günün hangi saatlerinde mesaj trafiğinin arttığını gözlemleyin.</span>
        </div>
        <div className="h-40 flex items-end justify-between gap-2 px-4">
          {[
            { hr: '08:00', pct: 10 },
            { hr: '10:00', pct: 35 },
            { hr: '12:00', pct: 60 },
            { hr: '14:00', pct: 85 },
            { hr: '16:00', pct: 90 },
            { hr: '18:00', pct: 75 },
            { hr: '20:00', pct: 45 },
            { hr: '22:00', pct: 20 },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-purple-600/20 hover:bg-purple-600/40 rounded-t-md transition-all relative group" style={{ height: `${bar.pct}px` }}>
                <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-[8px] text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.pct}%
                </div>
                <div className="bg-purple-500 w-full h-full rounded-t-md absolute bottom-0" style={{ height: `${bar.pct}%` }} />
              </div>
              <span className="text-[9px] text-zinc-600 font-bold shrink-0">{bar.hr}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
