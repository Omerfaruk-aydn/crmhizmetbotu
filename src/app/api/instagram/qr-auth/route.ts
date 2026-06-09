/**
 * Instagram QR Auth — Python instagrapi servisine bağlı
 * =======================================================
 * QR sayfasından kullanıcı adı + şifre alır,
 * Python mikroservisi üzerinden giriş yapar,
 * session'ı DB'ye kaydeder.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

const QR_PROVIDER = 'instagram_qr_session';
const IG_SERVICE = process.env.INSTAGRAM_SERVICE_URL || 'http://localhost:8001';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, username, password, verifyCode, challengeType, pendingSessionJson } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token gerekli.' }, { status: 400 });
    }

    // ─── Verify code mode (2FA / Challenge) ──────────────────────────────────
    if (verifyCode && pendingSessionJson) {
      const verifyRes = await fetch(`${IG_SERVICE}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_json: pendingSessionJson,
          code: verifyCode,
          challenge_type: challengeType || 'sms',
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        return NextResponse.json({ error: verifyData.detail || 'Kod doğrulanamadı.' }, { status: 400 });
      }

      // Session'ı kaydet ve QR'ı done yap
      return await saveSessionAndMarkDone(token, username, verifyData);
    }

    // ─── Normal login mode ────────────────────────────────────────────────────
    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre gerekli.' }, { status: 400 });
    }

    // QR session'ı bul
    const record = await findQrSession(token);
    if (!record) {
      return NextResponse.json({ error: 'Oturum bulunamadı veya süresi doldu.' }, { status: 404 });
    }

    const cfg = record.config as any;
    if (cfg?.expiresAt && new Date(cfg.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'QR süresi doldu. Yeni QR oluşturun.' }, { status: 410 });
    }

    // "Giriş yapılıyor..." durumuna geç
    await db.integration.update({
      where: { id: record.id },
      data: {
        config: { ...cfg, status: 'logging_in', message: 'Instagram\'a bağlanılıyor...', progress: 40 },
        updatedAt: new Date(),
      },
    });

    // Python servisine giriş isteği gönder
    const loginRes = await fetch(`${IG_SERVICE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const loginData = await loginRes.json();

    // Servis yanıt vermedi
    if (!loginRes.ok && !loginData.two_factor_required && !loginData.challenge_required) {
      // Hata durumunda QR'ı pending'e geri al
      await db.integration.update({
        where: { id: record.id },
        data: {
          config: { ...cfg, status: 'pending', message: 'Hata oluştu.', progress: 10 },
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ error: loginData.detail || 'Giriş başarısız.' }, { status: 400 });
    }

    // 2FA veya challenge gerekli
    if (loginData.two_factor_required || loginData.challenge_required) {
      await db.integration.update({
        where: { id: record.id },
        data: {
          config: { ...cfg, status: 'pending', message: 'Doğrulama kodu bekleniyor...', progress: 60 },
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        requiresVerification: true,
        challengeType: loginData.two_factor_required ? '2fa' : 'sms',
        pendingSessionJson: loginData.session_json,
        message: loginData.error || 'Doğrulama kodu girin.',
      });
    }

    // Başarılı giriş — session'ı kaydet
    return await saveSessionAndMarkDone(token, username, loginData);

  } catch (err: any) {
    console.error('[QR Auth] Error:', err.message);

    // Python servisi çalışmıyor mu?
    if (err.cause?.code === 'ECONNREFUSED') {
      return NextResponse.json({
        error: 'Instagram servisi şu an çalışmıyor. Lütfen sistem yöneticisiyle iletişime geçin.',
      }, { status: 503 });
    }

    return NextResponse.json({ error: err.message || 'Sunucu hatası.' }, { status: 500 });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function findQrSession(token: string) {
  const records = await db.integration.findMany({
    where: { provider: QR_PROVIDER },
  });
  return records.find((r: any) => {
    const cfg = r.config as any;
    return cfg && cfg.token === token;
  }) || null;
}

async function saveSessionAndMarkDone(token: string, username: string, loginData: any) {
  const record = await findQrSession(token);
  if (!record) {
    return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 404 });
  }

  const cfg = record.config as any;
  const businessId = record.businessId;

  // "Kaydediliyor..." durumu
  await db.integration.update({
    where: { id: record.id },
    data: {
      config: { ...cfg, status: 'saving', message: 'Oturum kaydediliyor...', progress: 80 },
      updatedAt: new Date(),
    },
  });

  const configData = {
    username,
    sessionJson: loginData.session_json,
    userId: loginData.user_id,
    fullName: loginData.full_name,
    connectedVia: 'instagrapi',
    connectedAt: new Date().toISOString(),
  };

  // Gerçek Instagram entegrasyonunu kaydet/güncelle
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

  // QR session'ı done yap
  await db.integration.update({
    where: { id: record.id },
    data: {
      config: {
        ...cfg,
        status: 'done',
        message: `@${username} başarıyla bağlandı!`,
        progress: 100,
        username,
      },
      updatedAt: new Date(),
    },
  });

  console.log(`[QR Auth] ✅ Connected @${username} for business ${businessId} via instagrapi`);
  return NextResponse.json({ success: true, username });
}
