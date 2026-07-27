/**
 * Mobile Authentication Service
 */

import { mobileApi, API_ENDPOINTS } from './api';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'supplier' | 'admin';
}

class MobileAuthService {
  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private user: User | null = null;

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await mobileApi.post<{ tokens: AuthTokens; user: User }>(
        API_ENDPOINTS.auth.login,
        { email, password },
        false
      );

      if (response.success && response.data) {
        this.accessToken = response.data.tokens.accessToken;
        this.refreshTokenValue = response.data.tokens.refreshToken;
        this.user = response.data.user;
        mobileApi.setAccessToken(this.accessToken);
        this.saveToStorage();
        return { success: true, user: this.user };
      }

      return { success: false, error: response.error?.message || 'Login failed' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }

  async register(data: { email: string; password: string; name: string }): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await mobileApi.post<{ tokens: AuthTokens; user: User }>(
        API_ENDPOINTS.auth.register,
        data,
        false
      );

      if (response.success && response.data) {
        this.accessToken = response.data.tokens.accessToken;
        this.refreshTokenValue = response.data.tokens.refreshToken;
        this.user = response.data.user;
        mobileApi.setAccessToken(this.accessToken);
        this.saveToStorage();
        return { success: true, user: this.user };
      }

      return { success: false };
    } catch {
      return { success: false };
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshTokenValue) return false;

    try {
      const response = await mobileApi.post<{ tokens: AuthTokens }>(
        API_ENDPOINTS.auth.refresh,
        { refreshToken: this.refreshTokenValue },
        false
      );

      if (response.success && response.data) {
        this.accessToken = response.data.tokens.accessToken;
        this.refreshTokenValue = response.data.tokens.refreshToken;
        mobileApi.setAccessToken(this.accessToken);
        this.saveToStorage();
        return true;
      }

      await this.logout();
      return false;
    } catch {
      await this.logout();
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await mobileApi.post(API_ENDPOINTS.auth.logout);
    } catch { /* ignore */ }
    
    this.accessToken = null;
    this.refreshTokenValue = null;
    this.user = null;
    mobileApi.setAccessToken(null);
    this.clearStorage();
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.loadFromStorage();
    }
    return this.accessToken;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ident_access_token', this.accessToken || '');
      localStorage.setItem('ident_refresh_token', this.refreshTokenValue || '');
      if (this.user) {
        localStorage.setItem('ident_user', JSON.stringify(this.user));
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    this.accessToken = localStorage.getItem('ident_access_token') || null;
    this.refreshTokenValue = localStorage.getItem('ident_refresh_token') || null;
    
    const userJson = localStorage.getItem('ident_user');
    if (userJson) {
      try {
        this.user = JSON.parse(userJson);
      } catch { /* ignore */ }
    }

    if (this.accessToken) {
      mobileApi.setAccessToken(this.accessToken);
    }
  }

  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ident_access_token');
      localStorage.removeItem('ident_refresh_token');
      localStorage.removeItem('ident_user');
    }
  }
}

export const authService = new MobileAuthService();
