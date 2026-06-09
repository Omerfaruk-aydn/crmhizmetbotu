import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('t');

    if (!token) {
      return new Response('Token is required', { status: 400 });
    }

    // Find the QR session in database
    const qrSessions = await db.integration.findMany({
      where: { provider: 'instagram_qr_session' },
    });
    const matched = qrSessions.find((s: any) => {
      const cfg = s.config as any;
      return cfg && cfg.token === token;
    });

    if (!matched) {
      return new Response('QR session not found or expired', { status: 404 });
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

    // Instagram Login for Business scopes
    const scopes = [
      'instagram_business_basic',
      'instagram_business_manage_messages'
    ].join(',');

    // Redirect to Instagram Login Dialog, passing token as state
    const oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scopes}&state=${token}`;

    console.log('[QR Auth Redirect] Redirecting to Instagram OAuth with redirect_uri:', redirectUri);

    return NextResponse.redirect(oauthUrl);
  } catch (err: any) {
    console.error('Instagram QR Auth Redirect Error:', err);
    return new Response(err.message || 'Internal Server Error', { status: 500 });
  }
}
