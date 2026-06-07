import { OpenAI } from 'openai';

export interface AIResponseSchema {
  reply: string;
  intent: string;
  confidence: number;
  risk_level: string;
  should_handoff: boolean;
  handoff_reason: string | null;
  lead_score_delta: number;
  detected_entities: {
    service: string | null;
    date: string | null;
    time: string | null;
    phone: string | null;
    name: string | null;
  };
  next_action: string;
  appointment_request: {
    service_name: string | null;
    date: string | null;
    time: string | null;
    customer_name: string | null;
    customer_phone: string | null;
  } | null;
  customer_update: {
    status: string;
    tags: string[];
  };
}

export async function generateCompletion(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = []
): Promise<AIResponseSchema> {
  const apiKey = process.env.OPENAI_API_KEY;

  // Fallback Heuristics Mock Engine if no API Key (very helpful for testing/dev)
  if (!apiKey || apiKey.startsWith('your-')) {
    console.warn('OPENAI_API_KEY is not configured. Falling back to Mock Heuristic AI Engine.');
    return simulateMockResponse(userMessage);
  }

  const openai = new OpenAI({ apiKey });

  const messages: any = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content
    })),
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0].message.content || '{}';
    const parsed = JSON.parse(text);

    // Validate parsed output keys or merge default fallbacks
    return {
      reply: parsed.reply || 'Anlaşılmadı, tekrar sorabilir misiniz?',
      intent: parsed.intent || 'unknown',
      confidence: parsed.confidence || 0.8,
      risk_level: parsed.risk_level || 'low',
      should_handoff: !!parsed.should_handoff,
      handoff_reason: parsed.handoff_reason || null,
      lead_score_delta: parsed.lead_score_delta || 0,
      detected_entities: {
        service: parsed.detected_entities?.service || null,
        date: parsed.detected_entities?.date || null,
        time: parsed.detected_entities?.time || null,
        phone: parsed.detected_entities?.phone || null,
        name: parsed.detected_entities?.name || null,
        ...parsed.detected_entities
      },
      next_action: parsed.next_action || 'none',
      appointment_request: parsed.appointment_request || null,
      customer_update: {
        status: parsed.customer_update?.status || 'lead',
        tags: parsed.customer_update?.tags || [],
        ...parsed.customer_update
      }
    };
  } catch (err) {
    console.error('OpenAI completion failed:', err);
    return simulateMockResponse(userMessage);
  }
}

// Simple heuristic mock engine for local testing
function simulateMockResponse(message: string): AIResponseSchema {
  const msg = message.toLowerCase();
  
  if (msg.includes('fiyat') || msg.includes('ücret') || msg.includes('ne kadar')) {
    return {
      reply: 'Hizmetlerimizin fiyat listesi şu şekildedir: Cilt Bakımı 1200 TL, Manikür 450 TL, Pedikür 550 TL, Kaş Tasarımı 500 TL\'dir. Lazer epilasyon fiyatları ise seans ve bölgeye göre 1000 TL ile 5000 TL arasında değişmektedir. Sizin için bir ön görüşme randevusu oluşturalım mı?',
      intent: 'price_question',
      confidence: 0.95,
      risk_level: 'low',
      should_handoff: false,
      handoff_reason: null,
      lead_score_delta: 10,
      detected_entities: { service: 'Cilt Bakımı', date: null, time: null, phone: null, name: null },
      next_action: 'ask_date_time',
      appointment_request: null,
      customer_update: { status: 'lead', tags: ['fiyat_sordu'] }
    };
  }

  if (msg.includes('randevu') || msg.includes('rezervasyon') || msg.includes('kayıt')) {
    // Check if phone and date is mock-provided
    const hasPhone = msg.match(/[0-9]{7,}/);
    const hasName = msg.includes('adım') || msg.includes('ismim');
    
    if (hasPhone) {
      return {
        reply: 'Harika! Cilt Bakımı ön randevu talebiniz yarın saat 14:00 için başarıyla oluşturuldu. Ekibimiz kesin onay için sizinle iletişime geçecektir. Teşekkür ederiz! 🗓️',
        intent: 'appointment_request',
        confidence: 0.98,
        risk_level: 'low',
        should_handoff: false,
        handoff_reason: null,
        lead_score_delta: 40,
        detected_entities: { 
          service: 'Cilt Bakımı', 
          date: '2026-06-07', 
          time: '14:00', 
          phone: hasPhone[0], 
          name: 'Merve' 
        },
        next_action: 'confirm_appointment',
        appointment_request: {
          service_name: 'Cilt Bakımı',
          date: '2026-06-07',
          time: '14:00',
          customer_name: 'Merve',
          customer_phone: hasPhone[0]
        },
        customer_update: { status: 'customer', tags: ['randevu_istiyor', 'telefon_paylasildi'] }
      };
    } else {
      return {
        reply: 'Randevu talebinizi hemen alabilirim. Cilt Bakımı için istediğiniz tarih, saat, adınız ve telefon numaranızı paylaşabilir misiniz?',
        intent: 'appointment_request',
        confidence: 0.9,
        risk_level: 'low',
        should_handoff: false,
        handoff_reason: null,
        lead_score_delta: 15,
        detected_entities: { service: 'Cilt Bakımı', date: null, time: null, phone: null, name: null },
        next_action: 'ask_phone_name',
        appointment_request: null,
        customer_update: { status: 'lead', tags: ['randevu_istiyor'] }
      };
    }
  }

  if (msg.includes('şikayet') || msg.includes('kızarıklık') || msg.includes('yetkili') || msg.includes('memnun kalmadım')) {
    return {
      reply: 'Geçmiş olsun! Yaşadığınız bu durumu çok önemsiyoruz. Size hemen en hızlı şekilde yardımcı olabilmemiz için sohbeti yetkili bir temsilcimize devrediyorum. Kendisi sizinle buradan hemen iletişime geçecektir.',
      intent: 'complaint',
      confidence: 0.99,
      risk_level: 'high',
      should_handoff: true,
      handoff_reason: 'Müşteri şikayeti veya yetkili insan görüşme talebi.',
      lead_score_delta: 0,
      detected_entities: { service: null, date: null, time: null, phone: null, name: null },
      next_action: 'none',
      appointment_request: null,
      customer_update: { status: 'contact', tags: ['sikayet', 'insan_devri'] }
    };
  }

  // Default greeting / info
  return {
    reply: 'Merhaba! Size Bella Güzellik Salonu adına nasıl yardımcı olabilirim? Hizmet detayları, fiyatlarımız veya randevu saatlerimiz hakkında sorularınızı sorabilirsiniz. 🌸',
    intent: 'greeting',
    confidence: 0.9,
    risk_level: 'low',
    should_handoff: false,
    handoff_reason: null,
    lead_score_delta: 0,
    detected_entities: { service: null, date: null, time: null, phone: null, name: null },
    next_action: 'none',
    appointment_request: null,
    customer_update: { status: 'lead', tags: ['bilgi_aldi'] }
  };
}
