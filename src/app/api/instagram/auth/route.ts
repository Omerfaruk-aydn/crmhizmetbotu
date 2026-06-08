import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      return new Response('Facebook App ID is not configured', { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (() => {
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        return `${protocol}://${host}`;
    })();
    const redirectUri = `${appUrl}/api/instagram/callback`;

    // Facebook Login for Business scopes
    const scopes = [
      'instagram_basic',
      'instagram_manage_messages',
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_metadata'
    ].join(',');

    // Redirect to Facebook Login Dialog
    const oauthUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scopes}&state=${authCtx.businessId}`;

    console.log('Redirecting to Facebook OAuth URL with redirect_uri:', redirectUri);

    return NextResponse.redirect(oauthUrl);
  } catch (err: any) {
    console.error('Instagram Auth Redirect Error:', err);
    return new Response(err.message || 'Internal Server Error', { status: 500 });
  }
}
