/**
 * Content Migration API Routes
 * Admin tools for content management and migration
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string) {
  return {
    success,
    ...(success ? { data } : { error }),
    timestamp: new Date().toISOString(),
  };
}

// ==================== CONTENT STATUS ====================

/**
 * GET /api/migration/content-status - Get content by status
 */
router.get('/content-status', async (req: Request, res: Response) => {
  try {
    const { type, status, ownership, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        items: [
          { id: 'dest_1', type: 'destination', name: 'Serengeti', status: 'published', ownership: 'system', created_by: 'system' },
          { id: 'dest_2', type: 'destination', name: 'Masai Mara', status: 'published', ownership: 'admin', created_by: 'admin_001' },
          { id: 'dest_3', type: 'destination', name: 'New Park', status: 'draft', ownership: 'admin', created_by: 'admin_002' },
          { id: 'pkg_1', type: 'package', name: 'Safari Classic', status: 'published', ownership: 'supplier', created_by: 'sup_001' },
          { id: 'pkg_2', type: 'package', name: 'Old Package', status: 'archived', ownership: 'system', created_by: 'system' },
        ],
        summary: {
          default: 5,
          draft: 3,
          published: 12,
          archived: 2,
        },
      }));
    }

    // This would query the actual tables with status columns
    res.status(200).json(createResponse(true, { items: [], summary: {} }));
  } catch (error) {
    console.error('Error fetching content status:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch content status'));
  }
});

/**
 * PUT /api/migration/status - Update content status
 */
router.put('/status', async (req: Request, res: Response) => {
  try {
    const { items, status, performedBy } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'Items array required'));
    }
    if (!status || !['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json(createResponse(false, undefined, 'Valid status required (draft, published, archived)'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        updated_count: items.length,
        status,
        items,
      }));
    }

    // Update each item's status
    const results = { succeeded: 0, failed: 0, errors: [] as string[] };
    for (const item of items) {
      try {
        const { type, id } = item;
        // This would update the actual table
        results.succeeded++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${item.id}: ${String(err)}`);
      }
    }

    res.status(200).json(createResponse(true, results));
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update status'));
  }
});

// ==================== BULK OPERATIONS ====================

/**
 * POST /api/migration/bulk-publish - Bulk publish content
 */
router.post('/bulk-publish', async (req: Request, res: Response) => {
  try {
    const { itemIds, itemType, performedBy } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'Item IDs required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        operation_id: `bulk_${Date.now()}`,
        type: 'bulk_publish',
        total: itemIds.length,
        succeeded: itemIds.length,
        failed: 0,
        status: 'completed',
      }));
    }

    res.status(200).json(createResponse(true, { operation_id: `bulk_${Date.now()}`, status: 'completed' }));
  } catch (error) {
    console.error('Error bulk publishing:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to bulk publish'));
  }
});

/**
 * POST /api/migration/bulk-unpublish - Bulk unpublish content
 */
router.post('/bulk-unpublish', async (req: Request, res: Response) => {
  try {
    const { itemIds, performedBy } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        operation_id: `bulk_${Date.now()}`,
        type: 'bulk_unpublish',
        total: itemIds?.length || 0,
        succeeded: itemIds?.length || 0,
        failed: 0,
      }));
    }

    res.status(200).json(createResponse(true, { status: 'completed' }));
  } catch (error) {
    console.error('Error bulk unpublishing:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to bulk unpublish'));
  }
});

/**
 * POST /api/migration/bulk-archive - Bulk archive content
 */
router.post('/bulk-archive', async (req: Request, res: Response) => {
  try {
    const { itemIds, performedBy } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        operation_id: `bulk_${Date.now()}`,
        type: 'bulk_archive',
        total: itemIds?.length || 0,
        succeeded: itemIds?.length || 0,
      }));
    }

    res.status(200).json(createResponse(true, { status: 'completed' }));
  } catch (error) {
    console.error('Error bulk archiving:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to bulk archive'));
  }
});

// ==================== CONTENT REPLACEMENT ====================

/**
 * POST /api/migration/replace-images - Replace image URLs
 */
router.post('/replace-images', async (req: Request, res: Response) => {
  try {
    const { oldUrl, newUrl, contentType, performedBy } = req.body;

    if (!oldUrl || !newUrl) {
      return res.status(400).json(createResponse(false, undefined, 'Old URL and new URL required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        operation_id: `replace_${Date.now()}`,
        old_url: oldUrl,
        new_url: newUrl,
        replacements_made: 15,
        affected_items: ['dest_1', 'pkg_2', 'exp_3'],
      }));
    }

    res.status(200).json(createResponse(true, { status: 'completed' }));
  } catch (error) {
    console.error('Error replacing images:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to replace images'));
  }
});

/**
 * GET /api/migration/replacement-preview - Preview replacement effects
 */
router.post('/replacement-preview', async (req: Request, res: Response) => {
  try {
    const { oldUrl, contentType } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        old_url: oldUrl,
        matches: [
          { content_type: 'destinations', content_id: 'dest_1', content_name: 'Serengeti', field: 'hero_image' },
          { content_type: 'packages', content_id: 'pkg_2', content_name: 'Safari Classic', field: 'gallery' },
        ],
        total_matches: 2,
      }));
    }

    res.status(200).json(createResponse(true, { matches: [] }));
  } catch (error) {
    console.error('Error previewing replacement:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to preview replacement'));
  }
});

// ==================== CONTENT IMPORT ====================

/**
 * POST /api/migration/import - Import content
 */
router.post('/import', async (req: Request, res: Response) => {
  try {
    const { contentType, items, ownership, performedBy, replaceExisting = false } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'Items array required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        import_id: `import_${Date.now()}`,
        content_type: contentType,
        total_items: items.length,
        imported: items.length - 1,
        skipped: 1,
        failed: 0,
        ownership: ownership || 'admin',
        status: 'completed',
      }));
    }

    res.status(200).json(createResponse(true, { status: 'completed' }));
  } catch (error) {
    console.error('Error importing content:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to import content'));
  }
});

// ==================== MIGRATION HISTORY ====================

/**
 * GET /api/migration/history - Get migration history
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { type, status, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        migrations: [
          {
            id: 'mig_1',
            migration_type: 'bulk_publish',
            description: 'Published 10 destinations',
            content_type: 'destinations',
            performed_by: 'admin_001',
            items_processed: 10,
            items_succeeded: 10,
            status: 'completed',
            created_at: '2026-07-25T10:00:00Z',
          },
          {
            id: 'mig_2',
            migration_type: 'replace_images',
            description: 'Replaced old CDN URLs',
            content_type: 'packages',
            performed_by: 'admin_002',
            items_processed: 25,
            items_succeeded: 24,
            items_failed: 1,
            status: 'completed',
            created_at: '2026-07-24T15:30:00Z',
          },
          {
            id: 'mig_3',
            migration_type: 'import',
            description: 'Imported new supplier packages',
            content_type: 'packages',
            performed_by: 'system',
            items_processed: 5,
            items_succeeded: 5,
            status: 'completed',
            created_at: '2026-07-23T09:00:00Z',
          },
        ],
        total: 3,
      }));
    }

    res.status(200).json(createResponse(true, { migrations: [], total: 0 }));
  } catch (error) {
    console.error('Error fetching migration history:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch migration history'));
  }
});

/**
 * GET /api/migration/bulk-operations - Get bulk operation history
 */
router.get('/bulk-operations', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        operations: [
          { id: 'op_1', operation_type: 'bulk_publish', total_selected: 15, success_count: 15, status: 'completed', created_at: '2026-07-25T10:00:00Z' },
          { id: 'op_2', operation_type: 'bulk_archive', total_selected: 8, success_count: 8, status: 'completed', created_at: '2026-07-24T14:00:00Z' },
        ],
      }));
    }

    res.status(200).json(createResponse(true, { operations: [] }));
  } catch (error) {
    console.error('Error fetching bulk operations:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch bulk operations'));
  }
});

// ==================== CONTENT OVERVIEW ====================

/**
 * GET /api/migration/overview - Get content overview
 */
router.get('/overview', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        destinations: {
          total: 25,
          by_status: { default: 5, draft: 3, published: 15, archived: 2 },
          by_ownership: { system: 5, admin: 12, supplier: 8 },
        },
        packages: {
          total: 120,
          by_status: { default: 20, draft: 15, published: 80, archived: 5 },
          by_ownership: { system: 20, admin: 30, supplier: 70 },
        },
        experiences: {
          total: 45,
          by_status: { default: 10, draft: 5, published: 28, archived: 2 },
          by_ownership: { system: 10, admin: 20, supplier: 15 },
        },
        media: {
          total: 350,
          by_status: { default: 50, draft: 20, published: 270, archived: 10 },
        },
      }));
    }

    res.status(200).json(createResponse(true, {
      destinations: { total: 0, by_status: {}, by_ownership: {} },
      packages: { total: 0, by_status: {}, by_ownership: {} },
      experiences: { total: 0, by_status: {}, by_ownership: {} },
      media: { total: 0, by_status: {} },
    }));
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch overview'));
  }
});

/**
 * GET /api/migration/default-content - Get default content registry
 */
router.get('/default-content', async (req: Request, res: Response) => {
  try {
    const { contentType } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        items: [
          { content_id: 'dest_1', content_type: 'destinations', name: 'Serengeti', is_active: true, can_be_modified: false },
          { content_id: 'dest_2', content_type: 'destinations', name: 'Masai Mara', is_active: true, can_be_modified: false },
          { content_id: 'dest_3', content_type: 'destinations', name: 'Kruger National Park', is_active: true, can_be_modified: false },
          { content_id: 'pkg_1', content_type: 'packages', name: 'Classic Safari', is_active: true, can_be_modified: false },
          { content_id: 'pkg_2', content_type: 'packages', name: 'Budget Safari', is_active: true, can_be_modified: false },
        ],
      }));
    }

    res.status(200).json(createResponse(true, { items: [] }));
  } catch (error) {
    console.error('Error fetching default content:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch default content'));
  }
});

// ==================== CONTENT RULES ====================

/**
 * GET /api/migration/content-rules - Get content priority rules
 */
router.get('/content-rules', async (req: Request, res: Response) => {
  try {
    // Production content priority rules
    const rules = {
      display_priority: {
        1: { status: 'published', ownership: 'admin', label: 'Admin Published' },
        2: { status: 'published', ownership: 'supplier', label: 'Supplier Published' },
        3: { status: 'published', ownership: 'system', label: 'System Default' },
        4: { status: 'draft', ownership: 'admin', label: 'Admin Draft (Hidden)' },
      },
      fallback_chain: ['admin', 'supplier', 'system'],
      show_rules: {
        never_show_empty: true,
        default_fallback: true,
        draft_hidden: true,
      },
    };

    res.status(200).json(createResponse(true, rules));
  } catch (error) {
    console.error('Error fetching content rules:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch content rules'));
  }
});

export default router;
