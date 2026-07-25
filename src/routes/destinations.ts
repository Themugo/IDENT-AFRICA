/**
 * Destinations API Routes
 * CRUD operations for wildlife destinations
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';
import type { DestinationRow } from '../db/types.js';
import { MOCK_DESTINATIONS } from '../server/mockData.js';

const router = Router();

// Response helper
function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * GET /api/destinations - List all destinations
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { country, category, featured, search, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      // Fallback to mock data
      let destinations = [...MOCK_DESTINATIONS];
      
      if (country) {
        destinations = destinations.filter(d => d.country === country);
      }
      if (category) {
        destinations = destinations.filter(d => d.category === category);
      }
      if (featured === 'true') {
        destinations = destinations.filter(d => d.featured);
      }
      if (search) {
        const searchLower = String(search).toLowerCase();
        destinations = destinations.filter(d => 
          d.name.toLowerCase().includes(searchLower) ||
          d.tagline.toLowerCase().includes(searchLower) ||
          d.country.toLowerCase().includes(searchLower)
        );
      }

      return res.status(200).json(createResponse(true, {
        destinations,
        total: destinations.length,
        limit: Number(limit),
        offset: Number(offset),
      }));
    }

    // Build query
    let sql = 'SELECT * FROM destinations WHERE is_active = true';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (country) {
      sql += ` AND country = $${paramIndex++}`;
      params.push(country);
    }
    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (featured === 'true') {
      sql += ' AND featured = true';
    }
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR tagline ILIKE $${paramIndex} OR country ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY rating DESC, featured DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      destinations: result.rows,
      total: result.rowCount || 0,
      limit: Number(limit),
      offset: Number(offset),
    }));
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch destinations', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/destinations/:id - Get single destination
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const destination = MOCK_DESTINATIONS.find(d => d.id === id);
      if (!destination) {
        return res.status(404).json(createResponse(false, undefined, 'Not found', 'Destination not found'));
      }
      return res.status(200).json(createResponse(true, destination));
    }

    const result = await query<DestinationRow>('SELECT * FROM destinations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Destination not found'));
    }

    const destination = result.rows[0];

    // Get gallery images
    const galleryResult = await query('SELECT * FROM destination_gallery WHERE destination_id = $1 ORDER BY display_order', [id]);

    // Get wildlife info
    const wildlifeResult = await query('SELECT * FROM destination_wildlife WHERE destination_id = $1', [id]);

    // Get park info
    const parkResult = await query('SELECT * FROM destination_park_info WHERE destination_id = $1', [id]);

    res.status(200).json(createResponse(true, {
      ...destination,
      gallery: galleryResult.rows,
      wildlife: wildlifeResult.rows,
      parkInfo: parkResult.rows[0] || null,
    }));
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch destination', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/destinations - Create destination (admin)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      id,
      name,
      tagline,
      country,
      region,
      category,
      image_url,
      hero_image_url,
      rating,
      starting_price_usd,
      duration_days,
      description,
      coordinates_lat,
      coordinates_lng,
      featured,
      eco_score,
    } = req.body;

    // Validate required fields
    if (!name || !tagline || !country || !region || !category || !image_url || !starting_price_usd || !description) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields', 'Please provide all required fields'));
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured', 'Please configure DATABASE_URL'));
    }

    const result = await query(
      `INSERT INTO destinations 
       (id, name, tagline, country, region, category, image_url, hero_image_url, rating, starting_price_usd, duration_days, description, coordinates_lat, coordinates_lng, featured, eco_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [id, name, tagline, country, region, category, image_url, hero_image_url, rating || 4.5, starting_price_usd, duration_days || 4, description, coordinates_lat, coordinates_lng, featured || false, eco_score || 9.0]
    );

    res.status(201).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create destination', 'An unexpected error occurred'));
  }
});

/**
 * PUT /api/destinations/:id - Update destination (admin)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured', 'Please configure DATABASE_URL'));
    }

    // Build dynamic update query
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'tagline', 'country', 'region', 'category', 'image_url', 'hero_image_url',
      'rating', 'starting_price_usd', 'duration_days', 'description', 'coordinates_lat',
      'coordinates_lng', 'featured', 'eco_score', 'best_months', 'wildlife_highlights',
      'highlights', 'big_five_probability'
    ];

    for (const field of allowedFields) {
      if (field in updates) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(updates[field]);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'No valid fields to update'));
    }

    values.push(id);
    const result = await query(
      `UPDATE destinations SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Destination not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error updating destination:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update destination', 'An unexpected error occurred'));
  }
});

/**
 * DELETE /api/destinations/:id - Soft delete destination (admin)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured', 'Please configure DATABASE_URL'));
    }

    const result = await query(
      'UPDATE destinations SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Destination not found'));
    }

    res.status(200).json(createResponse(true, { id, deleted: true }));
  } catch (error) {
    console.error('Error deleting destination:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete destination', 'An unexpected error occurred'));
  }
});

export default router;
