# IDENT AFRICA Advanced Analytics Documentation

## Overview

Advanced analytics and executive reporting system for IDENT AFRICA.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ANALYTICS ENGINE                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ User Events │  │ AI Events   │  │Business Events│           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          ▼                                      │
│              ┌───────────────────────┐                          │
│              │   Event Collection    │                          │
│              └───────────┬───────────┘                          │
│                          │                                      │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │Daily Metrics│  │Weekly Metrics│ │Monthly Metrics│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Event Types

### User Events

| Event | Description | Metadata |
|-------|-------------|----------|
| `page_view` | Page visit | url, title |
| `destination_view` | Destination page | destination_id |
| `package_view` | Package page | package_id, price |
| `search` | Search query | query, results_count |
| `favorite_add` | Add to favorites | entity_type, entity_id |
| `booking_start` | Checkout started | booking_id |
| `booking_complete` | Booking confirmed | booking_id, value |

### AI Events

| Event | Description | Metadata |
|-------|-------------|----------|
| `ai_question` | User asked AI | query |
| `ai_recommendation` | AI recommended | recommendations |
| `ai_recommendation_click` | User clicked | recommendation_id |
| `ai_itinerary_generate` | Itinerary created | itinerary_id |

### Business Events

| Event | Description | Metadata |
|-------|-------------|----------|
| `payment_received` | Payment successful | amount, currency |
| `payment_failed` | Payment failed | reason |
| `refund` | Refund issued | amount, reason |
| `commission_earned` | Commission calculated | amount |

---

## Dashboard Views

### Owner Dashboard

Full access to all metrics:
- Revenue analytics
- Customer analytics
- Supplier performance
- Cost analysis
- AI insights
- Data export

### Manager Dashboard

Operational metrics:
- Revenue overview
- Booking statistics
- Customer data
- Supplier performance
- Data export

### Finance Dashboard

Financial metrics:
- Revenue analytics
- Booking revenue
- Cost analysis
- Financial reports
- Data export

### Supplier Dashboard

Personalized metrics:
- My bookings
- My revenue
- My ratings
- Performance data

### Viewer Dashboard

Read-only metrics:
- Booking statistics (aggregated)

---

## Report Types

### Executive Summary
- Key metrics overview
- Period comparison
- Trend indicators

### Revenue Report
- Total revenue
- Revenue by destination
- Revenue by supplier
- Revenue trends

### Booking Report
- Booking volume
- Conversion rates
- Cancellation rates
- Average booking value

### Customer Report
- New vs returning
- Geographic distribution
- Customer segments
- Lifetime value

### Supplier Report
- Top performers
- Booking volume
- Ratings
- Revenue contribution

---

## Export Formats

### PDF Report
- Formatted executive summary
- Charts and graphs
- Date range selection

### CSV Export
- Raw data export
- Custom field selection
- Date range filter

### Excel Export
- Multiple sheets
- Charts included
- Formulas for analysis

---

## AI Insights

The AI assistant analyzes:

### Revenue Insights
- Revenue trends
- Growth drivers
- Seasonal patterns

### Booking Insights
- Conversion analysis
- Funnel optimization
- Booking patterns

### Customer Insights
- Acquisition channels
- Retention patterns
- Segmentation analysis

### Supplier Insights
- Performance ranking
- Demand forecasting
- Opportunity identification

---

## Database Schema

### analytics_events

```sql
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY,
    user_id UUID,
    session_id VARCHAR(100),
    event_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);
```

### daily_metrics

```sql
CREATE TABLE daily_metrics (
    date DATE PRIMARY KEY,
    page_views INTEGER,
    unique_visitors INTEGER,
    bookings INTEGER,
    revenue DECIMAL(12, 2),
    conversions DECIMAL(5, 2)
);
```

---

## API Endpoints

### Track Event
```http
POST /api/analytics/track
```

### Get Metrics
```http
GET /api/analytics/metrics?period=month
```

### Get Top Performers
```http
GET /api/analytics/top?type=destinations&limit=10
```

### Export Report
```http
GET /api/analytics/export?format=csv&period=year
```

---

## Permissions

| Permission | Owner | Manager | Finance | Supplier | Viewer |
|------------|-------|---------|---------|----------|--------|
| View Revenue | ✓ | ✓ | ✓ | - | - |
| View Bookings | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Customers | ✓ | ✓ | ✓ | - | - |
| View Suppliers | ✓ | ✓ | - | - | - |
| View Costs | ✓ | - | ✓ | - | - |
| Export Data | ✓ | ✓ | ✓ | - | - |
| Edit Settings | ✓ | - | - | - | - |

---

## Version

Current Version: 1.0.0
Last Updated: 2025-07-25
