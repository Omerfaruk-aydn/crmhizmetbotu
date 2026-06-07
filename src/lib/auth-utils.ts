import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function getAuthContext() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    const user = await db.profile.findUnique({
      where: { id: decoded.userId }
    });
    if (!user) return null;

    // Find associated business user relation
    const bizUser = await db.businessUser.findFirst({
      where: { userId: user.id },
      include: { business: true }
    });

    return {
      user,
      businessId: bizUser?.businessId || null,
      business: bizUser?.business || null,
      role: bizUser?.role || null
    };
  } catch (err: any) {
    // Suppress expected Next.js bailout errors during static generation of dynamic pages
    if (err?.message?.includes('Dynamic server usage') || err?.digest === 'DYNAMIC_SERVER_USAGE') {
      return null;
    }
    console.error('Error fetching auth context:', err);
    return null;
  }
}
