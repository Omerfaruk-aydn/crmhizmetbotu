import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.'),
  description: z.string().optional(),
  category: z.string().optional(),
  duration_minutes: z.number().min(5, 'Süre en az 5 dakika olmalıdır.').default(30),
  is_bookable: z.boolean().default(true),
  is_active: z.boolean().default(true),
  price: z.number().nullable().optional(),
  price_min: z.number().nullable().optional(),
  price_max: z.number().nullable().optional(),
  display_price: z.boolean().default(true)
});

export async function GET(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    // Fetch services joined with service prices
    const services = await db.service.findMany({
      where: {
        businessId: authCtx.businessId,
        isActive: true
      },
      include: {
        prices: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format output
    const formatted = services.map(s => {
      const p = s.prices?.[0] || null;
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        duration_minutes: s.durationMinutes,
        is_bookable: s.isBookable,
        is_active: s.isActive,
        price: p?.price || null,
        price_min: p?.priceMin || null,
        price_max: p?.priceMax || null,
        currency: p?.currency || 'TRY',
        display_price: p?.displayPrice !== undefined ? p.displayPrice : true,
        price_id: p?.id || null
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const json = await request.json();
    const validation = serviceSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { name, description, category, duration_minutes, is_bookable, is_active, price, price_min, price_max, display_price } = validation.data;

    // 1. Insert Service using Prisma
    const newSvc = await db.service.create({
      data: {
        businessId: authCtx.businessId,
        name,
        description: description || null,
        category: category || null,
        durationMinutes: duration_minutes,
        isBookable: is_bookable,
        isActive: is_active
      }
    });

    // 2. Insert Price details
    const newPrice = await db.servicePrice.create({
      data: {
        businessId: authCtx.businessId,
        serviceId: newSvc.id,
        price: price || null,
        priceMin: price_min || null,
        priceMax: price_max || null,
        displayPrice: display_price,
        currency: 'TRY'
      }
    });

    return NextResponse.json({
      id: newSvc.id,
      business_id: newSvc.businessId,
      name: newSvc.name,
      description: newSvc.description,
      category: newSvc.category,
      duration_minutes: newSvc.durationMinutes,
      is_bookable: newSvc.isBookable,
      is_active: newSvc.isActive,
      price: newPrice.price,
      price_min: newPrice.priceMin,
      price_max: newPrice.priceMax,
      currency: newPrice.currency,
      display_price: newPrice.displayPrice,
      price_id: newPrice.id
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
