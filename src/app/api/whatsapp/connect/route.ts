import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';
import {
  connectWhatsApp,
  getQRCode,
  getConnectionStatus,
  hasSession,
} from '@/lib/whatsapp/baileysClient';
import { initWhatsAppMessageHandler } from '@/lib/whatsapp/messageHandler';

// Initialize message handler once
initWhatsAppMessageHandler();

/**
 * POST /api/whatsapp/connect
 * Starts or resumes a Baileys WhatsApp session for the current business.
 * Returns { status, qr? }
 */
export async function POST(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    const businessId = ctx.businessId;
    const currentStatus = getConnectionStatus(businessId);

    // If already connected, return status
    if (currentStatus === 'connected') {
      return NextResponse.json({ status: 'connected', qr: null });
    }

    // Start connection (non-blocking)
    connectWhatsApp(businessId).catch((err) => {
      console.error(`[WhatsApp] connectWhatsApp error for ${businessId}:`, err);
    });

    // Wait a bit for QR to be generated
    await new Promise((r) => setTimeout(r, 2500));

    const status = getConnectionStatus(businessId);
    const qr = getQRCode(businessId);

    return NextResponse.json({ status, qr });
  } catch (err: any) {
    console.error('[/api/whatsapp/connect] Error:', err);
    return NextResponse.json({ error: err.message || 'Bağlantı başlatılamadı.' }, { status: 500 });
  }
}

/**
 * GET /api/whatsapp/connect
 * Polls connection status and QR code for the current business.
 */
export async function GET(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    const businessId = ctx.businessId;
    const status = getConnectionStatus(businessId);
    const qr = getQRCode(businessId);
    const sessionExists = hasSession(businessId);

    return NextResponse.json({ status, qr, sessionExists });
  } catch (err: any) {
    console.error('[/api/whatsapp/connect GET] Error:', err);
    return NextResponse.json({ error: err.message || 'Durum alınamadı.' }, { status: 500 });
  }
}
