/**
 * Inventory Service
 * 
 * Service for managing real-time inventory availability.
 */

import type {
  InventoryItem,
  InventoryReservation,
  AvailabilityResult,
  CalendarEntry,
  InventoryStats,
  CreateInventoryRequest,
  ReservationRequest,
  BlockRequest,
} from './types';

const API_BASE = '/api/inventory';

/**
 * Inventory Service
 */
class InventoryService {
  /**
   * Check availability for an item
   */
  async checkAvailability(
    inventoryId: string,
    date: string,
    quantity = 1
  ): Promise<AvailabilityResult> {
    const res = await fetch(`${API_BASE}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inventoryId, date, quantity }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to check availability');
    }

    return data.data;
  }

  /**
   * Check bulk availability
   */
  async checkBulkAvailability(
    items: Array<{ inventoryId: string; date: string; quantity?: number }>
  ): Promise<AvailabilityResult[]> {
    const res = await fetch(`${API_BASE}/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to check bulk availability');
    }

    return data.data.results;
  }

  /**
   * Reserve inventory
   */
  async reserve(request: ReservationRequest): Promise<InventoryReservation> {
    const res = await fetch(`${API_BASE}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to reserve inventory');
    }

    return data.data;
  }

  /**
   * Confirm reservation
   */
  async confirmReservation(reservationId: string, bookingId?: string): Promise<InventoryReservation> {
    const res = await fetch(`${API_BASE}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, bookingId }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to confirm reservation');
    }

    return data.data;
  }

  /**
   * Release reservation
   */
  async releaseReservation(reservationId: string, reason?: string): Promise<InventoryReservation> {
    const res = await fetch(`${API_BASE}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservationId, reason }),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to release reservation');
    }

    return data.data;
  }

  /**
   * Get inventory items
   */
  async getInventory(options: {
    supplierId?: string;
    productType?: string;
    productId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (options.supplierId) params.set('supplierId', options.supplierId);
    if (options.productType) params.set('productType', options.productType);
    if (options.productId) params.set('productId', options.productId);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const res = await fetch(`${API_BASE}?${params}`);
    const data = await res.json();
    
    return data.data?.items || [];
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItem(id: string): Promise<InventoryItem | null> {
    const res = await fetch(`${API_BASE}/${id}`);
    const data = await res.json();
    
    return data.success ? data.data : null;
  }

  /**
   * Create inventory item
   */
  async createInventory(request: CreateInventoryRequest): Promise<InventoryItem> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create inventory');
    }

    return data.data;
  }

  /**
   * Update inventory item
   */
  async updateInventory(
    id: string,
    updates: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update inventory');
    }

    return data.data;
  }

  /**
   * Delete inventory item
   */
  async deleteInventory(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to delete inventory');
    }
  }

  /**
   * Get availability calendar
   */
  async getCalendar(
    inventoryId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarEntry[]> {
    const params = new URLSearchParams({ startDate, endDate });
    const res = await fetch(`${API_BASE}/calendar/${inventoryId}?${params}`);
    const data = await res.json();
    
    return data.success ? data.data : [];
  }

  /**
   * Update calendar entry
   */
  async updateCalendar(
    inventoryId: string,
    entry: Partial<CalendarEntry> & { date: string }
  ): Promise<CalendarEntry> {
    const res = await fetch(`${API_BASE}/calendar/${inventoryId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update calendar');
    }

    return data.data;
  }

  /**
   * Get reservations
   */
  async getReservations(options: {
    inventoryId?: string;
    bookingId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<InventoryReservation[]> {
    const params = new URLSearchParams();
    if (options.inventoryId) params.set('inventoryId', options.inventoryId);
    if (options.bookingId) params.set('bookingId', options.bookingId);
    if (options.status) params.set('status', options.status);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());

    const res = await fetch(`${API_BASE}/reservations/all?${params}`);
    const data = await res.json();
    
    return data.data?.reservations || [];
  }

  /**
   * Create inventory block
   */
  async createBlock(request: BlockRequest): Promise<void> {
    const res = await fetch(`${API_BASE}/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create block');
    }
  }

  /**
   * Remove inventory block
   */
  async removeBlock(blockId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/blocks/${blockId}`, { method: 'DELETE' });
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to remove block');
    }
  }

  /**
   * Get inventory statistics
   */
  async getStats(supplierId?: string): Promise<InventoryStats> {
    const params = supplierId ? `?supplierId=${supplierId}` : '';
    const res = await fetch(`${API_BASE}/stats${params}`);
    const data = await res.json();
    
    return data.success ? data.data : {
      totalItems: 0,
      totalCapacity: 0,
      availableCapacity: 0,
      reservedCapacity: 0,
      utilizationRate: 0,
      byType: {} as Record<string, { count: number; capacity: number }>,
      lowStockItems: 0,
    };
  }
}

export const inventoryService = new InventoryService();
