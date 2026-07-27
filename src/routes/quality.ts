/**
 * Supplier Quality Scoring API Routes
 * Supplier performance tracking and badge assignment
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

// Score weights for overall calculation
const SCORE_WEIGHTS = {
  rating: 0.35,        // 35% - Customer ratings
  responseTime: 0.20,   // 20% - Response time
  completionRate: 0.25, // 25% - Booking completion
  satisfaction: 0.15,   // 15% - Customer satisfaction
  cancellation: 0.05,   // 5% - Cancellation rate (low is better)
};

// ==================== QUALITY SCORES ====================

/**
 * GET /api/quality/scores - Get all supplier quality scores
 */
router.get('/scores', async (req: Request, res: Response) => {
  try {
    const { badge, minScore, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        scores: [
          {
            supplier_id: 'supp_001',
            overall_score: 92.5,
            score_grade: 'A+',
            average_rating: 4.8,
            booking_completion_rate: 98,
            cancellation_rate: 1.5,
            avg_response_time_minutes: 15,
            badges: ['verified_luxury', 'trusted_supplier'],
            primary_badge: 'verified_luxury',
          },
          {
            supplier_id: 'supp_002',
            overall_score: 85.0,
            score_grade: 'A',
            average_rating: 4.5,
            booking_completion_rate: 92,
            cancellation_rate: 3.2,
            avg_response_time_minutes: 45,
            badges: ['top_safari', 'trusted_supplier'],
            primary_badge: 'top_safari',
          },
          {
            supplier_id: 'supp_003',
            overall_score: 78.3,
            score_grade: 'B+',
            average_rating: 4.2,
            booking_completion_rate: 88,
            cancellation_rate: 5.5,
            avg_response_time_minutes: 60,
            badges: ['eco_champion'],
            primary_badge: 'eco_champion',
          },
        ],
        total: 3,
      }));
    }

    let sql = 'SELECT * FROM supplier_quality_scores WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (minScore) {
      sql += ` AND overall_score >= $${paramIndex++}`;
      params.push(minScore);
    }

    sql += ' ORDER BY overall_score DESC';
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { scores: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching quality scores:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch scores'));
  }
});

/**
 * GET /api/quality/scores/:supplierId - Get supplier quality score
 */
router.get('/scores/:supplierId', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        supplier_id: supplierId,
        overall_score: 88.5,
        score_grade: 'A',
        rating_score: 90,
        response_time_score: 85,
        completion_rate_score: 92,
        satisfaction_score: 88,
        cancellation_rate_score: 95,
        average_rating: 4.6,
        total_ratings: 156,
        booking_completion_rate: 92,
        cancellation_rate: 4.2,
        avg_response_time_minutes: 30,
        total_bookings: 245,
        completed_bookings: 225,
        cancelled_bookings: 10,
        badges: ['trusted_supplier', 'eco_champion'],
        primary_badge: 'trusted_supplier',
        last_calculated_at: new Date().toISOString(),
      }));
    }

    const result = await query(
      'SELECT * FROM supplier_quality_scores WHERE supplier_id = $1',
      [supplierId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Quality score not found'));
    }

    res.status(200).json(createResponse(true, result.rows[0]));
  } catch (error) {
    console.error('Error fetching quality score:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch score'));
  }
});

/**
 * POST /api/quality/calculate/:supplierId - Recalculate quality score
 */
router.post('/calculate/:supplierId', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        supplier_id: supplierId,
        overall_score: 85.0,
        score_grade: 'A',
        recalculated: true,
      }));
    }

    // Get or create quality record
    let qualityResult = await query(
      'SELECT * FROM supplier_quality_scores WHERE supplier_id = $1',
      [supplierId]
    );

    if (qualityResult.rows.length === 0) {
      qualityResult = await query(
        'INSERT INTO supplier_quality_scores (supplier_id) VALUES ($1) RETURNING *',
        [supplierId]
      );
    }

    // Calculate metrics from various sources
    // Rating metrics
    const ratingsResult = await query(
      `SELECT 
        COUNT(*) as total,
        AVG(overall_rating) as avg_rating
       FROM supplier_ratings 
       WHERE supplier_id = $1 AND status = 'approved'`,
      [supplierId]
    );

    // Booking completion metrics
    const bookingResult = await query(
      `SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
       FROM bookings 
       WHERE supplier_id = $1`,
      [supplierId]
    );

    // Response time metrics
    const responseResult = await query(
      `SELECT 
        AVG(response_time_minutes) as avg_response,
        COUNT(*) as total_responses
       FROM response_time_logs 
       WHERE supplier_id = $1 AND responded = TRUE`,
      [supplierId]
    );

    const ratings = ratingsResult.rows[0] as Record<string, unknown> || {};
    const bookings = bookingResult.rows[0] as Record<string, unknown> || {};
    const responses = responseResult.rows[0] as Record<string, unknown> || {};

    // Calculate individual scores (0-100)
    const totalRatings = parseInt(ratings.total as string || '0');
    const avgRating = parseFloat(ratings.avg_rating as string || '0');
    const ratingScore = totalRatings > 0 ? (avgRating / 5) * 100 : 0;

    const totalBookings = parseInt(bookings.total_bookings as string || '0');
    const completedBookings = parseInt(bookings.completed as string || '0');
    const cancelledBookings = parseInt(bookings.cancelled as string || '0');
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;
    const cancellationScore = 100 - cancellationRate;

    const avgResponseMinutes = parseFloat(responses.avg_response as string || '0');
    // Response time score: < 15min = 100, 15-60min = 80-100, > 60min = < 80
    let responseTimeScore = 100;
    if (avgResponseMinutes > 0) {
      if (avgResponseMinutes <= 15) responseTimeScore = 100;
      else if (avgResponseMinutes <= 30) responseTimeScore = 95;
      else if (avgResponseMinutes <= 60) responseTimeScore = 85;
      else if (avgResponseMinutes <= 120) responseTimeScore = 70;
      else responseTimeScore = 50;
    }

    // Satisfaction score (based on ratings and other factors)
    const satisfactionScore = ratingScore * 0.8 + responseTimeScore * 0.2;

    // Calculate overall score
    const overallScore = Math.round(
      (ratingScore * SCORE_WEIGHTS.rating +
       responseTimeScore * SCORE_WEIGHTS.responseTime +
       completionRate * SCORE_WEIGHTS.completionRate +
       satisfactionScore * SCORE_WEIGHTS.satisfaction +
       cancellationScore * SCORE_WEIGHTS.cancellation) * 100
    ) / 100;

    // Determine grade
    let grade = 'D';
    if (overallScore >= 97) grade = 'A+';
    else if (overallScore >= 93) grade = 'A';
    else if (overallScore >= 90) grade = 'A-';
    else if (overallScore >= 87) grade = 'B+';
    else if (overallScore >= 83) grade = 'B';
    else if (overallScore >= 80) grade = 'B-';
    else if (overallScore >= 77) grade = 'C+';
    else if (overallScore >= 73) grade = 'C';
    else if (overallScore >= 70) grade = 'C-';
    else if (overallScore >= 60) grade = 'D';

    // Calculate badges
    const badges = await calculateBadges(supplierId, {
      overallScore,
      avgRating,
      completionRate,
      cancellationRate,
      totalBookings,
      totalRatings,
    });

    // Update quality record
    await query(
      `UPDATE supplier_quality_scores SET 
        overall_score = $1,
        score_grade = $2,
        rating_score = $3,
        response_time_score = $4,
        completion_rate_score = $5,
        satisfaction_score = $6,
        cancellation_rate_score = $7,
        total_ratings = $8,
        average_rating = $9,
        avg_response_time_minutes = $10,
        booking_completion_rate = $11,
        cancellation_rate = $12,
        total_bookings = $13,
        completed_bookings = $14,
        cancelled_bookings = $15,
        badges = $16,
        primary_badge = $17,
        last_calculated_at = CURRENT_TIMESTAMP
       WHERE supplier_id = $18`,
      [
        overallScore, grade,
        ratingScore, responseTimeScore, completionRate, satisfactionScore, cancellationScore,
        totalRatings, avgRating, Math.round(avgResponseMinutes),
        completionRate, cancellationRate,
        totalBookings, completedBookings, cancelledBookings,
        badges, badges[0] || null,
        supplierId,
      ]
    );

    res.status(200).json(createResponse(true, {
      supplier_id: supplierId,
      overall_score: overallScore,
      score_grade: grade,
      rating_score: ratingScore,
      response_time_score: responseTimeScore,
      completion_rate_score: completionRate,
      satisfaction_score: satisfactionScore,
      cancellation_rate_score: cancellationScore,
      badges,
      recalculated: true,
    }));
  } catch (error) {
    console.error('Error calculating quality score:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to calculate score'));
  }
});

// ==================== BADGES ====================

/**
 * GET /api/quality/badges - Get all badge definitions
 */
router.get('/badges', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        badges: [
          { badge_type: 'verified_luxury', name: 'Verified Luxury Partner', icon: '💎', color: '#8B5CF6', description: 'Premium service meeting luxury standards' },
          { badge_type: 'top_safari', name: 'Top Safari Provider', icon: '🦁', color: '#F59E0B', description: 'Top-rated safari and wildlife experience provider' },
          { badge_type: 'eco_champion', name: 'Eco Champion', icon: '🌿', color: '#10B981', description: 'Recognized for sustainable and eco-friendly practices' },
          { badge_type: 'super_host', name: 'Super Host', icon: '⭐', color: '#FBBF24', description: 'Exceptional host with outstanding hospitality' },
          { badge_type: 'trusted_supplier', name: 'Trusted Supplier', icon: '✅', color: '#22C55E', description: 'Consistently high performance' },
        ],
      }));
    }

    const result = await query('SELECT * FROM badge_definitions WHERE is_active = TRUE ORDER BY sort_order');
    res.status(200).json(createResponse(true, { badges: result.rows }));
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch badges'));
  }
});

/**
 * GET /api/quality/badges/:supplierId - Get supplier badges
 */
router.get('/badges/:supplierId', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        supplier_id: supplierId,
        badges: [
          { badge_type: 'verified_luxury', name: 'Verified Luxury Partner', icon: '💎', color: '#8B5CF6' },
          { badge_type: 'trusted_supplier', name: 'Trusted Supplier', icon: '✅', color: '#22C55E' },
        ],
        primary_badge: 'verified_luxury',
      }));
    }

    const result = await query(
      'SELECT badges, primary_badge FROM supplier_quality_scores WHERE supplier_id = $1',
      [supplierId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(createResponse(false, undefined, 'Supplier not found'));
    }

    const score = result.rows[0] as Record<string, unknown>;
    const badges = (score.badges as string[]) || [];

    const badgeDetails = await query(
      'SELECT badge_type, name, icon, color, description FROM badge_definitions WHERE badge_type = ANY($1)',
      [badges]
    );

    res.status(200).json(createResponse(true, {
      supplier_id: supplierId,
      badges: badgeDetails.rows,
      primary_badge: score.primary_badge,
    }));
  } catch (error) {
    console.error('Error fetching supplier badges:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch badges'));
  }
});

// ==================== RATINGS ====================

/**
 * GET /api/quality/ratings/:supplierId - Get supplier ratings
 */
router.get('/ratings/:supplierId', async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;
    const { status = 'approved', limit = '20', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        ratings: [
          {
            id: 'r_1',
            customer_id: 'user_001',
            overall_rating: 5,
            service_rating: 5,
            value_rating: 4,
            cleanliness_rating: 5,
            location_rating: 4,
            communication_rating: 5,
            review_text: 'Amazing safari experience! The guides were knowledgeable and the accommodations were top-notch.',
            is_verified_stay: true,
            created_at: new Date().toISOString(),
          },
        ],
        total: 1,
      }));
    }

    const result = await query(
      `SELECT * FROM supplier_ratings 
       WHERE supplier_id = $1 AND status = $2
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [supplierId, status, Number(limit), Number(offset)]
    );

    res.status(200).json(createResponse(true, { ratings: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch ratings'));
  }
});

/**
 * POST /api/quality/ratings - Submit a rating
 */
router.post('/ratings', async (req: Request, res: Response) => {
  try {
    const {
      supplierId, bookingId, customerId,
      overallRating, serviceRating, valueRating, cleanlinessRating, locationRating, communicationRating,
      reviewText, isPublic = true,
    } = req.body;

    if (!supplierId || !bookingId || !customerId || !overallRating) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `rating_${Date.now()}`,
        supplier_id: supplierId,
        booking_id: bookingId,
        overall_rating: overallRating,
        status: 'approved',
        created_at: new Date().toISOString(),
      }));
    }

    const result = await query(
      `INSERT INTO supplier_ratings (
        supplier_id, booking_id, customer_id,
        overall_rating, service_rating, value_rating,
        cleanliness_rating, location_rating, communication_rating,
        review_text, is_public, is_verified_stay, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE, 'approved')
      RETURNING *`,
      [
        supplierId, bookingId, customerId,
        overallRating, serviceRating, valueRating,
        cleanlinessRating, locationRating, communicationRating,
        reviewText, isPublic,
      ]
    );

    // Trigger score recalculation
    await recalculateScore(supplierId);

    res.status(201).json(createResponse(true, result.rows[0], 'Rating submitted'));
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to submit rating'));
  }
});

// ==================== RESPONSE TIME ====================

/**
 * POST /api/quality/response - Log a response
 */
router.post('/response', async (req: Request, res: Response) => {
  try {
    const { supplierId, inquiryType, relatedId, responseTimeMinutes } = req.body;

    if (!supplierId || !inquiryType) {
      return res.status(400).json(createResponse(false, undefined, 'Missing required fields'));
    }

    if (!isDatabaseConnected()) {
      return res.status(201).json(createResponse(true, {
        id: `resp_${Date.now()}`,
        supplier_id: supplierId,
        responded: true,
        response_time_minutes: responseTimeMinutes,
      }));
    }

    await query(
      `INSERT INTO response_time_logs (
        supplier_id, inquiry_type, related_id,
        inquiry_received_at, first_response_at, response_time_minutes, responded
      ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $4, TRUE)`,
      [supplierId, inquiryType, relatedId, responseTimeMinutes]
    );

    res.status(201).json(createResponse(true, undefined, 'Response logged'));
  } catch (error) {
    console.error('Error logging response:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to log response'));
  }
});

// ==================== ALERTS ====================

/**
 * GET /api/quality/alerts - Get quality alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { supplierId, status, severity, limit = '50', offset = '0' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        alerts: [
          {
            id: 'alert_1',
            supplier_id: 'supp_001',
            alert_type: 'low_rating',
            severity: 'warning',
            title: 'Rating Dropped',
            description: 'Average rating dropped below 4.0',
            current_value: 3.8,
            threshold_value: 4.0,
            status: 'open',
          },
        ],
        total: 1,
      }));
    }

    let sql = 'SELECT * FROM quality_alerts WHERE 1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (supplierId) {
      sql += ` AND supplier_id = $${paramIndex++}`;
      params.push(supplierId);
    }
    if (status) {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }
    if (severity) {
      sql += ` AND severity = $${paramIndex++}`;
      params.push(severity);
    }

    sql += ' ORDER BY created_at DESC';
    sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
    params.push(Number(limit), Number(offset));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { alerts: result.rows, total: result.rowCount }));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch alerts'));
  }
});

/**
 * PUT /api/quality/alerts/:id - Update alert
 */
router.put('/alerts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote, resolvedBy } = req.body;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, undefined, 'Alert updated'));
    }

    await query(
      `UPDATE quality_alerts SET 
        status = $1,
        resolution_note = $2,
        resolved_by = $3,
        resolved_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [status, resolutionNote, resolvedBy, id]
    );

    res.status(200).json(createResponse(true, undefined, 'Alert updated'));
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to update alert'));
  }
});

// ==================== STATISTICS ====================

/**
 * GET /api/quality/stats - Get quality statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        total_suppliers: 45,
        avg_score: 82.5,
        top_suppliers: [],
        badge_distribution: { trusted_supplier: 15, eco_champion: 8, top_safari: 12 },
        recent_alerts: 5,
        avg_response_time: 35,
      }));
    }

    const [statsResult, badgeResult, alertResult] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total_suppliers,
          AVG(overall_score) as avg_score,
          AVG(avg_response_time_minutes) as avg_response_time,
          AVG(booking_completion_rate) as avg_completion
        FROM supplier_quality_scores
      `),
      query(`
        SELECT badge, COUNT(*) as count
        FROM supplier_quality_scores,
        UNNEST(badges) as badge
        GROUP BY badge
      `),
      query(`SELECT COUNT(*) as count FROM quality_alerts WHERE status = 'open'`),
    ]);

    const stats = statsResult.rows[0] as Record<string, unknown> || {};
    const alerts = alertResult.rows[0] as Record<string, unknown> || {};

    const badgeDist: Record<string, number> = {};
    badgeResult.rows.forEach((row: Record<string, unknown>) => {
      badgeDist[row.badge as string] = parseInt(row.count as string);
    });

    res.status(200).json(createResponse(true, {
      total_suppliers: parseInt(stats.total_suppliers as string || '0'),
      avg_score: parseFloat(stats.avg_score as string || '0'),
      avg_response_time: Math.round(parseFloat(stats.avg_response_time as string || '0')),
      avg_completion: parseFloat(stats.avg_completion as string || '0'),
      badge_distribution: badgeDist,
      recent_alerts: parseInt(alerts.count as string || '0'),
    }));
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch statistics'));
  }
});

// ==================== LEADERBOARD ====================

/**
 * GET /api/quality/leaderboard - Get top suppliers
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { badge, category, limit = '10' } = req.query;

    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(true, {
        suppliers: [
          { supplier_id: 'supp_001', name: 'Safari Elite', overall_score: 95, badges: ['verified_luxury', 'super_host'], avg_rating: 4.9 },
          { supplier_id: 'supp_002', name: 'Wildlife Tours', overall_score: 92, badges: ['top_safari'], avg_rating: 4.8 },
          { supplier_id: 'supp_003', name: 'Eco Adventures', overall_score: 89, badges: ['eco_champion'], avg_rating: 4.7 },
        ],
      }));
    }

    let sql = `
      SELECT sq.*, s.name as supplier_name
      FROM supplier_quality_scores sq
      LEFT JOIN suppliers s ON sq.supplier_id = s.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (badge) {
      sql += ' AND $1 = ANY(sq.badges)';
      params.push(badge);
    }

    sql += ' ORDER BY sq.overall_score DESC';
    sql += ' LIMIT $' + (params.length + 1);
    params.push(Number(limit));

    const result = await query(sql, params);
    res.status(200).json(createResponse(true, { suppliers: result.rows }));
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json(createResponse(false, undefined, 'Failed to fetch leaderboard'));
  }
});

// Helper function to calculate badges
async function calculateBadges(
  supplierId: string,
  metrics: {
    overallScore: number;
    avgRating: number;
    completionRate: number;
    cancellationRate: number;
    totalBookings: number;
    totalRatings: number;
  }
): Promise<string[]> {
  try {
    const badges: string[] = [];
    const definitions = await query('SELECT * FROM badge_definitions WHERE is_active = TRUE ORDER BY min_overall_score DESC');

    for (const row of definitions.rows) {
      const def = row as Record<string, unknown>;
      const badgeType = def.badge_type as string;

      let qualifies = true;

      // Check overall score
      if (metrics.overallScore < (def.min_overall_score as number)) {
        qualifies = false;
      }

      // Check rating
      if (qualifies && def.min_rating && metrics.avgRating < (def.min_rating as number)) {
        qualifies = false;
      }

      // Check completion rate
      if (qualifies && def.min_completion_rate && metrics.completionRate < (def.min_completion_rate as number)) {
        qualifies = false;
      }

      // Check cancellation rate
      if (qualifies && def.max_cancellation_rate && metrics.cancellationRate > (def.max_cancellation_rate as number)) {
        qualifies = false;
      }

      // Check minimum bookings
      if (qualifies && def.min_bookings && metrics.totalBookings < (def.min_bookings as number)) {
        qualifies = false;
      }

      if (qualifies) {
        badges.push(badgeType);
      }
    }

    return badges.slice(0, 5); // Max 5 badges
  } catch (error) {
    console.error('Error calculating badges:', error);
    return [];
  }
}

// Helper function to recalculate score
async function recalculateScore(supplierId: string) {
  try {
    // This would trigger the calculation in a real scenario
    // For now, we just log it
    console.log(`Recalculating score for supplier: ${supplierId}`);
  } catch (error) {
    console.error('Error triggering score recalculation:', error);
  }
}

export default router;
