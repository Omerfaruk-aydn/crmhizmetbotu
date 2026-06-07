import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

function mapBusinessToWidgetDb(biz: any) {
  if (!biz) return null;
  return {
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    sector: biz.sector,
    phone: biz.phone,
    address: biz.address,
    primary_color: biz.primaryColor,
    brand_tone: biz.brandTone
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'slug parametresi gereklidir.' }, { status: 400 });
    }

    const business = await db.business.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        sector: true,
        phone: true,
        address: true,
        primaryColor: true,
        brandTone: true
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'İşletme bulunamadı.' }, { status: 404 });
    }

    return NextResponse.json(mapBusinessToWidgetDb(business));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
