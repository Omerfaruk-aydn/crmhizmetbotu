import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { z } from 'zod';

const businessSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.').optional(),
  phone: z.string().nullable().optional(),
  whatsapp_number: z.string().nullable().optional(),
  instagram_handle: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  brand_tone: z.string().optional(),
  primary_color: z.string().optional()
});

function mapBusinessToDb(biz: any) {
  if (!biz) return null;
  return {
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    sector: biz.sector,
    phone: biz.phone,
    whatsapp_number: biz.whatsappNumber,
    instagram_handle: biz.instagramHandle,
    website: biz.website,
    address: biz.address,
    location_url: biz.locationUrl,
    timezone: biz.timezone,
    brand_tone: biz.brandTone,
    primary_color: biz.primaryColor,
    status: biz.status,
    created_at: biz.createdAt,
    updated_at: biz.updatedAt,
    deleted_at: biz.deletedAt
  };
}

export async function GET(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim veya işletme bulunamadı.' }, { status: 401 });
    }

    const business = await db.business.findUnique({
      where: { id: authCtx.businessId }
    });

    if (!business) {
      return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(mapBusinessToDb(business));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const json = await request.json();
    const validation = businessSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const updateData: any = {};
    if (validation.data.name !== undefined) updateData.name = validation.data.name;
    if (validation.data.phone !== undefined) updateData.phone = validation.data.phone;
    if (validation.data.whatsapp_number !== undefined) updateData.whatsappNumber = validation.data.whatsapp_number;
    if (validation.data.instagram_handle !== undefined) updateData.instagramHandle = validation.data.instagram_handle;
    if (validation.data.website !== undefined) updateData.website = validation.data.website;
    if (validation.data.address !== undefined) updateData.address = validation.data.address;
    if (validation.data.brand_tone !== undefined) updateData.brandTone = validation.data.brand_tone;
    if (validation.data.primary_color !== undefined) updateData.primaryColor = validation.data.primary_color;

    const updatedBiz = await db.business.update({
      where: { id: authCtx.businessId },
      data: updateData
    });

    return NextResponse.json(mapBusinessToDb(updatedBiz));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
