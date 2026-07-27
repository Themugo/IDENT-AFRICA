/**
 * Mobile API Service
 * 
 * Versioned API client for IDENT AFRICA mobile applications.
 */

const API_VERSION = 'v1';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.identafrica.com';

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
  },
  users: {
    profile: '/api/v1/users/profile',
    update: '/api/v1/users/profile',
  },
  destinations: {
    list: '/api/v1/destinations',
    search: '/api/v1/destinations/search',
    featured: '/api/v1/destinations/featured',
  },
  packages: {
    list: '/api/v1/packages',
    search: '/api/v1/packages/search',
  },
  bookings: {
    list: '/api/v1/bookings',
    create: '/api/v1/bookings',
  },
  payments: {
    create: '/api/v1/payments/create',
  },
  notifications: {
    list: '/api/v1/notifications',
    settings: '/api/v1/notifications/settings',
  },
  favorites: {
    list: '/api/v1/favorites',
    add: '/api/v1/favorites',
  },
};

// Helper functions for dynamic endpoints
export const endpoints = {
  destinationDetail: (id: string) => `/api/v1/destinations/${id}`,
  packageDetail: (id: string) => `/api/v1/packages/${id}`,
  bookingDetail: (id: string) => `/api/v1/bookings/${id}`,
  bookingCancel: (id: string) => `/api/v1/bookings/${id}/cancel`,
  paymentVerify: (provider: string, ref: string) => `/api/v1/payments/verify/${provider}/${ref}`,
  notificationMarkRead: (id: string) => `/api/v1/notifications/${id}/read`,
  favoriteRemove: (id: string) => `/api/v1/favorites/${id}`,
};

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// API Client
class MobileApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = true
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Platform': 'mobile',
    };

    if (requiresAuth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(this.buildUrl(endpoint), {
        ...options,
        headers: { ...headers, ...options.headers },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: data.message || 'Request failed',
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network request failed',
        },
      };
    }
  }

  async get<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, requiresAuth);
  }

  async post<T>(endpoint: string, body?: unknown, requiresAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, requiresAuth);
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const mobileApi = new MobileApiClient();
export const api = { endpoints: API_ENDPOINTS, client: mobileApi };
