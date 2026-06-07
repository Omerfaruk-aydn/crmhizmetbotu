import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const appId = process.env.INSTAGRAM_APP_ID;
    if (!appId) {
      return new Response('Instagram App ID is not configured', { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (() => {
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        return `${protocol}://${host}`;
    })();
    const redirectUri = `${appUrl}/api/instagram/callback`;

    // Instagram API with Instagram Login scopes
    const scopes = [
      'instagram_business_basic',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments'
    ].join(',');

    // Direct Instagram Login OAuth URL
    const oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}&response_type=code&state=${authCtx.businessId}`;

    console.log('Redirecting to Instagram OAuth URL with redirect_uri:', redirectUri);

    return NextResponse.redirect(oauthUrl);
  } catch (err: any) {
    console.error('Instagram Auth Redirect Error:', err);
    return new Response(err.message || 'Internal Server Error', { status: 500 });
  }
}
