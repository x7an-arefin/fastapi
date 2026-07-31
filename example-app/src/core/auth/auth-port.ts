export interface SessionData {
  userId: string;
  sessionId: string;
  expiresAt: Date;
  roles: string[];
  permissions: string[];
}

export interface AuthPort {
  verifySession(token: string): Promise<SessionData | null>;

  /**
   * @author arefin
   * @description Create a new authenticated session for a user and return session data
   */
  createSession(userId: string): Promise<{ token: string; session: SessionData }>;

  revokeSession(sessionId: string): Promise<void>;
}
