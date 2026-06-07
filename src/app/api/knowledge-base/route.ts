import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { z } from 'zod';

const kbSchema = z.object({
  title: z.string().min(2, 'Başlık en az 2 karakter olmalıdır.'),
  content: z.string().min(5, 'İçerik en az 5 karakter olmalıdır.'),
  category: z.string().default('General'),
  priority: z.number().default(0),
  is_active: z.boolean().default(true)
});

function mapKbItemToDb(item: any) {
  if (!item) return null;
  return {
    id: item.id,
    business_id: item.businessId,
    title: item.title,
    content: item.content,
    category: item.category,
    tags: item.tags,
    priority: item.priority,
    is_active: item.isActive,
    source_type: item.sourceType,
    created_by: item.createdBy,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: item.deletedAt
  };
}

export async function GET(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const items = await db.knowledgeBaseItem.findMany({
      where: {
        businessId: authCtx.businessId,
        deletedAt: null
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(items.map(mapKbItemToDb));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId || !authCtx.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const json = await request.json();
    const validation = kbSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const newItem = await db.knowledgeBaseItem.create({
      data: {
        businessId: authCtx.businessId,
        title: validation.data.title,
        content: validation.data.content,
        category: validation.data.category,
        priority: validation.data.priority,
        isActive: validation.data.is_active,
        sourceType: 'manual',
        createdBy: authCtx.user.id
      }
    });

    return NextResponse.json(mapKbItemToDb(newItem));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
