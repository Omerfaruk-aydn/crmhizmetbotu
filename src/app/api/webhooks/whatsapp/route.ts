import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processIncomingMessage } from '@/lib/ai/engine';

// GET: Webhook Verification by Meta
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return new Response('businessId is required', { status: 400 });
    }

    if (mode === 'subscribe' && token) {
      // Fetch integration configuration from database
      const integration = await db.integration.findFirst({
        where: {
          businessId,
          provider: 'whatsapp'
        }
      });

      if (!integration || integration.status !== 'active') {
        return new Response('WhatsApp integration is not active for this business', { status: 403 });
      }

      const config = integration.config as any;
      const dbVerifyToken = config?.verifyToken;

      if (dbVerifyToken && dbVerifyToken === token) {
        console.log('WhatsApp webhook verified successfully for business:', businessId);
        return new Response(challenge, { status: 200 });
      } else {
        return new Response('Verification token mismatch', { status: 403 });
      }
    }

    return new Response('Invalid webhook verify request', { status: 400 });
  } catch (err: any) {
    console.error('WhatsApp webhook GET verification error:', err);
    return new Response(err.message || 'Internal Server Error', { status: 500 });
  }
}

// POST: Receive Incoming WhatsApp Message from Meta
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'businessId is required' }, { status: 400 });
    }

    // Fetch integration configuration
    const integration = await db.integration.findFirst({
      where: {
        businessId,
        provider: 'whatsapp'
      }
    });

    if (!integration || integration.status !== 'active') {
      return NextResponse.json({ error: 'WhatsApp integration is not active' }, { status: 400 });
    }

    const config = integration.config as any;
    const accessToken = config?.accessToken;
    const dbPhoneNumberId = config?.phoneNumberId;

    if (!accessToken) {
      return NextResponse.json({ error: 'WhatsApp accessToken not configured' }, { status: 400 });
    }

    const body = await request.json();

    // Check if this is a WhatsApp Message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      // We only process incoming text messages
      if (message && message.type === 'text') {
        const senderPhone = message.from; // Sender wa_id / phone number
        const messageText = message.text.body;
        const senderName = value.contacts?.[0]?.profile?.name || 'WhatsApp Kullanıcısı';
        const webhookPhoneNumberId = value.metadata?.phone_number_id;

        // Use the configured phone number ID, fallback to the incoming one if not specified in db
        const activePhoneNumberId = dbPhoneNumberId || webhookPhoneNumberId;

        if (!activePhoneNumberId) {
          return NextResponse.json({ error: 'phone_number_id not found' }, { status: 400 });
        }

        // Process message through AI Response Engine
        const result = await processIncomingMessage({
          businessId,
          sourceChannel: 'whatsapp',
          customerExternalId: senderPhone,
          customerName: senderName,
          messageContent: messageText
        });

        // Dispatch reply to WhatsApp if it is generated and AI is enabled
        if (result.reply) {
          const metaUrl = `https://graph.facebook.com/v21.0/${activePhoneNumberId}/messages`;
          
          const metaRes = await fetch(metaUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: senderPhone,
              type: 'text',
              text: {
                body: result.reply
              }
            })
          });

          if (!metaRes.ok) {
            const metaError = await metaRes.json();
            console.error('Meta API response error:', metaError);
            throw new Error(metaError.error?.message || 'Meta API call failed');
          }
        }

        return NextResponse.json({ success: true, conversationId: result.conversationId });
      }
    }

    return NextResponse.json({ success: true, note: 'Not a WhatsApp message event' });
  } catch (err: any) {
    console.error('WhatsApp webhook POST processing error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
