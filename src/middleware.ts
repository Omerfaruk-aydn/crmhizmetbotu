import { NextResponse, type NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

// Base64Url helper compatible with Edge runtime
function base64UrlToArr(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Edge-safe JWT verification using Web Crypto API
async function verifyJWTEdge(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const keyData = encoder.encode(JWT_SECRET);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBin = base64UrlToArr(signatureB64);
    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBin as any,
      data as any
    );

    if (!isValid) return null;

    const payloadStr = new TextDecoder().decode(base64UrlToArr(payloadB64));
    const payload = JSON.parse(payloadStr);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  let user = null;

  if (token) {
    user = await verifyJWTEdge(token);
  }

  const url = request.nextUrl.clone();

  // Protect dashboard and admin pages
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin')) {
    if (!user) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from login/register pages
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/register')) {
    if (user) {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/widget|api/ai|widget.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
