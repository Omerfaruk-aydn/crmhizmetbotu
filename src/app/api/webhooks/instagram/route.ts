import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processIncomingMessage } from '@/lib/ai/engine';

// GET: Webhook Verification by Meta for Instagram
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');
    const businessId = searchParams.get('businessId');

    if (mode === 'subscribe' && token) {
      // 1. Verify using global token first
      const globalVerifyToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'OtoCevapVerifyToken2026';
      if (token === globalVerifyToken) {
        console.log('Instagram webhook verified globally using application token.');
        return new Response(challenge, { status: 200 });
      }

      // 2. Fallback to business-specific token
      if (businessId) {
        const integration = await db.integration.findFirst({
          where: {
            businessId,
            provider: 'instagram'
          }
        });

        if (integration && integration.status === 'active') {
          const config = integration.config as any;
          const dbVerifyToken = config?.verifyToken;

          if (dbVerifyToken && dbVerifyToken === token) {
            console.log('Instagram webhook verified successfully for business:', businessId);
            return new Response(challenge, { status: 200 });
          }
        }
      }

      return new Response('Verification token mismatch', { status: 403 });
    }

    return new Response('Invalid webhook verify request', { status: 400 });
  } catch (err: any) {
    console.error('Instagram webhook GET verification error:', err);
    return new Response(err.message || 'Internal Server Error', { status: 500 });
  }
}

// POST: Receive Incoming Instagram DM from Meta
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    const body = await request.json();

    // Check if this is an Instagram Messaging event
    if (body.object === 'instagram') {
      const entry = body.entry?.[0];
      const messagingEvent = entry?.messaging?.[0];
      const message = messagingEvent?.message;

      // Extract details and process if it is a text message and has text body
      if (messagingEvent && message && message.text) {
        const senderId = messagingEvent.sender?.id; // Scoped user ID (IGSID)
        const recipientId = messagingEvent.recipient?.id; // Instagram Business Account ID
        const entryId = entry?.id; // Fallback Instagram Business Account ID
        const targetIgAccountId = recipientId || entryId;

        if (!targetIgAccountId) {
          console.error('Instagram webhook error: Could not resolve Instagram Business Account ID');
          return NextResponse.json({ error: 'Could not resolve Instagram Business Account ID' }, { status: 400 });
        }

        // Resolve businessId and pageAccessToken
        let resolvedBusinessId = businessId;
        let resolvedPageAccessToken = null;

        if (resolvedBusinessId) {
          // URL-specified business lookup
          const integration = await db.integration.findFirst({
            where: { businessId: resolvedBusinessId, provider: 'instagram' }
          });
          if (integration && integration.status === 'active') {
            const config = integration.config as any;
            resolvedPageAccessToken = config?.pageAccessToken;
          }
        } else {
          // SaaS lookup: search active integrations for matching instagramBusinessAccountId
          const integrations = await db.integration.findMany({
            where: { provider: 'instagram', status: 'active' }
          });

          const matchedIntegration = integrations.find(ig => {
            const cfg = ig.config as any;
            return cfg?.instagramBusinessAccountId === targetIgAccountId;
          });

          if (matchedIntegration) {
            resolvedBusinessId = matchedIntegration.businessId;
            const config = matchedIntegration.config as any;
            resolvedPageAccessToken = config?.pageAccessToken;
          }
        }

        if (!resolvedBusinessId || !resolvedPageAccessToken) {
          console.error(`Instagram webhook error: business/credentials not found for IG Account ${targetIgAccountId}`);
          return NextResponse.json({ error: 'Instagram integration not found or inactive' }, { status: 404 });
        }

        const messageText = message.text;
        
        // Process message through AI Response Engine
        const result = await processIncomingMessage({
          businessId: resolvedBusinessId,
          sourceChannel: 'instagram',
          customerExternalId: senderId,
          customerName: 'Instagram Müşterisi',
          messageContent: messageText
        });

        // Dispatch reply to Instagram DM if generated
        if (result.reply) {
          const metaUrl = `https://graph.facebook.com/v21.0/me/messages?access_token=${resolvedPageAccessToken}`;
          
          const metaRes = await fetch(metaUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipient: {
                id: senderId
              },
              message: {
                text: result.reply
              }
            })
          });

          if (!metaRes.ok) {
            const metaError = await metaRes.json();
            console.error('Instagram Meta API response error:', metaError);
            throw new Error(metaError.error?.message || 'Meta API call failed');
          }
        }

        return NextResponse.json({ success: true, conversationId: result.conversationId });
      }
    }

    return NextResponse.json({ success: true, note: 'Not an Instagram messaging event' });
  } catch (err: any) {
    console.error('Instagram webhook POST processing error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
