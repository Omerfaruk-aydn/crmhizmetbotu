import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';
import { db } from '@/lib/db';

/**
 * POST /api/instagram/disconnect
 * Disconnects the Instagram integration for the current business.
 */
export async function POST(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    const businessId = ctx.businessId;

    // Delete or update integration record
    await db.integration.deleteMany({
      where: { businessId, provider: 'instagram' }
    });

    // Reset instagram handle on business profile
    await db.business.update({
      where: { id: businessId },
      data: { instagramHandle: null }
    });

    return NextResponse.json({ success: true, status: 'disconnected' });
  } catch (err: any) {
    console.error('[/api/instagram/disconnect] Error:', err);
    return NextResponse.json({ error: err.message || 'Bağlantı kesilemedi.' }, { status: 500 });
  }
}
