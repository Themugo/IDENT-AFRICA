/**
 * Media Intelligence API Routes
 * 
 * Centralized media management with fallback support.
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';
import type { MediaCategory, MediaQuery } from '../types/media.js';

const router = Router();

// Database row types
interface MediaRow {
  id: string;
  filename: string;
  original_name: string;
  url: string;
  thumbnail_url: string;
  mime_type: string;
  format: string;
  size: number;
  width: number;
  height: number;
  storage_path: string;
  category: string;
  alt_text: string;
  description: string;
  tags: string[];
  source: string;
  owner_id: string;
  variants: unknown;
  metadata: unknown;
  is_optimized: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  usage: unknown[];
}

interface StatsRow {
  category: string;
  count: string;
  size: string;
  source: string;
}

interface CategoryCountRow {
  category: string;
  count: string;
}

interface UnusedCountRow {
  count: string;
}

// Response helper
function createResponse<T>(data: T, error?: string) {
  return {
    success: !error,
    data,
    ...(error ? { error } : {}),
    timestamp: new Date().toISOString(),
  };
}

// Default assets (fallback when DB not connected)
const DEFAULT_ASSETS: Record<string, { url: string; category: MediaCategory; altText: string }> = {
  'hero-safari-1': { url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80', category: 'hero', altText: 'Safari wildlife' },
  'hero-savanna': { url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1920&q=80', category: 'hero', altText: 'African savanna' },
  'hero-gorilla': { url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80', category: 'hero', altText: 'Mountain gorilla' },
  'hero-beach': { url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80', category: 'hero', altText: 'Zanzibar beach' },
  'dest-masai-mara-main': { url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80', category: 'destination', altText: 'Masai Mara' },
  'dest-serengeti-main': { url: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80', category: 'destination', altText: 'Serengeti' },
  'dest-bwindi-main': { url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80', category: 'destination', altText: 'Bwindi Forest' },
  'dest-volcanoes-main': { url: 'https://images.unsplash.com/photo-1548560781-a1f7f9c0b1f1?auto=format&fit=crop&w=1200&q=80', category: 'destination', altText: 'Volcanoes NP' },
  'acc-luxury-lodge': { url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80', category: 'accommodation', altText: 'Luxury lodge' },
  'exp-gorilla-trek': { url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80', category: 'experience', altText: 'Gorilla trekking' },
  'placeholder-hero': { url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80', category: 'hero', altText: 'IDENT Africa Safari' },
  'placeholder-avatar': { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', category: 'profile', altText: 'User avatar' },
};

// ============ MEDIA ASSETS ============

/**
 * GET /api/media - List all media assets
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, source, search, tags, unused, limit = 50, offset = 0 } = req.query;

    if (!isDatabaseConnected()) {
      // Return default assets when DB not connected
      const items = Object.entries(DEFAULT_ASSETS).map(([key, asset]) => ({
        id: key,
        filename: key,
        url: asset.url,
        category: asset.category,
        altText: asset.altText,
        source: 'default',
        isActive: true,
      }));

      return res.status(200).json(createResponse({
        items,
        total: items.length,
        page: 1,
        limit: Number(limit),
        hasMore: false,
      }));
    }

    let sql = `
      SELECT ma.*, 
             COALESCE(json_agg(json_build_object(
               'entityType', mu.entity_type,
               'entityId', mu.entity_id,
               'usageType', mu.usage_type,
               'isRequired', mu.is_required
             )) FILTER (WHERE mu.id IS NOT NULL), '[]') as usage
      FROM media_assets ma
      LEFT JOIN media_usage mu ON ma.id = mu.media_id
      WHERE ma.is_active = true
    `;
    
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND ma.category = $${paramIndex++}`;
      params.push(category);
    }

    if (source) {
      sql += ` AND ma.source = $${paramIndex++}`;
      params.push(source);
    }

    if (search) {
      sql += ` AND (ma.filename ILIKE $${paramIndex} OR ma.alt_text ILIKE $${paramIndex} OR ma.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` GROUP BY ma.id ORDER BY ma.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    interface MediaRow {
      id: string;
      filename: string;
      original_name: string;
      url: string;
      thumbnail_url: string;
      mime_type: string;
      format: string;
      size: number;
      width: number;
      height: number;
      storage_path: string;
      category: string;
      alt_text: string;
      description: string;
      tags: string[];
      source: string;
      owner_id: string;
      variants: unknown;
      metadata: unknown;
      is_optimized: boolean;
      is_active: boolean;
      created_at: string;
      updated_at: string;
      usage: unknown[];
    }

    const result = await query<MediaRow>(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM media_assets WHERE is_active = true';
    if (category) countSql += ` AND category = '${category}'`;
    interface CountRow { count: string }
    const countResult = await query<CountRow>(countSql);

    res.status(200).json(createResponse({
      items: result.rows.map(row => ({
        id: row.id,
        filename: row.filename,
        originalName: row.original_name,
        url: row.url,
        thumbnailUrl: row.thumbnail_url,
        mimeType: row.mime_type,
        format: row.format,
        size: row.size,
        width: row.width,
        height: row.height,
        storagePath: row.storage_path,
        category: row.category,
        altText: row.alt_text,
        description: row.description,
        tags: row.tags,
        source: row.source,
        ownerId: row.owner_id,
        variants: row.variants,
        metadata: row.metadata,
        isOptimized: row.is_optimized,
        isActive: row.is_active,
        usage: row.usage,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
      total: parseInt(countResult.rows[0].count),
      page: Math.floor(Number(offset) / Number(limit)) + 1,
      limit: Number(limit),
      hasMore: Number(offset) + result.rows.length < parseInt(countResult.rows[0].count),
    }));
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch media'));
  }
});

/**
 * GET /api/media/stats - Get media statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({
        totalAssets: Object.keys(DEFAULT_ASSETS).length,
        totalSize: 0,
        byCategory: {},
        bySource: { default: { count: Object.keys(DEFAULT_ASSETS).length, size: 0 }, uploaded: { count: 0, size: 0 } },
        unusedAssets: 0,
      }));
    }

    interface StatsRow { category: string; count: string; size: string; source: string }
    const result = await query<StatsRow>(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(size) as size,
        source
      FROM media_assets 
      WHERE is_active = true
      GROUP BY category, source
    `);

    const stats = {
      totalAssets: 0,
      totalSize: 0,
      byCategory: {} as Record<string, { count: number; size: number }>,
      bySource: { default: { count: 0, size: 0 }, uploaded: { count: 0, size: 0 } },
      unusedAssets: 0,
    };

    result.rows.forEach(row => {
      stats.totalAssets += parseInt(row.count);
      stats.totalSize += parseInt(String(row.size || "0"));
      
      if (!stats.byCategory[row.category]) {
        stats.byCategory[row.category] = { count: 0, size: 0 };
      }
      stats.byCategory[row.category].count += parseInt(row.count);
      stats.byCategory[row.category].size += parseInt(String(row.size || "0"));
      
      stats.bySource[row.source].count += parseInt(row.count);
      stats.bySource[row.source].size += parseInt(String(row.size || "0"));
    });

    // Get unused count
    interface UnusedCountRow { count: string }
    const unusedResult = await query<UnusedCountRow>(`
      SELECT COUNT(*) FROM media_assets ma
      LEFT JOIN media_usage mu ON ma.id = mu.media_id
      WHERE mu.id IS NULL AND ma.source = 'uploaded' AND ma.is_active = true
    `);
    stats.unusedAssets = parseInt(unusedResult.rows[0]?.count || "0");

    res.status(200).json(createResponse(stats));
  } catch (error) {
    console.error('Error fetching media stats:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch media stats'));
  }
});

/**
 * GET /api/media/:id - Get single media asset
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const defaultAsset = DEFAULT_ASSETS[id];
      if (defaultAsset) {
        return res.status(200).json(createResponse({
          id,
          filename: id,
          url: defaultAsset.url,
          category: defaultAsset.category,
          altText: defaultAsset.altText,
          source: 'default',
          isDefault: true,
        }));
      }
      return res.status(404).json(createResponse(undefined, 'Media not found'));
    }

    const result = await query<MediaRow>(`
      SELECT ma.*, 
             COALESCE(json_agg(json_build_object(
               'entityType', mu.entity_type,
               'entityId', mu.entity_id,
               'usageType', mu.usage_type,
               'isRequired', mu.is_required
             )) FILTER (WHERE mu.id IS NOT NULL), '[]') as usage
      FROM media_assets ma
      LEFT JOIN media_usage mu ON ma.id = mu.media_id
      WHERE ma.id = $1
      GROUP BY ma.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(undefined, 'Media not found'));
    }

    const row = result.rows[0];
    res.status(200).json(createResponse({
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      url: row.url,
      thumbnailUrl: row.thumbnail_url,
      mimeType: row.mime_type,
      format: row.format,
      size: row.size,
      width: row.width,
      height: row.height,
      storagePath: row.storage_path,
      category: row.category,
      altText: row.alt_text,
      description: row.description,
      tags: row.tags,
      source: row.source,
      ownerId: row.owner_id,
      variants: row.variants,
      metadata: row.metadata,
      isOptimized: row.is_optimized,
      isActive: row.is_active,
      usage: row.usage,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch media'));
  }
});

/**
 * POST /api/media - Upload new media asset
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { filename, url, category, altText, description, tags, metadata } = req.body;

    if (!filename || !url || !category) {
      return res.status(400).json(createResponse(undefined, 'Missing required fields'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse({
        id: `media-${Date.now()}`,
        filename,
        url,
        category,
        altText,
        source: 'uploaded',
        createdAt: new Date().toISOString(),
      }));
    }

    const id = `media-${Date.now()}`;
    const result = await query<MediaRow>(`
      INSERT INTO media_assets (id, filename, original_name, url, storage_path, mime_type, format, size, category, alt_text, description, tags, metadata, source)
      VALUES ($1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'uploaded')
      RETURNING *
    `, [
      id,
      filename,
      url,
      `uploads/${filename}`,
      'image/jpeg', // Default, would be extracted from file
      url.includes('.png') ? 'png' : url.includes('.webp') ? 'webp' : 'jpeg',
      0, // Size would be extracted
      category,
      altText,
      description,
      tags || [],
      metadata || {},
    ]);

    res.status(201).json(createResponse(result.rows[0]));
  } catch (error) {
    console.error('Error creating media:', error);
    res.status(500).json(createResponse(undefined, 'Failed to create media'));
  }
});

/**
 * PUT /api/media/:id - Update media asset
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { altText, description, tags, isActive } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({
        id,
        altText,
        description,
        tags,
        isActive,
        updatedAt: new Date().toISOString(),
      }));
    }

    const updates: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (altText !== undefined) {
      updates.push(`alt_text = $${paramIndex++}`);
      params.push(altText);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      params.push(tags);
    }
    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(isActive);
    }

    if (updates.length === 0) {
      return res.status(400).json(createResponse(undefined, 'No updates provided'));
    }

    params.push(id);
    const result = await query<MediaRow>(`
      UPDATE media_assets SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(undefined, 'Media not found'));
    }

    res.status(200).json(createResponse(result.rows[0]));
  } catch (error) {
    console.error('Error updating media:', error);
    res.status(500).json(createResponse(undefined, 'Failed to update media'));
  }
});

/**
 * DELETE /api/media/:id - Delete media asset
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({ message: 'Media deleted (mock mode)' }));
    }

    // Soft delete
    const result = await query<MediaRow>(`
      UPDATE media_assets SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(undefined, 'Media not found'));
    }

    res.status(200).json(createResponse({ message: 'Media deleted' }));
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json(createResponse(undefined, 'Failed to delete media'));
  }
});

// ============ MEDIA RESOLVER ============

/**
 * GET /api/media/resolve/:key - Resolve media with fallback
 */
router.get('/resolve/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    if (!isDatabaseConnected()) {
      // Return default asset
      const defaultAsset = DEFAULT_ASSETS[key];
      if (defaultAsset) {
        return res.status(200).json(createResponse({
          url: defaultAsset.url,
          source: 'default',
          fallback: null,
          isDefault: true,
        }));
      }
      // Return placeholder
      return res.status(200).json(createResponse({
        url: DEFAULT_ASSETS['placeholder-hero'].url,
        source: 'default',
        fallback: null,
        isDefault: true,
        isPlaceholder: true,
      }));
    }

    // Check for uploaded asset first
    const uploadedResult = await query<{url: string; alt_text: string}>(`
      SELECT url, alt_text FROM media_assets 
      WHERE filename = $1 AND source = 'uploaded' AND is_active = true
      LIMIT 1
    `, [key]);

    if (uploadedResult.rows.length > 0) {
      return res.status(200).json(createResponse({
        url: uploadedResult.rows[0].url,
        altText: uploadedResult.rows[0].alt_text,
        source: 'uploaded',
        fallback: null,
        isDefault: false,
      }));
    }

    // Check for default asset in DB
    const defaultResult = await query<{url: string; alt_text: string}>(`
      SELECT url, alt_text FROM default_assets 
      WHERE asset_key = $1 AND is_active = true
      LIMIT 1
    `, [key]);

    if (defaultResult.rows.length > 0) {
      return res.status(200).json(createResponse({
        url: defaultResult.rows[0].url,
        altText: defaultResult.rows[0].alt_text,
        source: 'default',
        fallback: null,
        isDefault: true,
      }));
    }

    // Return placeholder
    return res.status(200).json(createResponse({
      url: DEFAULT_ASSETS['placeholder-hero'].url,
      source: 'default',
      fallback: null,
      isDefault: true,
      isPlaceholder: true,
    }));
  } catch (error) {
    console.error('Error resolving media:', error);
    res.status(500).json(createResponse(undefined, 'Failed to resolve media'));
  }
});

// ============ CATEGORY ROUTES ============

/**
 * GET /api/media/categories - List all categories with counts
 */
router.get('/categories/list', async (req: Request, res: Response) => {
  try {
    const categories: MediaCategory[] = [
      'hero', 'destination', 'accommodation', 'experience', 'gallery',
      'partner', 'testimonial', 'blog', 'profile', 'ui', 'banner', 'other'
    ];

    if (!isDatabaseConnected()) {
      const categoryData = categories.map(cat => ({
        category: cat,
        count: Object.values(DEFAULT_ASSETS).filter(a => a.category === cat).length,
      }));
      return res.status(200).json(createResponse(categoryData));
    }

    const result = await query<CategoryCountRow>(`
      SELECT category, COUNT(*) as count 
      FROM media_assets 
      WHERE is_active = true 
      GROUP BY category
    `);

    const categoryMap: Record<string, number> = {};
    result.rows.forEach(row => {
      categoryMap[row.category] = parseInt(row.count);
    });

    const categoryData = categories.map(cat => ({
      category: cat,
      count: categoryMap[cat] || 0,
    }));

    res.status(200).json(createResponse(categoryData));
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch categories'));
  }
});

export default router;
