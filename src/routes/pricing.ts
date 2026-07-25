/**
 * Pricing API Routes
 * Dynamic pricing engine for travel packages and destinations
 */

import { Router, Request, Response } from 'express';
import { query, transaction, isDatabaseConnected } from '../db/index.js';
import { pricingService } from '../services/pricing/index.js';
import type { PricingRule, PromotionalCampaign } from '../services/pricing/types.js';

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

// ==================== PRICE CALCULATION ====================

/**
 * POST /api/pricing/calculate - Calculate dynamic price
 */
router.post('/calculate', async (req: Request, res: Response) => {
  try {
    const { 
      entityId, 
      entityType = 'package',
      basePrice,
      travelDate,
      travelers = 1,
      promoCode,
      userId
    } = req.body;

    if (!entityId || !basePrice || !travelDate) {
      return res.status(400).json(createResponse(
        false, 
        undefined, 
        'Missing required fields',
        'entityId, basePrice, and travelDate are required'
      ));
    }

    const calculation = await pricingService.calculatePrice({
      entityId,
      entityType,
      basePrice: Number(basePrice),
      travelDate,
      travelers: Number(travelers),
      promoCode,
      userId,
    });

    res.status(200).json(createResponse(true, calculation));
  } catch (error) {
    console.error('Error calculating price:', error);
    res.status(500).json(createResponse(false, undefined, 'Price calculation failed'));
  }
});

/**
 * GET /api/pricing/display/:entityId - Get price display for entity
 */
router.get('/display/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityId } = req.params;
    const { basePrice, travelers = '1' } = req.query;

    if (!basePrice) {
      return res.status(400).json(createResponse(
        false, 
        undefined, 
        'Missing basePrice parameter'
      ));
    }

    const display = await pricingService.getPriceDisplay(
      entityId,
      Number(basePrice),
      Number(travelers)
    );

    res.status(200).json(createResponse(true, display));
  } catch (error) {
    console.error('Error getting price display:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to get price display'));
  }
});

/**
 * POST /api/pricing/validate-promo - Validate promo code
 */
router.post('/validate-promo', async (req: Request, res: Response) => {
  try {
    const { code, amount } = req.body;

    if (!code || !amount) {
      return res.status(400).json(createResponse(
        false, 
        undefined, 
        'Missing required fields',
        'code and amount are required'
      ));
    }

    const validation = await pricingService.validatePromoCode(code, Number(amount));

    res.status(200).json(createResponse(true, validation));
  } catch (error) {
    console.error('Error validating promo:', error);
    res.status(500).json(createResponse(false, undefined, 'Promo validation failed'));
  }
});

/**
 * POST /api/pricing/redeem-promo - Redeem promo code
 */
router.post('/redeem-promo', async (req: Request, res: Response) => {
  try {
    const { code, userId, bookingId, orderAmount } = req.body;

    if (!code || !userId || !orderAmount) {
      return res.status(400).json(createResponse(
        false, 
        undefined, 
        'Missing required fields'
      ));
    }

    const result = await pricingService.redeemPromoCode(code, userId, bookingId, Number(orderAmount));

    if (!result.success) {
      return res.status(400).json(createResponse(false, undefined, result.error));
    }

    res.status(200).json(createResponse(true, result));
  } catch (error) {
    console.error('Error redeeming promo:', error);
    res.status(500).json(createResponse(false, undefined, 'Promo redemption failed'));
  }
});

// ==================== PRICING RULES ====================

/**
 * GET /api/pricing/rules - List all pricing rules
 */
router.get('/rules', async (req: Request, res: Response) => {
  try {
    const { entityId, entityType, ruleType, isActive, isApproved, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      const rules = await pricingService.getRules(entityId as string || '');
      return res.status(200).json(createResponse(true, { rules, total: rules.length }));
    }

    let sql = 'SELECT * FROM pricing_rules WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (entityId) {
      sql += ` AND entity_id = $${paramIndex++}`;
      params.push(entityId);
    }
    if (entityType) {
      sql += ` AND entity_type = $${paramIndex++}`;
      params.push(entityType);
    }
    if (ruleType) {
      sql += ` AND rule_type = $${paramIndex++}`;
      params.push(ruleType);
    }
    if (isActive !== undefined) {
      sql += ` AND is_active = $${paramIndex++}`;
      params.push(isActive === 'true');
    }
    if (isApproved !== undefined) {
      sql += ` AND is_approved = $${paramIndex++}`;
      params.push(isApproved === 'true');
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      rules: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch pricing rules'));
  }
});

/**
 * GET /api/pricing/rules/:id - Get rule by ID
 */
router.get('/rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(503).json(createResponse(false, undefined, 'Database not configured'));
    }

    const result = await query('SELECT * FROM pricing_rules WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Rule not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching rule:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch rule'));
  }
});

/**
 * POST /api/pricing/rules - Create pricing rule
 */
router.post('/rules', async (req: Request, res: Response) => {
  try {
    const {
      entityId,
      entityType,
      ruleType,
      action = 'percentage',
      percentageChange = 0,
      fixedAmount = 0,
      startDate,
      endDate,
      minTravelers = 1,
      maxTravelers,
      minDaysNotice,
      isWeekendOnly = false,
      name,
      description,
      promoCode,
      priority = 0,
      isActive = true,
      supplierId,
    } = req.body;

    if (!entityId || !entityType || !ruleType || !name) {
      return res.status(400).json(createResponse(
        false, 
        undefined, 
        'Missing required fields',
        'entityId, entityType, ruleType, and name are required'
      ));
    }

    if (!isDatabaseConnected()) {
      const rule = await pricingService.createRule({
        entityId,
        entityType,
        ruleType,
        action,
        percentageChange,
        fixedAmount,
        startDate,
        endDate,
        minTravelers,
        maxTravelers,
        minDaysNotice,
        isWeekendOnly,
        name,
        description,
        promoCode,
        priority,
        isActive,
        supplierId,
      });
      return res.status(201).json(createResponse(true, rule, 'Rule created'));
    }

    const id = `rule_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const result = await query<PricingRule>(
      `INSERT INTO pricing_rules (
        id, entity_id, entity_type, rule_type, action, percentage_change, fixed_amount,
        start_date, end_date, min_travelers, max_travelers, min_days_notice, is_weekend_only,
        name, description, promo_code, priority, is_active, is_approved, supplier_id, requires_supplier_approval
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        id, entityId, entityType, ruleType, action, percentageChange, fixedAmount,
        startDate || null, endDate || null, minTravelers, maxTravelers || null,
        minDaysNotice || null, isWeekendOnly, name, description || null,
        promoCode || null, priority, isActive, false, supplierId || null, !!supplierId
      ]
    );

    // Log creation
    await query(
      'INSERT INTO audit_logs (entity_type, entity_id, action, new_value) VALUES ($1, $2, $3, $4)',
      ['pricing_rule', id, 'pricing_rule_created', JSON.stringify({ name, ruleType, entityId })]
    );

    res.status(201).json(createResponse(true, result.rows[0], 'Pricing rule created'));
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create pricing rule'));
  }
});

/**
 * PUT /api/pricing/rules/:id - Update pricing rule
 */
router.put('/rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!isDatabaseConnected()) {
      const rule = await pricingService.updateRule(id, updates);
      if (!rule) {
        return res.status(404).json(createResponse(false, undefined, 'Rule not found'));
      }
      return res.status(200).json(createResponse(true, rule, 'Rule updated'));
    }

    const allowedFields = [
      'rule_type', 'action', 'percentage_change', 'fixed_amount',
      'start_date', 'end_date', 'min_travelers', 'max_travelers',
      'min_days_notice', 'is_weekend_only', 'name', 'description',
      'promo_code', 'priority', 'is_active'
    ];

    const setClauses: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        setClauses.push(`${dbField} = $${paramIndex++}`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'No valid fields to update'));
    }

    params.push(id);
    const result = await query(
      `UPDATE pricing_rules SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Rule not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0], 'Rule updated'));
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update rule'));
  }
});

/**
 * DELETE /api/pricing/rules/:id - Delete pricing rule
 */
router.delete('/rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isDatabaseConnected()) {
      const deleted = await pricingService.deleteRule(id);
      if (!deleted) {
        return res.status(404).json(createResponse(false, undefined, 'Rule not found'));
      }
      return res.status(200).json(createResponse(true, undefined, 'Rule deleted'));
    }

    const result = await query(
      'DELETE FROM pricing_rules WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Rule not found'));
    }

    await query(
      'INSERT INTO audit_logs (entity_type, entity_id, action) VALUES ($1, $2, $3)',
      ['pricing_rule', id, 'pricing_rule_deleted']
    );

    res.status(200).json(createResponse(true, undefined, 'Rule deleted'));
  } catch (error) {
    console.error('Error deleting rule:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to delete rule'));
  }
});

/**
 * POST /api/pricing/rules/:id/approve - Approve pricing rule
 */
router.post('/rules/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;

    if (!isDatabaseConnected()) {
      const rule = await pricingService.approveRule(id, approvedBy || 'admin');
      if (!rule) {
        return res.status(404).json(createResponse(false, undefined, 'Rule not found'));
      }
      return res.status(200).json(createResponse(true, rule, 'Rule approved'));
    }

    const result = await query(
      `UPDATE pricing_rules SET is_approved = true, approved_by = $1, approved_at = NOW() 
       WHERE id = $2 RETURNING *`,
      [approvedBy || 'admin', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Rule not found'));
    }

    await query(
      'INSERT INTO audit_logs (entity_type, entity_id, action, new_value) VALUES ($1, $2, $3, $4)',
      ['pricing_rule', id, 'pricing_rule_approved', JSON.stringify({ approvedBy })]
    );

    res.status(200).json(createResponse(true, result.rows[0], 'Rule approved'));
  } catch (error) {
    console.error('Error approving rule:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to approve rule'));
  }
});

/**
 * GET /api/pricing/rules/pending - Get pending approval rules
 */
router.get('/rules/pending', async (req: Request, res: Response) => {
  try {
    const { entityType, supplierId } = req.query;

    if (!isDatabaseConnected()) {
      const allRules: PricingRule[] = [];
      return res.status(200).json(createResponse(true, {
        rules: allRules.filter(r => !r.isApproved && r.isActive),
        total: allRules.filter(r => !r.isApproved && r.isActive).length,
      }));
    }

    let sql = 'SELECT * FROM pricing_rules WHERE is_active = true AND is_approved = false';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (entityType) {
      sql += ` AND entity_type = $${paramIndex++}`;
      params.push(entityType);
    }
    if (supplierId) {
      sql += ` AND supplier_id = $${paramIndex++}`;
      params.push(supplierId);
    }

    sql += ' ORDER BY created_at ASC';

    const result = await query(sql, params);

    res.status(200).json(createResponse(true, {
      rules: result.rows,
      total: result.rowCount || 0,
    }));
  } catch (error) {
    console.error('Error fetching pending rules:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch pending rules'));
  }
});

// ==================== CAMPAIGNS ====================

/**
 * GET /api/pricing/campaigns - List campaigns
 */
router.get('/campaigns', async (req: Request, res: Response) => {
  try {
    const { status, active, limit = '50', offset = '0' } = req.query;

    const filters: { status?: string; active?: boolean } = {};
    if (status) filters.status = status as string;
    if (active !== undefined) filters.active = active === 'true';

    const campaigns = await pricingService.getCampaigns(filters);

    res.status(200).json(createResponse(true, {
      campaigns,
      total: campaigns.length,
    }));
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch campaigns'));
  }
});

/**
 * GET /api/pricing/campaigns/:id - Get campaign by ID
 */
router.get('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await pricingService.getCampaign(id);

    if (!campaign) {
      return res.status(404).json(createResponse(false, undefined, 'Campaign not found'));
    }

    res.status(200).json(createResponse(true, campaign));
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch campaign'));
  }
});

/**
 * POST /api/pricing/campaigns - Create campaign
 */
router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const {
      name,
      slug,
      description,
      campaignType,
      startDate,
      endDate,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase = 0,
      targetAudience = 'all',
      applicableEntities = [],
      maxUses,
      maxUsesPerUser = 1,
      promoCode,
      isAutoApply = false,
    } = req.body;

    if (!name || !slug || !campaignType || !startDate || !endDate || !discountType || discountValue === undefined) {
      return res.status(400).json(createResponse(
        false, 
        undefined, 
        'Missing required fields'
      ));
    }

    const campaign = await pricingService.createCampaign({
      name,
      slug,
      description,
      campaignType,
      startDate,
      endDate,
      discountType,
      discountValue,
      maxDiscount,
      minPurchase,
      targetAudience,
      applicableEntities,
      maxUses,
      maxUsesPerUser,
      promoCode,
      isAutoApply,
    });

    // Log creation
    if (isDatabaseConnected()) {
      await query(
        'INSERT INTO audit_logs (entity_type, entity_id, action, new_value) VALUES ($1, $2, $3, $4)',
        ['campaign', campaign.id, 'campaign_created', JSON.stringify({ name, campaignType })]
      );
    }

    res.status(201).json(createResponse(true, campaign, 'Campaign created'));
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to create campaign'));
  }
});

/**
 * PUT /api/pricing/campaigns/:id - Update campaign
 */
router.put('/campaigns/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const campaign = await pricingService.updateCampaign(id, updates);

    if (!campaign) {
      return res.status(404).json(createResponse(false, undefined, 'Campaign not found'));
    }

    res.status(200).json(createResponse(true, campaign, 'Campaign updated'));
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update campaign'));
  }
});

/**
 * POST /api/pricing/campaigns/:id/activate - Activate campaign
 */
router.post('/campaigns/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await pricingService.activateCampaign(id);

    if (!campaign) {
      return res.status(404).json(createResponse(false, undefined, 'Campaign not found'));
    }

    res.status(200).json(createResponse(true, campaign, 'Campaign activated'));
  } catch (error) {
    console.error('Error activating campaign:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to activate campaign'));
  }
});

/**
 * POST /api/pricing/campaigns/:id/deactivate - Deactivate campaign
 */
router.post('/campaigns/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const campaign = await pricingService.deactivateCampaign(id);

    if (!campaign) {
      return res.status(404).json(createResponse(false, undefined, 'Campaign not found'));
    }

    res.status(200).json(createResponse(true, campaign, 'Campaign deactivated'));
  } catch (error) {
    console.error('Error deactivating campaign:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to deactivate campaign'));
  }
});

// ==================== SEASONS ====================

/**
 * GET /api/pricing/seasons - Get all seasons
 */
router.get('/seasons', async (req: Request, res: Response) => {
  try {
    const seasons = await pricingService.getSeasons();
    res.status(200).json(createResponse(true, seasons));
  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch seasons'));
  }
});

/**
 * GET /api/pricing/seasons/current - Get current season
 */
router.get('/seasons/current', async (req: Request, res: Response) => {
  try {
    const { region } = req.query;
    const season = await pricingService.getCurrentSeason(region as string | undefined);
    res.status(200).json(createResponse(true, season));
  } catch (error) {
    console.error('Error fetching current season:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch current season'));
  }
});

/**
 * PUT /api/pricing/seasons/:id - Update season
 */
router.put('/seasons/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const season = await pricingService.updateSeason(id, updates);

    if (!season) {
      return res.status(404).json(createResponse(false, undefined, 'Season not found'));
    }

    res.status(200).json(createResponse(true, season, 'Season updated'));
  } catch (error) {
    console.error('Error updating season:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update season'));
  }
});

// ==================== ANALYTICS ====================

/**
 * GET /api/pricing/analytics/:entityId - Get pricing analytics
 */
router.get('/analytics/:entityId', async (req: Request, res: Response) => {
  try {
    const { entityId } = req.params;
    const analytics = await pricingService.getAnalytics(entityId);
    res.status(200).json(createResponse(true, analytics));
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch analytics'));
  }
});

/**
 * GET /api/pricing/stats - Get pricing statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        totalRules: 0,
        activeRules: 0,
        pendingApprovals: 0,
        activeCampaigns: 0,
        totalRedemptions: 0,
      }));
    }

    const [rulesCount, campaignsCount, redemptionsCount] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) as count FROM pricing_rules WHERE is_active = true'),
      query<{ count: string }>("SELECT COUNT(*) as count FROM promotional_campaigns WHERE status = 'active'"),
      query<{ count: string }>('SELECT COUNT(*) as count FROM campaign_redemptions'),
    ]);

    const pendingResult = await query<{ count: string }>(
      'SELECT COUNT(*) as count FROM pricing_rules WHERE is_active = true AND is_approved = false'
    );

    res.status(200).json(createResponse(true, {
      totalRules: parseInt(rulesCount.rows[0]?.count || '0'),
      activeRules: parseInt(rulesCount.rows[0]?.count || '0'),
      pendingApprovals: parseInt(pendingResult.rows[0]?.count || '0'),
      activeCampaigns: parseInt(campaignsCount.rows[0]?.count || '0'),
      totalRedemptions: parseInt(redemptionsCount.rows[0]?.count || '0'),
    }));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch stats'));
  }
});

export default router;
