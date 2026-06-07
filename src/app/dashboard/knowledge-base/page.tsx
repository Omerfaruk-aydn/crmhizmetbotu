'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  BookOpen, 
  Check, 
  AlertCircle,
  Loader2,
  X,
  ToggleLeft,
  ToggleRight,
  Filter
} from 'lucide-react';

interface KBItem {
  id: string;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  priority: number;
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KBItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KBItem | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formPriority, setFormPriority] = useState(0);
  const [formActive, setFormActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Items
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/knowledge-base');
      if (!res.ok) throw new Error('Bilgi bankası yüklenirken hata oluştu.');
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('General');
    setFormPriority(0);
    setFormActive(true);
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (item: KBItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormCategory(item.category);
    setFormPriority(item.priority);
    setFormActive(item.is_active);
    setModalOpen(true);
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      title: formTitle,
      content: formContent,
      category: formCategory,
      priority: Number(formPriority),
      is_active: formActive
    };

    try {
      let res;
      if (editingItem) {
        // Update
        res = await fetch(`/api/knowledge-base/${editingItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create
        res = await fetch('/api/knowledge-base', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'İşlem başarısız oldu.');
      }

      setModalOpen(false);
      fetchItems();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Item
  const handleDelete = async (id: string) => {
    if (!confirm('Bu bilgi kartını silmek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Silme işlemi başarısız oldu.');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Toggle Active State directly
  const handleToggleActive = async (item: KBItem) => {
    try {
      const res = await fetch(`/api/knowledge-base/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !item.is_active })
      });
      if (!res.ok) throw new Error('Güncelleme başarısız.');
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Unique Categories for filter dropdown
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  // Filtered Items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5.5 h-5.5 text-purple-400" />
            Yapay Zekâ Bilgi Bankası (Brain)
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Yapay zeka asistanının sorulara cevap verirken okuyacağı ana kurallar.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/15 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Bilgi Kartı Ekle</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Bilgi bankasında ara..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-all placeholder:text-zinc-600"
          />
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-zinc-500" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-transparent text-xs text-zinc-300 font-semibold outline-none cursor-pointer"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat} className="bg-zinc-950 text-white">{cat === 'All' ? 'Tüm Kategoriler' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KB Table / Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
          Aradığınız kriterlere uygun bilgi kartı bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              className={`p-5 rounded-2xl border bg-zinc-950/40 relative group transition-all flex flex-col justify-between gap-4 ${
                item.is_active ? 'border-zinc-800' : 'border-zinc-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="px-2 py-0.5 rounded bg-purple-900/30 border border-purple-500/20 text-[9px] font-bold text-purple-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleActive(item)}
                      title={item.is_active ? 'Pasife Al' : 'Aktife Al'}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      {item.is_active ? (
                        <ToggleRight className="w-6 h-6 text-purple-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-zinc-600" />
                      )}
                    </button>
                    <span className="text-[10px] text-zinc-600 font-semibold">Öncelik: {item.priority}</span>
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm">{item.title}</h3>
                <p className="text-zinc-400 text-xs mt-2 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-900 pt-3">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-all"
                  title="Düzenle"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all"
                  title="Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
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
                {editingItem ? 'Bilgi Kartını Düzenle' : 'Yeni Bilgi Kartı Ekle'}
              </h2>
              <p className="text-zinc-500 text-[10px] mt-0.5">Yapay zeka asistanına yeni kurallar veya soru-cevap verisi tanımlayın.</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Başlık / Soru *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Örn: Konum ve Otopark"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">İçerik / Cevap *</label>
                <textarea
                  required
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  placeholder="Yapay zekanın müşteriye vereceği detaylı cevap veya sistem kuralı..."
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
                  >
                    <option>General</option>
                    <option>Konum</option>
                    <option>Çalışma Saati</option>
                    <option>Randevu</option>
                    <option>Hizmet Detay</option>
                    <option>Yasalar ve Güvenlik</option>
                    <option>İnsan Devri</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Arama Önceliği</label>
                  <input
                    type="number"
                    value={formPriority}
                    onChange={e => setFormPriority(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-400 font-medium select-none mt-1">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  className="accent-purple-500 w-4 h-4"
                />
                Bilgi Kartı Aktif (AI okuyabilsin)
              </label>

              <div className="flex justify-end gap-3 border-t border-zinc-900 pt-4 mt-2">
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
                  <span>{editingItem ? 'Kaydet' : 'Oluştur'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
