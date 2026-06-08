import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { getIgClient } from '@/lib/instagram';

/**
 * POST /api/instagram/setup
 * Authenticates with Instagram using username & password, and saves integration config.
 */
export async function POST(req: Request) {
  try {
    const ctx = await getAuthContext();
    if (!ctx?.businessId) {
      return NextResponse.json({ error: 'Yetkilendirme hatası.' }, { status: 401 });
    }

    const { username, password, sessionJson } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Kullanıcı adı zorunludur.' }, { status: 400 });
    }

    const businessId = ctx.businessId;
    let serializedState: any = null;

    if (sessionJson) {
      console.log(`[Instagram Setup] Verifying session JSON for ${username} on Business ${businessId}`);
      const ig = getIgClient(businessId, username);
      try {
        await ig.state.deserialize(sessionJson);
        // Test connectivity and session validity
        await ig.feed.directInbox().items();
        serializedState = await ig.state.serialize();
      } catch (err: any) {
        console.error(`[Instagram Setup] Session JSON verification failed:`, err);
        return NextResponse.json({
          error: `Oturum kodu doğrulanamadı. Kodun doğru kopyalandığından emin olun veya yerel betik ile yeni bir kod üretin. Hata: ${err.message || err}`
        }, { status: 400 });
      }
    } else {
      if (!password) {
        return NextResponse.json({ error: 'Şifre zorunludur.' }, { status: 400 });
      }

      console.log(`[Instagram Setup] Attempting login for ${username} on Business ${businessId}`);
      const ig = getIgClient(businessId, username);
      try {
        await ig.simulate.preLoginFlow();
        await ig.account.login(username, password);
        process.nextTick(async () => {
          try {
            await ig.simulate.postLoginFlow();
          } catch (e) {}
        });
        serializedState = await ig.state.serialize();
      } catch (err: any) {
        console.error(`[Instagram Setup] Verification failed for ${username}:`, err);
        return NextResponse.json({
          error: `Instagram girişi başarısız. Şifrenizi veya kullanıcı adınızı kontrol edin. Hata: ${err.message || err}`
        }, { status: 400 });
      }
    }

    const configData = {
      username,
      password: password || '',
      sessionState: JSON.stringify(serializedState),
      lastProcessedMessages: {} // To store threadId -> lastMessageId mapping
    };

    // Upsert integration record
    const existing = await db.integration.findFirst({
      where: { businessId, provider: 'instagram' }
    });

    if (existing) {
      await db.integration.update({
        where: { id: existing.id },
        data: {
          status: 'active',
          config: configData,
          updatedAt: new Date()
        }
      });
    } else {
      await db.integration.create({
        data: {
          businessId,
          provider: 'instagram',
          status: 'active',
          config: configData
        }
      });
    }

    // Save instagram handle to Business model
    await db.business.update({
      where: { id: businessId },
      data: { instagramHandle: `@${username}` }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[/api/instagram/setup] POST Error:', err);
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
      instagramHandle: config?.username ? `@${config.username}` : null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
