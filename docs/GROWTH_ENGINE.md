# IDENT AFRICA Growth Engine Documentation

## Overview

The Growth Engine provides analytics, SEO optimization, content marketing, and customer retention tools for IDENT AFRICA.

---

## Analytics Foundation

### Tracking Events

| Event Type | Description |
|------------|-------------|
| `page_view` | Page visit |
| `destination_view` | Destination page view |
| `package_view` | Package page view |
| `search` | Search query |
| `ai_conversation` | AI chat interaction |
| `booking_started` | Checkout initiated |
| `booking_completed` | Booking confirmed |
| `signup` | User registration |

### Analytics Dashboard

**Overview Metrics:**
- Unique visitors
- Page views
- Bounce rate
- Average session duration

**Traffic Analysis:**
- Traffic sources (Google, Direct, Social, Email)
- Device breakdown (Mobile, Desktop, Tablet)
- Geographic distribution

**Conversion Funnel:**
- Visitors → Package Views → Booking Started → Completed

**Content Performance:**
- Top destinations
- Top packages
- Search queries

---

## SEO Engine

### SEO Pages Table

Dynamic SEO for all content types:
- Destinations
- Packages
- Accommodations
- Suppliers
- Static pages

### SEO Fields

| Field | Description |
|-------|-------------|
| `meta_title` | Browser tab title |
| `meta_description` | Search result description |
| `og_title` | Social share title |
| `og_description` | Social share description |
| `og_image` | Social share image |
| `schema_data` | Structured data markup |
| `canonical_url` | Preferred URL |
| `robots` | Index/follow directives |

### Structured Data Types

- `Article` - Blog posts
- `Product` - Packages
- `BreadcrumbList` - Navigation
- `FAQPage` - FAQ content
- `LocalBusiness` - Contact info

---

## Content Marketing

### Blog Posts

**Features:**
- Rich text editor
- Featured images
- Gallery support
- Categories and tags
- SEO fields
- Publishing workflow
- View analytics

**Workflow:**
1. Draft → Write content
2. Review → Editorial review
3. Published → Live on site
4. Archived → Removed from site

### Categories

| Category | Use Case |
|----------|----------|
| Safari Guide | Destination guides |
| Accommodation | Lodge/hotel reviews |
| Tips & Advice | How-to content |
| Adventure | Activity guides |
| Culture | Local experiences |
| News | Updates & announcements |

---

## Email Marketing

### Email Templates

**System Templates:**
- Welcome email
- Booking confirmation
- Payment received
- Travel reminder
- Review request

**Marketing Templates:**
- Newsletter
- Promotions
- Special offers

### Email Variables

```
{{customer_name}} - Recipient name
{{booking_reference}} - Booking ID
{{destination}} - Travel destination
{{travel_date}} - Trip date
{{amount}} - Payment amount
{{package_name}} - Package title
```

### Email Queue

- Scheduled sending
- Delivery tracking
- Open/click analytics
- Bounce handling

---

## Customer Retention

### Favorites & Wishlist

Customers can save:
- Destinations
- Packages
- Accommodations
- Experiences
- Suppliers

### Trip History

- Past bookings
- Saved itineraries
- Travel memories
- Photo sharing

---

## Referral System

### Referral Types

| Type | Description |
|------|-------------|
| `referral` | Friend referral |
| `affiliate` | Partner affiliate |
| `partner` | Strategic partner |
| `campaign` | Marketing campaign |

### Referral Rewards

**Reward Types:**
- Percentage of booking value
- Fixed credit amount
- Platform credit

### Tracking

- Unique referral codes
- UTM parameter tracking
- Conversion attribution
- Reward distribution

---

## Performance Marketing

### Campaign Tracking

**UTM Parameters:**
- `utm_source` - Traffic source
- `utm_medium` - Marketing medium
- `utm_campaign` - Campaign name
- `utm_term` - Paid keywords
- `utm_content` - Ad variation

### Attribution

Track conversions from:
- Google Ads
- Facebook Ads
- Instagram Ads
- Email campaigns
- Affiliate partners

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `analytics_events` | Event tracking |
| `blog_posts` | Content management |
| `email_templates` | Email templates |
| `email_queue` | Email delivery |
| `favorites` | Wishlist items |
| `referrals` | Referral programs |
| `referral_usages` | Referral tracking |
| `campaigns` | Marketing campaigns |
| `seo_pages` | SEO metadata |
| `daily_analytics` | Aggregated stats |

---

## API Endpoints

### Analytics

```http
GET /api/analytics/overview
GET /api/analytics/traffic
GET /api/analytics/conversions
POST /api/analytics/event
```

### Blog

```http
GET /api/blog/posts
POST /api/blog/posts
PATCH /api/blog/posts/:id
DELETE /api/blog/posts/:id
```

### Email

```http
GET /api/email/templates
POST /api/email/send
GET /api/email/queue
```

### Referrals

```http
GET /api/referrals
POST /api/referrals
GET /api/referrals/:code
```

---

## Integration Points

### Analytics Events

Track events in components:
```typescript
import { trackEvent } from '@/services/analytics';

trackEvent({
  event_type: 'page_view',
  page: '/destinations/masai-mara',
  metadata: { destination: 'masai-mara' }
});
```

### Email Triggers

Send emails on actions:
```typescript
import { sendEmail } from '@/services/email';

sendEmail({
  template: 'booking_confirmation',
  recipient: 'customer@email.com',
  variables: { booking_reference: 'BK-123' }
});
```

---

## Configuration

### Environment Variables

```env
# Analytics
ANALYTICS_ID=G-XXXXXXXXXX

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SENDGRID_API_KEY=SG.xxx

# SEO
SITE_URL=https://identafrica.com
DEFAULT_OG_IMAGE=https://identafrica.com/og-image.jpg
```

---

## Metrics

### Key Performance Indicators

| Metric | Target |
|--------|--------|
| Monthly Visitors | 100,000+ |
| Conversion Rate | 3%+ |
| Email Open Rate | 25%+ |
| Referral Conversion | 5%+ |

### Growth Metrics

| Metric | Monthly Target |
|--------|---------------|
| Visitor Growth | +10% |
| Booking Growth | +15% |
| Revenue Growth | +20% |

---

## Version

Current Version: 1.0.0
Last Updated: 2025-07-25
