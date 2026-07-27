/**
 * CMS API Routes
 * Content Management System endpoints
 */

import { Router, Request, Response } from 'express';
import { query, transaction, isDatabaseConnected } from '../db/index.js';

const router = Router();

// Response helper
function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

// ============ HOMEPAGE CMS ============

/**
 * GET /api/cms/homepage - Get homepage configuration
 */
router.get('/homepage', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        id: 'default',
        hero: {
          title: 'East Africa\'s Finest Safari Expeditions',
          subtitle: 'Experience the wild heart of Africa...',
          ctaText: 'Start Your Journey',
          ctaLink: '/destinations',
          backgroundImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
          overlayOpacity: 0.4,
          isActive: true,
        },
        sections: [],
        footer: {
          companyName: 'Ident Africa',
          tagline: 'Luxury East Africa Expeditions',
          contactEmail: 'hello@identafrica.com',
          contactPhone: '+254 700 123 456',
          socialLinks: [],
        },
      }));
    }

    const result = await query<{ config: unknown }>(
      'SELECT config FROM cms_homepage WHERE is_active = true ORDER BY updated_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(200).json(createResponse(true, null));
    }

    res.status(200).json(createResponse(true, result.rows[0].config));
  } catch (error) {
    console.error('Error fetching homepage config:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch homepage config'));
  }
});

/**
 * PUT /api/cms/homepage - Update homepage configuration
 */
router.put('/homepage', async (req: Request, res: Response) => {
  try {
    const config = req.body.config as Record<string, unknown>;

    if (!config) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid config'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { message: 'Mock mode - config not saved' }));
    }

    await transaction(async (client) => {
      // Deactivate all existing configs
      await client.query('UPDATE cms_homepage SET is_active = false');

      // Insert new config
      await client.query(
        `INSERT INTO cms_homepage (config, is_active, updated_by) VALUES ($1, true, $2)`,
        [JSON.stringify(config), 'admin']
      );
    });

    res.status(200).json(createResponse(true, { message: 'Homepage config updated' }));
  } catch (error) {
    console.error('Error updating homepage config:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update homepage config'));
  }
});

// ============ THEME CMS ============

/**
 * GET /api/cms/theme - Get theme configuration
 */
router.get('/theme', async (req: Request, res: Response) => {
  try {
    const defaultTheme = {
      id: 'default',
      logo: { url: '/logo.svg', alt: 'Ident Africa', width: '150px', height: '40px' },
      favicon: '/favicon.ico',
      colors: {
        primary: '#F59E0B',
        primaryHover: '#D97706',
        secondary: '#78716C',
        secondaryHover: '#57534E',
        accent: '#10B981',
        background: '#1C1917',
        backgroundAlt: '#292524',
        surface: '#292524',
        text: '#FAFAF9',
        textMuted: '#A8A29E',
        border: '#44403C',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      typography: {
        headingFont: 'Playfair Display, serif',
        bodyFont: 'Inter, sans-serif',
      },
      button: {
        borderRadius: '8px',
        paddingX: '24px',
        paddingY: '12px',
        fontSize: '14px',
      },
    };

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, defaultTheme));
    }

    const result = await query<{ config: unknown }>(
      'SELECT config FROM cms_theme ORDER BY updated_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(200).json(createResponse(true, defaultTheme));
    }

    res.status(200).json(createResponse(true, result.rows[0].config));
  } catch (error) {
    console.error('Error fetching theme config:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch theme config'));
  }
});

/**
 * PUT /api/cms/theme - Update theme configuration
 */
router.put('/theme', async (req: Request, res: Response) => {
  try {
    const config = req.body.config as Record<string, unknown>;

    if (!config) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid config'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { message: 'Mock mode - theme not saved' }));
    }

    await query(
      `INSERT INTO cms_theme (config, updated_by) VALUES ($1, $2) ON CONFLICT DO UPDATE SET config = $1, updated_at = NOW()`,
      [JSON.stringify(config), 'admin']
    );

    res.status(200).json(createResponse(true, { message: 'Theme config updated' }));
  } catch (error) {
    console.error('Error updating theme config:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update theme config'));
  }
});

// ============ MEDIA CMS ============

/**
 * GET /api/cms/media - List media items
 */
router.get('/media', async (req: Request, res: Response) => {
  try {
    const { folder, search, type, limit = 50, offset = 0 } = req.query;

    // Mock data for demo
    const mockMedia = [
      {
        id: 'media-1',
        filename: 'safari-hero.jpg',
        originalName: 'safari_hero.jpg',
        url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
        mimeType: 'image/jpeg',
        size: 245000,
        width: 1920,
        height: 1080,
        tags: ['hero', 'safari', 'masai-mara'],
        folder: 'destinations',
        uploadedBy: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'media-2',
        filename: 'luxury-lodge.jpg',
        originalName: 'luxury_lodge.jpg',
        url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80',
        mimeType: 'image/jpeg',
        size: 312000,
        width: 1920,
        height: 1080,
        tags: ['lodge', 'luxury', 'serengeti'],
        folder: 'accommodation',
        uploadedBy: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'media-3',
        filename: 'gorilla.jpg',
        originalName: 'gorilla.jpg',
        url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
        mimeType: 'image/jpeg',
        size: 278000,
        width: 1920,
        height: 1080,
        tags: ['gorilla', 'bwindi', 'wildlife'],
        folder: 'destinations',
        uploadedBy: 'admin',
        createdAt: new Date().toISOString(),
      },
    ];

    let items = mockMedia;

    if (search) {
      const searchLower = String(search).toLowerCase();
      items = items.filter(m => 
        m.filename.toLowerCase().includes(searchLower) ||
        m.tags.some(t => t.toLowerCase().includes(searchLower))
      );
    }

    if (folder) {
      items = items.filter(m => m.folder === folder);
    }

    if (type && type !== 'all') {
      items = items.filter(m => m.mimeType.startsWith(String(type)));
    }

    const total = items.length;
    const paginatedItems = items.slice(Number(offset), Number(offset) + Number(limit));

    res.status(200).json(createResponse(true, {
      items: paginatedItems,
      total,
      limit: Number(limit),
      offset: Number(offset),
    }));
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch media'));
  }
});

/**
 * POST /api/cms/media/upload - Upload media
 */
router.post('/media/upload', async (req: Request, res: Response) => {
  try {
    const { filename, url, mimeType, size, tags, folder } = req.body;

    if (!filename || !url) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    const id = `media-${Date.now()}`;

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id,
        filename,
        url,
        mimeType: mimeType || 'image/jpeg',
        size: size || 0,
        tags: tags || [],
        folder,
        uploadedBy: 'admin',
        createdAt: new Date().toISOString(),
      }));
    }

    const result = await query(
      `INSERT INTO cms_media (id, filename, url, mime_type, size, tags, folder, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, filename, url, mimeType, size, tags || [], folder, 'admin']
    );

    res.status(201).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to upload media'));
  }
});

/**
 * DELETE /api/cms/media/:id - Delete media item
 */
router.delete('/media/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { message: 'Mock mode - media not deleted' }));
    }

    await query('DELETE FROM cms_media WHERE id = $1', [id]);

    res.status(200).json(createResponse(true, { message: 'Media deleted' }));
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete media'));
  }
});

// ============ DESTINATION CMS ============

/**
 * GET /api/cms/destinations - List destinations
 */
router.get('/destinations', async (req: Request, res: Response) => {
  try {
    const { country, featured, search, limit = 50, offset = 0 } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        items: [],
        total: 0,
        limit: Number(limit),
        offset: Number(offset),
      }));
    }

    let sql = 'SELECT * FROM destinations WHERE is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (country) {
      sql += ` AND country = $${paramIndex++}`;
      params.push(country);
    }

    if (featured !== undefined) {
      sql += ` AND featured = $${paramIndex++}`;
      params.push(featured === 'true');
    }

    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR tagline ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY featured DESC, rating DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      items: result.rows,
      total: result.rows.length,
      limit: Number(limit),
      offset: Number(offset),
    }));
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch destinations'));
  }
});

/**
 * POST /api/cms/destinations - Create destination
 */
router.post('/destinations', async (req: Request, res: Response) => {
  try {
    const { destination } = req.body;

    if (!destination || !destination.name) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid destination data'));
    }

    const id = destination.id || `dest-${Date.now()}`;

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        ...destination,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    const result = await query(
      `INSERT INTO destinations (id, name, tagline, country, region, category, image, hero_image, gallery, description, highlights, rating, reviews_count, starting_price, duration_days, wildlife_highlights, best_months, coordinates, featured, eco_score, is_active, seo_meta, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
       RETURNING *`,
      [
        id,
        destination.name,
        destination.tagline,
        destination.country,
        destination.region,
        destination.category,
        destination.image,
        destination.heroImage,
        destination.gallery,
        destination.description,
        destination.highlights,
        destination.rating || 0,
        destination.reviewsCount || 0,
        destination.startingPrice || 0,
        destination.durationDays || 1,
        destination.wildlifeHighlights,
        destination.bestMonths,
        JSON.stringify(destination.coordinates),
        destination.featured || false,
        destination.ecoScore || 0,
        true,
        JSON.stringify(destination.seo || {}),
        'admin',
      ]
    );

    res.status(201).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create destination'));
  }
});

/**
 * PUT /api/cms/destinations/:id - Update destination
 */
router.put('/destinations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { destination } = req.body;

    if (!destination) {
      return res.status(400).json(createResponse(false, undefined, 'Invalid destination data'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        ...destination,
        id,
        updatedAt: new Date().toISOString(),
      }));
    }

    const result = await query(
      `UPDATE destinations SET
        name = $2, tagline = $3, country = $4, region = $5, category = $6,
        image = $7, hero_image = $8, gallery = $9, description = $10, highlights = $11,
        rating = $12, reviews_count = $13, starting_price = $14, duration_days = $15,
        wildlife_highlights = $16, best_months = $17, coordinates = $18, featured = $19,
        eco_score = $20, seo_meta = $21, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [
        id,
        destination.name,
        destination.tagline,
        destination.country,
        destination.region,
        destination.category,
        destination.image,
        destination.heroImage,
        destination.gallery,
        destination.description,
        destination.highlights,
        destination.rating || 0,
        destination.reviewsCount || 0,
        destination.startingPrice || 0,
        destination.durationDays || 1,
        destination.wildlifeHighlights,
        destination.bestMonths,
        JSON.stringify(destination.coordinates),
        destination.featured || false,
        destination.ecoScore || 0,
        JSON.stringify(destination.seo || {}),
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Destination not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update destination'));
  }
});

/**
 * DELETE /api/cms/destinations/:id - Delete destination
 */
router.delete('/destinations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, { message: 'Mock mode - destination not deleted' }));
    }

    await query('UPDATE destinations SET is_active = false WHERE id = $1', [id]);

    res.status(200).json(createResponse(true, { message: 'Destination deleted' }));
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete destination'));
  }
});

// ============ ACCOMMODATION CMS ============

/**
 * GET /api/cms/accommodation - List accommodation
 */
router.get('/accommodation', async (req: Request, res: Response) => {
  try {
    const { country, tier, featured, limit = 50, offset = 0 } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        items: [],
        total: 0,
        limit: Number(limit),
        offset: Number(offset),
      }));
    }

    let sql = 'SELECT * FROM lodges WHERE is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (country) {
      sql += ` AND country = $${paramIndex++}`;
      params.push(country);
    }

    if (tier) {
      sql += ` AND tier = $${paramIndex++}`;
      params.push(tier);
    }

    if (featured !== undefined) {
      sql += ` AND featured = $${paramIndex++}`;
      params.push(featured === 'true');
    }

    sql += ` ORDER BY featured DESC, rating DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      items: result.rows,
      total: result.rows.length,
      limit: Number(limit),
      offset: Number(offset),
    }));
  } catch (error) {
    console.error('Error fetching accommodation:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch accommodation'));
  }
});

// ============ EXPERIENCE CMS ============

/**
 * GET /api/cms/experiences - List experiences
 */
router.get('/experiences', async (req: Request, res: Response) => {
  try {
    const { category, destinationId, limit = 50, offset = 0 } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        items: [],
        total: 0,
        limit: Number(limit),
        offset: Number(offset),
      }));
    }

    let sql = 'SELECT * FROM experiences WHERE is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (destinationId) {
      sql += ` AND destination_id = $${paramIndex++}`;
      params.push(destinationId);
    }

    sql += ` ORDER BY featured DESC, name ASC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      items: result.rows,
      total: result.rows.length,
      limit: Number(limit),
      offset: Number(offset),
    }));
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch experiences'));
  }
});

// ============ TESTIMONIALS CMS ============

/**
 * GET /api/cms/testimonials - List testimonials
 */
router.get('/testimonials', async (req: Request, res: Response) => {
  try {
    const { featured, limit = 50, offset = 0 } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        items: [],
        total: 0,
        limit: Number(limit),
        offset: Number(offset),
      }));
    }

    let sql = 'SELECT * FROM testimonials WHERE is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (featured !== undefined) {
      sql += ` AND featured = $${paramIndex++}`;
      params.push(featured === 'true');
    }

    sql += ` ORDER BY featured DESC, created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      items: result.rows,
      total: result.rows.length,
      limit: Number(limit),
      offset: Number(offset),
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch testimonials'));
  }
});

export default router;
