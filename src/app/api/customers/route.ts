import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const whereClause: any = {
      businessId: authCtx.businessId,
      deletedAt: null
    };

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const customers = await db.customer.findMany({
      where: whereClause,
      include: {
        customerTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format tags joined mapping
    const formatted = customers.map(c => {
      const tags = (c.customerTags || [])
        .map((t: any) => t.tag ? { name: t.tag.name, color: t.tag.color } : null)
        .filter(Boolean);
        
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        source_channel: c.sourceChannel,
        status: c.status,
        lead_score: c.leadScore,
        notes: c.notes,
        created_at: c.createdAt,
        tags
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
