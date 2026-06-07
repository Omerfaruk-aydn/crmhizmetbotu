import { db } from '@/lib/db';
import { compileSystemPrompt } from './prompts';
import { generateCompletion, AIResponseSchema } from './provider';

interface ProcessMessageParams {
  businessId: string;
  sourceChannel: 'web' | 'whatsapp' | 'instagram';
  customerExternalId?: string; // e.g. Phone number or Instagram ID
  customerName?: string;
  messageContent: string;
}

export async function processIncomingMessage({
  businessId,
  sourceChannel,
  customerExternalId,
  customerName,
  messageContent
}: ProcessMessageParams) {
  // 1. Fetch Business Context
  const business = await db.business.findUnique({
    where: { id: businessId }
  });

  if (!business) {
    throw new Error(`Business not found: ${businessId}`);
  }

  // 2. Find or Create Customer
  let customer: any = null;
  const extField = sourceChannel === 'whatsapp' ? 'phone' : sourceChannel === 'instagram' ? 'instagramId' : 'externalId';
  const queryVal = customerExternalId || 'anonymous-web-user';

  const existingCust = await db.customer.findFirst({
    where: {
      businessId,
      [extField]: queryVal,
      deletedAt: null
    }
  });

  if (existingCust) {
    customer = existingCust;
  } else {
    // Create new customer
    customer = await db.customer.create({
      data: {
        businessId,
        name: customerName || (sourceChannel === 'web' ? 'Web Ziyaretçisi' : 'Yeni Müşteri'),
        [extField]: queryVal,
        sourceChannel,
        status: 'lead',
        leadScore: 0
      }
    });
  }

  // 3. Find or Create Conversation
  let conversation = await db.conversation.findFirst({
    where: {
      businessId,
      customerId: customer.id,
      status: 'active'
    }
  });

  if (!conversation) {
    // Check for any recent handoff conversation. If in handoff, don't auto-reply
    const handoffConv = await db.conversation.findFirst({
      where: {
        businessId,
        customerId: customer.id,
        status: 'handoff'
      }
    });

    if (handoffConv) {
      conversation = handoffConv;
    } else {
      // Create new conversation
      conversation = await db.conversation.create({
        data: {
          businessId,
          customerId: customer.id,
          channel: sourceChannel,
          status: 'active',
          aiEnabled: true
        }
      });
    }
  }

  // 4. Save Customer's Incoming Message
  await db.message.create({
    data: {
      businessId,
      conversationId: conversation.id,
      customerId: customer.id,
      senderType: 'customer',
      content: messageContent
    }
  });

  // 5. If AI is disabled for this conversation (e.g. in human handoff mode), stop auto-reply
  if (!conversation.aiEnabled) {
    return {
      reply: null,
      ai_enabled: false,
      conversationId: conversation.id,
      customerId: customer.id
    };
  }

  // 6. Load services catalogue
  const services = await db.service.findMany({
    where: {
      businessId,
      isActive: true
    },
    include: {
      prices: true
    }
  });

  const formattedServices = services.map(s => {
    const p = s.prices?.[0];
    return {
      name: s.name,
      description: s.description || undefined,
      duration_minutes: s.durationMinutes,
      price: p?.price ?? undefined,
      price_min: p?.priceMin ?? undefined,
      price_max: p?.priceMax ?? undefined,
      display_price: p?.displayPrice !== false,
      is_bookable: s.isBookable
    };
  });

  // 7. Load knowledge base FAQs & rules
  const kbItems = await db.knowledgeBaseItem.findMany({
    where: {
      businessId,
      isActive: true,
      deletedAt: null
    }
  });

  const formattedFaqs = kbItems.map(k => ({
    question: k.title,
    answer: k.content,
    category: k.category
  }));

  // 8. Fetch last 10 messages for context history
  const historyMsgs = await db.message.findMany({
    where: {
      conversationId: conversation.id
    },
    select: {
      senderType: true,
      content: true
    },
    orderBy: {
      createdAt: 'asc'
    },
    take: 10
  });

  const chatHistory = historyMsgs
    .filter(m => m.senderType === 'customer' || m.senderType === 'ai')
    .map(m => ({
      role: (m.senderType === 'ai' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: m.content
    }));

  // Remove the last user message from history context as it is added separately
  if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].content === messageContent) {
    chatHistory.pop();
  }

  // 9. Compile system prompt
  const systemPrompt = compileSystemPrompt(
    {
      name: business.name,
      sector: business.sector || '',
      phone: business.phone || '',
      whatsapp_number: business.whatsappNumber || '',
      instagram_handle: business.instagramHandle || '',
      address: business.address || '',
      brand_tone: business.brandTone
    },
    formattedServices,
    formattedFaqs
  );

  // 10. Generate completion from AI
  const aiOutput: AIResponseSchema = await generateCompletion(systemPrompt, messageContent, chatHistory);

  // 11. Write AI Reply to Database
  const aiMsg = await db.message.create({
    data: {
      businessId,
      conversationId: conversation.id,
      customerId: customer.id,
      senderType: 'ai',
      content: aiOutput.reply,
      intent: aiOutput.intent,
      aiConfidence: aiOutput.confidence,
      metadata: {
        risk_level: aiOutput.risk_level,
        next_action: aiOutput.next_action,
        detected_entities: aiOutput.detected_entities
      }
    }
  });

  // 12. Save usage logs
  await db.aiLog.create({
    data: {
      businessId,
      conversationId: conversation.id,
      messageId: aiMsg.id,
      provider: process.env.OPENAI_API_KEY ? 'openai' : 'local-mock',
      model: process.env.OPENAI_MODEL_NAME || 'gpt-4o-mini',
      intent: aiOutput.intent,
      confidence: aiOutput.confidence,
      riskLevel: aiOutput.risk_level,
      rawResponse: aiOutput as any
    }
  });

  // Increment Usage Log counter
  await db.usageLog.create({
    data: {
      businessId,
      usageType: 'ai_message',
      quantity: 1
    }
  });

  // ==========================================
  // CRM STATE ACTIONS
  // ==========================================

  // A. Lead Scoring
  const oldScore = customer.leadScore || 0;
  if (aiOutput.lead_score_delta !== 0) {
    const newScore = Math.min(100, Math.max(0, oldScore + aiOutput.lead_score_delta));
    
    // Update score
    await db.customer.update({
      where: { id: customer.id },
      data: { leadScore: newScore }
    });

    // Log event
    await db.leadEvent.create({
      data: {
        businessId,
        customerId: customer.id,
        conversationId: conversation.id,
        eventType: aiOutput.intent || 'unknown',
        scoreDelta: aiOutput.lead_score_delta,
        description: `AI tespit edilen niyet (intent): ${aiOutput.intent}. Puan değişimi: ${aiOutput.lead_score_delta}`
      }
    });

    // Check if customer became a Hot Lead (score crosses 60)
    if (oldScore < 60 && newScore >= 60) {
      // Trigger Hot Lead notification
      await db.notification.create({
        data: {
          businessId,
          type: 'hot_lead',
          title: '🔥 Sıcak Fırsat Yakalandı!',
          body: `${customer.name} isimli müşteri randevuya çok yaklaştı! Lead skoru: ${newScore}/100.`,
          metadata: { customer_id: customer.id, conversation_id: conversation.id }
        }
      });
    }
  }

  // B. Trigger Appointment Request
  if (aiOutput.appointment_request && aiOutput.appointment_request.service_name) {
    const ar = aiOutput.appointment_request;
    
    // Check if service exists
    const matchingSvc = services.find(s => s.name.toLowerCase().includes(ar.service_name!.toLowerCase()));

    // Insert Appointment
    await db.appointment.create({
      data: {
        businessId,
        customerId: customer.id,
        conversationId: conversation.id,
        serviceId: matchingSvc?.id || null,
        requestedDate: ar.date || new Date().toISOString().split('T')[0],
        requestedTime: ar.time ? `${ar.time}:00` : '12:00:00',
        customerName: ar.customer_name || customer.name,
        customerPhone: ar.customer_phone || customer.phone || queryVal,
        status: 'new',
        sourceChannel: sourceChannel
      }
    });

    // Create Notification
    await db.notification.create({
      data: {
        businessId,
        type: 'appointment_requested',
        title: '🗓️ Yeni Randevu Talebi!',
        body: `${ar.customer_name || customer.name} isimli müşteri ${ar.service_name} için randevu talep etti.`,
        metadata: { customer_id: customer.id, conversation_id: conversation.id }
      }
    });
  }

  // C. Trigger Human Handoff (El-Devri)
  if (aiOutput.should_handoff) {
    // 1. Update conversation status
    await db.conversation.update({
      where: { id: conversation.id },
      data: {
        status: 'handoff',
        aiEnabled: false
      }
    });

    // 2. Insert Handoff record
    await db.handoff.create({
      data: {
        businessId,
        conversationId: conversation.id,
        customerId: customer.id,
        reason: aiOutput.handoff_reason || 'AI güven düzeyi düşük veya şikayet konusu.',
        priority: aiOutput.risk_level === 'high' ? 'high' : 'medium',
        status: 'open'
      }
    });

    // 3. Create System notice message in chat log
    await db.message.create({
      data: {
        businessId,
        conversationId: conversation.id,
        customerId: customer.id,
        senderType: 'system',
        content: `⚠️ Sohbet yapay zekadan çıkarıldı. İnsan temsilci devri (Handoff) başlatıldı. Sebep: ${aiOutput.handoff_reason || 'Kritik Konu'}`
      }
    });

    // 4. Create Notification
    await db.notification.create({
      data: {
        businessId,
        type: 'handoff_required',
        title: '⚠️ Müşteri İnsan Temsilci Bekliyor!',
        body: `${customer.name} için yapay zekâ yanıtı durduruldu. Acil devralınması bekleniyor.`,
        metadata: { customer_id: customer.id, conversation_id: conversation.id }
      }
    });
  }

  // D. Handle tags and customer updates from AI schema
  if (aiOutput.customer_update) {
    const { status: newStatus, tags: newTags } = aiOutput.customer_update;
    
    // Update status if present
    if (newStatus) {
      await db.customer.update({
        where: { id: customer.id },
        data: { status: newStatus }
      });
    }

    // Save tags (insert tag if not exists, link tags)
    if (newTags && newTags.length > 0) {
      for (const tName of newTags) {
        // Find tag
        const existingTag = await db.tag.findFirst({
          where: {
            businessId,
            name: tName
          }
        });

        let tagId = existingTag?.id;
        if (!tagId) {
          // Create tag
          const newTag = await db.tag.create({
            data: { businessId, name: tName, color: '#6b7280' }
          });
          tagId = newTag.id;
        }

        // Link tag to customer
        if (tagId) {
          try {
            await db.customerTag.create({
              data: { businessId, customerId: customer.id, tagId }
            });
          } catch (err) {
            // Avoid duplicates crash
          }
        }
      }
    }
  }

  // Update conversation last message timestamp
  await db.conversation.update({
    where: { id: conversation.id },
    data: { lastMessageAt: new Date() }
  });

  return {
    reply: aiOutput.reply,
    ai_enabled: !aiOutput.should_handoff,
    conversationId: conversation.id,
    customerId: customer.id
  };
}
