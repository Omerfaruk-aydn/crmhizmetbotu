import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';
import { db } from '@/lib/db';

// ─── In-memory job store (works in dev/Node server, not Vercel Edge) ──────────
type JobStatus = 'starting' | 'waiting_login' | 'collecting' | 'saving' | 'done' | 'error';

interface Job {
  status: JobStatus;
  message: string;
  progress: number; // 0-100
  username?: string;
  error?: string;
  businessId: string;
  createdAt: number;
}

// Global map — persists across requests in the same Node process
const jobs = new Map<string, Job>();

// Clean up old jobs every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [id, job] of jobs.entries()) {
    if (job.createdAt < cutoff) jobs.delete(id);
  }
}, 60_000);

// ─── POST: Start browser login job ───────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    // Check if running on Vercel (Playwright won't work there)
    if (process.env.VERCEL) {
      return NextResponse.json({
        error: 'Bu özellik yalnızca yerel sunucuda çalışır. Vercel\'de kullanılamaz. Lütfen "Çerez ile Bağlan" yöntemini kullanın.'
      }, { status: 400 });
    }

    const jobId = `ig-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const businessId = ctx.businessId;

    jobs.set(jobId, {
      status: 'starting',
      message: 'Tarayıcı başlatılıyor...',
      progress: 5,
      businessId,
      createdAt: Date.now(),
    });

    // Run Playwright in background (non-blocking)
    runBrowserLogin(jobId, businessId).catch((err) => {
      const job = jobs.get(jobId);
      if (job) {
        jobs.set(jobId, {
          ...job,
          status: 'error',
          message: 'Bağlantı hatası oluştu.',
          error: err.message,
          progress: 0,
        });
      }
    });

    return NextResponse.json({ jobId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── GET: Poll job status ─────────────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId gerekli.' }, { status: 400 });
  }

  const job = jobs.get(jobId);
  if (!job) {
    return NextResponse.json({ error: 'İş bulunamadı veya süresi doldu.' }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    message: job.message,
    progress: job.progress,
    username: job.username,
    error: job.error,
  });
}

// ─── Playwright browser login logic ──────────────────────────────────────────
async function runBrowserLogin(jobId: string, businessId: string) {
  const updateJob = (patch: Partial<Job>) => {
    const job = jobs.get(jobId);
    if (job) jobs.set(jobId, { ...job, ...patch });
  };

  let browser: any = null;

  try {
    // Dynamic import — playwright is a devDependency
    let chromium: any;
    try {
      ({ chromium } = await import('playwright'));
    } catch {
      throw new Error('Playwright yüklü değil. "npm install playwright" komutunu çalıştırın.');
    }

    updateJob({ status: 'starting', message: 'Tarayıcı açılıyor...', progress: 10 });

    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--start-maximized'],
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      viewport: null,
      locale: 'tr-TR',
      timezoneId: 'Europe/Istanbul',
    });

    const page = await context.newPage();

    updateJob({ status: 'starting', message: 'Instagram açılıyor...', progress: 20 });

    await page.goto('https://www.instagram.com/accounts/login/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    updateJob({
      status: 'waiting_login',
      message: 'Tarayıcıda giriş yapmanız bekleniyor...',
      progress: 30,
    });

    // Wait up to 5 minutes for the user to log in
    await page.waitForURL(
      (url: URL) => {
        const href = url.href;
        return (
          href === 'https://www.instagram.com/' ||
          href === 'https://www.instagram.com' ||
          href.includes('/home/') ||
          href.includes('/accounts/onetap') ||
          href.includes('/direct/')
        );
      },
      { timeout: 300_000 }
    );

    updateJob({ status: 'collecting', message: 'Giriş algılandı! Çerezler toplanıyor...', progress: 60 });

    // Collect cookies immediately
    const allCookies = await context.cookies([
      'https://www.instagram.com',
      'https://i.instagram.com',
    ]);

    const sessionCookie = allCookies.find((c: any) => c.name === 'sessionid');
    const dsUserIdCookie = allCookies.find((c: any) => c.name === 'ds_user_id');

    if (!sessionCookie) {
      throw new Error('sessionid çerezi bulunamadı. Lütfen tam giriş yapıp ana sayfaya geçin.');
    }

    const userId = dsUserIdCookie?.value || 'unknown';

    // Try to get username from page URL or title
    let username = 'instagram_user';
    try {
      // Navigate to profile to get username
      await page.goto('https://www.instagram.com/accounts/edit/', {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });
      const usernameInput = await page.$('input[name="username"]');
      if (usernameInput) {
        username = await usernameInput.inputValue() || username;
      }
    } catch {
      // Fall back to userId
      username = userId !== 'unknown' ? userId : username;
    }

    updateJob({ status: 'saving', message: 'Oturum veritabanına kaydediliyor...', progress: 80, username });

    await browser.close();
    browser = null;

    // Build cookie JSON for storage
    const cookieJson = allCookies.map((c: any) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      expirationDate: c.expires,
    }));

    // Import cookies into instagram-private-api session format
    const { IgApiClient } = await import('instagram-private-api');
    const { Cookie } = await import('tough-cookie');

    const ig = new IgApiClient();
    ig.state.generateDevice(userId);

    const proxyUrl = process.env.INSTAGRAM_PROXY_URL;
    if (proxyUrl) ig.state.proxyUrl = proxyUrl;

    for (const c of allCookies) {
      try {
        const igCookie = new Cookie({
          key: c.name,
          value: c.value,
          domain: (c.domain || 'instagram.com').replace(/^\./, ''),
          path: c.path || '/',
          secure: c.secure,
          httpOnly: c.httpOnly,
        });
        await ig.state.cookieJar.setCookie(igCookie, 'https://i.instagram.com/');
      } catch {}
    }

    // Test API access
    try {
      await ig.feed.directInbox().items();
    } catch (testErr: any) {
      console.warn('[Browser Connect] API test warning:', testErr.message);
      // Don't fail — cookies may still be valid for web requests
    }

    const serializedState = await ig.state.serialize();

    // Save to database
    const configData = {
      username,
      password: '',
      sessionState: JSON.stringify(serializedState),
      rawCookies: cookieJson,
      lastProcessedMessages: {},
      connectedVia: 'browser',
      connectedAt: new Date().toISOString(),
    };

    const existing = await db.integration.findFirst({
      where: { businessId, provider: 'instagram' },
    });

    if (existing) {
      await db.integration.update({
        where: { id: existing.id },
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

    updateJob({
      status: 'done',
      message: `@${username} hesabı başarıyla bağlandı!`,
      progress: 100,
      username,
    });

    console.log(`[Instagram Browser Connect] Successfully connected @${username} for business ${businessId}`);

  } catch (err: any) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    const job = jobs.get(jobId);
    jobs.set(jobId, {
      ...(job || { businessId, createdAt: Date.now() }),
      status: 'error',
      message: err.message || 'Bilinmeyen hata oluştu.',
      error: err.message,
      progress: 0,
    });
    console.error('[Instagram Browser Connect] Error:', err.message);
  }
}
