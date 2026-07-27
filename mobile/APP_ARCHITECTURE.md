# IDENT AFRICA Mobile Application Architecture

## Overview

IDENT AFRICA mobile applications for travelers and suppliers, built with React Native + Expo.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MOBILE APPLICATIONS                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Traveler   │  │ Supplier   │  │ Admin      │             │
│  │ App        │  │ App        │  │ App        │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                     │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API LAYER (v1)                              │
│  /api/v1/auth, /api/v1/destinations, /api/v1/bookings, etc.    │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     IDENT AFRICA BACKEND                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## App Structure

```
mobile/
├── apps/
│   ├── traveler/           # Traveler app
│   │   ├── app/
│   │   │   ├── (tabs)/    # Tab navigation
│   │   │   │   ├── explore/
│   │   │   │   ├── search/
│   │   │   │   ├── bookings/
│   │   │   │   └── profile/
│   │   │   ├── booking/
│   │   │   ├── package/
│   │   │   └── ai/
│   │   └── package.json
│   │
│   ├── supplier/          # Supplier app
│   │   ├── app/
│   │   │   ├── (tabs)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── bookings/
│   │   │   │   ├── packages/
│   │   │   │   └── earnings/
│   │   │   └── booking/
│   │   └── package.json
│   │
│   └── admin/             # Admin app (optional)
│
├── packages/
│   ├── ui/                # Shared UI components
│   ├── api/               # API client
│   ├── auth/              # Auth context
│   ├── navigation/         # Shared navigation
│   └── utils/             # Utilities
│
└── assets/                # Shared assets
```

---

## Traveler App Features

### Discovery Tab
- Featured destinations
- Popular packages
- Search with filters
- AI recommendations

### Explore Tab
- Browse by category
- Destination details
- Package listings
- Supplier profiles

### Bookings Tab
- Active bookings
- Past trips
- Booking details
- Payment status
- Documents

### Profile Tab
- User settings
- Travel preferences
- Favorites
- Notifications
- Help & Support

### AI Concierge
- Chat interface
- Recommendations
- Itinerary builder
- Travel advice

---

## Supplier App Features

### Dashboard Tab
- Today's summary
- Pending actions
- Quick stats
- Recent bookings

### Bookings Tab
- New bookings
- Confirmed bookings
- Past bookings
- Booking details

### Packages Tab
- My packages
- Add/Edit package
- Pricing management
- Availability calendar

### Earnings Tab
- Revenue overview
- Pending payouts
- Transaction history
- Earnings chart

---

## Technical Stack

### Core
- React Native 0.72+
- Expo SDK 49+
- TypeScript

### Navigation
- Expo Router (file-based)
- React Navigation (stack)

### State Management
- Zustand (lightweight)
- React Query (server state)

### UI
- Tamagui (cross-platform)
- NativeWind (Tailwind)
- expo-image

### Storage
- expo-secure-store (tokens)
- AsyncStorage (general)
- expo-sqlite (offline DB)

### Networking
- fetch (built-in)
- axios (advanced)

### Push Notifications
- Firebase Cloud Messaging
- expo-notifications

---

## API Versioning

### Base URL
```
Production: https://api.identafrica.com
Staging: https://staging-api.identafrica.com
```

### Versioning Strategy
```
/api/v1/...  - Current stable
/api/v2/...  - Next version (when needed)
```

### Rate Limiting
- 100 requests/minute (authenticated)
- 20 requests/minute (unauthenticated)

---

## Authentication Flow

### Login
1. User enters email/password
2. App sends to `/api/v1/auth/login`
3. Server returns access + refresh tokens
4. Tokens stored securely (expo-secure-store)
5. Access token used for API requests

### Token Refresh
- Access token: 15 minutes
- Refresh token: 7 days
- Auto-refresh 5 minutes before expiry

### Device Sessions
- Each device gets unique session
- Sessions tracked in database
- Can revoke from profile

---

## Offline Support

### Cached Data
- Destinations (24 hours)
- Packages (6 hours)
- User profile (15 minutes)
- Bookings (5 minutes)

### Offline Actions
- Queue actions when offline
- Sync when back online
- Show pending indicator

### Sync Strategy
1. App opens → Load cached
2. Fetch fresh data if online
3. Update cache with fresh data
4. Show loading state if slow

---

## Push Notifications

### Firebase Setup
```javascript
// firebase.json
{
  "messaging": {
    "vapid_key": "YOUR_VAPID_KEY"
  }
}
```

### Notification Types
| Type | Purpose |
|------|---------|
| booking_confirmed | Booking confirmation |
| payment_received | Payment success |
| travel_reminder | Trip approaching |
| supplier_update | Package update |
| ai_recommendation | New recommendations |
| review_request | Post-trip review |

---

## Build Configuration

### iOS
- Minimum: iOS 13
- Bundle ID: com.identafrica.traveler
- Capabilities: Push, Background

### Android
- Minimum: API 23 (Android 6)
- Package: com.identafrica.traveler
- Play Services: FCM

---

## Environment Variables

```env
# Development
API_URL=https://staging-api.identafrica.com
ENVIRONMENT=development

# Production
API_URL=https://api.identafrica.com
ENVIRONMENT=production

# Firebase
FCM_SENDER_ID=xxx
```

---

## Version

Current Version: 1.0.0
Last Updated: 2025-07-25
