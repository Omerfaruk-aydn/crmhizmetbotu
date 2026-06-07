import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1, 'Mesaj boş olamaz.')
});

const updateSchema = z.object({
  ai_enabled: z.boolean().optional(),
  status: z.enum(['active', 'handoff', 'closed']).optional(),
  assigned_to: z.string().uuid().nullable().optional()
});

function mapConversationToDb(conv: any) {
  if (!conv) return null;
  return {
    id: conv.id,
    business_id: conv.businessId,
    customer_id: conv.customerId,
    channel: conv.channel,
    status: conv.status,
    ai_enabled: conv.aiEnabled,
    assigned_to: conv.assignedTo,
    last_message_at: conv.lastMessageAt,
    created_at: conv.createdAt,
    updated_at: conv.updatedAt,
    customers: conv.customer ? {
      id: conv.customer.id,
      business_id: conv.customer.businessId,
      name: conv.customer.name,
      phone: conv.customer.phone,
      email: conv.customer.email,
      instagram_id: conv.customer.instagramId,
      external_id: conv.customer.externalId,
      source_channel: conv.customer.sourceChannel,
      status: conv.customer.status,
      lead_score: conv.customer.leadScore,
      language: conv.customer.language,
      notes: conv.customer.notes,
      created_at: conv.customer.createdAt,
      updated_at: conv.customer.updatedAt
    } : null
  };
}

function mapMessageToDb(msg: any) {
  if (!msg) return null;
  return {
    id: msg.id,
    business_id: msg.businessId,
    conversation_id: msg.conversationId,
    customer_id: msg.customerId,
    sender_type: msg.senderType,
    sender_id: msg.senderId,
    content: msg.content,
    intent: msg.intent,
    ai_confidence: msg.aiConfidence,
    metadata: msg.metadata,
    created_at: msg.createdAt
  };
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

    // Fetch conversation details and verify ownership using Prisma
    const conv = await db.conversation.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId
      },
      include: {
        customer: true
      }
    });

    if (!conv) return NextResponse.json({ error: 'Konuşma bulunamadı.' }, { status: 404 });

    // Fetch message logs
    const messages = await db.message.findMany({
      where: {
        conversationId: id
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({
      conversation: mapConversationToDb(conv),
      messages: messages.map(mapMessageToDb)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId || !authCtx.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const json = await request.json();
    const validation = messageSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    // Verify ownership and get customer ID
    const conv = await db.conversation.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId
      }
    });

    if (!conv) return NextResponse.json({ error: 'Konuşma bulunamadı.' }, { status: 404 });

    // Insert human agent message using Prisma
    const newMsg = await db.message.create({
      data: {
        businessId: authCtx.businessId,
        conversationId: id,
        customerId: conv.customerId,
        senderType: 'agent',
        senderId: authCtx.user.id,
        content: validation.data.content
      }
    });

    // Update conversation last message timestamp and automatically mute AI if not already muted
    await db.conversation.update({
      where: { id: id },
      data: {
        lastMessageAt: new Date(),
        aiEnabled: false // Human intervened, auto-mute AI to avoid double-replying!
      }
    });

    return NextResponse.json(mapMessageToDb(newMsg));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

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

    const { ai_enabled, status, assigned_to } = validation.data;

    // Verify ownership
    const conv = await db.conversation.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId
      }
    });

    if (!conv) return NextResponse.json({ error: 'Konuşma bulunamadı.' }, { status: 404 });

    // Update conversation properties using Prisma
    const updateData: any = {};
    if (ai_enabled !== undefined) updateData.aiEnabled = ai_enabled;
    if (status !== undefined) updateData.status = status;
    if (assigned_to !== undefined) updateData.assignedTo = assigned_to;

    const updatedConv = await db.conversation.update({
      where: { id: id },
      data: updateData
    });

    // If status is updated to active (closing a handoff), resolve active handoffs
    if (status === 'active') {
      await db.handoff.updateMany({
        where: {
          conversationId: id,
          status: 'open'
        },
        data: {
          status: 'resolved',
          resolvedAt: new Date()
        }
      });
    }

    return NextResponse.json(mapConversationToDb(updatedConv));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
