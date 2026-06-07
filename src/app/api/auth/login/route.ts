import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    // Find user profile
    const user = await db.profile.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Hatalı e-posta adresi veya şifre.' }, { status: 400 });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Hatalı e-posta adresi veya şifre.' }, { status: 400 });
    }

    // Sign JWT Token
    const token = signToken({ userId: user.id, email: user.email });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Check if user has an associated business
    const userBusiness = await db.businessUser.findFirst({
      where: { userId: user.id }
    });

    return NextResponse.json({
      success: true,
      hasBusiness: !!userBusiness
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Giriş yapılırken beklenmedik bir hata oluştu.' }, { status: 500 });
  }
}
