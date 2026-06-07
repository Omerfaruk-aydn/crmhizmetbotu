import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';
import { z } from 'zod';

const appointmentSchema = z.object({
  customerId: z.string().uuid(),
  conversationId: z.string().uuid().nullable().optional(),
  serviceId: z.string().uuid().nullable().optional(),
  requestedDate: z.string(),
  requestedTime: z.string(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(5),
  note: z.string().optional(),
  status: z.string().default('new')
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
    updated_at: appt.updatedAt,
    services: appt.service ? { name: appt.service.name } : null
  };
}

export async function GET(request: Request) {
  try {
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.businessId) {
      return NextResponse.json({ error: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const appts = await db.appointment.findMany({
      where: { businessId: authCtx.businessId },
      include: {
        service: {
          select: { name: true }
        }
      },
      orderBy: [
        { requestedDate: 'asc' },
        { requestedTime: 'asc' }
      ]
    });

    return NextResponse.json(appts.map(mapAppointmentToDb));
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
    const validation = appointmentSchema.safeParse(json);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const {
      customerId, conversationId, serviceId, requestedDate, requestedTime,
      customerName, customerPhone, note, status
    } = validation.data;

    const appt = await db.appointment.create({
      data: {
        businessId: authCtx.businessId,
        customerId,
        conversationId: conversationId || null,
        serviceId: serviceId || null,
        requestedDate,
        requestedTime,
        customerName,
        customerPhone,
        note: note || null,
        status,
        sourceChannel: 'agent' // manual entry
      }
    });

    return NextResponse.json(mapAppointmentToDb(appt));
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
