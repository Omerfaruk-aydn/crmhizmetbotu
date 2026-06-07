import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(2).optional(),
  content: z.string().min(5).optional(),
  category: z.string().optional(),
  priority: z.number().optional(),
  is_active: z.boolean().optional()
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

    // Verify ownership and get item
    const item = await db.knowledgeBaseItem.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId,
        deletedAt: null
      }
    });

    if (!item) return NextResponse.json({ error: 'Bilgi kartı bulunamadı.' }, { status: 404 });

    const updateData: any = {};
    if (validation.data.title !== undefined) updateData.title = validation.data.title;
    if (validation.data.content !== undefined) updateData.content = validation.data.content;
    if (validation.data.category !== undefined) updateData.category = validation.data.category;
    if (validation.data.priority !== undefined) updateData.priority = validation.data.priority;
    if (validation.data.is_active !== undefined) updateData.isActive = validation.data.is_active;

    const updatedItem = await db.knowledgeBaseItem.update({
      where: { id: id },
      data: updateData
    });

    return NextResponse.json(mapKbItemToDb(updatedItem));
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
    const item = await db.knowledgeBaseItem.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId,
        deletedAt: null
      }
    });

    if (!item) return NextResponse.json({ error: 'Bilgi kartı bulunamadı.' }, { status: 404 });

    // Soft delete
    await db.knowledgeBaseItem.update({
      where: { id: id },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
