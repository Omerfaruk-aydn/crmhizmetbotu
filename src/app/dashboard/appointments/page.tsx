'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Calendar, 
  Check, 
  X, 
  MessageSquare, 
  Smartphone, 
  Globe, 
  UserCheck, 
  AlertCircle,
  Loader2,
  Filter
} from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface Appointment {
  id: string;
  customer_id: string;
  conversation_id: string | null;
  service_id: string | null;
  requested_date: string;
  requested_time: string;
  customer_name: string;
  customer_phone: string;
  note: string | null;
  source_channel: string;
  status: 'new' | 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed';
  services: { name: string } | null;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Fetch lists
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointments');
      if (!res.ok) throw new Error('Randevular yüklenirken hata oluştu.');
      const data = await res.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Update Status Action
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActioningId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Randevu durumu güncellenemedi.');
      
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActioningId(null);
    }
  };

  // Filter lists matching active filter option
  const filteredAppts = appointments.filter(a => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'new') return a.status === 'new' || a.status === 'pending_confirmation';
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-5.5 h-5.5 text-purple-400" />
          Randevu ve Talep Yönetimi
        </h1>
        <p className="text-zinc-500 text-xs mt-1">AI asistanı tarafından toplanan randevu taleplerini onaylayın veya iptal edin.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel buttons */}
      <div className="flex gap-2 pb-1 overflow-x-auto select-none border-b border-zinc-900 pb-4">
        {[
          { id: 'all', label: 'Tüm Randevular' },
          { id: 'new', label: 'Bekleyen Onaylar' },
          { id: 'confirmed', label: 'Onaylananlar' },
          { id: 'completed', label: 'Tamamlananlar' },
          { id: 'cancelled', label: 'İptaller' }
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setStatusFilter(chip.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
              statusFilter === chip.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/15'
                : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Lists */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : filteredAppts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
          Kriterlere uygun randevu kaydı bulunamadı.
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-950/20 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold">
                <th className="p-4">Müşteri Bilgileri</th>
                <th className="p-4">Talep Edilen Hizmet</th>
                <th className="p-4">Tarih & Saat</th>
                <th className="p-4">Kaynak</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppts.map(appt => {
                const icon = appt.source_channel === 'whatsapp'
                  ? <Smartphone className="w-4 h-4 text-green-400" />
                  : appt.source_channel === 'instagram'
                  ? <Instagram className="w-4 h-4 text-pink-400" />
                  : <Globe className="w-4 h-4 text-blue-400" />;

                const isActioning = actioningId === appt.id;

                return (
                  <tr key={appt.id} className="border-b border-zinc-800/80 hover:bg-zinc-900/10 text-zinc-300">
                    <td className="p-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{appt.customer_name}</h4>
                        <span className="text-[10px] text-zinc-500 mt-1 block">{appt.customer_phone}</span>
                      </div>
                      {appt.note && (
                        <p className="text-[10px] text-zinc-500 italic mt-1.5">Not: {appt.note}</p>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-white">
                      {appt.services?.name || 'Genel Görüşme'}
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-semibold">{new Date(appt.requested_date).toLocaleDateString('tr-TR')}</span>
                        <span className="text-zinc-500 block mt-1">{appt.requested_time?.substring(0, 5)}</span>
                      </div>
                    </td>
                    <td className="p-4 flex items-center gap-1.5 mt-2.5">
                      {icon}
                      <span className="capitalize">{appt.source_channel}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        appt.status === 'confirmed'
                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                          : appt.status === 'cancelled'
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : appt.status === 'completed'
                          ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                      }`}>
                        {appt.status === 'confirmed' 
                          ? 'Onaylandı' 
                          : appt.status === 'cancelled' 
                          ? 'İptal' 
                          : appt.status === 'completed' 
                          ? 'Tamamlandı' 
                          : 'Onay Bekliyor'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        
                        {/* Direct Chat Link */}
                        {appt.conversation_id && (
                          <Link
                            href={`/dashboard/conversations?id=${appt.conversation_id}`}
                            className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all"
                            title="Sohbete Git"
                          >
                            <MessageSquare className="w-4 h-4 text-purple-400" />
                          </Link>
                        )}

                        {/* Approve Button */}
                        {(appt.status === 'new' || appt.status === 'pending_confirmation') && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                            disabled={isActioning}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 transition-all disabled:opacity-40"
                            title="Onayla"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Cancel Button */}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                            disabled={isActioning}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-all disabled:opacity-40"
                            title="İptal Et"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {/* Complete Button */}
                        {appt.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'completed')}
                            disabled={isActioning}
                            className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all disabled:opacity-40"
                            title="Tamamlandı Olarak İşaretle"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
