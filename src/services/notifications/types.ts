/**
 * Notification Types
 * 
 * Type definitions for notification system.
 */

// Notification channels
export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push';

// Notification types
export type NotificationType = 
  | 'booking_confirmation'
  | 'booking_cancellation'
  | 'payment_received'
  | 'payment_failed'
  | 'booking_reminder'
  | 'supplier_message'
  | 'admin_message'
  | 'promotion'
  | 'system_alert'
  | 'review_request';

// Notification status
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

// User types
export type UserType = 'customer' | 'supplier' | 'admin';

// Message types
export type MessageType = 'text' | 'system' | 'booking_update';

// Notification
export interface Notification {
  id: string;
  recipientId: string;
  recipientType: UserType;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  message: string;
  metadata?: Record<string, unknown>;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status: NotificationStatus;
  statusDetails?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

// Message
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: UserType;
  senderName?: string;
  recipientId?: string;
  recipientType?: UserType;
  content: string;
  messageType: MessageType;
  attachments?: Attachment[];
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
}

// Attachment
export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

// Conversation
export interface Conversation {
  id: string;
  participant: string;
  participantType?: UserType;
  lastMessage?: string;
  unreadCount: number;
  updatedAt: string;
}

// Notification Template
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  templateBody: string;
  templateVariables?: string[];
  isActive: boolean;
  priority: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Push Token
export interface PushToken {
  id: string;
  userId: string;
  userType: UserType;
  token: string;
  deviceType?: 'ios' | 'android' | 'web';
  deviceName?: string;
  isActive: boolean;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Email Subscription
export interface EmailSubscription {
  id: string;
  email: string;
  subscribed: boolean;
  subscribedAt?: string;
  unsubscribedAt?: string;
  preferences: {
    promotions: boolean;
    newsletter: boolean;
    bookingUpdates: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Notification Stats
export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  byChannel: Record<NotificationChannel, number>;
  byType: Record<NotificationType, number>;
}

// Send notification request
export interface SendNotificationRequest {
  recipientId: string;
  recipientType?: UserType;
  recipientEmail?: string;
  recipientPhone?: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  message: string;
  metadata?: Record<string, unknown>;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// Send message request
export interface SendMessageRequest {
  conversationId?: string;
  senderId: string;
  senderType?: UserType;
  senderName?: string;
  recipientId?: string;
  recipientType?: UserType;
  content: string;
  messageType?: MessageType;
  attachments?: Attachment[];
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// Create template request
export interface CreateTemplateRequest {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string;
  templateBody: string;
  templateVariables?: string[];
  priority?: number;
  createdBy?: string;
}
