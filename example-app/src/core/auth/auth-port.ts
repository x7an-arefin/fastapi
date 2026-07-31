// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ╚══════════════════════════════════════════════════════════════════════╝
/**
 * AuthPort — interface for the authentication adapter.
 * The concrete implementation (BetterAuth) is injected behind this interface,
 * making it easy to swap or mock during testing.
 */
export interface SessionData {
  userId: string;
  sessionId: string;
  expiresAt: Date;
  roles: string[];
  permissions: string[];
}

export interface AuthPort {
  /**
   * Verify a session token and return session data.
   * Returns null if the session is invalid or expired.
   */
  verifySession(token: string): Promise<SessionData | null>;

  /**
   * Create a new session after successful login.
   */
  createSession(userId: string): Promise<{ token: string; session: SessionData }>;

  /**
   * Invalidate a session (logout / revocation).
   */
  revokeSession(sessionId: string): Promise<void>;
}
