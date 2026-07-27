/**
 * Push Notification Service
 */

import { mobileApi, API_ENDPOINTS, endpoints } from './api';

export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'payment_received'
  | 'payment_failed'
  | 'travel_reminder'
  | 'supplier_update'
  | 'ai_recommendation'
  | 'review_request'
  | 'general';

export interface PushNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

export interface NotificationSettings {
  bookingUpdates: boolean;
  paymentUpdates: boolean;
  travelReminders: boolean;
  aiRecommendations: boolean;
  promotions: boolean;
  email: boolean;
  push: boolean;
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private permissionGranted = false;

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';

      if (this.permissionGranted) {
        // In production: Get FCM token
        this.fcmToken = `fcm_${Date.now()}`;
        await this.registerDevice();
        this.setupForegroundHandler();
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async registerDevice(): Promise<void> {
    if (!this.fcmToken) return;

    try {
      await mobileApi.post('/api/v1/notifications/register-device', {
        fcmToken: this.fcmToken,
        platform: this.getPlatform(),
      });
    } catch { /* ignore */ }
  }

  private getPlatform(): 'ios' | 'android' | 'web' {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('iphone') || ua.includes('ipad')) return 'ios';
    if (ua.includes('android')) return 'android';
    return 'web';
  }

  private setupForegroundHandler(): void {
    // In production: Set up Firebase onMessage handler
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const response = await mobileApi.get<{ settings: NotificationSettings }>(
        API_ENDPOINTS.notifications.settings
      );
      return response.data?.settings || this.getDefaultSettings();
    } catch {
      return this.getDefaultSettings();
    }
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<boolean> {
    try {
      const response = await mobileApi.patch(API_ENDPOINTS.notifications.settings, settings);
      return response.success;
    } catch {
      return false;
    }
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      bookingUpdates: true,
      paymentUpdates: true,
      travelReminders: true,
      aiRecommendations: true,
      promotions: false,
      email: true,
      push: true,
    };
  }

  async getNotifications(limit = 20): Promise<PushNotification[]> {
    try {
      const response = await mobileApi.get<{ notifications: PushNotification[] }>(
        `${API_ENDPOINTS.notifications.list}?limit=${limit}`
      );
      return response.data?.notifications || [];
    } catch {
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await mobileApi.post(endpoints.notificationMarkRead(notificationId));
      return response.success;
    } catch {
      return false;
    }
  }

  async markAllAsRead(): Promise<boolean> {
    try {
      const response = await mobileApi.post(API_ENDPOINTS.notifications.list + '/read-all');
      return response.success;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return this.fcmToken;
  }

  isEnabled(): boolean {
    return this.permissionGranted && !!this.fcmToken;
  }
}

export const pushNotifications = new PushNotificationService();
