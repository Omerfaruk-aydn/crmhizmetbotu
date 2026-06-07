import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/'
  });

  const url = new URL(request.url);
  url.pathname = '/login';

  return NextResponse.redirect(url, { status: 302 });
}
