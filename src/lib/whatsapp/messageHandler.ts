/**
 * WhatsApp Message Handler
 * Baileys'den gelen mesajları AI engine'e bağlar.
 * Bu modül, Next.js server startup'ında import edilerek
 * message event handler'ı kaydeder.
 */

import { onMessage, sendWhatsAppMessage } from './baileysClient';
import { processIncomingMessage } from '@/lib/ai/engine';

let initialized = false;

export function initWhatsAppMessageHandler() {
  if (initialized) return;
  initialized = true;

  console.log('[WhatsApp] Initializing message handler...');

  onMessage(async (businessId, from, name, text) => {
    console.log(`[WhatsApp] Processing message from ${name} (${from}): ${text}`);
    
    try {
      const result = await processIncomingMessage({
        businessId,
        sourceChannel: 'whatsapp',
        customerExternalId: from,
        customerName: name,
        messageContent: text,
      });

      if (result.reply) {
        const sent = await sendWhatsAppMessage(businessId, from, result.reply);
        if (sent) {
          console.log(`[WhatsApp] ✅ Reply sent to ${from}: ${result.reply.substring(0, 60)}...`);
        } else {
          console.error(`[WhatsApp] ❌ Failed to send reply to ${from}`);
        }
      }
    } catch (err) {
      console.error(`[WhatsApp] Error processing message from ${from}:`, err);
    }
  });
}
