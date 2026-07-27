/**
 * Offline Storage Service
 */

import { mobileApi, API_ENDPOINTS, endpoints } from './api';

interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

type CacheType = 'destinations' | 'packages' | 'bookings' | 'favorites' | 'user';

class OfflineStorageService {
  private storage: Storage;

  constructor() {
    this.storage = typeof window !== 'undefined' ? localStorage : ({} as Storage);
  }

  get<T>(type: CacheType): T | null {
    try {
      const item = this.storage.getItem(`offline_${type}`);
      if (!item) return null;

      const cached: StorageItem<T> = JSON.parse(item);
      if (Date.now() > cached.expiresAt) {
        this.remove(type);
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  }

  set<T>(type: CacheType, data: T, durationMs = 3600000): void {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + durationMs,
      };
      this.storage.setItem(`offline_${type}`, JSON.stringify(item));
    } catch { /* ignore */ }
  }

  remove(type: CacheType): void {
    this.storage.removeItem(`offline_${type}`);
  }

  clear(): void {
    const types: CacheType[] = ['destinations', 'packages', 'bookings', 'favorites', 'user'];
    types.forEach(t => this.remove(t));
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  getLastSync(): Date | null {
    const lastSync = this.storage.getItem('offline_last_sync');
    return lastSync ? new Date(lastSync) : null;
  }

  setLastSync(): void {
    this.storage.setItem('offline_last_sync', new Date().toISOString());
  }

  async cacheDestinations(): Promise<void> {
    try {
      const response = await mobileApi.get<{ destinations: unknown[] }>(API_ENDPOINTS.destinations.list);
      if (response.success && response.data) {
        this.set('destinations', response.data.destinations, 86400000);
        this.setLastSync();
      }
    } catch { /* ignore */ }
  }

  getCachedDestinations<T>(): T[] {
    return this.get<T[]>('destinations') || [];
  }

  async cachePackages(): Promise<void> {
    try {
      const response = await mobileApi.get<{ packages: unknown[] }>(API_ENDPOINTS.packages.list);
      if (response.success && response.data) {
        this.set('packages', response.data.packages, 21600000);
        this.setLastSync();
      }
    } catch { /* ignore */ }
  }

  getCachedPackages<T>(): T[] {
    return this.get<T[]>('packages') || [];
  }

  cacheUser(user: unknown): void {
    this.set('user', user, 900000);
  }

  getCachedUser<T>(): T | null {
    return this.get<T>('user');
  }

  async cacheBookings(): Promise<void> {
    try {
      const response = await mobileApi.get<{ bookings: unknown[] }>(API_ENDPOINTS.bookings.list);
      if (response.success && response.data) {
        this.set('bookings', response.data.bookings, 300000);
      }
    } catch { /* ignore */ }
  }

  getCachedBookings<T>(): T[] {
    return this.get<T[]>('bookings') || [];
  }

  cacheFavorites(favorites: unknown[]): void {
    this.set('favorites', favorites);
  }

  getCachedFavorites<T>(): T[] {
    return this.get<T[]>('favorites') || [];
  }

  async syncWhenOnline(): Promise<void> {
    if (!this.isOnline()) return;

    const pending = this.getPendingActions();
    for (const action of pending) {
      try {
        await this.executePendingAction(action);
        this.removePendingAction(action.id);
      } catch { /* keep for next sync */ }
    }
  }

  private getPendingActions(): Array<{ id: string; action: string; data: unknown }> {
    try {
      const pending = this.storage.getItem('offline_pending');
      return pending ? JSON.parse(pending) : [];
    } catch {
      return [];
    }
  }

  addPendingAction(action: string, data: unknown): void {
    const pending = this.getPendingActions();
    pending.push({ id: `action_${Date.now()}`, action, data });
    this.storage.setItem('offline_pending', JSON.stringify(pending));
  }

  private removePendingAction(actionId: string): void {
    const pending = this.getPendingActions().filter(a => a.id !== actionId);
    this.storage.setItem('offline_pending', JSON.stringify(pending));
  }

  private async executePendingAction(action: { action: string; data: unknown }): Promise<void> {
    switch (action.action) {
      case 'create_booking':
        await mobileApi.post(API_ENDPOINTS.bookings.create, action.data);
        break;
      case 'add_favorite':
        await mobileApi.post(API_ENDPOINTS.favorites.add, action.data);
        break;
      case 'remove_favorite':
        await mobileApi.delete(endpoints.favoriteRemove(action.data as string));
        break;
    }
  }

  clearExpired(): void {
    const types: CacheType[] = ['destinations', 'packages', 'bookings', 'favorites', 'user'];
    types.forEach(t => {
      const item = this.storage.getItem(`offline_${t}`);
      if (item) {
        try {
          const parsed = JSON.parse(item) as StorageItem<unknown>;
          if (Date.now() > parsed.expiresAt) {
            this.storage.removeItem(`offline_${t}`);
          }
        } catch {
          this.storage.removeItem(`offline_${t}`);
        }
      }
    });
  }
}

export const offlineStorage = new OfflineStorageService();
