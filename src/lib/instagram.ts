import { IgApiClient } from 'instagram-private-api';
import { db } from './db';

// Cache client instances by businessId to reuse connections in memory when possible
const clients: { [key: string]: IgApiClient } = {};

export function getIgClient(businessId: string, username: string): IgApiClient {
  if (!clients[businessId]) {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    
    // Apply proxy if configured
    const proxyUrl = process.env.INSTAGRAM_PROXY_URL;
    if (proxyUrl) {
      ig.state.proxyUrl = proxyUrl;
      console.log(`[Instagram Client] Using proxy: ${proxyUrl.includes('@') ? proxyUrl.split('@')[1] : proxyUrl}`);
    }
    
    clients[businessId] = ig;
  }
  return clients[businessId];
}

/**
 * Initializes and logs in to Instagram using saved session state or credentials.
 * Saves the session back to the database after successful login.
 */
export async function getAuthenticatedClient(businessId: string): Promise<IgApiClient> {
  const integration = await db.integration.findFirst({
    where: { businessId, provider: 'instagram' }
  });

  if (!integration || !integration.config) {
    throw new Error('Instagram entegrasyon ayarları bulunamadı.');
  }

  const config = integration.config as any;
  const { username, password, sessionState } = config;

  if (!username || !password) {
    throw new Error('Instagram kullanıcı adı veya şifresi eksik.');
  }

  const ig = getIgClient(businessId, username);

  let isLoggedIn = false;

  // Try deserializing existing session
  if (sessionState) {
    try {
      await ig.state.deserialize(sessionState);
      // Verify session is active by making a lightweight request
      await ig.feed.directInbox().items();
      isLoggedIn = true;
      console.log(`[Instagram Client] Session restored successfully for: ${username}`);
    } catch (err) {
      console.log(`[Instagram Client] Session expired or invalid for: ${username}. Re-authenticating...`);
    }
  }

  // If session is not active, log in using username & password
  if (!isLoggedIn) {
    try {
      await ig.simulate.preLoginFlow();
      await ig.account.login(username, password);
      process.nextTick(async () => await ig.simulate.postLoginFlow());

      // Save new session state to DB
      const serializedState = await ig.state.serialize();
      await db.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...config,
            sessionState: JSON.stringify(serializedState)
          }
        }
      });
      console.log(`[Instagram Client] Logged in successfully and saved session for: ${username}`);
    } catch (loginErr: any) {
      console.error(`[Instagram Client] Login failed for ${username}:`, loginErr);
      throw new Error(`Instagram girişi başarısız: ${loginErr.message || loginErr}`);
    }
  }

  return ig;
}

/**
 * Sends a direct message to a specific Instagram thread or user.
 */
export async function sendIgMessage(businessId: string, threadId: string, text: string): Promise<void> {
  try {
    const ig = await getAuthenticatedClient(businessId);
    const thread = ig.entity.directThread(threadId);
    await thread.broadcastText(text);
    console.log(`[Instagram Client] Message sent to thread ${threadId}: ${text}`);
  } catch (err: any) {
    console.error(`[Instagram Client] Failed to send message to thread ${threadId}:`, err);
    throw err;
  }
}
