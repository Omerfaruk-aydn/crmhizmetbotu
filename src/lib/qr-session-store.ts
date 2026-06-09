/**
 * Shared in-memory store for QR connect sessions.
 * Kept in a separate module so it can be imported by both the API route and the ig-auth page route.
 */

export type QRStatus = 'pending' | 'scanned' | 'logging_in' | 'collecting' | 'saving' | 'done' | 'error' | 'expired';

export interface QRSession {
  token: string;
  status: QRStatus;
  message: string;
  progress: number;
  businessId: string;
  username?: string;
  error?: string;
  createdAt: number;
  expiresAt: number;
  cookies?: any[];
}

// Global map — persists across requests in the same Node.js process
export const qrSessions = new Map<string, QRSession>();

// Cleanup expired sessions every 30 seconds
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [token, session] of qrSessions.entries()) {
      if (session.expiresAt < now && session.status !== 'done') {
        qrSessions.set(token, { ...session, status: 'expired', message: 'QR süresi doldu.' });
        // Delete after another 5 minutes
        setTimeout(() => qrSessions.delete(token), 5 * 60 * 1000);
      }
    }
  }, 30_000);
}
