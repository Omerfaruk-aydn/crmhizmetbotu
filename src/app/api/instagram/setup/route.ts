import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';
import { db } from '@/lib/db';

/**
 * POST /api/instagram/setup
 * Saves or updates the Instagram integration config for the current business.
 * Body: { pageAccessToken, verifyToken }
 */
export async function POST(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    const { pageAccessToken, verifyToken } = await req.json();

    if (!pageAccessToken) {
      return NextResponse.json({ error: 'pageAccessToken zorunludur.' }, { status: 400 });
    }

    const businessId = ctx.businessId;

    // Upsert integration record
    const existing = await db.integration.findFirst({
      where: { businessId, provider: 'instagram' }
    });

    if (existing) {
      await db.integration.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          config: {
            pageAccessToken,
            verifyToken: verifyToken || 'MY_VERIFY_TOKEN',
          }
        }
      });
    } else {
      await db.integration.create({
        data: {
          businessId,
          provider: 'instagram',
          status: 'active',
          config: {
            pageAccessToken,
            verifyToken: verifyToken || 'MY_VERIFY_TOKEN',
          }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[/api/instagram/setup] Error:', err);
    return NextResponse.json({ error: err.message || 'Kayıt başarısız.' }, { status: 500 });
  }
}

/**
 * GET /api/instagram/setup
 * Returns current Instagram integration status.
 */
export async function GET(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    const integration = await db.integration.findFirst({
      where: { businessId: ctx.businessId, provider: 'instagram' }
    });

    const config = integration?.config as any;

    return NextResponse.json({
      connected: integration?.status === 'active',
      status: integration?.status || 'inactive',
      instagramHandle: config?.instagramHandle || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
