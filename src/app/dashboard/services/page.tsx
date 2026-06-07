'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Scissors, 
  AlertCircle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  Eye,
  EyeOff
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  is_bookable: boolean;
  is_active: boolean;
  price: number | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  display_price: boolean;
  price_id: string | null;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSvc, setEditingSvc] = useState<ServiceItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Genel');
  const [formDuration, setFormDuration] = useState(30);
  const [formBookable, setFormBookable] = useState(true);
  const [formActive, setFormActive] = useState(true);
  
  // Pricing parameters
  const [priceType, setPriceType] = useState<'fixed' | 'range' | 'hidden'>('fixed');
  const [formPrice, setFormPrice] = useState('');
  const [formPriceMin, setFormPriceMin] = useState('');
  const [formPriceMax, setFormPriceMax] = useState('');
  const [formDisplayPrice, setFormDisplayPrice] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  // Fetch Services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Hizmet listesi yüklenirken hata oluştu.');
      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingSvc(null);
    setFormName('');
    setFormDesc('');
    setFormCategory('Genel');
    setFormDuration(30);
    setFormBookable(true);
    setFormActive(true);
    
    setPriceType('fixed');
    setFormPrice('');
    setFormPriceMin('');
    setFormPriceMax('');
    setFormDisplayPrice(true);

    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (svc: ServiceItem) => {
    setEditingSvc(svc);
    setFormName(svc.name);
    setFormDesc(svc.description || '');
    setFormCategory(svc.category || 'Genel');
    setFormDuration(svc.duration_minutes);
    setFormBookable(svc.is_bookable);
    setFormActive(svc.is_active);
    
    setFormDisplayPrice(svc.display_price);

    if (!svc.display_price) {
      setPriceType('hidden');
      setFormPrice('');
      setFormPriceMin('');
      setFormPriceMax('');
    } else if (svc.price_min || svc.price_max) {
      setPriceType('range');
      setFormPrice('');
      setFormPriceMin(svc.price_min?.toString() || '');
      setFormPriceMax(svc.price_max?.toString() || '');
    } else {
      setPriceType('fixed');
      setFormPrice(svc.price?.toString() || '');
      setFormPriceMin('');
      setFormPriceMax('');
    }

    setModalOpen(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError('Lütfen hizmet adını girin.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      name: formName,
      description: formDesc,
      category: formCategory,
      duration_minutes: Number(formDuration),
      is_bookable: formBookable,
      is_active: formActive,
      display_price: priceType !== 'hidden',
      price: priceType === 'fixed' && formPrice ? Number(formPrice) : null,
      price_min: priceType === 'range' && formPriceMin ? Number(formPriceMin) : null,
      price_max: priceType === 'range' && formPriceMax ? Number(formPriceMax) : null
    };

    try {
      let res;
      if (editingSvc) {
        res = await fetch(`/api/services/${editingSvc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'İşlem başarısız.');
      }

      setModalOpen(false);
      fetchServices();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Service
  const handleDelete = async (id: string) => {
    if (!confirm('Bu hizmeti silmek istediğinize emin misiniz? Fiyat bilgileri de silinecektir.')) return;
    
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Silme işlemi başarısız oldu.');
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Toggle Active State
  const handleToggleActive = async (svc: ServiceItem) => {
    try {
      const res = await fetch(`/api/services/${svc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !svc.is_active })
      });
      if (!res.ok) throw new Error('Güncelleme başarısız.');
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, is_active: !s.is_active } : s));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filtered Services
  const filteredServices = services.filter(svc => 
    svc.name.toLowerCase().includes(search.toLowerCase()) || 
    svc.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Scissors className="w-5.5 h-5.5 text-purple-400" />
            Hizmetler ve Fiyat Kataloğu
          </h1>
          <p className="text-zinc-500 text-xs mt-1">İşletmenizin sunduğu seanslar, süreler ve fiyatlandırma seçenekleri.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Hizmet Ekle</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Hizmetlerde veya kategorilerde ara..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-all placeholder:text-zinc-600"
        />
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
          Katalogda kayıtlı hizmet bulunamadı.
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-950/20 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold">
                <th className="p-4">Hizmet Adı & Kategori</th>
                <th className="p-4">Süre</th>
                <th className="p-4">Fiyat / Fiyatlandırma</th>
                <th className="p-4">Randevu Durumu</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(svc => (
                <tr key={svc.id} className={`border-b border-zinc-800/80 hover:bg-zinc-900/10 text-zinc-300 ${!svc.is_active ? 'opacity-50' : ''}`}>
                  <td className="p-4">
                    <div>
                      <h4 className="font-bold text-white text-sm">{svc.name}</h4>
                      <span className="text-[10px] text-zinc-500 mt-1 block">{svc.category || 'Genel'}</span>
                    </div>
                  </td>
                  <td className="p-4 font-semibold">{svc.duration_minutes} dakika</td>
                  <td className="p-4">
                    {svc.display_price ? (
                      svc.price_min || svc.price_max ? (
                        <span className="font-bold text-white">{svc.price_min || '0'} - {svc.price_max || '—'} {svc.currency}</span>
                      ) : (
                        <span className="font-bold text-white">{svc.price} {svc.currency}</span>
                      )
                    ) : (
                      <span className="text-zinc-500 flex items-center gap-1 text-[10px] italic">
                        <EyeOff className="w-3.5 h-3.5" />
                        AI Fiyat Gizleyecek
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      svc.is_bookable 
                        ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                        : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                    }`}>
                      {svc.is_bookable ? 'Randevu Alınabilir' : 'Randevu Kapalı'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2.5">
                      <button 
                        onClick={() => handleToggleActive(svc)}
                        title={svc.is_active ? 'Pasife Al' : 'Aktife Al'}
                        className="text-zinc-500 hover:text-white transition-colors"
                      >
                        {svc.is_active ? (
                          <ToggleRight className="w-6 h-6 text-purple-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-zinc-600" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(svc)}
                        className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all"
                        title="Düzenle"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(svc.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT DIALOG OVERLAY */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative flex flex-col gap-5"
          >
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-base font-bold text-white">
                {editingSvc ? 'Hizmeti Düzenle' : 'Yeni Hizmet Tanımla'}
              </h2>
              <p className="text-zinc-500 text-[10px] mt-0.5">Yapay zekanın fiyat ve seans sorularına bu bilgiler ışığında cevap vereceğini unutmayın.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Hizmet Adı *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Örn: Cilt Bakımı"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Kategori</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    placeholder="Örn: Cilt Bakımı, Epilasyon"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Açıklama</label>
                <textarea
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="Seans içeriği, kullanılan malzemeler veya müşteri gereksinimleri..."
                  rows={2}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Süre (Dakika) *</label>
                  <input
                    type="number"
                    required
                    value={formDuration}
                    onChange={e => setFormDuration(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Fiyat Tipi</label>
                  <select
                    value={priceType}
                    onChange={e => setPriceType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                  >
                    <option value="fixed">Sabit Fiyat</option>
                    <option value="range">Fiyat Aralığı</option>
                    <option value="hidden">Gizli Fiyat (AI Göstermeyecek)</option>
                  </select>
                </div>
              </div>

              {/* Price Details based on Type */}
              {priceType === 'fixed' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Sabit Fiyat (TL) *</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="Örn: 1200"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              )}

              {priceType === 'range' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase">Minimum Fiyat (TL) *</label>
                    <input
                      type="number"
                      value={formPriceMin}
                      onChange={e => setFormPriceMin(e.target.value)}
                      placeholder="Örn: 1000"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400 uppercase">Maksimum Fiyat (TL) *</label>
                    <input
                      type="number"
                      value={formPriceMax}
                      onChange={e => setFormPriceMax(e.target.value)}
                      placeholder="Örn: 5000"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-6 items-center mt-2 select-none">
                <label className="flex items-center gap-2 text-xs text-zinc-400 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formBookable}
                    onChange={e => setFormBookable(e.target.checked)}
                    className="accent-purple-500 w-4 h-4"
                  />
                  Randevu Alınabilsin
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-400 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={e => setFormActive(e.target.checked)}
                    className="accent-purple-500 w-4 h-4"
                  />
                  Hizmet Aktif
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-900 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-500 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingSvc ? 'Kaydet' : 'Oluştur'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
