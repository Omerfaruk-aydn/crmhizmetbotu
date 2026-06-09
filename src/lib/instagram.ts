import { IgApiClient, IgCheckpointError, IgLoginBadPasswordError, IgLoginTwoFactorRequiredError } from 'instagram-private-api';
import { db } from './db';

// Cache client instances by businessId to reuse connections
const clients: { [key: string]: IgApiClient } = {};

// Track session health per businessId
const sessionHealth: { [key: string]: { lastCheck: number; healthy: boolean } } = {};
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function getIgClient(businessId: string, username: string): IgApiClient {
  if (!clients[businessId]) {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    
    // Apply proxy if configured
    const proxyUrl = process.env.INSTAGRAM_PROXY_URL;
    if (proxyUrl) {
      ig.state.proxyUrl = proxyUrl;
      console.log(`[Instagram] Proxy: ${proxyUrl.includes('@') ? proxyUrl.split('@')[1] : proxyUrl}`);
    } else {
      console.warn('[Instagram] No proxy configured. Consider adding INSTAGRAM_PROXY_URL.');
    }
    
    clients[businessId] = ig;
  }
  return clients[businessId];
}

export function clearIgClient(businessId: string): void {
  delete clients[businessId];
  delete sessionHealth[businessId];
}

/**
 * Returns true if the client session is likely still valid based on last check time.
 * Avoids hitting Instagram on every request.
 */
function isSessionLikelyHealthy(businessId: string): boolean {
  const health = sessionHealth[businessId];
  if (!health) return false;
  const elapsed = Date.now() - health.lastCheck;
  return health.healthy && elapsed < SESSION_CHECK_INTERVAL;
}

/**
 * Initializes and authenticates Instagram using saved session state or credentials.
 * Saves the session back to the database after successful login.
 */
export async function getAuthenticatedClient(businessId: string): Promise<IgApiClient> {
  const integration = await db.integration.findFirst({
    where: { businessId, provider: 'instagram' }
  });

  if (!integration || !integration.config) {
    throw new Error('Instagram entegrasyon ayarları bulunamadı. Lütfen bağlantıyı tekrar kurun.');
  }

  const config = integration.config as any;
  const { username, password, sessionState } = config;

  if (!username) {
    throw new Error('Instagram kullanıcı adı eksik.');
  }

  const ig = getIgClient(businessId, username);

  // Fast path: session was recently verified as healthy
  if (isSessionLikelyHealthy(businessId)) {
    return ig;
  }

  let isLoggedIn = false;

  // Try deserializing existing session
  if (sessionState) {
    try {
      await ig.state.deserialize(sessionState);
      // Verify session is active with a lightweight request
      await ig.feed.directInbox().items();
      isLoggedIn = true;
      sessionHealth[businessId] = { lastCheck: Date.now(), healthy: true };
      console.log(`[Instagram] Session restored for: ${username}`);
    } catch (err) {
      console.log(`[Instagram] Session expired for: ${username}. Re-authenticating...`);
      sessionHealth[businessId] = { lastCheck: Date.now(), healthy: false };
      clearIgClient(businessId);
      // Recreate client for fresh login
      const freshIg = getIgClient(businessId, username);
      Object.assign(ig, freshIg);
    }
  }

  // If session is not active and we have password, try fresh login
  if (!isLoggedIn && password) {
    try {
      const freshIg = getIgClient(businessId, username);
      await freshIg.simulate.preLoginFlow();
      await freshIg.account.login(username, password);
      
      process.nextTick(async () => {
        try { await freshIg.simulate.postLoginFlow(); } catch {}
      });

      // Save new session state to DB
      const serializedState = await freshIg.state.serialize();
      await db.integration.update({
        where: { id: integration.id },
        data: {
          config: {
            ...config,
            sessionState: JSON.stringify(serializedState)
          }
        }
      });

      sessionHealth[businessId] = { lastCheck: Date.now(), healthy: true };
      console.log(`[Instagram] Re-login successful for: ${username}`);
      return freshIg;
    } catch (loginErr: any) {
      sessionHealth[businessId] = { lastCheck: Date.now(), healthy: false };
      
      if (loginErr instanceof IgCheckpointError) {
        throw new Error(`Instagram güvenlik doğrulaması gerekiyor. Hesabı tarayıcıda manuel giriş yaparak onaylayın, ardından çerez yöntemiyle yeniden bağlayın.`);
      }
      if (loginErr instanceof IgLoginBadPasswordError) {
        throw new Error(`Instagram şifresi hatalı. Lütfen ayarlardan hesabı yeniden bağlayın.`);
      }
      
      console.error(`[Instagram] Re-login failed for ${username}:`, loginErr);
      throw new Error(`Instagram oturumu yenilenemedi: ${loginErr.message || loginErr}`);
    }
  }

  if (!isLoggedIn) {
    throw new Error('Instagram oturumu geçersiz. Lütfen ayarlardan hesabı yeniden bağlayın.');
  }

  return ig;
}

/**
 * Sends a direct message to a specific Instagram thread.
 */
export async function sendIgMessage(businessId: string, threadId: string, text: string): Promise<void> {
  try {
    const ig = await getAuthenticatedClient(businessId);
    const thread = ig.entity.directThread(threadId);
    await thread.broadcastText(text);
    console.log(`[Instagram] Message sent to thread ${threadId}`);
  } catch (err: any) {
    console.error(`[Instagram] Failed to send to thread ${threadId}:`, err);
    throw err;
  }
}
