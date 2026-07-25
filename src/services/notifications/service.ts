/**
 * Notification Service
 * 
 * Service for managing notifications and messages.
 */

import type {
  Notification,
  Message,
  Conversation,
  NotificationTemplate,
  NotificationStats,
  SendNotificationRequest,
  SendMessageRequest,
  CreateTemplateRequest,
} from './types';

const API_BASE = '/api/notifications';

/**
 * Notification Service
 */
class NotificationService {
  /**
   * Get notifications
   */
  async getNotifications(options: {
    userId?: string;
    userType?: string;
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const params = new URLSearchParams();
    if (options.userId) params.set('userId', options.userId);
    if (options.userType) params.set('userType', options.userType);
    if (options.status) params.set('status', options.status);
    if (options.type) params.set('type', options.type);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const res = await fetch(`${API_BASE}?${params}`);
    const data = await res.json();
    
    return data.success ? data.data : { notifications: [], total: 0, unreadCount: 0 };
  }

  /**
   * Send notification
   */
  async send(request: SendNotificationRequest): Promise<Notification> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send notification');
    }

    return data.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${notificationId}/read`, { method: 'PUT' });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to mark notification as read');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to mark all as read');
    }
  }

  /**
   * Delete notification
   */
  async delete(notificationId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${notificationId}`, { method: 'DELETE' });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete notification');
    }
  }

  /**
   * Get messages
   */
  async getMessages(options: {
    userId?: string;
    conversationId?: string;
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ messages: Message[]; total: number; conversations: Conversation[] }> {
    const params = new URLSearchParams();
    if (options.userId) params.set('userId', options.userId);
    if (options.conversationId) params.set('conversationId', options.conversationId);
    if (options.unreadOnly) params.set('unreadOnly', 'true');
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const res = await fetch(`${API_BASE}/messages?${params}`);
    const data = await res.json();
    
    return data.success ? data.data : { messages: [], total: 0, conversations: [] };
  }

  /**
   * Get conversations list
   */
  async getConversations(userId: string, userType?: string): Promise<Conversation[]> {
    const params = new URLSearchParams({ userId });
    if (userType) params.set('userType', userType);

    const res = await fetch(`${API_BASE}/conversations?${params}`);
    const data = await res.json();
    
    return data.success ? data.data.conversations : [];
  }

  /**
   * Send message
   */
  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send message');
    }

    return data.data;
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/messages/${messageId}/read`, { method: 'PUT' });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to mark message as read');
    }
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/messages/conversation/${conversationId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to mark conversation as read');
    }
  }

  /**
   * Get templates
   */
  async getTemplates(options: {
    type?: string;
    channel?: string;
    activeOnly?: boolean;
  } = {}): Promise<NotificationTemplate[]> {
    const params = new URLSearchParams();
    if (options.type) params.set('type', options.type);
    if (options.channel) params.set('channel', options.channel);
    if (options.activeOnly !== false) params.set('activeOnly', 'true');

    const res = await fetch(`${API_BASE}/templates?${params}`);
    const data = await res.json();
    
    return data.success ? data.data.templates : [];
  }

  /**
   * Create template
   */
  async createTemplate(request: CreateTemplateRequest): Promise<NotificationTemplate> {
    const res = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create template');
    }

    return data.data;
  }

  /**
   * Register push token
   */
  async registerPushToken(
    userId: string,
    token: string,
    options: {
      userType?: string;
      deviceType?: string;
      deviceName?: string;
    } = {}
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/push-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token, ...options }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to register push token');
    }
  }

  /**
   * Remove push token
   */
  async removePushToken(userId: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/push-tokens`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, token }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to remove push token');
    }
  }

  /**
   * Get statistics
   */
  async getStats(userId?: string): Promise<NotificationStats> {
    const params = userId ? `?userId=${userId}` : '';
    const res = await fetch(`${API_BASE}/stats${params}`);
    const data = await res.json();
    
    return data.success ? data.data : {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      byChannel: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };
  }
}

export const notificationService = new NotificationService();
