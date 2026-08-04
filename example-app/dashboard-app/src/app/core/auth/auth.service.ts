import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { createAuthClient } from 'better-auth/client';
import { environment } from '@env/environment';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly client = createAuthClient({
    baseURL: environment.authBaseUrl,
    sessionOptions: {
      refetchOnWindowFocus: true,
      refetchInterval: 0,
    },
  });
  
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _isLoading = signal(true);
  private readonly _error = signal<string | null>(null);
  
  readonly user = this._user.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  
  async initialize(): Promise<void> {
    this._isLoading.set(true);
    try {
      const { data } = await this.client.getSession();
      this._user.set((data?.user as AuthUser) ?? null);
    } catch {
      this._user.set(null);
    } finally {
      this._isLoading.set(false);
    }
  }
  
  async signIn(email: string, password: string): Promise<void> {
    this._error.set(null);
    this._isLoading.set(true);
    const { data, error } = await this.client.signIn.email({ email, password });
    this._isLoading.set(false);
    if (error) {
      this._error.set(error.message ?? 'Sign in failed');
      return;
    }
    this._user.set((data?.user as AuthUser) ?? null);
    await this.router.navigateByUrl(environment.loginRedirect);
  }
  
  async signOut(): Promise<void> {
    await this.client.signOut();
    this._user.set(null);
    await this.router.navigateByUrl('/login');
  }
  
  clearError(): void {
    this._error.set(null);
  }
}
