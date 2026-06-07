import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthContext } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    // Get current session user
    const authCtx = await getAuthContext();
    if (!authCtx || !authCtx.user) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Lütfen giriş yapın.' }, { status: 401 });
    }
    const user = authCtx.user;

    const body = await request.json();
    const {
      businessInfo,
      brandTone,
      workingHours,
      services,
      faqs,
      handoffRules
    } = body;

    if (!businessInfo?.name || !businessInfo?.sector) {
      return NextResponse.json({ error: 'İşletme adı ve sektör zorunludur.' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = businessInfo.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Create Business
    const business = await db.business.create({
      data: {
        name: businessInfo.name,
        slug: uniqueSlug,
        sector: businessInfo.sector,
        phone: businessInfo.phone || null,
        whatsappNumber: businessInfo.whatsapp || null,
        instagramHandle: businessInfo.instagram || null,
        website: businessInfo.website || null,
        address: businessInfo.address || null,
        brandTone: brandTone || 'Professional',
        status: 'active'
      }
    });

    const businessId = business.id;

    // 2. Link user to business as owner
    await db.businessUser.create({
      data: {
        businessId: businessId,
        userId: user.id,
        role: 'business_owner'
      }
    });

    // 3. Create services and service prices
    if (services && services.length > 0) {
      for (const svc of services) {
        const insertedSvc = await db.service.create({
          data: {
            businessId: businessId,
            name: svc.name,
            description: svc.description || null,
            category: businessInfo.sector,
            durationMinutes: svc.duration ? parseInt(svc.duration) : 30,
            isBookable: svc.isBookable !== undefined ? svc.isBookable : true,
            isActive: true
          }
        });

        if (svc.price) {
          await db.servicePrice.create({
            data: {
              businessId: businessId,
              serviceId: insertedSvc.id,
              price: parseFloat(svc.price),
              currency: 'TRY',
              displayPrice: svc.displayPrice !== undefined ? svc.displayPrice : true
            }
          });
        }
      }
    }

    // 4. Create Q&A FAQs as Knowledge Base Items
    if (faqs && faqs.length > 0) {
      const kbItems = faqs.map((faq: any) => ({
        businessId: businessId,
        title: faq.question,
        content: faq.answer,
        category: faq.category || 'Genel',
        sourceType: 'manual',
        isActive: true
      }));

      await db.knowledgeBaseItem.createMany({
        data: kbItems
      });
    }

    // 5. Create Handoff rules inside Knowledge Base
    const rulesToInsert = [];
    if (handoffRules) {
      if (handoffRules.complaint) {
        rulesToInsert.push({
          businessId: businessId,
          title: 'Kural: Şikayetlerde İnsan Devri',
          content: 'Müşteri herhangi bir hizmet, personel veya ödeme konusunda şikayette bulunursa, tartışmaya girmeden empati kurun ve görüşmeyi derhal insan temsilciye devredin.',
          category: 'İnsan Devri',
          isActive: true
        });
      }
      if (handoffRules.refund) {
        rulesToInsert.push({
          businessId: businessId,
          title: 'Kural: Ödeme ve İade Talepleri',
          content: 'Ödeme problemleri, iade istekleri veya fiyat indirim pazarlıklarında AI yetkisizdir. Bu konular doğrudan insan temsilciye aktarılmalıdır.',
          category: 'İnsan Devri',
          isActive: true
        });
      }
      if (handoffRules.sensitive) {
        rulesToInsert.push({
          businessId: businessId,
          title: 'Kural: Sağlık ve Hassas Konular',
          content: 'Cilt hastalıkları, alerjiler veya tıbbi tedavi sorularında kesinlikle tıbbi tanı koymayın. Görüşmeyi detaylar için insan uzmanımıza devredin.',
          category: 'İnsan Devri',
          isActive: true
        });
      }
    }

    if (rulesToInsert.length > 0) {
      await db.knowledgeBaseItem.createMany({
        data: rulesToInsert
      });
    }

    // Initialize default tags
    await db.tag.createMany({
      data: [
        { businessId: businessId, name: 'Yeni Mesaj', color: '#3b82f6' },
        { businessId: businessId, name: 'Fiyat Sordu', color: '#f59e0b' },
        { businessId: businessId, name: 'Randevu İstiyor', color: '#10b981' },
        { businessId: businessId, name: 'Şikayet / Destek', color: '#ef4444' }
      ]
    });

    // Create a default subscription (Starter plan, active)
    await db.subscription.create({
      data: {
        businessId: businessId,
        plan: 'starter',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000) // 30 days
      }
    });

    return NextResponse.json({ success: true, businessId, slug: uniqueSlug });
  } catch (err: any) {
    console.error('Onboarding API error:', err);
    return NextResponse.json({ error: err.message || 'Onboarding tamamlanırken hata oluştu.' }, { status: 500 });
  }
}
