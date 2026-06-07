import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';
import { disconnectWhatsApp } from '@/lib/whatsapp/baileysClient';

/**
 * POST /api/whatsapp/disconnect
 * Logs out and removes the Baileys session for the current business.
 */
export async function POST(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    const businessId = ctx.businessId;
    await disconnectWhatsApp(businessId);

    return NextResponse.json({ success: true, status: 'disconnected' });
  } catch (err: any) {
    console.error('[/api/whatsapp/disconnect] Error:', err);
    return NextResponse.json({ error: err.message || 'Bağlantı kesilemedi.' }, { status: 500 });
  }
}
