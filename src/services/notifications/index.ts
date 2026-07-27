/**
 * Notification Service
 * 
 * Real-time notifications for suppliers and admins.
 */

// Types
export * from './types';

// Service
export { notificationService } from './service';

// Legacy store
export type NotificationType = 
  | 'new_booking'
  | 'booking_cancelled'
  | 'booking_confirmed'
  | 'payment_received'
  | 'payment_failed'
  | 'review_received'
  | 'review_approved'
  | 'payout_processed'
  | 'payout_failed'
  | 'document_uploaded'
  | 'verification_update'
  | 'supplier_approved'
  | 'supplier_rejected'
  | 'product_approved'
  | 'product_rejected'
  | 'system_alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
}

class NotificationStore {
  private suppliers: Map<string, Notification[]> = new Map();
  private admins: Notification[] = [];
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();

  addSupplierNotification(
    supplierId: string, 
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ): Notification {
    const fullNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const existing = this.suppliers.get(supplierId) || [];
    this.suppliers.set(supplierId, [fullNotification, ...existing].slice(0, 100));
    this.notifyListeners(`supplier:${supplierId}`, fullNotification);
    return fullNotification;
  }

  addAdminNotification(
    notification: Omit<Notification, 'id' | 'read' | 'createdAt'>
  ): Notification {
    const fullNotification: Notification = {
      ...notification,
      id: `notif_admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.admins = [fullNotification, ...this.admins].slice(0, 100);
    this.notifyListeners('admin', fullNotification);
    return fullNotification;
  }

  getSupplierNotifications(supplierId: string, limit = 20): Notification[] {
    return (this.suppliers.get(supplierId) || []).slice(0, limit);
  }

  getAdminNotifications(limit = 20): Notification[] {
    return this.admins.slice(0, limit);
  }

  markAsRead(target: 'supplier' | 'admin', id: string, supplierId?: string): void {
    if (target === 'supplier' && supplierId) {
      const notifications = this.suppliers.get(supplierId);
      if (notifications) {
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) notifications[index].read = true;
      }
    } else {
      const index = this.admins.findIndex(n => n.id === id);
      if (index !== -1) this.admins[index].read = true;
    }
  }

  getUnreadCount(target: 'supplier' | 'admin', supplierId?: string): number {
    if (target === 'supplier' && supplierId) {
      return (this.suppliers.get(supplierId) || []).filter(n => !n.read).length;
    }
    return this.admins.filter(n => !n.read).length;
  }

  subscribe(
    target: 'supplier' | 'admin', 
    id: string, 
    callback: (notification: Notification) => void
  ): () => void {
    const key = target === 'supplier' ? `supplier:${id}` : id;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);
    return () => { this.listeners.get(key)?.delete(callback); };
  }

  private notifyListeners(key: string, notification: Notification): void {
    this.listeners.get(key)?.forEach(callback => {
      try { callback(notification); } 
      catch (e) { console.error('Error in notification listener:', e); }
    });
  }
}

export const notificationStore = new NotificationStore();
