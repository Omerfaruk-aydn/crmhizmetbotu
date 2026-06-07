'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Send, 
  Bot, 
  Clock, 
  MapPin, 
  Calendar, 
  HelpCircle, 
  ShieldAlert, 
  Loader2,
  Smartphone,
  Phone,
  MessageSquare,
  Check,
  CheckCheck,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'customer' | 'ai' | 'system';
  content: string;
  timestamp: string;
}

function WidgetContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  // Channel tab State
  const [activeChannel, setActiveChannel] = useState<'whatsapp' | 'instagram'>('whatsapp');

  // Business Profile Config
  const [bizConfig, setBizConfig] = useState<any | null>(null);
  const [visitorId, setVisitorId] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat Log States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  // KVKK screen check
  const [kvkkApproved, setKvkkApproved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch configs & setup local session visitor id
  useEffect(() => {
    if (!slug) {
      setError('İşletme slug parametresi bulunamadı.');
      setLoadingConfig(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/widget/config?slug=${slug}`);
        if (!res.ok) throw new Error('İşletme profili alınamadı.');
        const data = await res.json();
        setBizConfig(data);

        // Generate or load visitor ID
        let vId = localStorage.getItem(`assistora_visitor_${slug}`);
        if (!vId) {
          vId = `v_${Math.random().toString(36).substring(2, 11)}`;
          localStorage.setItem(`assistora_visitor_${slug}`, vId);
        }
        setVisitorId(vId);

        // Load chat history if exists
        const cached = localStorage.getItem(`assistora_chat_${slug}_${vId}_${activeChannel}`);
        if (cached) {
          setMessages(JSON.parse(cached));
        } else {
          // Welcome greeting
          setMessages([
            {
              id: '1',
              sender: 'ai',
              content: `Merhaba! ${data.name} ${activeChannel === 'whatsapp' ? 'WhatsApp' : 'Instagram'} hattına hoş geldiniz. Size nasıl yardımcı olabilirim? 🌸`,
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, [slug, activeChannel]);

  // Persist chat logs helper
  useEffect(() => {
    if (messages.length > 0 && visitorId && slug) {
      localStorage.setItem(`assistora_chat_${slug}_${visitorId}_${activeChannel}`, JSON.stringify(messages));
    }
  }, [messages, visitorId, slug, activeChannel]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !bizConfig || !aiEnabled) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'customer',
      content: text,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: bizConfig.id,
          sourceChannel: activeChannel,
          messageContent: text,
          customerExternalId: visitorId,
          customerName: activeChannel === 'whatsapp' ? 'WhatsApp Müşterisi' : 'Instagram Takipçisi'
        })
      });

      if (!res.ok) throw new Error('Yanıt alınamadı.');
      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }

      if (!data.ai_enabled) {
        setAiEnabled(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          sender: 'system',
          content: activeChannel === 'whatsapp' 
            ? '⚠️ WhatsApp sohbeti canlı müşteri temsilcisine aktarıldı. AI kapatıldı.' 
            : '⚠️ Instagram sohbeti temsilciye aktarıldı. AI otomatik yanıtı durduruldu.',
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: 'Üzgünüm, şu anda yanıt vermekte zorlanıyorum. Lütfen daha sonra tekrar deneyin veya doğrudan bizi arayın.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickChip = (action: string) => {
    let msg = '';
    if (action === 'fiyat') msg = 'Hizmetlerinizin güncel fiyat listesini öğrenebilir miyim?';
    if (action === 'saat') msg = 'Hangi gün ve saatler arasında açıksınız?';
    if (action === 'konum') msg = 'Açık adresiniz ve harita konumunuz nedir?';
    if (action === 'randevu') msg = 'Yarın saat 14:00 için randevu oluşturabilir miyiz?';
    if (action === 'insan') msg = 'Beni yetkili bir canlı temsilciye bağlayabilir misiniz?';

    handleSendMessage(msg);
  };

  const clearChatHistory = () => {
    if (!bizConfig) return;
    const initialGreeting: Message[] = [
      {
        id: '1',
        sender: 'ai',
        content: `Merhaba! ${bizConfig.name} ${activeChannel === 'whatsapp' ? 'WhatsApp' : 'Instagram'} hattına hoş geldiniz. Size nasıl yardımcı olabilirim? 🌸`,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initialGreeting);
    setAiEnabled(true);
    if (slug && visitorId) {
      localStorage.setItem(`assistora_chat_${slug}_${visitorId}_${activeChannel}`, JSON.stringify(initialGreeting));
    }
  };

  if (loadingConfig) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !bizConfig) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-6 text-center bg-[#09090b] text-zinc-400 text-xs">
        <ShieldAlert className="w-8 h-8 text-red-500 mb-2" />
        <span>{error || 'Asistan yüklenemedi.'}</span>
      </div>
    );
  }

  // Render KVKK Consent screen first
  if (!kvkkApproved) {
    return (
      <div className="h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6 select-none relative">
        <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              <Smartphone className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-white text-sm">{bizConfig.name}</span>
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-400">KVKK Aydınlatma Metni</h2>
            <p className="text-[11px] text-zinc-400 leading-relaxed mt-2">
              Sohbet simülatörünü başlatmadan önce, simüle edilen kanallar üzerinden randevu veya destek kaydı oluşturulması amacıyla verilerinizin işlenmesini onaylamanız gerekmektedir.
            </p>
          </div>
          <button
            onClick={() => setKvkkApproved(true)}
            className="w-full py-3 text-center text-xs font-bold text-black bg-white rounded-xl hover:opacity-90 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>Okudum, Onaylıyorum</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center p-4">
      
      {/* Simulation Selector & Info bar */}
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-3 mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              activeChannel === 'whatsapp' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Phone className="w-3 h-3" />
            WhatsApp
          </button>
          <button
            onClick={() => setActiveChannel('instagram')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              activeChannel === 'instagram' 
                ? 'bg-purple-600 text-white' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            Instagram
          </button>
        </div>

        <button
          onClick={clearChatHistory}
          className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-lg text-[10px] font-semibold"
        >
          Sohbeti Temizle
        </button>
      </div>

      {/* Main simulated phone container */}
      <div className="w-full max-w-md h-[80vh] bg-[#0d0e12] flex flex-col justify-between text-zinc-100 overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl select-none">
        
        {/* Header */}
        <div className={`px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between shrink-0 text-white ${
          activeChannel === 'whatsapp' ? 'bg-[#075e54]' : 'bg-gradient-to-r from-[#8a3ab9] to-[#cd486b]'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs uppercase">
              {bizConfig.name?.charAt(0) || 'B'}
            </div>
            <div>
              <h4 className="text-xs font-bold leading-none">{bizConfig.name}</h4>
              <span className="text-[9px] text-white/90 block mt-1">
                {activeChannel === 'whatsapp' ? 'WhatsApp AI Asistanı' : 'Instagram DM Asistanı'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] text-white/95">Çevrimiçi</span>
          </div>
        </div>

        {/* Messages Board */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col justify-start bg-[#0b0c10]">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'customer' ? 'self-end items-end ml-auto' : 'self-start items-start'
              }`}
            >
              <div 
                className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'customer'
                    ? (activeChannel === 'whatsapp' ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-purple-600 text-white rounded-tr-none') 
                    : msg.sender === 'system'
                    ? 'bg-zinc-900/60 border border-zinc-850 text-yellow-500 italic text-center w-full max-w-none rounded-lg py-2 self-center font-medium'
                    : 'bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-[8px] text-zinc-600 mt-1 px-1 flex items-center gap-0.5">
                {msg.timestamp}
                {msg.sender === 'customer' && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
              </span>
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
          <div ref={messagesEndRef} />
        </div>

        {/* Quick selection chips */}
        {aiEnabled && (
          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto shrink-0 select-none border-t border-zinc-900 bg-zinc-950/40">
            {[
              { id: 'fiyat', label: 'Fiyatlar', icon: Globe },
              { id: 'randevu', label: 'Randevu Talebi', icon: Calendar },
              { id: 'saat', label: 'Çalışma Saatleri', icon: Clock },
              { id: 'konum', label: 'Konum & Yol', icon: MapPin },
              { id: 'insan', label: 'Temsilciye Bağlan', icon: ShieldAlert }
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => handleQuickChip(chip.id)}
                className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-[10px] font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
              >
                <chip.icon className="w-3 h-3 text-zinc-500" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input panel */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-3 border-t border-zinc-800 bg-zinc-950 flex gap-2 shrink-0 items-center"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            disabled={!aiEnabled}
            placeholder={aiEnabled ? `${activeChannel === 'whatsapp' ? 'WhatsApp' : 'Instagram'} üzerinden mesaj yazın...` : "Canlı temsilciye devredildi."}
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-full px-4 py-2.5 text-xs text-white outline-none disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !aiEnabled}
            className={`p-2.5 rounded-full hover:opacity-90 transition-all text-white disabled:opacity-45 disabled:pointer-events-none active:scale-95 shrink-0 flex items-center justify-center`}
            style={{ backgroundColor: activeChannel === 'whatsapp' ? '#128c7e' : '#a855f7' }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}

export default function WidgetPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-[#09090b]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    }>
      <WidgetContent />
    </Suspense>
  );
}
