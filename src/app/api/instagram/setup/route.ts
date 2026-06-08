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

    const { username, password, sessionJson, twoFactorCode, twoFactorIdentifier } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Kullanıcı adı zorunludur.' }, { status: 400 });
    }

    const businessId = ctx.businessId;
    let serializedState: any = null;

    if (twoFactorCode && twoFactorIdentifier) {
      // 2FA Verification Flow
      console.log(`[Instagram Setup] Verifying 2FA code for ${username} on Business ${businessId}`);
      const ig = getIgClient(businessId, username);
      try {
        await ig.account.twoFactorLogin({
          username,
          verificationCode: twoFactorCode,
          twoFactorIdentifier: twoFactorIdentifier,
          trustThisDevice: '1'
        });
        
        process.nextTick(async () => {
          try {
            await ig.simulate.postLoginFlow();
          } catch (e) {}
        });
        
        serializedState = await ig.state.serialize();
      } catch (err: any) {
        console.error(`[Instagram Setup] 2FA code verification failed:`, err);
        return NextResponse.json({
          error: `Girdiğiniz doğrulama kodu geçersiz veya süresi dolmuş. Hata: ${err.message || err}`
        }, { status: 400 });
      }
    } else if (sessionJson) {
      console.log(`[Instagram Setup] Verifying session JSON for ${username} on Business ${businessId}`);
      const ig = getIgClient(businessId, username);
      try {
        let isImported = false;
        
        try {
          const parsed = JSON.parse(sessionJson);
          
          if (Array.isArray(parsed)) {
            // Format B: Chrome/Firefox cookie JSON list from extensions like Cookie-Editor
            const { Cookie } = require('tough-cookie');
            for (const c of parsed) {
              const name = c.name || c.key;
              const value = c.value;
              if (!name || !value) continue;
              
              const cookie = new Cookie({
                key: name,
                value: value,
                domain: 'instagram.com',
                path: c.path || '/',
                secure: c.secure !== false,
                httpOnly: c.httpOnly !== false
              });
              await ig.state.cookieJar.setCookie(cookie, 'https://i.instagram.com/');
            }
            isImported = true;
            console.log('[Instagram Setup] Successfully imported session from cookie JSON array.');
          } else if (parsed && parsed.cookies) {
            // Format A: Serialized state JSON
            await ig.state.deserialize(sessionJson);
            isImported = true;
            console.log('[Instagram Setup] Successfully imported session from serialized state JSON.');
          }
        } catch {
          // If JSON parse fails, it will fall back to raw session ID
        }

        if (!isImported) {
          // Format C: Raw session ID string
          const rawSessionId = sessionJson.trim();
          if (rawSessionId) {
            const { Cookie } = require('tough-cookie');
            
            // Extract user id if present in the format user_id:token or user_id%3Atoken
            let dsUserId = '';
            if (rawSessionId.includes('%3A')) {
              dsUserId = rawSessionId.split('%3A')[0];
            } else if (rawSessionId.includes(':')) {
              dsUserId = rawSessionId.split(':')[0];
            }

            const cookiesToSet = [
              { key: 'sessionid', value: rawSessionId }
            ];
            if (dsUserId) {
              cookiesToSet.push({ key: 'ds_user_id', value: dsUserId });
            }

            for (const item of cookiesToSet) {
              const cookie = new Cookie({
                key: item.key,
                value: item.value,
                domain: 'instagram.com',
                path: '/',
                secure: true,
                httpOnly: true
              });
              await ig.state.cookieJar.setCookie(cookie, 'https://i.instagram.com/');
            }
            console.log('[Instagram Setup] Successfully imported session from raw sessionid string.');
          } else {
            throw new Error('Oturum kodu boş olamaz.');
          }
        }

        // Test connectivity and session validity
        await ig.feed.directInbox().items();
        serializedState = await ig.state.serialize();
      } catch (err: any) {
        console.error(`[Instagram Setup] Session JSON verification failed:`, err);
        return NextResponse.json({
          error: `Oturum kodu doğrulanamadı. Tarayıcınızdan doğru çerezleri kopyaladığınızdan emin olun. Hata: ${err.message || err}`
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
        
        // Catch two-factor required error
        if (err.name === 'IgLoginTwoFactorRequiredError' || (err.response && err.response.body && err.response.body.two_factor_info)) {
          const twoFactorInfo = err.response.body.two_factor_info;
          console.log(`[Instagram Setup] Two-factor authentication required for ${username}`);
          return NextResponse.json({
            twoFactorRequired: true,
            twoFactorIdentifier: twoFactorInfo.two_factor_identifier,
            username
          });
        }
        
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
