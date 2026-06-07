import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessId } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'İşletme ID gereklidir.' }, { status: 400 });
    }

    // 1. Fetch tags for color matching
    const dbTags = await db.tag.findMany({
      where: { businessId },
      select: { id: true, name: true }
    });

    const findTagId = (name: string) => dbTags?.find(t => t.name === name)?.id;

    // 2. Fetch services to link service IDs
    const dbSvcs = await db.service.findMany({
      where: { businessId },
      select: { id: true, name: true }
    });

    const ciltBakimiId = dbSvcs?.find(s => s.name.toLowerCase().includes('cilt'))?.id;
    const manikurId = dbSvcs?.find(s => s.name.toLowerCase().includes('manikür'))?.id;

    // ==========================================
    // CUSTOMER 1: Merve Yılmaz (Randevu & Sıcak Müşteri)
    // ==========================================
    const customer1 = await db.customer.create({
      data: {
        businessId,
        name: 'Merve Yılmaz',
        phone: '+905329998877',
        email: 'merve.yilmaz@gmail.com',
        sourceChannel: 'whatsapp',
        status: 'lead',
        leadScore: 95,
        notes: 'Cilt bakımı fiyatı sordu, yarın 14:00 için randevu talep etti, telefon bıraktı.'
      }
    });

    // Conversation 1
    const conv1 = await db.conversation.create({
      data: {
        businessId,
        customerId: customer1.id,
        channel: 'whatsapp',
        status: 'active',
        aiEnabled: true
      }
    });

    // Messages for Merve
    await db.message.createMany({
      data: [
        {
          businessId,
          conversationId: conv1.id,
          customerId: customer1.id,
          senderType: 'customer',
          content: 'Merhaba, cilt bakımı işlemleriniz ve güncel fiyatlarınız hakkında bilgi alabilir miyim?',
          intent: 'price_question'
        },
        {
          businessId,
          conversationId: conv1.id,
          customerId: customer1.id,
          senderType: 'ai',
          content: 'Merhaba Merve Hanım! Cilt bakımı seansımız 60 dakika sürmektedir ve gözenek temizliği, nemlendirici maskeler içerir. Fiyatı 1200 TL\'dir. Sizin için bir randevu oluşturmamı ister misiniz?',
          intent: 'service_info',
          aiConfidence: 0.95
        },
        {
          businessId,
          conversationId: conv1.id,
          customerId: customer1.id,
          senderType: 'customer',
          content: 'Evet çok iyi olur. Yarın saat 14:00 uygun mudur? Adım Merve Yılmaz, telefonum 0532 999 8877.',
          intent: 'appointment_request'
        },
        {
          businessId,
          conversationId: conv1.id,
          customerId: customer1.id,
          senderType: 'ai',
          content: 'Harika! Yarın saat 14:00 için cilt bakımı ön randevu talebiniz sisteme kaydedilmiştir. Ekibimiz kesin onay için sizinle 0532 999 8877 numaranızdan iletişime geçecektir. Keyifli günler dileriz! 🌸',
          intent: 'appointment_request',
          aiConfidence: 0.98
        }
      ]
    });

    // Appointment Request 1
    await db.appointment.create({
      data: {
        businessId,
        customerId: customer1.id,
        conversationId: conv1.id,
        serviceId: ciltBakimiId || null,
        requestedDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
        requestedTime: '14:00:00',
        customerName: 'Merve Yılmaz',
        customerPhone: '+905329998877',
        status: 'new',
        sourceChannel: 'whatsapp'
      }
    });

    // Tag relations
    const priceTagId = findTagId('Fiyat Sordu');
    const apptTagId = findTagId('Randevu İstiyor');
    if (priceTagId) {
      await db.customerTag.create({
        data: {
          businessId,
          customerId: customer1.id,
          tagId: priceTagId
        }
      });
    }
    if (apptTagId) {
      await db.customerTag.create({
        data: {
          businessId,
          customerId: customer1.id,
          tagId: apptTagId
        }
      });
    }

    // Lead Events
    await db.leadEvent.createMany({
      data: [
        { businessId, customerId: customer1.id, conversationId: conv1.id, eventType: 'price_question', scoreDelta: 10, description: 'Cilt bakımı fiyatı soruldu.' },
        { businessId, customerId: customer1.id, conversationId: conv1.id, eventType: 'phone_provided', scoreDelta: 25, description: 'Telefon paylaşıldı.' },
        { businessId, customerId: customer1.id, conversationId: conv1.id, eventType: 'appointment_requested', scoreDelta: 40, description: 'Randevu talebi oluşturuldu.' }
      ]
    });

    // ==========================================
    // CUSTOMER 2: Ahmet Kaya (Şikayet & El-Devri Handoff)
    // ==========================================
    const customer2 = await db.customer.create({
      data: {
        businessId,
        name: 'Ahmet Kaya',
        phone: '+905051112233',
        email: 'ahmet.kaya@gmail.com',
        sourceChannel: 'instagram',
        status: 'lead',
        leadScore: 40,
        notes: 'Cilt bakımı seansı sonrası kızarıklık şikayeti var. İnsan temsilci bekliyor.'
      }
    });

    // Conversation 2
    const conv2 = await db.conversation.create({
      data: {
        businessId,
        customerId: customer2.id,
        channel: 'instagram',
        status: 'handoff',
        aiEnabled: false
      }
    });

    // Messages
    await db.message.createMany({
      data: [
        {
          businessId,
          conversationId: conv2.id,
          customerId: customer2.id,
          senderType: 'customer',
          content: 'İyi günler, geçen hafta sizde cilt bakımı yaptırmıştım ancak cildimde yoğun kızarıklık oluştu. Hiç memnun kalmadım, yetkili biriyle görüşmek istiyorum.',
          intent: 'complaint'
        },
        {
          businessId,
          conversationId: conv2.id,
          customerId: customer2.id,
          senderType: 'ai',
          content: 'Geçmiş olsun Ahmet Bey! Yaşadığınız durum için üzgünüz. Sağlığınızı ve memnuniyetinizi çok önemsiyoruz. Size en doğru şekilde yardımcı olmak amacıyla bu görüşmeyi hemen işletme yöneticimize aktarıyorum. Kendisi en kısa sürede buradan size yazacaktır.',
          intent: 'complaint',
          aiConfidence: 0.97
        },
        {
          businessId,
          conversationId: conv2.id,
          customerId: customer2.id,
          senderType: 'system',
          content: '⚠️ Sohbet yapay zekadan çıkarıldı. İnsan temsilci devri (Handoff) başlatıldı.'
        }
      ]
    });

    // Handoff record
    await db.handoff.create({
      data: {
        businessId,
        conversationId: conv2.id,
        customerId: customer2.id,
        reason: 'Cilt tahrişi şikayeti ve yetkili görüşme isteği.',
        priority: 'high',
        status: 'open'
      }
    });

    // Tag relation
    const complaintTagId = findTagId('Şikayet / Destek');
    if (complaintTagId) {
      await db.customerTag.create({
        data: {
          businessId,
          customerId: customer2.id,
          tagId: complaintTagId
        }
      });
    }

    // ==========================================
    // CUSTOMER 3: Selin Deniz (Bilgi Alıyor / Cold)
    // ==========================================
    const customer3 = await db.customer.create({
      data: {
        businessId,
        name: 'Selin Deniz',
        phone: '+905554445566',
        email: 'selin.deniz@gmail.com',
        sourceChannel: 'web',
        status: 'lead',
        leadScore: 15,
        notes: 'Konum ve çalışma saatlerini sordu.'
      }
    });

    // Conversation 3
    const conv3 = await db.conversation.create({
      data: {
        businessId,
        customerId: customer3.id,
        channel: 'web',
        status: 'active',
        aiEnabled: true
      }
    });

    // Messages
    await db.message.createMany({
      data: [
        {
          businessId,
          conversationId: conv3.id,
          customerId: customer3.id,
          senderType: 'customer',
          content: 'Moda\'daki şubenizin açık adresi nedir ve otoparkınız var mı acaba?',
          intent: 'location_question'
        },
        {
          businessId,
          conversationId: conv3.id,
          customerId: customer3.id,
          senderType: 'ai',
          content: 'Merhaba Selin Hanım! Adresimiz: Caferağa Mah. Moda Cad. No:12 D:3 Kadıköy / İstanbul. Salonumuzun önünde müşterilerimiz için 2 araçlık ücretsiz otopark alanı mevcuttur. Yol tarifi ve harita konumumuz: https://maps.google.com/?q=Moda+Kadikoy+Istanbul',
          intent: 'location_question',
          aiConfidence: 0.99
        }
      ]
    });

    // Add usage logs for metrics
    await db.usageLog.createMany({
      data: [
        { businessId, usageType: 'ai_message', quantity: 15 },
        { businessId, usageType: 'handoff_agent', quantity: 1 }
      ]
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Seeding error:', err);
    return NextResponse.json({ error: err.message || 'Seeding failed.' }, { status: 500 });
  }
}
