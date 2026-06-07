import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';

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

export async function GET(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // handoff, active, all

    const whereClause: any = {
      businessId: authCtx.businessId
    };

    if (filter === 'handoff') {
      whereClause.status = 'handoff';
    } else if (filter === 'active') {
      whereClause.status = 'active';
    }

    const conversations = await db.conversation.findMany({
      where: whereClause,
      include: {
        customer: true
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    return NextResponse.json(conversations.map(mapConversationToDb));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
