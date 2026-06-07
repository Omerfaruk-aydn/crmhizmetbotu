'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  Bot, 
  User as UserIcon, 
  ShieldAlert, 
  Calendar, 
  Sparkles, 
  Check, 
  Smartphone, 
  Globe, 
  ChevronRight, 
  Loader2, 
  Plus, 
  UserCheck, 
  RefreshCw,
  Clock,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  source_channel: string;
  lead_score: number;
  status: string;
  notes: string;
}

interface Conversation {
  id: string;
  business_id: string;
  customer_id: string;
  channel: string;
  status: string;
  ai_enabled: boolean;
  last_message_at: string;
  customers: Customer;
}

interface Message {
  id: string;
  sender_type: 'customer' | 'ai' | 'agent' | 'system';
  content: string;
  intent: string | null;
  ai_confidence: number | null;
  created_at: string;
}

export default function ConversationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryConvId = searchParams.get('id');
  const queryFilter = searchParams.get('filter');

  // Page States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [togglingAi, setTogglingAi] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>(queryFilter || 'all');

  // Input states
  const [replyText, setReplyText] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [updatingNotes, setUpdatingNotes] = useState(false);

  // Appointment Modal
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [apptService, setApptService] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [apptCreating, setApptCreating] = useState(false);

  // Services list (for appointment modal)
  const [services, setServices] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Conversations List
  const fetchConversations = async (selectFirst = false) => {
    try {
      const url = activeFilter !== 'all' 
        ? `/api/conversations?filter=${activeFilter}`
        : '/api/conversations';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Konuşmalar yüklenemedi.');
      const data = await res.json();
      setConversations(data);

      if (selectFirst && data.length > 0 && !queryConvId) {
        handleSelectConversation(data[0]);
      } else if (queryConvId && data.length > 0) {
        const matching = data.find((c: any) => c.id === queryConvId);
        if (matching) handleSelectConversation(matching);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch Chat History
  const fetchMessages = async (convId: string) => {
    setLoadingChat(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (!res.ok) throw new Error('Mesajlar yüklenemedi.');
      const data = await res.json();
      setMessages(data.messages);
      setCustomerNotes(data.conversation.customers?.notes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  // Fetch Services catalog
  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations(true);
    fetchServices();
  }, [activeFilter]);

  // Periodic poll for new messages in active chat
  useEffect(() => {
    if (!selectedConv) return;
    
    const interval = setInterval(() => {
      fetchMessages(selectedConv.id);
    }, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, [selectedConv?.id]);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    fetchMessages(conv.id);
  };

  // Post manual human agent reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConv) return;

    setSendingMsg(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText })
      });

      if (!res.ok) throw new Error('Mesaj gönderilemedi.');
      const data = await res.json();
      
      setMessages(prev => [...prev, data]);
      setReplyText('');
      
      // Since human responded, AI auto-mutes. Update local state
      setSelectedConv(prev => prev ? { ...prev, ai_enabled: false } : null);
      setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, ai_enabled: false } : c));
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Toggle AI automation
  const handleToggleAi = async () => {
    if (!selectedConv) return;
    setTogglingAi(true);
    const newVal = !selectedConv.ai_enabled;
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ai_enabled: newVal,
          status: newVal ? 'active' : 'handoff' // If turning AI back on, resolve handoff
        })
      });

      if (!res.ok) throw new Error('AI güncellenemedi.');
      const data = await res.json();
      
      setSelectedConv(prev => prev ? { ...prev, ai_enabled: data.ai_enabled, status: data.status } : null);
      setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, ai_enabled: data.ai_enabled, status: data.status } : c));
      
      // Reload message log to fetch system status notifications if any
      fetchMessages(selectedConv.id);
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingAi(false);
    }
  };

  // Trigger manual handoff request
  const handleTriggerHandoff = async () => {
    if (!selectedConv) return;
    setTogglingAi(true);
    try {
      const res = await fetch(`/api/conversations/${selectedConv.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'handoff',
          ai_enabled: false 
        })
      });

      if (!res.ok) throw new Error('Handoff başarısız.');
      const data = await res.json();
      
      setSelectedConv(prev => prev ? { ...prev, status: data.status, ai_enabled: data.ai_enabled } : null);
      setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, status: data.status, ai_enabled: data.ai_enabled } : c));
      fetchMessages(selectedConv.id);
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingAi(false);
    }
  };

  // Update customer notes
  const handleSaveNotes = async () => {
    if (!selectedConv) return;
    setUpdatingNotes(true);
    try {
      const res = await fetch(`/api/customers/${selectedConv.customers.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: customerNotes })
      });
      if (!res.ok) throw new Error('Not güncellenemedi.');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingNotes(false);
    }
  };

  // Create Appointment Request from panel
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || !apptService || !apptDate || !apptTime) return;

    setApptCreating(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedConv.business_id,
          customerId: selectedConv.customers.id,
          conversationId: selectedConv.id,
          serviceId: apptService,
          requestedDate: apptDate,
          requestedTime: apptTime,
          customerName: selectedConv.customers.name,
          customerPhone: selectedConv.customers.phone,
          status: 'confirmed' // Pre-approved when logged by agent
        })
      });

      if (!res.ok) throw new Error('Randevu oluşturulamadı.');
      
      setApptModalOpen(false);
      setApptService('');
      setApptDate('');
      setApptTime('');
      alert('Randevu başarıyla oluşturuldu ve onaylandı! 🗓️');
    } catch (err) {
      console.error(err);
    } finally {
      setApptCreating(false);
    }
  };

  // Filter list matching search query
  const filteredConvs = conversations.filter(c => 
    c.customers?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customers?.phone?.includes(searchQuery)
  );

  return (
    <div className="flex border border-zinc-800 bg-zinc-950 rounded-2xl h-[calc(100vh-120px)] overflow-hidden">
      
      {/* COLUMN 1: CONVERSATIONS LIST (LEFT) */}
      <div className="w-80 border-r border-zinc-800 flex flex-col justify-start shrink-0">
        
        {/* Search bar */}
        <div className="p-4 border-b border-zinc-800 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Müşteri veya tel ara..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-purple-500 outline-none pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder:text-zinc-600 transition-all"
            />
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
            {[
              { id: 'all', label: 'Tümü' },
              { id: 'active', label: 'AI Aktif' },
              { id: 'handoff', label: 'El-Devri' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  setLoadingList(true);
                  setActiveFilter(f.id);
                }}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                  activeFilter === f.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
          {loadingList ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center p-8 text-xs text-zinc-600 font-medium">
              Aktif sohbet bulunmuyor.
            </div>
          ) : (
            filteredConvs.map(conv => {
              const channelIcon = conv.channel === 'whatsapp' 
                ? <Smartphone className="w-3.5 h-3.5 text-green-400" />
                : conv.channel === 'instagram'
                ? <Instagram className="w-3.5 h-3.5 text-pink-400" />
                : <Globe className="w-3.5 h-3.5 text-blue-400" />;
              
              const isSelected = selectedConv?.id === conv.id;

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left flex items-start justify-between gap-3 transition-all ${
                    isSelected ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/20'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {channelIcon}
                      <h4 className="text-xs font-bold text-white truncate">{conv.customers?.name || 'Müşteri'}</h4>
                    </div>
                    
                    {/* Status badges */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        conv.status === 'handoff'
                          ? 'bg-red-500/15 border border-red-500/20 text-red-400 animate-pulse'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {conv.status === 'handoff' ? 'El Devri' : conv.ai_enabled ? 'AI Aktif' : 'AI Durdu'}
                      </span>
                      {conv.customers?.lead_score >= 60 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-bold text-amber-400">
                          🔥 Sıcak
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-zinc-500 block">Skor</span>
                    <span className="text-xs font-extrabold text-purple-400">{conv.customers?.lead_score || 0}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

      </div>

      {/* COLUMN 2: MESSAGE HISTORY PANEL (MIDDLE) */}
      <div className="flex-1 flex flex-col justify-between bg-zinc-950/20">
        
        {selectedConv ? (
          <>
            {/* Header info */}
            <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-950 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xs font-bold text-white">{selectedConv.customers?.name || 'İsimsiz Müşteri'}</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">{selectedConv.customers?.phone || 'Telefon Yok'}</p>
              </div>

              {/* Automation Toggles */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleAi}
                  disabled={togglingAi}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                    selectedConv.ai_enabled 
                      ? 'bg-purple-600/10 border-purple-500/30 text-purple-400 hover:bg-purple-600/20' 
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{selectedConv.ai_enabled ? 'AI Auto-Reply Açık' : 'AI Durduruldu'}</span>
                </button>

                {selectedConv.status !== 'handoff' ? (
                  <button
                    onClick={handleTriggerHandoff}
                    disabled={togglingAi}
                    className="px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-red-500/30 bg-zinc-900 hover:bg-red-500/5 text-[10px] font-bold text-zinc-400 hover:text-red-400 uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Temsilciye Devret</span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {loadingChat ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-7 h-7 animate-spin text-purple-500" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isCust = msg.sender_type === 'customer';
                  const isSys = msg.sender_type === 'system';
                  
                  if (isSys) {
                    return (
                      <div key={msg.id} className="flex justify-center my-4">
                        <span className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-medium text-yellow-400 italic text-center max-w-md">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col max-w-[75%] ${isCust ? 'self-start' : 'self-end items-end ml-auto'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        {msg.sender_type === 'ai' && <Bot className="w-3.5 h-3.5 text-purple-400" />}
                        {msg.sender_type === 'agent' && <UserCheck className="w-3.5 h-3.5 text-green-400" />}
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
                          {msg.sender_type === 'customer' ? 'Müşteri' : msg.sender_type === 'ai' ? 'Yapay Zekâ' : 'Temsilci'}
                        </span>
                      </div>

                      <div 
                        className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                          isCust 
                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none' 
                            : msg.sender_type === 'ai'
                            ? 'bg-purple-600/10 border border-purple-500/20 text-purple-100 rounded-tr-none'
                            : 'bg-green-600/10 border border-green-500/20 text-green-100 rounded-tr-none'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {/* Display metadata if AI processed it */}
                      {!isCust && msg.intent && (
                        <div className="flex items-center gap-2 mt-1.5 px-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-[8px] font-bold uppercase text-zinc-500">
                            Niyet: {msg.intent}
                          </span>
                          {msg.ai_confidence && (
                            <span className="text-[8.5px] text-zinc-600">
                              Güven Oranı: {Math.round(msg.ai_confidence * 100)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Warning handoff alert bar */}
            {selectedConv.status === 'handoff' && (
              <div className="mx-5 mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs text-red-400">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
                  <span>Bu konuşma insan temsilciye aktarıldı (AI durduruldu).</span>
                </div>
                <button
                  onClick={handleToggleAi}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg font-bold text-[9px] uppercase tracking-wider"
                >
                  AI\'yi Geri Başlat
                </button>
              </div>
            )}

            {/* Chat Input form */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center gap-3">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={selectedConv.ai_enabled ? "Mesaj yazın... (Yazarsanız AI durdurulacaktır)" : "İnsani cevap yazın..."}
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-purple-500 outline-none rounded-xl px-4 py-3 text-xs text-white"
              />
              <button
                type="submit"
                disabled={sendingMsg}
                className="px-4 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs shrink-0 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {sendingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Gönder</span>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageSquare className="w-10 h-10 text-zinc-700 mb-3" />
            <h4 className="font-bold text-zinc-500 text-sm">Görüşme Seçilmedi</h4>
            <p className="text-zinc-600 text-xs mt-1">Sol listeden bir sohbet seçerek konuşma geçmişini inceleyin.</p>
          </div>
        )}

      </div>

      {/* COLUMN 3: CUSTOMER CRM PANEL SIDEBAR (RIGHT) */}
      {selectedConv && (
        <div className="w-72 border-l border-zinc-800 flex flex-col justify-start p-5 shrink-0 overflow-y-auto space-y-6">
          
          {/* Section 1: Customer Bio */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-3">Müşteri Profili</span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white text-sm">
                {selectedConv.customers?.name?.charAt(0) || 'C'}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-white text-xs truncate">{selectedConv.customers?.name || 'Müşteri'}</h4>
                <span className="text-[9px] text-zinc-500 capitalize tracking-wide">{selectedConv.channel} kanalı</span>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-900" />

          {/* Section 2: Metrics and Temperature */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Lead Skoru</span>
              <span className="font-bold text-purple-400">{selectedConv.customers?.lead_score || 0} / 100</span>
            </div>
            
            {/* Thermometer */}
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500" 
                style={{ width: `${selectedConv.customers?.lead_score || 0}%` }}
              />
            </div>
            
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>Cold</span>
              <span>Warm</span>
              <span>Hot</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase">Telefon</span>
              <span className="text-white font-medium">{selectedConv.customers?.phone || 'Yok'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-semibold text-zinc-500 uppercase">E-posta</span>
              <span className="text-white font-medium truncate">{selectedConv.customers?.email || 'Yok'}</span>
            </div>
          </div>

          <div className="h-px bg-zinc-900" />

          {/* Quick Actions Panel */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">CRM Hızlı İşlemler</span>
            <button
              onClick={() => setApptModalOpen(true)}
              className="w-full py-2.5 rounded-xl border border-zinc-800 hover:border-purple-500/30 bg-zinc-900/40 text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition-all"
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Randevu Oluştur</span>
            </button>
          </div>

          <div className="h-px bg-zinc-900" />

          {/* Section 4: Notes */}
          <div className="space-y-3 flex-1 flex flex-col">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">CRM Görüşme Notları</span>
            <textarea
              value={customerNotes}
              onChange={e => setCustomerNotes(e.target.value)}
              placeholder="Müşteri talepleri veya önemli notlar..."
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 resize-none flex-1"
            />
            <button
              onClick={handleSaveNotes}
              disabled={updatingNotes}
              className="w-full py-2 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-black disabled:text-zinc-500 font-bold rounded-lg text-[10px] transition-all flex items-center justify-center gap-1"
            >
              {updatingNotes && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Notu Kaydet</span>
            </button>
          </div>

        </div>
      )}

      {/* CREATE APPOINTMENT MODAL OVERLAY */}
      {apptModalOpen && selectedConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative flex flex-col gap-5 text-left"
          >
            <button 
              onClick={() => setApptModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h2 className="text-sm font-bold text-white">Manuel Randevu Oluştur</h2>
              <p className="text-zinc-500 text-[10px] mt-0.5">Müşteri için onaylı randevu kaydı girin.</p>
            </div>

            <form onSubmit={handleCreateAppointment} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Hizmet Seçin *</label>
                <select
                  required
                  value={apptService}
                  onChange={e => setApptService(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none"
                >
                  <option value="">Seçiniz...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.price} TL)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Tarih *</label>
                  <input
                    type="date"
                    required
                    value={apptDate}
                    onChange={e => setApptDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Saat *</label>
                  <input
                    type="time"
                    required
                    value={apptTime}
                    onChange={e => setApptTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={apptCreating}
                className="w-full mt-2 py-3 bg-white text-black font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {apptCreating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Randevuyu Onayla</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
