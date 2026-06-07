import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { OpenAI } from 'openai';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  status: z.string().optional(),
  notes: z.string().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const json = await request.json();
    const validation = updateSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // Verify ownership and update customer details using Prisma
    const customer = await db.customer.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId,
        deletedAt: null
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Müşteri bulunamadı.' }, { status: 404 });
    }

    const updatedCust = await db.customer.update({
      where: { id: id },
      data: validation.data
    });

    return NextResponse.json({
      id: updatedCust.id,
      business_id: updatedCust.businessId,
      name: updatedCust.name,
      phone: updatedCust.phone,
      email: updatedCust.email,
      source_channel: updatedCust.sourceChannel,
      status: updatedCust.status,
      lead_score: updatedCust.leadScore,
      notes: updatedCust.notes,
      created_at: updatedCust.createdAt
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    // 1. Fetch customer details
    const customer = await db.customer.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId,
        deletedAt: null
      },
      include: {
        customerTags: {
          include: {
            tag: true
          }
        }
      }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Müşteri bulunamadı.' }, { status: 404 });
    }

    // 2. Fetch Lead Events timeline
    const leadEvents = await db.leadEvent.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Fetch Appointment history
    const appointments = await db.appointment.findMany({
      where: { customerId: id },
      include: { service: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Fetch Message history for summary extraction
    const messages = await db.message.findMany({
      where: { customerId: id },
      select: { senderType: true, content: true, intent: true },
      orderBy: { createdAt: 'asc' }
    });

    // 5. Generate AI Summary of user activity
    let aiSummary = '';
    const chatTranscript = (messages || [])
      .map(m => `${m.senderType === 'ai' ? 'Asistan' : 'Müşteri'}: ${m.content}`)
      .join('\n');

    if (chatTranscript.length > 20) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey && !apiKey.startsWith('your-')) {
        try {
          const openai = new OpenAI({ apiKey });
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Sana bir müşteri sohbet dökümü vereceğim. Lütfen bu müşterinin ne istediğini, hangi hizmetlerle ilgilendiğini, verdiği bilgileri (telefon, isim vb.) ve randevu alıp almadığını 1-2 cümlelik kısa bir Türkçe özet olarak yaz. Üçüncü şahıs dili kullan ("Bu müşteri ... sordu").'
              },
              { role: 'user', content: chatTranscript }
            ]
          });
          aiSummary = response.choices[0].message.content || '';
        } catch {
          aiSummary = extractHeuristicSummary(messages || []);
        }
      } else {
        aiSummary = extractHeuristicSummary(messages || []);
      }
    } else {
      aiSummary = 'Yapay zekanın özet çıkarabilmesi için yeterli konuşma geçmişi bulunmuyor.';
    }

    const tags = (customer.customerTags || [])
      .map((t: any) => t.tag ? { name: t.tag.name, color: t.tag.color } : null)
      .filter(Boolean);

    return NextResponse.json({
      customer: {
        id: customer.id,
        business_id: customer.businessId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        instagram_id: customer.instagramId,
        external_id: customer.externalId,
        source_channel: customer.sourceChannel,
        status: customer.status,
        lead_score: customer.leadScore,
        language: customer.language,
        notes: customer.notes,
        created_at: customer.createdAt,
        tags
      },
      timeline: leadEvents.map(e => ({
        id: e.id,
        business_id: e.businessId,
        customer_id: e.customerId,
        conversation_id: e.conversationId,
        event_type: e.eventType,
        score_delta: e.scoreDelta,
        description: e.description,
        created_at: e.createdAt
      })),
      appointments: appointments.map(a => ({
        id: a.id,
        business_id: a.businessId,
        customer_id: a.customerId,
        conversation_id: a.conversationId,
        service_id: a.serviceId,
        requested_date: a.requestedDate,
        requested_time: a.requestedTime,
        customer_name: a.customerName,
        customer_phone: a.customerPhone,
        note: a.note,
        source_channel: a.sourceChannel,
        status: a.status,
        assigned_to: a.assignedTo,
        created_at: a.createdAt,
        services: a.service ? { name: a.service.name } : null
      })),
      aiSummary
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Local rule-based summary extractor fallback
function extractHeuristicSummary(messages: any[]): string {
  const intents = messages.map(m => m.intent).filter(Boolean);
  const contents = messages.map(m => m.content.toLowerCase()).join(' ');

  let summary = 'Bu müşteri ';
  
  if (intents.includes('price_question')) {
    summary += 'hizmet fiyatlarını sordu. ';
  } else {
    summary += 'bilgi almak amacıyla iletişime geçti. ';
  }

  if (contents.includes('lazer')) {
    summary += 'Özellikle lazer epilasyon ile ilgileniyor. ';
  } else if (contents.includes('cilt')) {
    summary += 'Cilt bakımı hizmetiyle ilgileniyor. ';
  }

  if (intents.includes('appointment_request') || contents.includes('randevu')) {
    summary += 'Telefon numarasını paylaşarak ön randevu talebinde bulundu.';
  } else {
    summary += 'Henüz aktif bir randevu talebi oluşturmadı.';
  }

  return summary;
}
