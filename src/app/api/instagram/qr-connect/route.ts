/**
 * Instagram QR Oturum Aktarma Sistemi — DB-backed (Vercel uyumlu)
 * ================================================================
 * Vercel serverless'ta in-memory Map çalışmaz (instance'lar stateless).
 * QR session'ları PostgreSQL'de Integration tablosunda saklanır.
 *
 * POST  → QR session başlatır
 * GET   → Session durumunu sorgular (polling)
 * PATCH → Mobil sayfadan çerezleri alır, DB'ye kaydeder
 */

import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import QRCode from 'qrcode';

const QR_PROVIDER = 'instagram_qr_session';
const QR_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ─── POST: Start QR session ───────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    const token = generateToken();
    const expiresAt = new Date(Date.now() + QR_EXPIRY_MS).toISOString();

    // Prefer explicit app URL (works on phones) → fall back to request origin (local dev)
    const reqUrl = new URL(req.url);
    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || reqUrl.origin;
    const authUrl = `${origin}/ig-auth/${token}`;

    // Store session in DB (works across all Vercel instances)
    // Upsert: one pending QR session per business at a time
    const existing = await db.integration.findFirst({
      where: { businessId: ctx.businessId, provider: QR_PROVIDER },
    });

    const sessionConfig = {
      token,
      status: 'pending',
      message: 'QR kodu bekleniyor...',
      progress: 10,
      expiresAt,
      authUrl,
    };

    if (existing) {
      await db.integration.update({
        where: { id: existing.id },
        data: { status: 'pending', config: sessionConfig, updatedAt: new Date() },
      });
    } else {
      await db.integration.create({
        data: {
          businessId: ctx.businessId,
          provider: QR_PROVIDER,
          status: 'pending',
          config: sessionConfig,
        },
      });
    }

    // Generate QR code image
    const qrDataUrl = await QRCode.toDataURL(authUrl, {
      width: 280,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    });

    return NextResponse.json({ token, qrDataUrl, authUrl, expiresIn: 600 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── GET: Poll QR session status ──────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('t');

  if (!token) {
    return NextResponse.json({ error: 'Token gerekli.' }, { status: 400 });
  }

  // Find session by token stored in config JSON
  const records = await db.integration.findMany({
    where: { provider: QR_PROVIDER },
  });

  const record = records.find((r: any) => {
    const cfg = r.config as any;
    return cfg && cfg.token === token;
  });

  if (!record) {
    return NextResponse.json({ status: 'expired', message: 'Oturum bulunamadı.' });
  }

  const cfg = record.config as any;

  // Check expiry
  if (cfg?.expiresAt && new Date(cfg.expiresAt) < new Date() && cfg?.status !== 'done') {
    return NextResponse.json({ status: 'expired', message: 'QR süresi doldu.' });
  }

  return NextResponse.json({
    status: cfg?.status || 'pending',
    message: cfg?.message || '',
    progress: cfg?.progress || 10,
    username: cfg?.username,
    error: cfg?.error,
  });
}

// ─── PATCH: Called from ig-auth page when cookies are ready ──────────────────
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { token, cookies, username } = body;

    if (!token || !cookies) {
      return NextResponse.json({ error: 'Token ve çerezler gerekli.' }, { status: 400 });
    }

    // Find the pending QR session matching token
    const records = await db.integration.findMany({
      where: { provider: QR_PROVIDER },
    });

    const record = records.find((r: any) => {
      const cfg = r.config as any;
      return cfg && cfg.token === token;
    });

    if (!record) {
      return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 404 });
    }

    const cfg = record.config as any;

    if (cfg?.expiresAt && new Date(cfg.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'QR süresi doldu.' }, { status: 410 });
    }

    // Update to saving state
    await db.integration.update({
      where: { id: record.id },
      data: {
        config: { ...cfg, status: 'saving', message: 'Oturum kaydediliyor...', progress: 80, username },
        updatedAt: new Date(),
      },
    });

    // Save the actual Instagram session
    const businessId = record.businessId;
    await saveInstagramSession(businessId, username, cookies);

    // Mark as done
    await db.integration.update({
      where: { id: record.id },
      data: {
        config: { ...cfg, status: 'done', message: `@${username} başarıyla bağlandı!`, progress: 100, username },
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[QR Connect] PATCH error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Save Instagram session to DB ─────────────────────────────────────────────
async function saveInstagramSession(businessId: string, username: string, cookies: any[]) {
  const { IgApiClient } = await import('instagram-private-api');
  const { Cookie } = await import('tough-cookie');

  const dsUserIdCookie = cookies.find((c: any) => c.name === 'ds_user_id');
  const userId = dsUserIdCookie?.value || username;

  const ig = new IgApiClient();
  ig.state.generateDevice(userId);

  const proxyUrl = process.env.INSTAGRAM_PROXY_URL;
  if (proxyUrl) ig.state.proxyUrl = proxyUrl;

  for (const c of cookies) {
    try {
      const igCookie = new Cookie({
        key: c.name,
        value: c.value,
        domain: (c.domain || 'instagram.com').replace(/^\./, ''),
        path: c.path || '/',
        secure: c.secure ?? true,
        httpOnly: c.httpOnly ?? false,
      });
      await ig.state.cookieJar.setCookie(igCookie, 'https://i.instagram.com/');
    } catch {}
  }

  try {
    await ig.feed.directInbox().items();
  } catch (e: any) {
    console.warn('[QR Connect] API test warning:', e.message);
  }

  const serializedState = await ig.state.serialize();

  const configData = {
    username,
    password: '',
    sessionState: JSON.stringify(serializedState),
    rawCookies: cookies,
    lastProcessedMessages: {},
    connectedVia: 'qr',
    connectedAt: new Date().toISOString(),
  };

  // Save/update the actual Instagram integration
  const existingIg = await db.integration.findFirst({
    where: { businessId, provider: 'instagram' },
  });

  if (existingIg) {
    await db.integration.update({
      where: { id: existingIg.id },
      data: { status: 'active', config: configData, updatedAt: new Date() },
    });
  } else {
    await db.integration.create({
      data: { businessId, provider: 'instagram', status: 'active', config: configData },
    });
  }

  await db.business.update({
    where: { id: businessId },
    data: { instagramHandle: `@${username}` },
  });

  console.log(`[QR Connect] ✅ Connected @${username} for business ${businessId}`);
}

// ─── Utility ──────────────────────────────────────────────────────────────────
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
