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
    const businessId = searchParams.get('state');

    if (!code || !businessId) {
      console.error('Instagram Callback Error: Code or state missing');
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=missing_auth_params'));
    }

    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'OtoCevapVerifyToken2026';

    if (!appId || !appSecret) {
      console.error('Instagram Callback Error: Facebook app credentials not configured');
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=meta_config_missing'));
    }

    const redirectUri = `${appUrl}/api/instagram/callback`;

    // 1. Exchange authorization code for a short-lived user access token
    const tokenExchangeUrl = `https://graph.facebook.com/v21.0/oauth/access_token` +
      `?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_secret=${appSecret}` +
      `&code=${code}`;

    console.log('[Instagram Callback] Exchanging code for short-lived token...');
    const shortTokenRes = await fetch(tokenExchangeUrl);
    if (!shortTokenRes.ok) {
      const errData = await shortTokenRes.json();
      console.error('[Instagram Callback] Short lived token exchange failed:', errData);
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=token_exchange_failed'));
    }

    const { access_token: shortToken } = await shortTokenRes.json();

    // 2. Exchange short-lived token for a long-lived user access token
    const longTokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token` +
      `?grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${shortToken}`;

    console.log('[Instagram Callback] Exchanging short-lived token for long-lived token...');
    const longTokenRes = await fetch(longTokenUrl);
    if (!longTokenRes.ok) {
      const errData = await longTokenRes.json();
      console.error('[Instagram Callback] Long lived token exchange failed:', errData);
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=long_token_failed'));
    }

    const { access_token: longLivedUserToken } = await longTokenRes.json();

    // 3. Fetch user's Facebook Pages and linked Instagram accounts
    console.log('[Instagram Callback] Fetching linked pages and Instagram accounts...');
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts` +
      `?fields=name,access_token,instagram_business_account{id,username}` +
      `&access_token=${longLivedUserToken}`;

    const pagesRes = await fetch(pagesUrl);
    if (!pagesRes.ok) {
      const errData = await pagesRes.json();
      console.error('[Instagram Callback] Failed to fetch pages:', errData);
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=pages_fetch_failed'));
    }

    const { data: pages } = await pagesRes.json();
    
    // Find the page linked to an Instagram Business account
    const matchedPage = pages?.find((page: any) => page.instagram_business_account);

    if (!matchedPage) {
      console.error('[Instagram Callback] No Facebook Page linked to an Instagram Professional account was found.');
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=no_linked_instagram_found'));
    }

    const pageId = matchedPage.id;
    const pageAccessToken = matchedPage.access_token;
    const instagramBusinessAccountId = matchedPage.instagram_business_account.id;
    const instagramHandle = `@${matchedPage.instagram_business_account.username}`;

    console.log(`[Instagram Callback] Found linked Instagram Account: ${instagramHandle} (${instagramBusinessAccountId})`);

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
    return NextResponse.redirect(getRedirectUrl('/dashboard/settings?instagram=success'));
  } catch (err: any) {
    console.error('[Instagram Callback] Internal Callback Error:', err);
    return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=internal_callback_error'));
  }
}
