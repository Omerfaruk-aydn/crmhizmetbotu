import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedClient, sendIgMessage } from '@/lib/instagram';
import { processIncomingMessage } from '@/lib/ai/engine';

export const dynamic = 'force-dynamic';

/**
 * GET /api/instagram/poll
 * Polls the unofficial Instagram inbox for new messages and processes replies.
 */
export async function GET(req: Request) {
  // Simple token authorization to protect this endpoint from public spam
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const expectedToken = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || 'OtoCevapVerifyToken2026';

  if (token !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch active integrations
    const integrations = await db.integration.findMany({
      where: { provider: 'instagram', status: 'active' }
    });

    console.log(`[Instagram Poll] Found ${integrations.length} active Instagram integrations.`);

    let processedCount = 0;
    let replyCount = 0;

    for (const integration of integrations) {
      const businessId = integration.businessId;
      const config = integration.config as any;
      const lastProcessedMessages = config.lastProcessedMessages || {};

      try {
        const ig = await getAuthenticatedClient(businessId);
        const loggedInUserId = ig.state.cookieUserId;

        // Fetch direct inbox threads
        const inboxFeed = ig.feed.directInbox();
        const threads = await inboxFeed.items();

        const updatedLastProcessed = { ...lastProcessedMessages };
        let hasChanges = false;

        for (const thread of threads) {
          const threadId = thread.thread_id;
          const lastItem = thread.last_permanent_item;

          if (!lastItem) continue;

          // Only handle text messages
          if (lastItem.item_type === 'text') {
            const lastItemId = lastItem.item_id;
            const senderUserId = lastItem.user_id.toString();
            
            const isFromCustomer = senderUserId !== loggedInUserId;
            const lastProcessedId = lastProcessedMessages[threadId];
            const isNew = lastProcessedId !== lastItemId;

            if (isFromCustomer && isNew) {
              console.log(`[Instagram Poll] New message in thread ${threadId} from user ${senderUserId}: "${lastItem.text}"`);

              // Get customer details
              const customerUser = thread.users?.find((u: any) => u.pk.toString() === senderUserId);
              const customerName = customerUser?.full_name || customerUser?.username || 'Instagram Müşterisi';

              // Process message with AI Response Engine
              const result = await processIncomingMessage({
                businessId,
                sourceChannel: 'instagram',
                customerExternalId: senderUserId,
                customerName,
                messageContent: lastItem.text || ''
              });

              processedCount++;

              if (result.reply) {
                // Send reply using private API
                await sendIgMessage(businessId, threadId, result.reply);
                replyCount++;
              }

              // Update state
              updatedLastProcessed[threadId] = lastItemId;
              hasChanges = true;
            } else if (!isFromCustomer) {
              // If the last message was sent by the bot/owner, mark it as processed so we don't reply to it
              if (lastProcessedId !== lastItemId) {
                updatedLastProcessed[threadId] = lastItemId;
                hasChanges = true;
              }
            }
          }
        }

        // Save updated processed message mapping
        if (hasChanges) {
          await db.integration.update({
            where: { id: integration.id },
            data: {
              config: {
                ...config,
                lastProcessedMessages: updatedLastProcessed
              }
            }
          });
        }
      } catch (err: any) {
        console.error(`[Instagram Poll] Error polling for business ${businessId}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      replies: replyCount
    });
  } catch (err: any) {
    console.error('[Instagram Poll] Internal Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
