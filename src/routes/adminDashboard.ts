/**
 * Admin Dashboard API Routes
 * 
 * Business metrics and dashboard data.
 */

import { Router, Request, Response } from 'express';
import { query, isDatabaseConnected } from '../db/index.js';

const router = Router();

function createResponse<T>(data: T, error?: string) {
  return {
    success: !error,
    data,
    ...(error ? { error } : {}),
    timestamp: new Date().toISOString(),
  };
}

// Mock dashboard data
const MOCK_METRICS = {
  todayBookings: 5,
  pendingBookings: 12,
  todayRevenue: 24500,
  monthRevenue: 156800,
  totalCustomers: 234,
  activeSuppliers: 18,
  todayVisitors: 1247,
  conversionRate: 2.3,
};

const MOCK_RECENT_BOOKINGS = [
  { id: '1', reference: 'BK20250725001', customer: 'Sarah Johnson', package: '7 Day Maasai Mara Safari', date: '2025-08-15', amount: 4500, status: 'pending' },
  { id: '2', reference: 'BK20250725002', customer: 'Michael Chen', package: 'Gorilla Trek Uganda', date: '2025-08-20', amount: 3200, status: 'confirmed' },
  { id: '3', reference: 'BK20250725003', customer: 'Emma Wilson', package: 'Zanzibar Beach Escape', date: '2025-09-01', amount: 2800, status: 'paid' },
  { id: '4', reference: 'BK20250724001', customer: 'James Brown', package: 'Serengeti Migration', date: '2025-08-10', amount: 5100, status: 'pending' },
  { id: '5', reference: 'BK20250724002', customer: 'Lisa Anderson', package: 'Rwanda Gorilla Experience', date: '2025-08-25', amount: 4800, status: 'confirmed' },
];

const MOCK_POPULAR_DESTINATIONS = [
  { name: 'Masai Mara', bookings: 45, revenue: 202500 },
  { name: 'Serengeti', bookings: 38, revenue: 190000 },
  { name: 'Bwindi Forest', bookings: 28, revenue: 140000 },
  { name: 'Zanzibar', bookings: 35, revenue: 105000 },
  { name: 'Ngorongoro', bookings: 22, revenue: 88000 },
];

const MOCK_RECENT_ACTIVITY = [
  { type: 'booking', message: 'New booking from Sarah Johnson', time: '5 minutes ago', icon: 'calendar' },
  { type: 'payment', message: 'Payment received - $2,800', time: '12 minutes ago', icon: 'dollar' },
  { type: 'enquiry', message: 'New enquiry from Michael Chen', time: '25 minutes ago', icon: 'mail' },
  { type: 'review', message: 'New review on Masai Mara Safari', time: '1 hour ago', icon: 'star' },
  { type: 'supplier', message: 'New supplier application', time: '2 hours ago', icon: 'building' },
];

// ============ DASHBOARD METRICS ============

router.get('/metrics', async (req: Request, res: Response) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(MOCK_METRICS));
    }

    // Get metrics from database
    const bookingsResult = await query<{count: string}>(`
      SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    const pendingResult = await query<{count: string}>(`
      SELECT COUNT(*) FROM bookings WHERE status = 'pending'
    `);
    
    const revenueResult = await query<{total: string}>(`
      SELECT COALESCE(SUM(total_amount), 0) as total 
      FROM bookings 
      WHERE DATE(created_at) = CURRENT_DATE 
      AND status IN ('paid', 'completed')
    `);
    
    const customersResult = await query<{count: string}>(`
      SELECT COUNT(*) FROM customers
    `);
    
    const suppliersResult = await query<{count: string}>(`
      SELECT COUNT(*) FROM suppliers WHERE status = 'active'
    `);

    const metrics = {
      todayBookings: parseInt(bookingsResult.rows[0]?.count || '0'),
      pendingBookings: parseInt(pendingResult.rows[0]?.count || '0'),
      todayRevenue: parseFloat(revenueResult.rows[0]?.total || '0'),
      monthRevenue: 0,
      totalCustomers: parseInt(customersResult.rows[0]?.count || '0'),
      activeSuppliers: parseInt(suppliersResult.rows[0]?.count || '0'),
      todayVisitors: 0,
      conversionRate: 0,
    };

    res.status(200).json(createResponse(metrics));
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json(createResponse(MOCK_METRICS));
  }
});

// ============ RECENT BOOKINGS ============

router.get('/bookings/recent', async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;
    
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(MOCK_RECENT_BOOKINGS.slice(0, Number(limit))));
    }

    interface BookingRow {
      id: string;
      booking_reference: string;
      first_name: string;
      last_name: string;
      title: string;
      travel_date: string;
      total_amount: string;
      status: string;
    }

    const result = await query<BookingRow>(`
      SELECT 
        b.id,
        b.booking_reference,
        c.first_name,
        c.last_name,
        p.title,
        b.travel_date,
        b.total_amount,
        b.status
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN packages p ON b.package_id = p.id
      ORDER BY b.created_at DESC
      LIMIT $1
    `, [Number(limit)]);

    const bookings = result.rows.map(row => ({
      id: row.id,
      reference: row.booking_reference,
      customer: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Guest',
      package: row.title || 'Custom Booking',
      date: row.travel_date,
      amount: parseFloat(row.total_amount),
      status: row.status,
    }));

    res.status(200).json(createResponse(bookings));
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(200).json(createResponse(MOCK_RECENT_BOOKINGS));
  }
});

// ============ POPULAR DESTINATIONS ============

router.get('/destinations/popular', async (req: Request, res: Response) => {
  try {
    const { limit = 5 } = req.query;
    
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(MOCK_POPULAR_DESTINATIONS.slice(0, Number(limit))));
    }

    interface DestinationRow {
      name: string;
      bookings: string;
      revenue: string;
    }

    const result = await query<DestinationRow>(`
      SELECT 
        d.name,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.total_amount), 0) as revenue
      FROM destinations d
      LEFT JOIN bookings b ON d.id = b.destination_id
      GROUP BY d.id, d.name
      ORDER BY revenue DESC
      LIMIT $1
    `, [Number(limit)]);

    const destinations = result.rows.map(row => ({
      name: row.name,
      bookings: parseInt(row.bookings),
      revenue: parseFloat(row.revenue),
    }));

    res.status(200).json(createResponse(destinations));
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    res.status(200).json(createResponse(MOCK_POPULAR_DESTINATIONS));
  }
});

// ============ RECENT ACTIVITY ============

router.get('/activity', async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    if (!isDatabaseConnected()) {
      return res.status(200).json(createResponse(MOCK_RECENT_ACTIVITY.slice(0, Number(limit))));
    }

    interface ActivityRow {
      action: string;
      details: { message?: string };
      created_at: string;
    }

    const result = await query<ActivityRow>(`
      SELECT action, details, created_at
      FROM activity_log
      ORDER BY created_at DESC
      LIMIT $1
    `, [Number(limit)]);

    const activities = result.rows.map(row => ({
      type: row.action.split('.')[0] || 'system',
      message: row.details?.message || row.action,
      time: getTimeAgo(row.created_at),
      icon: getIconForAction(row.action),
    }));

    res.status(200).json(createResponse(activities));
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(200).json(createResponse(MOCK_RECENT_ACTIVITY));
  }
});

// ============ ANALYTICS ============

router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { period = '30' } = req.query;
    
    if (!isDatabaseConnected()) {
      const mockData = generateMockAnalytics(Number(period));
      return res.status(200).json(createResponse(mockData));
    }

    interface AnalyticsRow {
      date: string;
      metric_type: string;
      metric_value: string;
    }

    const result = await query<AnalyticsRow>(`
      SELECT date, metric_type, metric_value
      FROM site_analytics
      WHERE date >= CURRENT_DATE - INTERVAL '1 day' * $1
      ORDER BY date ASC
    `, [Number(period)]);

    const analytics = {
      labels: [] as string[],
      pageviews: [] as number[],
      visitors: [] as number[],
      bookings: [] as number[],
    };

    result.rows.forEach(row => {
      const date = row.date.toString().split('T')[0];
      if (!analytics.labels.includes(date)) {
        analytics.labels.push(date);
      }
      if (row.metric_type === 'pageviews') {
        analytics.pageviews.push(parseInt(row.metric_value));
      } else if (row.metric_type === 'visitors') {
        analytics.visitors.push(parseInt(row.metric_value));
      }
    });

    res.status(200).json(createResponse(analytics));
  } catch (error) {
    console.error('Error fetching analytics:', error);
    const mockData = generateMockAnalytics(30);
    res.status(200).json(createResponse(mockData));
  }
});

// ============ HELPERS ============

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
}

function getIconForAction(action: string): string {
  if (action.includes('booking')) return 'calendar';
  if (action.includes('payment')) return 'dollar';
  if (action.includes('enquiry') || action.includes('contact')) return 'mail';
  if (action.includes('review')) return 'star';
  if (action.includes('supplier')) return 'building';
  return 'info';
}

function generateMockAnalytics(days: number) {
  const labels: string[] = [];
  const pageviews: number[] = [];
  const visitors: number[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toISOString().split('T')[0]);
    pageviews.push(Math.floor(Math.random() * 1000) + 500);
    visitors.push(Math.floor(Math.random() * 500) + 200);
  }
  
  return { labels, pageviews, visitors, bookings: [] };
}

export default router;
