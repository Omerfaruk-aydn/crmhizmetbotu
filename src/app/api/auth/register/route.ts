import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.profile.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda.' }, { status: 400 });
    }

    // Hash password & create user profile
    const passwordHash = await hashPassword(password);
    const user = await db.profile.create({
      data: {
        email,
        fullName,
        passwordHash
      }
    });

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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Kayıt işlemi sırasında bir hata oluştu.' }, { status: 500 });
  }
}
