import { NextResponse } from 'next/server';
import { processIncomingMessage } from '@/lib/ai/engine';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessId,
      sourceChannel = 'web',
      messageContent,
      customerExternalId,
      customerName
    } = body;

    if (!businessId || !messageContent) {
      return NextResponse.json({ error: 'businessId ve messageContent zorunludur.' }, { status: 400 });
    }

    // Verify business exists using Prisma
    const business = await db.business.findUnique({
      where: { id: businessId },
      select: { id: true }
    });

    if (!business) {
      return NextResponse.json({ error: 'Geçersiz İşletme ID.' }, { status: 404 });
    }

    // Process message through engine
    const result = await processIncomingMessage({
      businessId,
      sourceChannel,
      customerExternalId,
      customerName,
      messageContent
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('AI respond handler error:', err);
    return NextResponse.json({ error: err.message || 'AI yanıt motoru hatası.' }, { status: 500 });
  }
}
