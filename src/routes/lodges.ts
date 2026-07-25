/**
 * Lodges API Routes
 * CRUD operations for hotels and accommodations
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';
import type { LodgeRow } from '../db/types.js';
import { MOCK_LODGES } from '../server/mockData.js';

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

/**
 * GET /api/lodges - List all lodges
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { country, category, featured, search, min_price, max_price, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      let lodges = [...MOCK_LODGES];
      
      if (country) {
        lodges = lodges.filter(l => l.country === country);
      }
      if (category) {
        lodges = lodges.filter(l => l.category === category);
      }
      if (featured === 'true') {
        lodges = lodges.filter(l => l.featured);
      }
      if (search) {
        const searchLower = String(search).toLowerCase();
        lodges = lodges.filter(l => {
          const tagline = 'tagline' in l ? (l as Record<string, unknown>).tagline : undefined;
          return (
            l.name.toLowerCase().includes(searchLower) ||
            (typeof tagline === 'string' && tagline.toLowerCase().includes(searchLower)) ||
            l.country.toLowerCase().includes(searchLower)
          );
        });
      }
      if (min_price) {
        lodges = lodges.filter(l => l.pricePerNight >= Number(min_price));
      }
      if (max_price) {
        lodges = lodges.filter(l => l.pricePerNight <= Number(max_price));
      }

      return res.status(200).json(createResponse(true, {
        lodges,
        total: lodges.length,
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
    if (category) {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (featured === 'true') {
      sql += ' AND featured = true';
    }
    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR tagline ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (min_price) {
      sql += ` AND price_per_night_usd >= $${paramIndex++}`;
      params.push(Number(min_price));
    }
    if (max_price) {
      sql += ` AND price_per_night_usd <= $${paramIndex++}`;
      params.push(Number(max_price));
    }

    sql += ` ORDER BY rating DESC, featured DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      lodges: result.rows,
      total: result.rowCount || 0,
      limit: Number(limit),
      offset: Number(offset),
    }));
  } catch (error) {
    console.error('Error fetching lodges:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch lodges', 'An unexpected error occurred'));
  }
});

/**
 * GET /api/lodges/:id - Get single lodge
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const lodge = MOCK_LODGES.find(l => l.id === id);
      if (!lodge) {
        return res.status(404).json(createResponse(false, undefined, 'Not found', 'Lodge not found'));
      }
      return res.status(200).json(createResponse(true, lodge));
    }

    const result = await query('SELECT * FROM lodges WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Lodge not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching lodge:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch lodge', 'An unexpected error occurred'));
  }
});

/**
 * POST /api/lodges - Create lodge (admin)
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
      price_per_night_usd,
      max_guests,
      bedrooms,
      bathrooms,
      amenities,
      description,
      highlights,
      coordinates_lat,
      coordinates_lng,
      featured,
    } = req.body;

    if (!name || !tagline || !country || !region || !category || !image_url || !price_per_night_usd || !description) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields', 'Please provide all required fields'));
    }

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured', 'Please configure DATABASE_URL'));
    }

    const result = await query(
      `INSERT INTO lodges 
       (id, name, tagline, country, region, category, image_url, hero_image_url, rating, price_per_night_usd, max_guests, bedrooms, bathrooms, amenities, description, highlights, coordinates_lat, coordinates_lng, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [id, name, tagline, country, region, category, image_url, hero_image_url, rating || 4.5, price_per_night_usd, max_guests || 4, bedrooms || 2, bathrooms || 2, amenities || [], description, highlights || [], coordinates_lat, coordinates_lng, featured || false]
    );

    res.status(201).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error creating lodge:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create lodge', 'An unexpected error occurred'));
  }
});

/**
 * PUT /api/lodges/:id - Update lodge (admin)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured', 'Please configure DATABASE_URL'));
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const allowedFields = [
      'name', 'tagline', 'country', 'region', 'category', 'image_url', 'hero_image_url',
      'rating', 'price_per_night_usd', 'max_guests', 'bedrooms', 'bathrooms',
      'amenities', 'description', 'highlights', 'coordinates_lat', 'coordinates_lng', 'featured'
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
      `UPDATE lodges SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Lodge not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error updating lodge:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update lodge', 'An unexpected error occurred'));
  }
});

/**
 * DELETE /api/lodges/:id - Soft delete lodge (admin)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured', 'Please configure DATABASE_URL'));
    }

    const result = await query(
      'UPDATE lodges SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Not found', 'Lodge not found'));
    }

    res.status(200).json(createResponse(true, { id, deleted: true }));
  } catch (error) {
    console.error('Error deleting lodge:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete lodge', 'An unexpected error occurred'));
  }
});

export default router;
