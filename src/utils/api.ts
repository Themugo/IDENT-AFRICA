/**
 * API Client Utilities
 * 
 * Centralized API communication layer with error handling,
 * authentication support, and type safety.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  details?: string;
  status: number;
}

const API_BASE_URL = '/api';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = this.getStoredToken();
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private setStoredToken(token: string | null): void {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Add auth token if available
    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok || !data.success) {
        throw {
          message: data.error || 'Request failed',
          details: data.details,
          status: response.status,
        };
      }

      return data.data as T;
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error',
        details: 'Unable to connect to the server',
        status: 0,
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{
    token: string;
    user: { id: string; email: string; name: string; role: string };
  }> {
    const data = await this.request<{
      token: string;
      user: { id: string; email: string; name: string; role: string };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setStoredToken(data.token);
    return data;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setStoredToken(null);
    }
  }

  async getCurrentUser(): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
  } | null> {
    if (!this.token) return null;

    try {
      return await this.request('/auth/me');
    } catch {
      this.setStoredToken(null);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Exchange rates
  async getExchangeRates(): Promise<{
    rates: Record<string, { rate: number; symbol: string; prefix: boolean }>;
    source: string;
    lastUpdated: string;
  }> {
    return this.request('/exchange-rates');
  }

  // Admin stats
  async getAdminStats(): Promise<{
    totalRevenueUSD: number;
    activeExpeditionsCount: number;
    totalTravelersCount: number;
    verifiedRangersCount: number;
    popularParksCount: number;
    monthlyBookings: { month: string; bookings: number; revenueUSD: number }[];
    pendingSupplierApplications: number;
    pendingBookingApprovals: number;
    recentRefunds: number;
  }> {
    return this.request('/admin/stats');
  }

  // Database health
  async checkDatabaseHealth(): Promise<{
    database: { status: string; latency?: number; error?: string };
    timestamp: string;
  }> {
    return this.request('/db/health');
  }

  // AI Planner
  async generateItinerary(params: {
    budgetPerPersonUSD: number;
    durationDays: number;
    travelersCount: number;
    travelMonth: string;
    countries: string[];
    wildlifePriorities: string[];
    luxuryLevel: string;
    interests?: string[];
    specialInterests?: string;
  }): Promise<unknown> {
    return this.request('/ai-planner', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for custom instances
export { ApiClient };
