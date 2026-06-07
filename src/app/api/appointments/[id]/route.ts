import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['new', 'pending_confirmation', 'confirmed', 'cancelled', 'completed'])
});

function mapAppointmentToDb(appt: any) {
  if (!appt) return null;
  return {
    id: appt.id,
    business_id: appt.businessId,
    customer_id: appt.customerId,
    conversation_id: appt.conversationId,
    service_id: appt.serviceId,
    requested_date: appt.requestedDate,
    requested_time: appt.requestedTime,
    customer_name: appt.customerName,
    customer_phone: appt.customerPhone,
    note: appt.note,
    source_channel: appt.sourceChannel,
    status: appt.status,
    assigned_to: appt.assignedTo,
    created_at: appt.createdAt,
    updated_at: appt.updatedAt
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

    // Verify ownership and update status using Prisma
    const appt = await db.appointment.findFirst({
      where: {
        id: id,
        businessId: authCtx.businessId
      }
    });

    if (!appt) return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });

    const updatedAppt = await db.appointment.update({
      where: { id: id },
      data: { status: validation.data.status }
    });

    return NextResponse.json(mapAppointmentToDb(updatedAppt));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
