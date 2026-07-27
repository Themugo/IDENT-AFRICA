/**
 * Page Builder API Routes
 * 
 * Block-based page builder with protected components.
 * Admin controls content, not structure.
 */

import { Router, Request, Response } from 'express';
import { query, transaction, isDatabaseConnected } from '../db/index.js';
import type { PageType, BlockType, BlockContent, BlockSettings } from '../types/blocks.js';

const router = Router();

// Response helper
function createResponse<T>(data: T, error?: string) {
  return {
    success: !error,
    data,
    ...(error ? { error } : {}),
    timestamp: new Date().toISOString(),
  };
}

// Mock blocks for when database is not connected
const MOCK_BLOCKS: Record<PageType, Array<{
  id: string;
  page: PageType;
  sectionType: BlockType;
  content: BlockContent;
  settings: BlockSettings;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}>> = {
  homepage: [
    {
      id: 'block-hero-1',
      page: 'homepage',
      sectionType: 'hero',
      content: {
        title: 'East Africa\'s Finest Safari Expeditions',
        subtitle: 'Experience the wild heart of Africa with curated luxury expeditions across Kenya, Tanzania, Uganda & Rwanda',
        ctaText: 'Start Your Journey',
        ctaLink: '/destinations',
        backgroundImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
        overlayOpacity: 0.4,
        alignment: 'center',
        minHeight: 'full',
      },
      settings: { visible: true, containerWidth: 'full', paddingTop: 'none', paddingBottom: 'none' },
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'block-dest-1',
      page: 'homepage',
      sectionType: 'destination',
      content: {
        title: 'Featured Destinations',
        subtitle: 'Discover our most sought-after wildlife destinations',
        layout: 'grid',
        columns: 3,
        destinationIds: [],
        showFilters: true,
        limit: 6,
      },
      settings: { visible: true, containerWidth: 'wide', paddingTop: 'lg', paddingBottom: 'lg' },
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'block-exp-1',
      page: 'homepage',
      sectionType: 'experience',
      content: {
        title: 'Unforgettable Experiences',
        subtitle: 'From mountain gorilla encounters to great migration spectacles',
        layout: 'grid',
        columns: 3,
        showViewAll: true,
        viewAllLink: '/experiences',
      },
      settings: { visible: true, containerWidth: 'wide', paddingTop: 'lg', paddingBottom: 'lg', backgroundColor: '#292524' },
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'block-pkg-1',
      page: 'homepage',
      sectionType: 'package',
      content: {
        title: 'Curated Safari Packages',
        subtitle: 'Expertly designed expeditions for every type of traveler',
        layout: 'grid',
        columns: 3,
        showViewAll: true,
      },
      settings: { visible: true, containerWidth: 'wide', paddingTop: 'lg', paddingBottom: 'lg' },
      displayOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'block-test-1',
      page: 'homepage',
      sectionType: 'testimonial',
      content: {
        title: 'Traveler Stories',
        subtitle: 'Hear from those who\'ve experienced the magic of East Africa',
        layout: 'slider',
        showRating: true,
        showAvatar: true,
        autoPlay: true,
      },
      settings: { visible: true, containerWidth: 'wide', paddingTop: 'lg', paddingBottom: 'lg', backgroundColor: '#1C1917' },
      displayOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'block-cta-1',
      page: 'homepage',
      sectionType: 'cta',
      content: {
        title: 'Ready for Your Safari?',
        subtitle: 'Let us create your perfect African adventure',
        buttonText: 'Get Started',
        buttonLink: '/contact',
        buttonStyle: 'primary',
        alignment: 'center',
      },
      settings: { visible: true, containerWidth: 'narrow', paddingTop: 'xl', paddingBottom: 'xl', backgroundColor: '#F59E0B' },
      displayOrder: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  destinations: [
    {
      id: 'block-dest-hero',
      page: 'destinations',
      sectionType: 'hero',
      content: {
        title: 'Wildlife Destinations',
        subtitle: 'Explore the most breathtaking wildlife destinations in East Africa',
        ctaText: '',
        ctaLink: '',
        backgroundImage: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1920&q=80',
        overlayOpacity: 0.5,
        alignment: 'center',
        minHeight: 'large',
      },
      settings: { visible: true, containerWidth: 'full', paddingTop: 'none', paddingBottom: 'none' },
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'block-dest-list',
      page: 'destinations',
      sectionType: 'destination',
      content: {
        title: '',
        layout: 'grid',
        columns: 3,
        destinationIds: [],
        showFilters: true,
        limit: 20,
      },
      settings: { visible: true, containerWidth: 'wide', paddingTop: 'lg', paddingBottom: 'lg' },
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  accommodation: [
    {
      id: 'block-hotel-hero',
      page: 'accommodation',
      sectionType: 'hero',
      content: {
        title: 'Luxury Accommodation',
        subtitle: 'Handpicked lodges, camps, and villas for your perfect safari',
        ctaText: '',
        ctaLink: '',
        backgroundImage: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1920&q=80',
        overlayOpacity: 0.5,
        alignment: 'center',
        minHeight: 'large',
      },
      settings: { visible: true, containerWidth: 'full', paddingTop: 'none', paddingBottom: 'none' },
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  experiences: [
    {
      id: 'block-exp-hero',
      page: 'experiences',
      sectionType: 'hero',
      content: {
        title: 'Unforgettable Experiences',
        subtitle: 'From gorilla trekking to hot air balloon safaris',
        ctaText: '',
        ctaLink: '',
        backgroundImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1920&q=80',
        overlayOpacity: 0.5,
        alignment: 'center',
        minHeight: 'large',
      },
      settings: { visible: true, containerWidth: 'full', paddingTop: 'none', paddingBottom: 'none' },
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  packages: [
    {
      id: 'block-pkg-hero',
      page: 'packages',
      sectionType: 'hero',
      content: {
        title: 'Safari Packages',
        subtitle: 'Expertly designed expeditions for every type of traveler',
        ctaText: '',
        ctaLink: '',
        backgroundImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
        overlayOpacity: 0.5,
        alignment: 'center',
        minHeight: 'large',
      },
      settings: { visible: true, containerWidth: 'full', paddingTop: 'none', paddingBottom: 'none' },
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  about: [
    {
      id: 'block-about-hero',
      page: 'about',
      sectionType: 'hero',
      content: {
        title: 'About Ident Africa',
        subtitle: 'Your trusted partner for luxury East Africa safaris',
        ctaText: '',
        ctaLink: '',
        backgroundImage: '',
        overlayOpacity: 0.6,
        alignment: 'center',
        minHeight: 'medium',
      },
      settings: { visible: true, containerWidth: 'full', paddingTop: 'none', paddingBottom: 'none' },
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  contact: [
    {
      id: 'block-contact-hero',
      page: 'contact',
      sectionType: 'hero',
      content: {
        title: 'Contact Us',
        subtitle: 'Let\'s plan your perfect African adventure',
        ctaText: '',
        ctaLink: '',
        backgroundImage: '',
        overlayOpacity: 0.6,
        alignment: 'center',
        minHeight: 'medium',
      },
      settings: { visible: true, containerWidth: 'full', paddingTop: 'none', paddingBottom: 'none' },
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

// ============ PAGE BLOCKS ============

/**
 * GET /api/page-builder/:page - Get all blocks for a page
 */
router.get('/:page', async (req: Request, res: Response) => {
  try {
    const { page } = req.params as { page: PageType };

    if (!isDatabaseConnected()) {
      const blocks = MOCK_BLOCKS[page] || [];
      return res.status(200).json(createResponse({
        page,
        blocks,
        total: blocks.length,
      }));
    }

    interface PageSectionRow {
      id: string;
      page: string;
      section_type: string;
      content_json: Record<string, unknown>;
      settings_json: Record<string, unknown>;
      display_order: number;
      visible: boolean;
      created_at: string;
      updated_at: string;
    }

    const result = await query<PageSectionRow>(
      `SELECT id, page, section_type, content_json, settings_json, display_order, visible, created_at, updated_at
       FROM page_sections 
       WHERE page = $1 
       ORDER BY display_order ASC`,
      [page]
    );

    const blocks = result.rows.map(row => ({
      id: row.id,
      page: row.page,
      sectionType: row.section_type,
      content: row.content_json,
      settings: row.settings_json,
      displayOrder: row.display_order,
      visible: row.visible,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    res.status(200).json(createResponse({
      page,
      blocks,
      total: blocks.length,
    }));
  } catch (error) {
    console.error('Error fetching page blocks:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch page blocks'));
  }
});

// ============ BLOCK CRUD ============

/**
 * POST /api/page-builder/:page/blocks - Add a new block
 */
router.post('/:page/blocks', async (req: Request, res: Response) => {
  try {
    const { page } = req.params as { page: PageType };
    const { sectionType, content, settings } = req.body as {
      sectionType: BlockType;
      content: BlockContent;
      settings?: BlockSettings;
    };

    if (!sectionType) {
      return res.status(400).json(createResponse(undefined, 'Section type is required'));
    }

    // Get max order
    let maxOrder = 0;
    if (isDatabaseConnected()) {
      interface OrderRow { max_order: number }
      const orderResult = await query<OrderRow>(
        'SELECT COALESCE(MAX(display_order), 0) as max_order FROM page_sections WHERE page = $1',
        [page]
      );
      maxOrder = orderResult.rows[0]?.max_order || 0;
    }

    const newBlock = {
      id: `block-${Date.now()}`,
      page,
      sectionType,
      content: content || {},
      settings: settings || { visible: true },
      displayOrder: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDatabaseConnected()) {
      await query(
        `INSERT INTO page_sections (page, section_type, content_json, settings_json, display_order, visible, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          page,
          sectionType,
          JSON.stringify(content || {}),
          JSON.stringify(settings || { visible: true }),
          maxOrder + 1,
          settings?.visible ?? true,
          'admin',
        ]
      );
    }

    res.status(201).json(createResponse(newBlock));
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(500).json(createResponse(undefined, 'Failed to create block'));
  }
});

/**
 * PUT /api/page-builder/blocks/:id - Update a block
 */
router.put('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, settings } = req.body as {
      content?: BlockContent;
      settings?: Partial<BlockSettings>;
    };

    if (!content && !settings) {
      return res.status(400).json(createResponse(undefined, 'Content or settings required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({
        id,
        content: content || {},
        settings: settings || {},
        updatedAt: new Date().toISOString(),
      }));
    }

    let updateFields: string[] = [];
    let params: unknown[] = [];
    let paramIndex = 1;

    if (content) {
      updateFields.push(`content_json = $${paramIndex++}`);
      params.push(JSON.stringify(content));
    }

    if (settings) {
      if (settings.visible !== undefined) {
        updateFields.push(`visible = $${paramIndex++}`);
        params.push(settings.visible);
      }
      updateFields.push(`settings_json = settings_json || $${paramIndex++}`);
      params.push(JSON.stringify(settings));
    }

    params.push(id);

    interface PageSectionRow {
      id: string;
      page: string;
      section_type: string;
      content_json: Record<string, unknown>;
      settings_json: Record<string, unknown>;
      display_order: number;
      visible: boolean;
      created_at: string;
      updated_at: string;
    }

    const result = await query<PageSectionRow>(
      `UPDATE page_sections SET ${updateFields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, page, section_type, content_json, settings_json, display_order, visible, created_at, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(undefined, 'Block not found'));
    }

    const row = result.rows[0];
    res.status(200).json(createResponse({
      id: row.id,
      page: row.page,
      sectionType: row.section_type,
      content: row.content_json,
      settings: row.settings_json,
      displayOrder: row.display_order,
      visible: row.visible,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json(createResponse(undefined, 'Failed to update block'));
  }
});

/**
 * DELETE /api/page-builder/blocks/:id - Delete a block
 */
router.delete('/blocks/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({ message: 'Block deleted (mock mode)' }));
    }

    const result = await query(
      'DELETE FROM page_sections WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(undefined, 'Block not found'));
    }

    // Reorder remaining blocks
    await query(
      `UPDATE page_sections 
       SET display_order = display_order - 1 
       WHERE page = (SELECT page FROM page_sections WHERE id = $1) 
       AND display_order > (SELECT display_order FROM page_sections WHERE id = $1)`,
      [id]
    );

    res.status(200).json(createResponse({ message: 'Block deleted' }));
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json(createResponse(undefined, 'Failed to delete block'));
  }
});

// ============ BLOCK REORDERING ============

/**
 * PUT /api/page-builder/:page/reorder - Reorder blocks
 */
router.put('/:page/reorder', async (req: Request, res: Response) => {
  try {
    const { page } = req.params as { page: PageType };
    const { blockIds } = req.body as { blockIds: string[] };

    if (!blockIds || !Array.isArray(blockIds)) {
      return res.status(400).json(createResponse(undefined, 'blockIds array required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({ message: 'Blocks reordered (mock mode)' }));
    }

    await transaction(async (client) => {
      for (let i = 0; i < blockIds.length; i++) {
        await client.query(
          'UPDATE page_sections SET display_order = $1 WHERE id = $2 AND page = $3',
          [i + 1, blockIds[i], page]
        );
      }
    });

    res.status(200).json(createResponse({ message: 'Blocks reordered' }));
  } catch (error) {
    console.error('Error reordering blocks:', error);
    res.status(500).json(createResponse(undefined, 'Failed to reorder blocks'));
  }
});

// ============ BLOCK VISIBILITY ============

/**
 * PUT /api/page-builder/blocks/:id/visibility - Toggle block visibility
 */
router.put('/blocks/:id/visibility', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { visible } = req.body as { visible: boolean };

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse({ id, visible, updatedAt: new Date().toISOString() }));
    }

    interface VisibilityRow { id: string; visible: boolean; updated_at: string }
    const result = await query<VisibilityRow>(
      'UPDATE page_sections SET visible = $1, updated_at = NOW() WHERE id = $2 RETURNING id, visible, updated_at',
      [visible, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(undefined, 'Block not found'));
    }

    res.status(200).json(createResponse({
      id: result.rows[0].id,
      visible: result.rows[0].visible,
      updatedAt: result.rows[0].updated_at,
    }));
  } catch (error) {
    console.error('Error toggling block visibility:', error);
    res.status(500).json(createResponse(undefined, 'Failed to toggle visibility'));
  }
});

// ============ AVAILABLE BLOCKS ============

/**
 * GET /api/page-builder/:page/available-blocks - Get available block types for a page
 */
router.get('/:page/available-blocks', async (req: Request, res: Response) => {
  try {
    const { page } = req.params;

    const availableBlocks: BlockType[] = [
      'hero',
      'destination',
      'experience',
      'hotel',
      'package',
      'gallery',
      'testimonial',
      'partner',
      'cta',
    ];

    const blockDescriptions: Record<BlockType, { name: string; description: string; icon: string }> = {
      hero: { name: 'Hero Section', description: 'Full-width hero with title and CTA', icon: 'layout' },
      destination: { name: 'Destinations', description: 'Display destinations in grid or carousel', icon: 'map' },
      experience: { name: 'Experiences', description: 'Show safari experiences and activities', icon: 'compass' },
      hotel: { name: 'Accommodation', description: 'Display lodges, camps, and hotels', icon: 'building' },
      package: { name: 'Safari Packages', description: 'Show curated safari itineraries', icon: 'package' },
      gallery: { name: 'Gallery', description: 'Image gallery with lightbox', icon: 'image' },
      testimonial: { name: 'Testimonials', description: 'Customer reviews and testimonials', icon: 'quote' },
      partner: { name: 'Partners', description: 'Show partner logos', icon: 'handshake' },
      cta: { name: 'Call to Action', description: 'Conversion-focused section', icon: 'mouse-pointer' },
    };

    res.status(200).json(createResponse({
      page,
      availableBlocks,
      blockDescriptions,
    }));
  } catch (error) {
    console.error('Error fetching available blocks:', error);
    res.status(500).json(createResponse(undefined, 'Failed to fetch available blocks'));
  }
});

export default router;
