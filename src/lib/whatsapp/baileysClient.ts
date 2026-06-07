/**
 * WhatsApp Baileys Client
 * Normal (kişisel) WhatsApp hesabıyla çalışır. Business hesabı gerektirmez.
 * Her businessId için ayrı session saklanır.
 */

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  isJidBroadcast,
  WAMessage,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';
import { EventEmitter } from 'events';

// In-memory store for active sockets per business
const activeSockets: Map<string, ReturnType<typeof makeWASocket>> = new Map();
const qrCodes: Map<string, string> = new Map();
const connectionStatuses: Map<string, 'disconnected' | 'connecting' | 'qr_pending' | 'connected'> = new Map();
const eventEmitter = new EventEmitter();

const SESSION_BASE_DIR = path.join(process.cwd(), '.wa-sessions');

function getSessionDir(businessId: string) {
  return path.join(SESSION_BASE_DIR, businessId);
}

export function getQRCode(businessId: string): string | null {
  return qrCodes.get(businessId) || null;
}

export function getConnectionStatus(businessId: string) {
  return connectionStatuses.get(businessId) || 'disconnected';
}

export function onMessage(handler: (businessId: string, from: string, name: string, text: string) => void) {
  eventEmitter.on('message', ({ businessId, from, name, text }) => {
    handler(businessId, from, name, text);
  });
}

export async function sendWhatsAppMessage(businessId: string, to: string, text: string): Promise<boolean> {
  const socket = activeSockets.get(businessId);
  if (!socket) {
    console.error(`[Baileys] No active socket for business ${businessId}`);
    return false;
  }
  try {
    // Normalize phone number to JID
    const jid = to.includes('@') ? to : `${to.replace(/\D/g, '')}@s.whatsapp.net`;
    await socket.sendMessage(jid, { text });
    return true;
  } catch (err) {
    console.error(`[Baileys] sendMessage error for ${businessId}:`, err);
    return false;
  }
}

export async function disconnectWhatsApp(businessId: string): Promise<void> {
  const socket = activeSockets.get(businessId);
  if (socket) {
    await socket.logout();
    activeSockets.delete(businessId);
    qrCodes.delete(businessId);
    connectionStatuses.set(businessId, 'disconnected');
    // Clean session files
    const sessionDir = getSessionDir(businessId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  }
}

export async function connectWhatsApp(businessId: string): Promise<void> {
  // Avoid duplicate connections
  if (activeSockets.has(businessId)) {
    console.log(`[Baileys] Already connected for ${businessId}`);
    return;
  }

  connectionStatuses.set(businessId, 'connecting');

  const sessionDir = getSessionDir(businessId);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const socket = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, {
        level: 'silent' as any,
        error: console.error,
        warn: console.warn,
        info: console.info,
        debug: console.debug,
        trace: console.debug,
        child: () => ({
          level: 'silent' as any,
          error: console.error,
          warn: console.warn,
          info: console.info,
          debug: console.debug,
          trace: console.debug,
          child: () => ({ level: 'silent' } as any),
        }),
      }),
    },
    printQRInTerminal: false,
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
  });

  activeSockets.set(businessId, socket);

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Generate QR code as data URL
      try {
        const QRCode = (await import('qrcode')).default;
        const dataUrl = await QRCode.toDataURL(qr);
        qrCodes.set(businessId, dataUrl);
        connectionStatuses.set(businessId, 'qr_pending');
        console.log(`[Baileys] QR code generated for ${businessId}`);
      } catch (err) {
        console.error('[Baileys] QR generation error:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`[Baileys] Connection closed for ${businessId}. Status: ${statusCode}. Reconnect: ${shouldReconnect}`);

      activeSockets.delete(businessId);
      qrCodes.delete(businessId);

      if (shouldReconnect) {
        connectionStatuses.set(businessId, 'disconnected');
        // Auto reconnect after 3s
        setTimeout(() => connectWhatsApp(businessId), 3000);
      } else {
        connectionStatuses.set(businessId, 'disconnected');
        // Remove session on logout
        const sessionDir = getSessionDir(businessId);
        if (fs.existsSync(sessionDir)) {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        }
      }
    }

    if (connection === 'open') {
      connectionStatuses.set(businessId, 'connected');
      qrCodes.delete(businessId);
      console.log(`[Baileys] ✅ WhatsApp connected for business ${businessId}`);
    }
  });

  socket.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message) continue;
      if (msg.key.fromMe) continue;
      if (isJidBroadcast(msg.key.remoteJid || '')) continue;

      const from = msg.key.remoteJid || '';
      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        '';

      if (!text) continue;

      const pushName = msg.pushName || 'WhatsApp Kullanıcısı';

      console.log(`[Baileys] Message from ${from}: ${text}`);

      eventEmitter.emit('message', {
        businessId,
        from,
        name: pushName,
        text,
      });
    }
  });
}

export function hasSession(businessId: string): boolean {
  const sessionDir = getSessionDir(businessId);
  return fs.existsSync(sessionDir) && fs.readdirSync(sessionDir).length > 0;
}
