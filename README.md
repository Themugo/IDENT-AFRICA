<div align="center">
<img width="200" height="200" alt="IDENT AFRICA Logo" src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80" />
</div>

# IDENT AFRICA

**Luxury East Africa Expeditions & Sanctuaries**

> **Version 1.0.0** | [Changelog](CHANGELOG.md) | [Security](SECURITY.md) | [Deployment](DEPLOYMENT.md) | [Contributing](CONTRIBUTING.md)

A premium travel ecosystem platform for booking African safari experiences, featuring AI-powered itinerary planning, multi-gateway payment processing (Stripe, Flutterwave, M-Pesa), JWT authentication, and a comprehensive supplier management portal.

---

## 🦁 Features

- **AI Safari Concierge** - Gemini-powered trip planner
- **Destination Explorer** - Browse East African wildlife destinations
- **Luxury Lodges** - Curated collection of premium accommodations
- **Visual Itinerary Builder** - Drag-and-drop trip customization
- **Trip Comparator** - Side-by-side itinerary comparison
- **Multi-Gateway Payments** - Stripe, Flutterwave, M-Pesa
- **Supplier Portal** - Partner management for lodges and operators
- **Admin Dashboard** - Comprehensive booking management
- **Real-time Exchange Rates** - Multi-currency support (USD, EUR, GBP, KES)
- **User Authentication** - JWT-based login/logout system

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                   React 19 + Vite + Tailwind                │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼───────────────────────────────────┐
│                        Backend                               │
│                  Express.js + Node.js                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐   │
│  │   AI    │  │Payments │  │  Auth   │  │  Business   │   │
│  │ Planner │  │Gateway  │  │ Service │  │   Logic     │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌─────────────┐  ┌──────────────┐
│  PostgreSQL   │  │  External   │  │   Content    │
│   Database    │  │   APIs      │  │    CMS       │
└───────────────┘  └─────────────┘  └──────────────┘
```

### System Modules

| Module | Description |
|--------|-------------|
| **Authentication** | JWT-based auth with role management |
| **Destinations** | Safari destinations with gallery and wildlife info |
| **Bookings** | Complete booking lifecycle management |
| **Payments** | Multi-gateway processing (Stripe, Flutterwave, M-Pesa) |
| **AI Planner** | Gemini-powered trip planning |
| **CMS** | Content management system |
| **Supplier Portal** | Partner dashboard and earnings |
| **Admin** | Comprehensive admin controls |

---

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite 6 |
| **Backend** | Express.js, Node.js 18+ |
| **AI** | Google Gemini (@google/genai) |
| **Payments** | Stripe, Flutterwave, M-Pesa |
| **Database** | PostgreSQL 14+ (optional - mock data by default) |
| **Auth** | JWT tokens with refresh support |
| **Icons** | Lucide React |
| **Animations** | Motion (Framer Motion alternative) |

---

## 📋 Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **npm** or **pnpm** package manager
- **PostgreSQL** 14+ (optional for local dev - uses mock data by default)
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd IDENT-AFRICA
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Required for AI features
GEMINI_API_KEY="your_gemini_api_key"

# Required for production
JWT_SECRET="generate-a-strong-random-secret"

# Application
NODE_ENV="development"
PORT=3000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Demo Login

Use these credentials for testing:
- Email: `kamauwamakena@gmail.com`
- Password: `demo123`

## 📦 Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (ESM output) |
| `npm run start` | Run production build |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove build artifacts |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |

## 🗄️ Database Setup (Optional)

For local development without database, the app uses mock data. To use PostgreSQL:

```bash
# 1. Create a PostgreSQL database
createdb ident_africa

# 2. Set DATABASE_URL in .env
export DATABASE_URL="postgresql://user:pass@localhost:5432/ident_africa"

# 3. Run migrations
npm run db:migrate
```

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/login     - User login
GET  /api/auth/me       - Get current user
POST /api/auth/logout    - User logout
```

### Health & Status
```
GET /api/health         - Application health
GET /api/db/health      - Database health
GET /api/exchange-rates - Exchange rates
```

### Payments
```
POST /api/payments/stripe/create-intent
POST /api/payments/flutterwave/charge
POST /api/payments/mpesa/stk-push
```

### AI Planner
```
POST /api/ai-planner
```

### Admin
```
GET /api/admin/stats
```

### Refunds
```
POST /api/refunds/process
```

## 🔒 Security Features

The application includes comprehensive security measures:

- **Helmet.js** - Security headers (CSP, X-Frame-Options, XSS protection)
- **CORS** - Configurable origin validation with whitelist
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - All API inputs validated and sanitized
- **Compression** - Gzip compression for responses
- **Rate Limiting Ready** - Structure for adding rate limiting
- **Error Masking** - Internal errors not exposed in production

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` with production domains
- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Add Stripe/Flutterwave/M-Pesa live credentials
- [ ] Set up PostgreSQL database and run migrations
- [ ] Enable HTTPS
- [ ] Configure monitoring (Sentry, DataDog, etc.)

## 🚢 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=your-domain.com`

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Production Deploy

```bash
npm run build
npm start
```

## 📁 Project Structure

```
IDENT-AFRICA/
├── src/
│   ├── auth/             # Authentication utilities
│   ├── components/       # React components
│   │   ├── ai-planner/   # AI concierge components
│   │   ├── auth/         # Authentication components
│   │   ├── booking/      # Booking flow components
│   │   ├── builder/      # Itinerary builder
│   │   ├── common/       # Shared components (ErrorBoundary, LoadingSpinner)
│   │   ├── compare/      # Trip comparison
│   │   ├── dashboard/   # Admin/user dashboards
│   │   ├── destinations/ # Destination browsing
│   │   ├── home/        # Landing page sections
│   │   ├── hotels/      # Hotel/lodge components
│   │   └── supplier/   # Supplier portal
│   ├── context/          # React Context providers (App, Auth)
│   ├── database/        # Database connection & migrations
│   ├── data/            # Mock data & constants
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions (API client, PDF export)
├── server.ts           # Express backend with all routes
├── schema.sql         # PostgreSQL schema with triggers
├── vercel.json       # Vercel configuration
├── .env.example      # Environment template
└── README.md         # This file
```

## 📝 License

Private - All rights reserved

## 🆘 Support

For issues or questions, please contact the development team.
