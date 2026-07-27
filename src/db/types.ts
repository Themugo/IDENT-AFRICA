/**
 * Database Row Types
 * Type definitions for database query results
 */

export interface UserRow {
  id: string;
  email: string;
  password_hash?: string;
  name: string;
  role: string;
  phone?: string;
  avatar_url?: string;
  preferred_currency?: string;
  dietary_preferences?: string;
  passport_country?: string;
  email_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  booking_ref: string;
  user_id: string;
  destination_id?: string;
  itinerary_id?: string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone?: string;
  start_date: string;
  end_date: string;
  adults_count: number;
  children_count: number;
  total_price_usd: number;
  currency: string;
  status: string;
  payment_status: string;
  payment_gateway?: string;
  created_at: string;
  updated_at: string;
}

export interface DestinationRow {
  id: string;
  name: string;
  tagline: string;
  country: string;
  region: string;
  category: string;
  image_url: string;
  hero_image_url?: string;
  rating: number;
  reviews_count: number;
  starting_price_usd: number;
  duration_days: number;
  best_months: string[];
  wildlife_highlights: string[];
  big_five_probability: Record<string, number>;
  description: string;
  highlights: string[];
  coordinates_lat: number;
  coordinates_lng: number;
  featured: boolean;
  eco_score: number;
  created_at: string;
  updated_at: string;
}

export interface LodgeRow {
  id: string;
  name: string;
  tagline: string;
  country: string;
  region: string;
  category: string;
  image_url: string;
  hero_image_url?: string;
  rating: number;
  reviews_count: number;
  price_per_night_usd: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  description: string;
  highlights: string[];
  coordinates_lat?: number;
  coordinates_lng?: number;
  featured: boolean;
  is_active: boolean;
  supplier_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierRow {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  approval_status: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransactionRow {
  id: string;
  booking_id?: string;
  transaction_ref: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  gateway_transaction_id?: string;
  gateway_response?: Record<string, unknown>;
  customer_email?: string;
  customer_phone?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CountResult {
  count: string;
}

export interface SumResult {
  count?: string;
  revenue?: string;
  total?: string;
}

export interface MonthlyStatsRow {
  month: string;
  bookings: string;
  revenue: string;
}
