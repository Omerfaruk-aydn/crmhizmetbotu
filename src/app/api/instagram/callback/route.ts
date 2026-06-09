import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (() => {
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${host}`;
  })();

  const getRedirectUrl = (path: string) => new URL(path, appUrl);

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    let businessId = searchParams.get('state');
    let qrSessionRecord: any = null;

    if (!code || !businessId) {
      console.error('Instagram Callback Error: Code or state missing');
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=missing_auth_params'));
    }

    // Resolve businessId if state is a QR token
    if (businessId && businessId.length === 32) {
      const qrSessions = await db.integration.findMany({
        where: { provider: 'instagram_qr_session' }
      });
      const matched = qrSessions.find((s: any) => {
        const cfg = s.config as any;
        return cfg && cfg.token === businessId;
      });
      if (matched) {
        qrSessionRecord = matched;
        businessId = matched.businessId;
        console.log(`[Instagram Callback] Found QR session matching token. Business ID: ${businessId}`);
      } else {
        console.warn(`[Instagram Callback] No QR session found matching token: ${businessId}`);
      }
    }

    const isInstagramFlow = !!qrSessionRecord;
    const appId = isInstagramFlow ? process.env.INSTAGRAM_APP_ID : process.env.FACEBOOK_APP_ID;
    const appSecret = isInstagramFlow ? process.env.INSTAGRAM_APP_SECRET : process.env.FACEBOOK_APP_SECRET;
    const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'OtoCevapVerifyToken2026';

    if (!appId || !appSecret) {
      console.error('Instagram Callback Error: App credentials not configured');
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=meta_config_missing'));
    }

    const redirectUri = `${appUrl}/api/instagram/callback`;

    let shortToken = '';
    if (isInstagramFlow) {
      // 1. Exchange authorization code for a short-lived user access token (Instagram Flow)
      console.log('[Instagram Callback] Exchanging code for short-lived token (Instagram Flow)...');
      const tokenExchangeUrl = `https://api.instagram.com/oauth/access_token`;
      const shortTokenRes = await fetch(tokenExchangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: appId,
          client_secret: appSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: code,
        }),
      });

      if (!shortTokenRes.ok) {
        const errData = await shortTokenRes.json();
        console.error('[Instagram Callback] Short lived token exchange failed (Instagram Flow):', errData);
        return NextResponse.redirect(getRedirectUrl(`/ig-auth/${qrSessionRecord.config.token}?error=token_exchange_failed`));
      }

      const data = await shortTokenRes.json();
      shortToken = data.access_token;
    } else {
      // 1. Exchange authorization code for a short-lived user access token (Facebook Flow)
      console.log('[Instagram Callback] Exchanging code for short-lived token (Facebook Flow)...');
      const tokenExchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token` +
        `?client_id=${appId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&client_secret=${appSecret}` +
        `&code=${code}`;

      const shortTokenRes = await fetch(tokenExchangeUrl);
      if (!shortTokenRes.ok) {
        const errData = await shortTokenRes.json();
        console.error('[Instagram Callback] Short lived token exchange failed (Facebook Flow):', errData);
        return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=token_exchange_failed'));
      }

      const data = await shortTokenRes.json();
      shortToken = data.access_token;
    }

    let longLivedUserToken = '';
    if (isInstagramFlow) {
      // 2. Exchange short-lived token for a long-lived user access token (Instagram Flow)
      console.log('[Instagram Callback] Exchanging short-lived token for long-lived token (Instagram Flow)...');
      const longTokenUrl = `https://graph.instagram.com/access_token` +
        `?grant_type=ig_exchange_token` +
        `&client_secret=${appSecret}` +
        `&access_token=${shortToken}`;

      const longTokenRes = await fetch(longTokenUrl);
      if (!longTokenRes.ok) {
        const errData = await longTokenRes.json();
        console.error('[Instagram Callback] Long lived token exchange failed (Instagram Flow):', errData);
        return NextResponse.redirect(getRedirectUrl(`/ig-auth/${qrSessionRecord.config.token}?error=long_token_failed`));
      }

      const data = await longTokenRes.json();
      longLivedUserToken = data.access_token;
    } else {
      // 2. Exchange short-lived token for a long-lived user access token (Facebook Flow)
      console.log('[Instagram Callback] Exchanging short-lived token for long-lived token (Facebook Flow)...');
      const longTokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token` +
        `?grant_type=fb_exchange_token` +
        `&client_id=${appId}` +
        `&client_secret=${appSecret}` +
        `&fb_exchange_token=${shortToken}`;

      const longTokenRes = await fetch(longTokenUrl);
      if (!longTokenRes.ok) {
        const errData = await longTokenRes.json();
        console.error('[Instagram Callback] Long lived token exchange failed (Facebook Flow):', errData);
        return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=long_token_failed'));
      }

      const data = await longTokenRes.json();
      longLivedUserToken = data.access_token;
    }

    let pageAccessToken = '';
    let pageId = '';
    let instagramBusinessAccountId = '';
    let instagramHandle = '';

    if (isInstagramFlow) {
      // 3. Fetch user details directly (Instagram Flow)
      console.log('[Instagram Callback] Fetching Instagram user details (Instagram Flow)...');
      const meUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedUserToken}`;
      const meRes = await fetch(meUrl);
      if (!meRes.ok) {
        const errData = await meRes.json();
        console.error('[Instagram Callback] Failed to fetch Instagram user details:', errData);
        return NextResponse.redirect(getRedirectUrl(`/ig-auth/${qrSessionRecord.config.token}?error=user_fetch_failed`));
      }

      const data = await meRes.json();
      instagramBusinessAccountId = data.id;
      instagramHandle = `@${data.username}`;
      pageAccessToken = longLivedUserToken; // Use the long-lived token directly for messaging
      pageId = data.id; // pageId acts as instagram account id
    } else {
      // 3. Fetch user's Facebook Pages and linked Instagram accounts (Facebook Flow)
      console.log('[Instagram Callback] Fetching linked pages and Instagram accounts (Facebook Flow)...');
      const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts` +
        `?fields=name,access_token,instagram_business_account{id,username}` +
        `&access_token=${longLivedUserToken}`;

      const pagesRes = await fetch(pagesUrl);
      if (!pagesRes.ok) {
        const errData = await pagesRes.json();
        console.error('[Instagram Callback] Failed to fetch pages (Facebook Flow):', errData);
        return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=pages_fetch_failed'));
      }

      const { data: pages } = await pagesRes.json();
      const matchedPage = pages?.find((page: any) => page.instagram_business_account);

      if (!matchedPage) {
        console.error('[Instagram Callback] No Facebook Page linked to an Instagram Professional account was found.');
        return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=no_linked_instagram_found'));
      }

      pageId = matchedPage.id;
      pageAccessToken = matchedPage.access_token;
      instagramBusinessAccountId = matchedPage.instagram_business_account.id;
      instagramHandle = `@${matchedPage.instagram_business_account.username}`;

      // 4. Subscribe the app to the Facebook Page's webhooks
      console.log(`[Instagram Callback] Subscribing app to Facebook Page (${pageId}) webhooks...`);
      const subscribeUrl = `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps` +
        `?subscribed_fields=messages,messaging_postbacks` +
        `&access_token=${pageAccessToken}`;

      const subscribeRes = await fetch(subscribeUrl, { method: 'POST' });
      if (!subscribeRes.ok) {
        const errData = await subscribeRes.json();
        console.error('[Instagram Callback] Webhook subscription failed:', errData);
        return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=webhook_subscription_failed'));
      }
    }

    // 5. Save/Update integration record in database
    const existing = await db.integration.findFirst({
      where: { businessId, provider: 'instagram' }
    });

    const configData = {
      pageAccessToken,
      pageId,
      instagramBusinessAccountId,
      instagramHandle,
      verifyToken
    };

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

    // Update business's instagram handle if not set
    await db.business.update({
      where: { id: businessId },
      data: { instagramHandle }
    });

    console.log(`Instagram connected officially and successfully for Business ${businessId}.`);

    if (qrSessionRecord) {
      const cfg = qrSessionRecord.config as any;
      await db.integration.update({
        where: { id: qrSessionRecord.id },
        data: {
          config: {
            ...cfg,
            status: 'done',
            message: `${instagramHandle} başarıyla bağlandı!`,
            progress: 100,
            username: instagramHandle.replace('@', ''),
          },
          updatedAt: new Date()
        }
      });
      // Redirect mobile browser back to ig-auth page so they see success message
      return NextResponse.redirect(getRedirectUrl(`/ig-auth/${cfg.token}`));
    }

    return NextResponse.redirect(getRedirectUrl('/dashboard/settings?instagram=success'));
  } catch (err: any) {
    console.error('[Instagram Callback] Internal Callback Error:', err);
    try {
      const { searchParams } = new URL(request.url);
      const state = searchParams.get('state');
      if (state && state.length === 32) {
        return NextResponse.redirect(getRedirectUrl(`/ig-auth/${state}?error=auth_failed`));
      }
    } catch {}
    return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=internal_callback_error'));
  }
}
