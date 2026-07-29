/**
 * Media Resolver Service
 * 
 * Centralized media resolution with automatic fallback support.
 * Priority: Uploaded > Default > Placeholder
 */

import type { MediaCategory, ResolvedMedia, MediaAsset } from '../../types/media';

// Default asset registry
const DEFAULT_ASSETS: Record<string, {
  url: string;
  category: MediaCategory;
  altText: string;
  description?: string;
}> = {
  // Hero Images
  'hero-safari': {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
    category: 'hero',
    altText: 'Safari wildlife in Masai Mara',
    description: 'Main hero image for safari homepage'
  },
  'hero-savanna': {
    url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1920&q=80',
    category: 'hero',
    altText: 'African savanna at sunset',
    description: 'Hero for Serengeti destination page'
  },
  'hero-gorilla': {
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80',
    category: 'hero',
    altText: 'Mountain gorilla in forest',
    description: 'Hero for gorilla trekking pages'
  },
  'hero-beach': {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
    category: 'hero',
    altText: 'Zanzibar beach paradise',
    description: 'Hero for beach destinations'
  },
  
  // Destination Images
  'dest-masai-mara': {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    category: 'destination',
    altText: 'Masai Mara wildlife',
    description: 'Primary image for Masai Mara destination'
  },
  'dest-serengeti': {
    url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80',
    category: 'destination',
    altText: 'Serengeti endless plains',
    description: 'Primary image for Serengeti destination'
  },
  'dest-bwindi': {
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    category: 'destination',
    altText: 'Bwindi Impenetrable Forest',
    description: 'Primary image for Bwindi destination'
  },
  'dest-volcanoes': {
    url: 'https://images.unsplash.com/photo-1548560781-a1f7f9c0b1f1?auto=format&fit=crop&w=1200&q=80',
    category: 'destination',
    altText: 'Volcanoes National Park',
    description: 'Primary image for Rwanda volcanoes'
  },
  'dest-ngorongoro': {
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    category: 'destination',
    altText: 'Ngorongoro Crater',
    description: 'Primary image for Ngorongoro destination'
  },
  'dest-zanzibar': {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    category: 'destination',
    altText: 'Zanzibar beaches',
    description: 'Primary image for Zanzibar destination'
  },
  
  // Accommodation Images
  'acc-luxury-lodge': {
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    category: 'accommodation',
    altText: 'Luxury safari lodge',
    description: 'Default luxury lodge interior'
  },
  'acc-tent-camp': {
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80',
    category: 'accommodation',
    altText: 'Safari tented camp',
    description: 'Default tented camp exterior'
  },
  'acc-treehouse': {
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    category: 'accommodation',
    altText: 'Treehouse accommodation',
    description: 'Treehouse lodge experience'
  },
  
  // Experience Images
  'exp-balloon': {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    category: 'experience',
    altText: 'Hot air balloon safari',
    description: 'Balloon safari experience'
  },
  'exp-game-drive': {
    url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    category: 'experience',
    altText: 'Game drive vehicle',
    description: 'Game drive experience'
  },
  'exp-gorilla': {
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    category: 'experience',
    altText: 'Gorilla trekking',
    description: 'Gorilla trekking experience'
  },
  'exp-cultural': {
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
    category: 'experience',
    altText: 'Cultural experience',
    description: 'Maasai cultural encounter'
  },
  
  // Gallery Images
  'gallery-wildlife': {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
    category: 'gallery',
    altText: 'African wildlife',
    description: 'Wildlife photography'
  },
  'gallery-landscape': {
    url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=800&q=80',
    category: 'gallery',
    altText: 'African landscape',
    description: 'Landscape photography'
  },
  'gallery-beach': {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    category: 'gallery',
    altText: 'Beach scenery',
    description: 'Coastal photography'
  },
  
  // Placeholder Images
  'placeholder-hero': {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
    category: 'hero',
    altText: 'IDENT Africa Safari',
    description: 'Default hero placeholder'
  },
  'placeholder-avatar': {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    category: 'profile',
    altText: 'User avatar',
    description: 'Default avatar placeholder'
  },
  'placeholder-thumbnail': {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80',
    category: 'ui',
    altText: 'Default thumbnail',
    description: 'Default thumbnail placeholder'
  },
};

// Cache for uploaded assets
const uploadedAssetsCache: Map<string, { url: string; altText?: string }> = new Map();
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let fetchPromise: Promise<void> | null = null; // deduplicate concurrent calls

/**
 * Fetch uploaded assets from API
 */
async function fetchUploadedAssets(): Promise<void> {
  // Don't refetch if cache is still valid
  if (Date.now() < cacheExpiry) return;
  
  // Deduplicate concurrent calls
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const response = await fetch('/api/media?source=uploaded&limit=100');
      const data = await response.json();
      
      if (data.success && data.data?.items) {
        const nextCache = new Map<string, { url: string; altText?: string }>();
        data.data.items.forEach((item: MediaAsset) => {
          nextCache.set(item.filename, {
            url: item.url,
            altText: item.altText,
          });
        });
        uploadedAssetsCache.clear();
        nextCache.forEach((v, k) => uploadedAssetsCache.set(k, v));
        cacheExpiry = Date.now() + CACHE_DURATION;
      }
    } catch (error) {
      // Silently degrade to defaults in production
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to fetch uploaded assets:', error);
      }
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Resolve media asset with automatic fallback
 */
export async function getMediaAsset(key: string): Promise<ResolvedMedia> {
  // Check uploaded assets first
  await fetchUploadedAssets();
  
  const uploaded = uploadedAssetsCache.get(key);
  if (uploaded) {
    return {
      asset: null,
      url: uploaded.url,
      source: 'uploaded',
      fallback: DEFAULT_ASSETS[key]?.url || DEFAULT_ASSETS['placeholder-hero'].url,
      isDefault: false,
    };
  }
  
  // Return default asset
  const defaultAsset = DEFAULT_ASSETS[key];
  if (defaultAsset) {
    return {
      asset: null,
      url: defaultAsset.url,
      source: 'default',
      fallback: null,
      isDefault: true,
    };
  }
  
  // Return placeholder as last resort
  return {
    asset: null,
    url: DEFAULT_ASSETS['placeholder-hero'].url,
    source: 'default',
    fallback: null,
    isDefault: true,
  };
}

/**
 * Get media URL directly (sync version)
 */
export function getMediaUrl(key: string, size: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'original'): string {
  const uploaded = uploadedAssetsCache.get(key);
  if (uploaded) return uploaded.url;
  
  const defaultAsset = DEFAULT_ASSETS[key];
  if (defaultAsset) return defaultAsset.url;
  
  return DEFAULT_ASSETS['placeholder-hero'].url;
}

/**
 * Get all default assets for a category
 */
export function getDefaultAssetsByCategory(category: MediaCategory): Array<{
  key: string;
  url: string;
  altText: string;
}> {
  return Object.entries(DEFAULT_ASSETS)
    .filter(([_, asset]) => asset.category === category)
    .map(([key, asset]) => ({
      key,
      url: asset.url,
      altText: asset.altText,
    }));
}

/**
 * Preload uploaded assets cache
 */
export function preloadMediaCache(): void {
  fetchUploadedAssets();
}

/**
 * Clear media cache
 */
export function clearMediaCache(): void {
  uploadedAssetsCache.clear();
  cacheExpiry = 0;
}

/**
 * Check if key has uploaded version
 */
export function hasUploadedAsset(key: string): boolean {
  return uploadedAssetsCache.has(key);
}

/**
 * Get asset info (default only)
 */
export function getDefaultAssetInfo(key: string): { url: string; altText: string; category: MediaCategory } | null {
  const asset = DEFAULT_ASSETS[key];
  if (!asset) return null;
  return {
    url: asset.url,
    altText: asset.altText,
    category: asset.category,
  };
}

// Export for use in components
export { DEFAULT_ASSETS };
