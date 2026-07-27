/**
 * Inventory Types
 * 
 * Type definitions for inventory management system.
 */

// Inventory item types
export type InventoryItemType = 'room' | 'seat' | 'vehicle' | 'guide' | 'activity';

// Inventory status
export type InventoryStatus = 'available' | 'reserved' | 'booked' | 'blocked';

// Reservation status
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'released';

// Block types
export type BlockType = 'maintenance' | 'closure' | 'event' | 'other';

// Main inventory item
export interface InventoryItem {
  id: string;
  supplierId: string;
  supplierName?: string;
  productId: string;
  productType: InventoryItemType;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  blockedQuantity: number;
  validFrom?: string;
  validTo?: string;
  name?: string;
  description?: string;
  unitType: string;
  createdAt: string;
  updatedAt: string;
}

// Daily inventory snapshot
export interface InventoryDaily {
  id: string;
  inventoryId: string;
  date: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  blockedQuantity: number;
  status: InventoryStatus;
  priceOverride?: number;
  minStay: number;
  createdAt: string;
  updatedAt: string;
}

// Reservation
export interface InventoryReservation {
  id: string;
  inventoryId: string;
  inventoryName?: string;
  productType?: InventoryItemType;
  dailyId?: string;
  bookingId?: string;
  sessionId?: string;
  quantity: number;
  status: ReservationStatus;
  reservationStart: string;
  reservationEnd: string;
  expiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Block
export interface InventoryBlock {
  id: string;
  inventoryId: string;
  reason?: string;
  blockType: BlockType;
  startDate: string;
  endDate: string;
  quantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Availability check request
export interface AvailabilityCheck {
  inventoryId: string;
  date: string;
  quantity: number;
  requestedQuantity?: number;
}

// Availability check response
export interface AvailabilityResult {
  available: boolean;
  inventoryId: string;
  date: string;
  requestedQuantity: number;
  availableQuantity: number;
  status: InventoryStatus;
  priceOverride?: number;
}

// Reservation request
export interface ReservationRequest {
  inventoryId: string;
  quantity: number;
  startDate: string;
  endDate: string;
  bookingId?: string;
  sessionId?: string;
  expiresInMinutes?: number;
}

// Calendar entry
export interface CalendarEntry {
  date: string;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  blockedQuantity: number;
  status: InventoryStatus;
  priceOverride?: number;
}

// Inventory statistics
export interface InventoryStats {
  totalItems: number;
  totalCapacity: number;
  availableCapacity: number;
  reservedCapacity: number;
  utilizationRate: number;
  byType: Record<InventoryItemType, { count: number; capacity: number }>;
  lowStockItems: number;
}

// Block creation request
export interface BlockRequest {
  inventoryId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  reason?: string;
  blockType?: BlockType;
}

// Create inventory request
export interface CreateInventoryRequest {
  supplierId: string;
  productId: string;
  productType: InventoryItemType;
  totalQuantity: number;
  availableQuantity?: number;
  name?: string;
  description?: string;
  unitType?: string;
  validFrom?: string;
  validTo?: string;
}

// Update inventory request
export interface UpdateInventoryRequest {
  totalQuantity?: number;
  availableQuantity?: number;
  name?: string;
  description?: string;
  unitType?: string;
  validFrom?: string;
  validTo?: string;
}
