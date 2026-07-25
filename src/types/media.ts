/**
 * IDENT AFRICA - Media Intelligence System Types
 * 
 * Centralized media management with fallback support.
 */

// ============ MEDIA CATEGORIES ============

export type MediaCategory = 
  | 'hero'
  | 'destination'
  | 'accommodation'
  | 'experience'
  | 'gallery'
  | 'partner'
  | 'testimonial'
  | 'blog'
  | 'profile'
  | 'ui'
  | 'banner'
  | 'other';

export type MediaSource = 'default' | 'uploaded';

// ============ IMAGE SIZES ============

export type ImageSize = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

export interface ImageVariants {
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  original: string;
}

// ============ IMAGE OPTIMIZATION ============

export interface ImageOptimization {
  quality: number;
  format: 'webp' | 'jpeg' | 'png' | 'original';
  sizes: {
    thumbnail: { width: number; height: number };
    small: { width: number; height: number };
    medium: { width: number; height: number };
    large: { width: number; height: number };
  };
}

// ============ MEDIA ASSET ============

export interface MediaAsset {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  variants?: ImageVariants;
  mimeType: string;
  format: 'webp' | 'jpeg' | 'png' | 'gif' | 'svg' | 'other';
  size: number;
  width?: number;
  height?: number;
  storagePath: string;
  category: MediaCategory;
  altText?: string;
  description?: string;
  source: MediaSource;
  ownerId?: string;
  tags: string[];
  metadata?: {
    camera?: string;
    location?: string;
    dateTaken?: string;
    artist?: string;
  };
  usage: MediaUsage[];
  isOptimized: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ MEDIA USAGE ============

export interface MediaUsage {
  entityType: 'destination' | 'lodges' | 'testimonials' | 'partners' | 'experiences' | 'packages' | 'homepage' | 'blog' | 'hero' | 'other';
  entityId?: string;
  usageType: 'primary' | 'gallery' | 'thumbnail' | 'background' | 'avatar' | 'banner';
  isRequired: boolean;
}

// ============ MEDIA STORAGE ============

export type StorageProvider = 'local' | 'supabase' | 's3' | 'r2';

export interface StorageConfig {
  provider: StorageProvider;
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKey?: string;
  secretKey?: string;
  publicUrl: string;
}

// ============ MEDIA UPLOAD ============

export interface MediaUploadRequest {
  file: File | Blob;
  filename: string;
  category: MediaCategory;
  altText?: string;
  description?: string;
  tags?: string[];
  optimize?: boolean;
  generateVariants?: boolean;
}

export interface MediaUploadResponse {
  success: boolean;
  asset?: MediaAsset;
  error?: string;
}

// ============ MEDIA REPLACEMENT ============

export interface MediaReplacementRequest {
  assetId: string;
  newFile: File | Blob;
  preserveVariants?: boolean;
}

// ============ MEDIA QUERY ============

export interface MediaQuery {
  category?: MediaCategory;
  source?: MediaSource;
  tags?: string[];
  search?: string;
  usedBy?: string;
  unused?: boolean;
  limit?: number;
  offset?: number;
}

// ============ MEDIA STATS ============

export interface MediaStats {
  totalAssets: number;
  totalSize: number;
  byCategory: Record<MediaCategory, { count: number; size: number }>;
  bySource: Record<MediaSource, { count: number; size: number }>;
  unusedAssets: number;
  lastUpload?: string;
}

// ============ MEDIA RESOLVER ============

export interface ResolvedMedia {
  asset: MediaAsset | null;
  url: string;
  source: MediaSource;
  fallback: string | null;
  isDefault: boolean;
}

// ============ DEFAULT ASSETS REGISTRY ============

export interface DefaultAsset {
  id: string;
  url: string;
  category: MediaCategory;
  altText: string;
  description?: string;
  tags: string[];
}

// ============ API RESPONSE ============

export interface MediaApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  stats?: MediaStats;
}

export interface MediaPaginatedResponse {
  items: MediaAsset[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============ IMAGE VALIDATION ============

export interface ImageValidation {
  maxSize: number; // bytes
  allowedFormats: string[];
  maxWidth: number;
  maxHeight: number;
}

export const IMAGE_VALIDATION: ImageValidation = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  maxWidth: 8000,
  maxHeight: 8000,
};

// ============ OPTIMIZATION SETTINGS ============

export const OPTIMIZATION_SETTINGS = {
  webpQuality: 85,
  jpegQuality: 80,
  pngCompression: 6,
  generateWebP: true,
  generateVariants: true,
  variants: {
    thumbnail: { width: 150, height: 150, fit: 'cover' as const },
    small: { width: 400, height: 300, fit: 'inside' as const },
    medium: { width: 800, height: 600, fit: 'inside' as const },
    large: { width: 1600, height: 1200, fit: 'inside' as const },
  },
};
