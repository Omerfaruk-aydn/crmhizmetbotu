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
    let code = searchParams.get('code');
    const businessId = searchParams.get('state');

    if (!code || !businessId) {
      console.error('Instagram Callback Error: Code or state missing');
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=missing_auth_params'));
    }

    // Strip trailing #_ that Instagram often appends to the code parameter
    code = code.replace(/#_$/, '');

    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const verifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'OtoCevapVerifyToken2026';

    if (!appId || !appSecret) {
      console.error('Instagram Callback Error: Instagram credentials not configured');
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=meta_config_missing'));
    }

    const redirectUri = `${appUrl}/api/instagram/callback`;

    // 1. Exchange authorization code for a short-lived user access token
    const tokenExchangeUrl = `https://api.instagram.com/oauth/access_token`;
    const formData = new URLSearchParams();
    formData.append('client_id', appId);
    formData.append('client_secret', appSecret);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', redirectUri);
    formData.append('code', code);

    console.log('Sending token exchange request to Instagram API...');
    console.log('Request payload:', formData.toString());
    const shortTokenRes = await fetch(tokenExchangeUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!shortTokenRes.ok) {
      const errData = await shortTokenRes.json();
      console.error('Short lived token exchange failed:', errData);
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=token_exchange_failed'));
    }

    const { access_token: shortToken, user_id: instagramBusinessAccountId } = await shortTokenRes.json();

    // 2. Exchange short-lived token for a long-lived user access token
    const longTokenUrl = `https://graph.instagram.com/access_token` +
      `?grant_type=ig_exchange_token` +
      `&client_secret=${appSecret}` +
      `&access_token=${shortToken}`;

    const longTokenRes = await fetch(longTokenUrl);
    if (!longTokenRes.ok) {
      const errData = await longTokenRes.json();
      console.error('Long lived token exchange failed:', errData);
      return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=long_token_failed'));
    }

    const { access_token: longLivedUserToken } = await longTokenRes.json();

    // 3. Get Instagram account details (username/handle)
    let instagramHandle = 'Instagram Business Account';
    try {
      const igDetailsUrl = `https://graph.instagram.com/v21.0/${instagramBusinessAccountId}` +
        `?fields=username` +
        `&access_token=${longLivedUserToken}`;
      const igDetailsRes = await fetch(igDetailsUrl);
      if (igDetailsRes.ok) {
        const igData = await igDetailsRes.json();
        if (igData.username) {
          instagramHandle = `@${igData.username}`;
        }
      }
    } catch (e) {
      console.error('Error fetching Instagram username:', e);
    }

    // 4. Save or update integration record in database
    const existing = await db.integration.findFirst({
      where: { businessId, provider: 'instagram' }
    });

    const configData = {
      pageAccessToken: longLivedUserToken,
      pageId: instagramBusinessAccountId, // for backwards compatibility
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

    console.log(`Instagram connected successfully for Business ${businessId}. Connected IG Account: ${instagramBusinessAccountId}`);
    return NextResponse.redirect(getRedirectUrl('/dashboard/settings?instagram=success'));
  } catch (err: any) {
    console.error('Instagram Callback Internal Error:', err);
    return NextResponse.redirect(getRedirectUrl('/dashboard/settings?error=internal_callback_error'));
  }
}
