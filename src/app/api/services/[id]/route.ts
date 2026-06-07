import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  duration_minutes: z.number().optional(),
  is_bookable: z.boolean().optional(),
  is_active: z.boolean().optional(),
  price: z.number().nullable().optional(),
  price_min: z.number().nullable().optional(),
  price_max: z.number().nullable().optional(),
  display_price: z.boolean().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const json = await request.json();
    const validation = updateSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const {
      name, description, category, duration_minutes, is_bookable, is_active,
      price, price_min, price_max, display_price
    } = validation.data;

    // Verify ownership
    const service = await db.service.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId
      }
    });

    if (!service) return NextResponse.json({ error: 'Hizmet bulunamadı.' }, { status: 404 });

    // 1. Update Service properties using Prisma
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (duration_minutes !== undefined) updateData.durationMinutes = duration_minutes;
    if (is_bookable !== undefined) updateData.isBookable = is_bookable;
    if (is_active !== undefined) updateData.isActive = is_active;

    const updatedSvc = await db.service.update({
      where: { id: id },
      data: updateData
    });

    // 2. Update Pricing properties
    const pricingData: any = {};
    if (price !== undefined) pricingData.price = price;
    if (price_min !== undefined) pricingData.priceMin = price_min;
    if (price_max !== undefined) pricingData.priceMax = price_max;
    if (display_price !== undefined) pricingData.displayPrice = display_price;

    if (Object.keys(pricingData).length > 0) {
      await db.servicePrice.updateMany({
        where: {
          serviceId: id,
          businessId: authCtx.businessId
        },
        data: pricingData
      });
    }

    // Return combined result
    const newPrice = await db.servicePrice.findFirst({
      where: { serviceId: id }
    });

    return NextResponse.json({
      id: updatedSvc.id,
      business_id: updatedSvc.businessId,
      name: updatedSvc.name,
      description: updatedSvc.description,
      category: updatedSvc.category,
      duration_minutes: updatedSvc.durationMinutes,
      is_bookable: updatedSvc.isBookable,
      is_active: updatedSvc.isActive,
      price: newPrice?.price || null,
      price_min: newPrice?.priceMin || null,
      price_max: newPrice?.priceMax || null,
      display_price: newPrice?.displayPrice !== undefined ? newPrice.displayPrice : true
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    // Verify ownership
    const service = await db.service.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId
      }
    });

    if (!service) return NextResponse.json({ error: 'Hizmet bulunamadı.' }, { status: 404 });

    // Hard delete service
    await db.service.delete({
      where: { id: id }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
