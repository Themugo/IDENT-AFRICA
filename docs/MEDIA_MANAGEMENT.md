# IDENT AFRICA Media Intelligence System

## Overview

The Media Intelligence System provides centralized media management with automatic fallback support. Default assets from Unsplash remain available, admin uploads override defaults, and the frontend never breaks if images are missing.

## Architecture

### Media Categories

| Category | Description | Example Usage |
|----------|-------------|---------------|
| hero | Full-width hero images | Homepage hero sections |
| destination | Destination images | Masai Mara, Serengeti galleries |
| accommodation | Lodge/camp images | Hotel listings, detail pages |
| experience | Experience images | Safari activities, tours |
| gallery | General gallery | Photo galleries, sliders |
| partner | Partner logos | Airline, hotel chain logos |
| testimonial | Customer photos | Review avatars |
| blog | Blog post images | Article thumbnails |
| profile | User avatars | Profile pictures |
| ui | UI elements | Icons, placeholders |
| banner | Promotional banners | Seasonal promotions |

## Media Resolution Logic

1. Check Uploaded Assets Cache
2. If found: Return uploaded URL
3. If not: Check Default Assets Registry
4. If found: Return default URL
5. If not: Return placeholder (fallback-hero)

## Default Assets Registry

### Hero Images
- hero-safari: Safari wildlife in Masai Mara
- hero-savanna: African savanna at sunset
- hero-gorilla: Mountain gorilla in forest
- hero-beach: Zanzibar beach paradise

### Destination Images
- dest-masai-mara: Masai Mara wildlife
- dest-serengeti: Serengeti endless plains
- dest-bwindi: Bwindi Impenetrable Forest
- dest-volcanoes: Volcanoes National Park

### Placeholder Images
- placeholder-hero: Default hero fallback
- placeholder-avatar: Default avatar fallback
- placeholder-thumbnail: Default thumbnail fallback

## Database Schema

### Tables

#### media_assets
- id: UUID Primary Key
- filename: Unique filename
- url: Full URL to asset
- thumbnail_url: Thumbnail URL
- category: Media category
- alt_text: SEO alt text
- description: Asset description
- tags: Searchable tags
- source: 'default' or 'uploaded'
- variants: Size variants (JSONB)
- size: File size in bytes
- width/height: Dimensions
- is_active: Soft delete flag
- created_at: Creation time
- updated_at: Last update

#### media_usage
Tracks where each media asset is used.

#### media_tags
Centralized tag management with usage counts.

#### default_assets
Registry of default/placeholder assets.

## API Endpoints

### List Media
GET /api/media
Query params: category, source, search, tags, limit, offset

### Get Statistics
GET /api/media/stats
Returns: total assets, size by category, unused count

### Get Single Asset
GET /api/media/:id

### Upload Asset
POST /api/media
Body: { filename, url, category, altText, description, tags }

### Update Asset
PUT /api/media/:id
Body: { altText, description, tags, isActive }

### Delete Asset
DELETE /api/media/:id
Soft delete (sets is_active = false)

### Resolve Media
GET /api/media/resolve/:key
Returns resolved URL with fallback info.

## Frontend Usage

### Media Resolver Service

```typescript
import { getMediaAsset, getMediaUrl } from '@/services/media';

// Async with fallback info
const resolved = await getMediaAsset('hero-safari');
// {
//   url: 'https://...',
//   source: 'uploaded' | 'default',
//   fallback: null | 'https://...',
//   isDefault: true | false
// }

// Sync URL lookup
const url = getMediaUrl('dest-masai-mara');
```

## Protected Design Rules

### Admin CAN:
- Upload new images
- Replace existing images
- Change alt text and descriptions
- Add/remove tags
- Delete uploaded assets
- Reorder gallery images

### Admin CANNOT:
- Break layout structure
- Inject HTML/CSS
- Modify component code
- Access raw image storage paths
- Override security settings

## Image Optimization

### Automatic Processing
1. Upload received
2. Generate variants (thumbnail, small, medium, large)
3. Convert to WebP where supported
4. Compress based on quality settings

### Variant Sizes
- thumbnail: 150x150 @ 80%
- small: 400x300 @ 85%
- medium: 800x600 @ 85%
- large: 1600x1200 @ 80%

## Storage Providers

### Local Development
- Files stored in /uploads directory
- Served statically via Express

### Production Ready
- Supabase Storage
- AWS S3
- Cloudflare R2

Configure via environment variables:
- STORAGE_PROVIDER
- SUPABASE_BUCKET

## Best Practices

1. Always use media resolver - Never hardcode Unsplash URLs
2. Provide alt text - SEO and accessibility
3. Use categories - Organization and filtering
4. Add tags - Improved searchability
5. Monitor unused assets - Clean up periodically
6. Use size variants - Optimize mobile performance
