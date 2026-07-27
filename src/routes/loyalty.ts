/**
 * Loyalty Program API Routes
 * Customer rewards and membership management
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';

const router = Router();

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string) {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

// Points earning rates
const POINTS_PER_DOLLAR = 10; // 10 points per $1 spent
const SIGNUP_BONUS = 100;
const REVIEW_BONUS = 50;
const REFERRAL_BONUS_REFERER = 500;
const REFERRAL_BONUS_REFERRED = 200;

// ==================== LOYALTY PROFILES ====================

/**
 * GET /api/loyalty/profiles - Get all loyalty profiles
 */
router.get('/profiles', async (req: Request, res: Response) => {
  try {
    const { tier, status, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        profiles: [
          {
            id: 'lp_1',
            customer_id: 'user_001',
            customer_name: 'John Smith',
            membership_tier: 'gold',
            current_points: 2500,
            lifetime_points: 8500,
            total_spending: 4200,
            total_bookings: 12,
            status: 'active',
          },
          {
            id: 'lp_2',
            customer_id: 'user_002',
            customer_name: 'Jane Doe',
            membership_tier: 'silver',
            current_points: 800,
            lifetime_points: 1500,
            total_spending: 750,
            total_bookings: 4,
            status: 'active',
          },
        ],
        total: 2,
      }));
    }

    let sql = 'SELECT * FROM loyalty_profiles WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (tier) {
      sql += ` AND membership_tier = $${paramIndex++}`;
      params.push(tier);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY lifetime_points DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { profiles: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching loyalty profiles:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch profiles'));
  }
});

/**
 * GET /api/loyalty/profiles/:customerId - Get customer loyalty profile
 */
router.get('/profiles/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        id: 'lp_1',
        customer_id: customerId,
        customer_name: 'John Smith',
        membership_tier: 'gold',
        current_points: 2500,
        lifetime_points: 8500,
        total_spending: 4200,
        total_bookings: 12,
        points_to_next_tier: 1500,
        tier_benefits: {
          points_multiplier: 1.2,
          discount_percentage: 5,
          priority_booking: true,
        },
        status: 'active',
        enrolled_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      }));
    }

    const result = await query(
      'SELECT * FROM loyalty_profiles WHERE customer_id = $1',
      [customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Loyalty profile not found'));
    }

    // Get tier benefits
    const profile = result.rows[0] as Record<string, unknown>;
    const tierResult = await query(
      'SELECT * FROM membership_levels WHERE tier = $1',
      [profile.membership_tier]
    );

    res.status(200).json(createResponse(true, {
      ...profile,
      tier_benefits: tierResult.rows[0] || {},
    }));
  } catch (error) {
    console.error('Error fetching loyalty profile:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch profile'));
  }
});

/**
 * POST /api/loyalty/profiles - Enroll customer in loyalty program
 */
router.post('/profiles', async (req: Request, res: Response) => {
  try {
    const { customerId, customerEmail, customerName } = req.body;

    if (!customerId) {
      return res.status(400).json(createResponse(false, undefined, 'Customer ID required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `lp_${Date.now()}`,
        customer_id: customerId,
        membership_tier: 'bronze',
        current_points: SIGNUP_BONUS,
        lifetime_points: SIGNUP_BONUS,
        status: 'active',
        enrolled_at: new Date().toISOString(),
      }));
    }

    // Check if already enrolled
    const existing = await query('SELECT id FROM loyalty_profiles WHERE customer_id = $1', [customerId]);
    if (existing.rows.length > 0) {
      return res.status(400).json(createResponse(false, undefined, 'Customer already enrolled'));
    }

    // Create profile
    const profileResult = await query(
      `INSERT INTO loyalty_profiles (customer_id, customer_email, customer_name, current_points, lifetime_points, tier_achieved_at, last_activity_at)
       VALUES ($1, $2, $3, $4, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [customerId, customerEmail, customerName, SIGNUP_BONUS]
    );

    // Create signup bonus transaction
    await query(
      `INSERT INTO points_transactions (loyalty_profile_id, customer_id, transaction_type, points, balance_after, description)
       VALUES ($1, $2, 'signup_bonus', $3, $3, 'Welcome bonus for joining IDENT AFRICA Rewards')`,
      [(profileResult.rows[0] as Record<string, unknown>).id, customerId, SIGNUP_BONUS]
    );

    res.status(201).json(createResponse(true, profileResult.rows[0] as Record<string, unknown>, 'Customer enrolled in loyalty program'));
  } catch (error) {
    console.error('Error enrolling customer:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to enroll customer'));
  }
});

// ==================== MEMBERSHIP TIERS ====================

/**
 * GET /api/loyalty/tiers - Get membership tiers
 */
router.get('/tiers', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        tiers: [
          { tier: 'bronze', name: 'Bronze', min_points: 0, color: '#CD7F32', benefits: [] },
          { tier: 'silver', name: 'Silver', min_points: 1000, color: '#C0C0C0', benefits: ['10% bonus points'] },
          { tier: 'gold', name: 'Gold', min_points: 5000, color: '#FFD700', benefits: ['20% bonus points', '5% discount'] },
          { tier: 'platinum', name: 'Platinum', min_points: 15000, color: '#E5E4E2', benefits: ['30% bonus points', '8% discount', 'Priority booking'] },
          { tier: 'diamond', name: 'Diamond', min_points: 50000, color: '#B9F2FF', benefits: ['50% bonus points', '12% discount', 'Exclusive experiences'] },
        ],
      }));
    }

    const result = await query('SELECT * FROM membership_levels WHERE is_active = TRUE ORDER BY sort_order');
    res.status(200).json(createResponse(true, { tiers: result.rows }));
  } catch (error) {
    console.error('Error fetching tiers:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch tiers'));
  }
});

// ==================== POINTS TRANSACTIONS ====================

/**
 * GET /api/loyalty/transactions - Get points transactions
 */
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const { customerId, type, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        transactions: [
          { id: 'tx_1', transaction_type: 'booking_earn', points: 500, balance_after: 2500, description: 'Safari Adventure', created_at: new Date().toISOString() },
          { id: 'tx_2', transaction_type: 'review_earn', points: 50, balance_after: 2550, description: 'Review bonus', created_at: new Date().toISOString() },
        ],
        total: 2,
      }));
    }

    let sql = 'SELECT * FROM points_transactions WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (customerId) {
      sql += ` AND customer_id = $${paramIndex++}`;
      params.push(customerId);
    }
    if (type) {
      sql += ` AND transaction_type = $${paramIndex++}`;
      params.push(type);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { transactions: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch transactions'));
  }
});

/**
 * POST /api/loyalty/earn/booking - Award points for booking
 */
router.post('/earn/booking', async (req: Request, res: Response) => {
  try {
    const { customerId, bookingId, amount, destination } = req.body;

    if (!customerId || !bookingId || !amount) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    // Get or create profile
    let profileId: string;
    let currentPoints: number;
    let multiplier = 1.0;

    if (!isDatabaseConnected()) {
      profileId = `lp_${customerId}`;
      currentPoints = 2500;
      multiplier = 1.2; // Gold tier
    } else {
      const profileResult = await query('SELECT * FROM loyalty_profiles WHERE customer_id = $1', [customerId]);
      
      if (profileResult.rows.length === 0) {
        // Auto-enroll customer
        const newProfile = await query(
          `INSERT INTO loyalty_profiles (customer_id, current_points, lifetime_points, tier_achieved_at)
           VALUES ($1, $2, $2, CURRENT_TIMESTAMP) RETURNING id, current_points`,
          [customerId, SIGNUP_BONUS]
        );
        profileId = (newProfile.rows[0] as Record<string, unknown>).id as string;
        currentPoints = SIGNUP_BONUS;
      } else {
        const profile = profileResult.rows[0] as Record<string, unknown>;
        profileId = profile.id as string;
        currentPoints = profile.current_points as number;
        
        // Get tier multiplier
        const tierResult = await query('SELECT points_multiplier FROM membership_levels WHERE tier = $1', [profile.membership_tier]);
        if (tierResult.rows.length > 0) {
          multiplier = parseFloat((tierResult.rows[0] as Record<string, unknown>).points_multiplier as string) || 1.0;
        }
      }
    }

    // Calculate points
    const basePoints = Math.floor(amount * POINTS_PER_DOLLAR);
    const earnedPoints = Math.floor(basePoints * multiplier);

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        points_earned: earnedPoints,
        new_balance: currentPoints + earnedPoints,
        multiplier,
        description: `Points earned for ${destination || 'booking'}`,
      }));
    }

    // Update profile
    const newBalance = currentPoints + earnedPoints;
    const newLifetime = (await query('SELECT lifetime_points FROM loyalty_profiles WHERE id = $1', [profileId])).rows[0] as Record<string, unknown>;
    
    await query(
      `UPDATE loyalty_profiles SET 
        current_points = $1,
        lifetime_points = lifetime_points + $2,
        total_bookings = total_bookings + 1,
        total_spending = total_spending + $3,
        last_activity_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [newBalance, earnedPoints, amount, profileId]
    );

    // Create transaction
    await query(
      `INSERT INTO points_transactions (
        loyalty_profile_id, customer_id, transaction_type, points, balance_after,
        booking_id, description
      ) VALUES ($1, $2, 'booking_earn', $3, $4, $5, $6)`,
      [profileId, customerId, earnedPoints, newBalance, bookingId, `Points earned for ${destination || 'booking'}`]
    );

    // Check for tier upgrade
    await checkAndUpgradeTier(profileId as string, customerId);

    res.status(200).json(createResponse(true, {
      points_earned: earnedPoints,
      new_balance: newBalance,
      multiplier,
      description: `Points earned for ${destination || 'booking'}`,
    }));
  } catch (error) {
    console.error('Error awarding booking points:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to award points'));
  }
});

/**
 * POST /api/loyalty/earn/review - Award points for review
 */
router.post('/earn/review', async (req: Request, res: Response) => {
  try {
    const { customerId, bookingId, reviewId, rating } = req.body;

    if (!customerId || !bookingId || !rating) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    let earnedPoints = REVIEW_BONUS;
    let bonusPoints = 0;

    // Bonus for 5-star reviews
    if (rating === 5) {
      bonusPoints = 25;
      earnedPoints += bonusPoints;
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        points_earned: earnedPoints,
        bonus_points: bonusPoints,
        new_balance: 2600,
        description: `Review ${rating}-star rating`,
      }));
    }

    // Get profile
    const profileResult = await query('SELECT * FROM loyalty_profiles WHERE customer_id = $1', [customerId]);
    if (profileResult.rows.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'Customer not in loyalty program'));
    }

    const profile = profileResult.rows[0] as Record<string, unknown>;

    // Update points
    const newBalance = (profile.current_points as number) + earnedPoints;
    await query(
      `UPDATE loyalty_profiles SET current_points = $1, last_activity_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newBalance, profile.id]
    );

    // Create transaction
    await query(
      `INSERT INTO points_transactions (
        loyalty_profile_id, customer_id, transaction_type, points, balance_after,
        review_id, booking_id, description
      ) VALUES ($1, $2, 'review_earn', $3, $4, $5, $6, $7)`,
      [profile.id, customerId, earnedPoints, newBalance, reviewId, bookingId, `Review bonus for ${rating}-star rating`]
    );

    // Log review reward
    await query(
      `INSERT INTO review_rewards (review_id, booking_id, customer_id, rating, points_awarded, bonus_points, bonus_eligible)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [reviewId, bookingId, customerId, rating, REVIEW_BONUS, bonusPoints, rating === 5]
    );

    res.status(200).json(createResponse(true, {
      points_earned: earnedPoints,
      bonus_points: bonusPoints,
      new_balance: newBalance,
      description: `Review ${rating}-star rating`,
    }));
  } catch (error) {
    console.error('Error awarding review points:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to award points'));
  }
});

/**
 * POST /api/loyalty/referral - Create/use referral
 */
router.post('/referral', async (req: Request, res: Response) => {
  try {
    const { action, referrerId, referredId, referredEmail, referredName, referralCode } = req.body;

    if (!action) {
      return res.status(400).json(createResponse(false, undefined, 'Action required'));
    }

    if (action === 'create') {
      // Create referral link
      const code = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const link = `https://ident.africa/join?ref=${code}`;

      if (!isDatabaseConnected()) {
        return res.status(201).json(createResponse(true, {
          referral_code: code,
          referral_link: link,
          points_bonus: REFERRAL_BONUS_REFERER,
        }));
      }

      await query(
        `INSERT INTO referrals (referrer_id, referrer_email, referral_code, referral_link)
         VALUES ($1, $2, $3, $4)`,
        [referrerId, req.body.referrerEmail, code, link]
      );

      res.status(201).json(createResponse(true, {
        referral_code: code,
        referral_link: link,
        points_bonus: REFERRAL_BONUS_REFERER,
      }));
    } else if (action === 'use') {
      // Use referral code
      if (!isDatabaseConnected()) {
        return res.status(200).json(createResponse(true, {
          success: true,
          referred_points: REFERRAL_BONUS_REFERRED,
          referrer_points: REFERRAL_BONUS_REFERER,
        }));
      }

      // Find referral
      const refResult = await query('SELECT * FROM referrals WHERE referral_code = $1', [referralCode]);
      if (refResult.rows.length === 0) {
        return res.status(404).json(createResponse(false, undefined, 'Invalid referral code'));
      }

      const referral = refResult.rows[0] as Record<string, unknown>;

      // Update referral
      await query(
        `UPDATE referrals SET 
          referred_id = $1, referred_email = $2, referred_name = $3, status = 'registered'
         WHERE id = $4`,
        [referredId, referredEmail, referredName, referral.id]
      );

      // Award points to both
      // Referred customer
      const referredProfile = await query('SELECT * FROM loyalty_profiles WHERE customer_id = $1', [referredId]);
      if (referredProfile.rows.length > 0) {
        const refProfile = referredProfile.rows[0] as Record<string, unknown>;
        await query(
          `UPDATE loyalty_profiles SET current_points = current_points + $1 WHERE id = $2`,
          [REFERRAL_BONUS_REFERRED, refProfile.id]
        );
        await query(
          `INSERT INTO points_transactions (loyalty_profile_id, customer_id, transaction_type, points, balance_after, referral_id, description)
           VALUES ($1, $2, 'referral_earn', $3, $4, $5, 'Referral signup bonus')`,
          [refProfile.id, referredId, REFERRAL_BONUS_REFERRED, (refProfile.current_points as number) + REFERRAL_BONUS_REFERRED, referral.id]
        );
      }

      res.status(200).json(createResponse(true, {
        success: true,
        referred_points: REFERRAL_BONUS_REFERRED,
        referrer_points: REFERRAL_BONUS_REFERER,
      }));
    }
  } catch (error) {
    console.error('Error handling referral:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to process referral'));
  }
});

// ==================== REDEMPTION ====================

/**
 * GET /api/loyalty/rewards - Get available rewards
 */
router.get('/rewards', async (req: Request, res: Response) => {
  try {
    const { category, minTier } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        rewards: [
          { id: 'r_1', name: '10% Booking Discount', category: 'discount', points_cost: 500, value_amount: 10, is_featured: true },
          { id: 'r_2', name: 'Safari Upgrade', category: 'upgrade', points_cost: 2000, value_amount: 200, is_featured: true },
          { id: 'r_3', name: 'Exclusive Dinner', category: 'experience', points_cost: 5000, value_amount: 500, is_featured: true },
        ],
      }));
    }

    let sql = 'SELECT * FROM redemption_rewards WHERE is_active = TRUE AND (quantity IS NULL OR quantity > redeemed_count)';
    const params: unknown[] = [];

    if (category) {
      sql += ' AND category = $1';
      params.push(category);
    }

    sql += ' ORDER BY is_featured DESC, points_cost ASC';

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { rewards: result.rows }));
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch rewards'));
  }
});

/**
 * POST /api/loyalty/redeem - Redeem points
 */
router.post('/redeem', async (req: Request, res: Response) => {
  try {
    const { customerId, rewardId, bookingId } = req.body;

    if (!customerId || !rewardId) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        redemption_id: `red_${Date.now()}`,
        points_spent: 500,
        voucher_code: `VCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: 'approved',
      }));
    }

    // Get reward
    const rewardResult = await query('SELECT * FROM redemption_rewards WHERE id = $1 AND is_active = TRUE', [rewardId]);
    if (rewardResult.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Reward not found'));
    }

    const reward = rewardResult.rows[0] as Record<string, unknown>;

    // Get profile
    const profileResult = await query('SELECT * FROM loyalty_profiles WHERE customer_id = $1', [customerId]);
    if (profileResult.rows.length === 0) {
      return res.status(400).json(createResponse(false, undefined, 'Customer not in loyalty program'));
    }

    const profile = profileResult.rows[0] as Record<string, unknown>;

    // Check points
    if ((profile.current_points as number) < (reward.points_cost as number)) {
      return res.status(400).json(createResponse(false, undefined, 'Insufficient points'));
    }

    // Create redemption
    const code = `VCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const redemptionResult = await query(
      `INSERT INTO redemptions (customer_id, loyalty_profile_id, reward_id, booking_id, points_spent, status, redemption_code)
       VALUES ($1, $2, $3, $4, $5, 'approved', $6) RETURNING *`,
      [customerId, profile.id, rewardId, bookingId, reward.points_cost, code]
    );

    // Deduct points
    const newBalance = (profile.current_points as number) - (reward.points_cost as number);
    await query(
      `UPDATE loyalty_profiles SET current_points = $1 WHERE id = $2`,
      [newBalance, profile.id]
    );

    // Create transaction
    await query(
      `INSERT INTO points_transactions (loyalty_profile_id, customer_id, transaction_type, points, balance_after, description)
       VALUES ($1, $2, 'redemption', $3, $4, $5)`,
      [profile.id, customerId, -(reward.points_cost as number), newBalance, `Redeemed: ${reward.name}`]
    );

    // Update reward count
    await query(
      'UPDATE redemption_rewards SET redeemed_count = redeemed_count + 1 WHERE id = $1',
      [rewardId]
    );

    res.status(200).json(createResponse(true, {
      redemption_id: (redemptionResult.rows[0] as Record<string, unknown>).id,
      points_spent: reward.points_cost,
      voucher_code: code,
      reward_name: reward.name,
      status: 'approved',
    }));
  } catch (error) {
    console.error('Error redeeming points:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to redeem points'));
  }
});

// ==================== PROMOTIONS ====================

/**
 * GET /api/loyalty/promotions - Get active promotions
 */
router.get('/promotions', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        promotions: [
          { id: 'p_1', name: 'Double Points Weekend', code: 'DOUBLE50', bonus_points: 0, points_multiplier: 2.0, ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
          { id: 'p_2', name: 'Safari Bonus', code: 'SAFARI100', bonus_points: 100, points_multiplier: 1.0, ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
        ],
      }));
    }

    const result = await query(
      `SELECT * FROM loyalty_promotions 
       WHERE is_active = TRUE 
       AND (ends_at IS NULL OR ends_at > CURRENT_TIMESTAMP)
       ORDER BY created_at DESC`
    );

    res.status(200).json(createResponse(true, { promotions: result.rows }));
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch promotions'));
  }
});

/**
 * POST /api/loyalty/promotions/validate - Validate promotion code
 */
router.post('/promotions/validate', async (req: Request, res: Response) => {
  try {
    const { code, customerId, bookingAmount } = req.body;

    if (!code) {
      return res.status(400).json(createResponse(false, undefined, 'Code required'));
    }

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        valid: true,
        promotion: { name: 'Safari Bonus', bonus_points: 100, points_multiplier: 1.5 },
      }));
    }

    const result = await query(
      `SELECT * FROM loyalty_promotions WHERE code = $1 AND is_active = TRUE`,
      [code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Invalid promotion code'));
    }

    const promotion = result.rows[0] as Record<string, unknown>;

    // Check if expired
    if (promotion.ends_at && new Date(promotion.ends_at as string) < new Date()) {
      return res.status(400).json(createResponse(false, undefined, 'Promotion has expired'));
    }

    // Check max uses
    if (promotion.max_uses && (promotion.current_uses as number) >= (promotion.max_uses as number)) {
      return res.status(400).json(createResponse(false, undefined, 'Promotion usage limit reached'));
    }

    // Check min booking value
    if (bookingAmount && promotion.min_booking_value && bookingAmount < (promotion.min_booking_value as number)) {
      return res.status(400).json(createResponse(false, undefined, `Minimum booking of $${promotion.min_booking_value} required`));
    }

    res.status(200).json(createResponse(true, {
      valid: true,
      promotion,
    }));
  } catch (error) {
    console.error('Error validating promotion:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to validate promotion'));
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/loyalty/stats - Get loyalty program statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        total_members: 1250,
        active_members: 1100,
        total_points_issued: 5000000,
        total_points_redeemed: 2500000,
        by_tier: { bronze: 600, silver: 350, gold: 200, platinum: 100, diamond: 50 },
        top_members: [],
      }));
    }

    const [memberStats, pointsStats, tierStats] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_members,
          COUNT(*) FILTER (WHERE status = 'active') as active_members,
          SUM(lifetime_points) as total_points_issued
        FROM loyalty_profiles
      `),
      query(`SELECT SUM(ABS(points)) as total_redeemed FROM points_transactions WHERE points < 0`),
      query(`
        SELECT membership_tier, COUNT(*) as count
        FROM loyalty_profiles WHERE status = 'active'
        GROUP BY membership_tier
      `),
    ]);

    const memberRow = memberStats.rows[0] as Record<string, unknown> || {};
    const pointsRow = pointsStats.rows[0] as Record<string, unknown> || {};

    const byTier: Record<string, number> = {};
    tierStats.rows.forEach((row: Record<string, unknown>) => {
      byTier[row.membership_tier as string] = parseInt(row.count as string);
    });

    res.status(200).json(createResponse(true, {
      total_members: parseInt(memberRow.total_members as string || '0'),
      active_members: parseInt(memberRow.active_members as string || '0'),
      total_points_issued: parseInt(memberRow.total_points_issued as string || '0'),
      total_points_redeemed: parseInt(pointsRow.total_redeemed as string || '0'),
      by_tier: byTier,
    }));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics'));
  }
});

// Helper function
async function checkAndUpgradeTier(profileId: string, customerId: string) {
  try {
    // Get current profile
    const profileResult = await query('SELECT * FROM loyalty_profiles WHERE id = $1', [profileId]);
    if (profileResult.rows.length === 0) return;

    const profile = profileResult.rows[0] as Record<string, unknown>;

    // Get next tier threshold
    const tiersResult = await query(
      'SELECT * FROM membership_levels WHERE sort_order > (SELECT sort_order FROM membership_levels WHERE tier = $1) ORDER BY sort_order ASC LIMIT 1',
      [profile.membership_tier]
    );

    if (tiersResult.rows.length === 0) return;

    const nextTier = tiersResult.rows[0] as Record<string, unknown>;

    // Check if eligible for upgrade
    if (
      (profile.lifetime_points as number) >= (nextTier.min_lifetime_points as number) &&
      parseFloat(profile.total_spending as string) >= parseFloat(nextTier.min_total_spending as string) &&
      (profile.total_bookings as number) >= (nextTier.min_bookings as number)
    ) {
      await query(
        'UPDATE loyalty_profiles SET membership_tier = $1, tier_achieved_at = CURRENT_TIMESTAMP WHERE id = $2',
        [nextTier.tier, profileId]
      );
    }
  } catch (error) {
    console.error('Error checking tier upgrade:', error);
  }
}

export default router;
