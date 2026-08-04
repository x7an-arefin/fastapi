import { AuthService } from '@core/auth/auth.service';
export function authInitFactory(auth: AuthService): () => Promise<void> {
  return () => auth.initialize();
}
