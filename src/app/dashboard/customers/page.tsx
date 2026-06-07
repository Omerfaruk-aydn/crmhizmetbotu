'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Loader2, 
  X, 
  Edit, 
  Check, 
  AlertCircle,
  Smartphone,
  Globe,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface Tag {
  name: string;
  color: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  source_channel: string;
  status: string;
  lead_score: number;
  notes: string;
  created_at: string;
  tags: Tag[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Customer Sheet State
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);
  const [custDetails, setCustDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // Edit State inside sheet
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Fetch list
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/customers', window.location.origin);
      if (search) url.searchParams.append('search', search);
      if (statusFilter) url.searchParams.append('status', statusFilter);
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Müşteri listesi alınamadı.');
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  // Fetch individual details
  const fetchCustomerDetails = async (id: string) => {
    setLoadingDetails(true);
    setEditing(false);
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) throw new Error('Müşteri detayları alınamadı.');
      const data = await res.json();
      setCustDetails(data);
      setAiSummary(data.aiSummary);

      // Populate edit fields
      const c = data.customer;
      setEditName(c.name || '');
      setEditEmail(c.email || '');
      setEditPhone(c.phone || '');
      setEditStatus(c.status || 'lead');
      setEditNotes(c.notes || '');

      setSelectedCustId(id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Save changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${selectedCustId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
          status: editStatus,
          notes: editNotes
        })
      });

      if (!res.ok) throw new Error('Müşteri bilgileri güncellenemedi.');
      const updated = await res.json();

      // Refresh local states
      setCustDetails((prev: any) => ({
        ...prev,
        customer: { ...prev.customer, ...updated }
      }));
      setCustomers(prev => prev.map(c => c.id === selectedCustId ? { ...c, ...updated } : c));
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Users className="w-5.5 h-5.5 text-purple-400" />
          CRM Müşteri Yönetimi (Leads)
        </h1>
        <p className="text-zinc-500 text-xs mt-1">Sistem tarafından kazanılan tüm müşteri kayıtları ve lead skorları.</p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="İsim, telefon veya e-posta ile arayın..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-all placeholder:text-zinc-600"
          />
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs text-zinc-300 font-semibold outline-none cursor-pointer"
          >
            <option value="" className="bg-zinc-950 text-white">Tüm Durumlar</option>
            <option value="lead" className="bg-zinc-950 text-white">Arama (Lead)</option>
            <option value="contact" className="bg-zinc-950 text-white">Temas Kuruldu</option>
            <option value="customer" className="bg-zinc-950 text-white">Müşteri (Kazanıldı)</option>
          </select>
        </div>
      </div>

      {/* Customer Grid / Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
          Kayıtlı müşteri bulunmuyor.
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-950/20 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold">
                <th className="p-4">Müşteri Bilgileri</th>
                <th className="p-4">Kanal</th>
                <th className="p-4">Lead Skoru</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Kayıt Tarihi</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => {
                const icon = c.source_channel === 'whatsapp'
                  ? <Smartphone className="w-4 h-4 text-green-400" />
                  : c.source_channel === 'instagram'
                  ? <Instagram className="w-4 h-4 text-pink-400" />
                  : <Globe className="w-4 h-4 text-blue-400" />;

                const scoreColor = c.lead_score >= 60 
                  ? 'text-red-400 font-black' 
                  : c.lead_score >= 30 
                  ? 'text-amber-400 font-bold' 
                  : 'text-blue-400 font-semibold';

                return (
                  <tr key={c.id} className="border-b border-zinc-800/80 hover:bg-zinc-900/10 text-zinc-300">
                    <td className="p-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{c.name || 'İsimsiz Müşteri'}</h4>
                        <span className="text-[10px] text-zinc-500 mt-1 block">{c.phone || c.email || 'İletişim Bilgisi Yok'}</span>
                      </div>
                      {/* Tags */}
                      {c.tags && c.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {c.tags.map((tg, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[8px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 uppercase tracking-wide">
                              {tg.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4 flex items-center gap-1.5 mt-2.5">
                      {icon}
                      <span className="capitalize">{c.source_channel}</span>
                    </td>
                    <td className="p-4">
                      <span className={scoreColor}>{c.lead_score} / 100</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        c.status === 'customer'
                          ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                          : c.status === 'contact'
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                      }`}>
                        {c.status === 'customer' ? 'Kazanıldı' : c.status === 'contact' ? 'Temasta' : 'Arama'}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500">
                      {new Date(c.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => fetchCustomerDetails(c.id)}
                        className="px-3 py-1.5 bg-zinc-900 border border-zinc-850 hover:border-purple-500/30 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
                      >
                        İncele
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL SIDE SHEET (FLY OUT OVERLAY) */}
      <AnimatePresence>
        {selectedCustId && custDetails && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs select-none">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={() => setSelectedCustId(null)} />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-lg bg-zinc-950 border-l border-zinc-800 h-full shadow-2xl relative z-10 p-6 overflow-y-auto flex flex-col justify-start gap-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCustId(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3 border-b border-zinc-900 pb-5">
                <div className="w-11 h-11 rounded-full bg-purple-500 flex items-center justify-center font-extrabold text-white text-base">
                  {custDetails.customer.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{custDetails.customer.name || 'Müşteri Detayları'}</h3>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mt-0.5">Müşteri Timeline Kartı</span>
                </div>
              </div>

              {/* Section 1: AI summary */}
              <div className="p-4 rounded-xl bg-purple-900/10 border border-purple-500/20 space-y-2.5">
                <h4 className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Yapay Zekâ Müşteri Özeti
                </h4>
                <p className="text-zinc-300 text-xs leading-relaxed italic">
                  "{aiSummary || 'Konuşma dökümü özetleniyor...'}"
                </p>
              </div>

              {/* Section 2: Details/Editor */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Müşteri Bilgileri</span>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="text-xs font-bold text-purple-400 flex items-center gap-1 hover:text-purple-300"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{editing ? 'İptal' : 'Düzenle'}</span>
                  </button>
                </div>

                {editing ? (
                  <form onSubmit={handleSaveChanges} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">İsim Soyisim</label>
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">Durum</label>
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none"
                        >
                          <option value="lead">Arama (Lead)</option>
                          <option value="contact">Temas Kuruldu</option>
                          <option value="customer">Müşteri (Kazanıldı)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">Telefon</label>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-zinc-500 uppercase font-semibold">E-posta</label>
                        <input
                          type="email"
                          value={editEmail}
                          onChange={e => setEditEmail(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-zinc-500 uppercase font-semibold">Notlar</label>
                      <textarea
                        value={editNotes}
                        onChange={e => setEditNotes(e.target.value)}
                        rows={2}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full py-2.5 bg-white text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-all"
                    >
                      {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Kaydet</span>
                    </button>
                  </form>
                ) : (
                  <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-semibold">Telefon</span>
                      <p className="text-white mt-0.5">{custDetails.customer.phone || 'Yok'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-semibold">E-posta</span>
                      <p className="text-white mt-0.5 truncate">{custDetails.customer.email || 'Yok'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-semibold">Lead Skoru</span>
                      <p className="text-purple-400 mt-0.5 font-bold">{custDetails.customer.lead_score} / 100</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase font-semibold">Kanal</span>
                      <p className="text-white mt-0.5 capitalize">{custDetails.customer.source_channel}</p>
                    </div>
                    <div className="col-span-2 border-t border-zinc-900 pt-2.5 mt-1">
                      <span className="text-[9px] text-zinc-500 uppercase font-semibold">CRM Notları</span>
                      <p className="text-zinc-400 mt-0.5 leading-relaxed">{custDetails.customer.notes || 'Not eklenmemiş.'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Direct message links */}
              <div className="flex gap-3">
                <Link
                  href={`/dashboard/conversations?id=${custDetails.customer.id}`}
                  className="flex-1 py-3 bg-zinc-900 border border-zinc-800 hover:border-purple-500/30 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span>Müşteri Sohbetine Git</span>
                </Link>
              </div>

              {/* Section 3: Timeline & events */}
              <div className="space-y-4 flex-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Lead Skor Etkinlikleri (Log)</span>
                
                {custDetails.timeline.length === 0 ? (
                  <div className="text-center p-6 border border-zinc-900 border-dashed rounded-xl text-zinc-500 text-xs">
                    Henüz skor etkinliği kaydedilmedi.
                  </div>
                ) : (
                  <div className="relative border-l border-zinc-900 ml-2.5 pl-5 space-y-4">
                    {custDetails.timeline.map((evt: any) => (
                      <div key={evt.id} className="relative text-xs">
                        {/* Dot indicator */}
                        <div className="absolute top-1 -left-[26px] w-3.5 h-3.5 rounded-full bg-zinc-950 border border-purple-500 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <h5 className="font-bold text-white">{evt.event_type}</h5>
                          <span className={`font-bold ${evt.score_delta > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                            {evt.score_delta > 0 ? `+${evt.score_delta}` : evt.score_delta} Puan
                          </span>
                        </div>
                        <p className="text-zinc-500 text-[10px] mt-0.5 leading-relaxed">{evt.description}</p>
                        <span className="text-[9px] text-zinc-600 font-semibold block mt-1">
                          {new Date(evt.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
