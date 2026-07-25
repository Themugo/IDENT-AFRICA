<div align="center">
<img width="200" height="200" alt="IDENT AFRICA Logo" src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80" />
</div>

# IDENT AFRICA

**Luxury East Africa Expeditions & Sanctuaries**

A premium travel ecosystem platform for booking African safari experiences, featuring AI-powered itinerary planning, multi-gateway payment processing (Stripe, Flutterwave, M-Pesa), and a comprehensive supplier management portal.

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

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Vite 6 |
| Backend | Express.js, Node.js |
| AI | Google Gemini (@google/genai) |
| Payments | Stripe, Flutterwave, M-Pesa |
| Database | PostgreSQL 14+ (schema provided) |

## 📋 Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **npm** or **pnpm** package manager
- **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

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

# Application
NODE_ENV="development"
PORT=3000
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📦 Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (ESM output) |
| `npm run start` | Run production build |
| `npm run lint` | Run TypeScript type checking |
| `npm run clean` | Remove build artifacts |

## 🗄️ Database Setup

The project includes a PostgreSQL schema at `schema.sql`. To set up the database:

```bash
# Connect to PostgreSQL
psql -U postgres -d ident_africa

# Run the schema
\i schema.sql
```

Or use a migration tool like Prisma or Drizzle for more control.

## 🌐 API Endpoints

### Health Check
```
GET /api/health
```

### Exchange Rates
```
GET /api/exchange-rates
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

### Refunds
```
POST /api/refunds/process
```

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
   - `NODE_ENV=production`

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

## 🔒 Security

The application includes several security measures:

- **Helmet.js** - Security headers
- **CORS** - Configurable origin validation
- **Rate Limiting** - (Configure via middleware)
- **Input Validation** - All API inputs validated
- **SQL Injection Prevention** - Parameterized queries (in production DB)
- **XSS Protection** - Content Security Policy

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS` with production domains
- [ ] Add Stripe/Flutterwave/M-Pesa live credentials
- [ ] Set up database connection
- [ ] Enable HTTPS
- [ ] Configure logging/monitoring

## 📁 Project Structure

```
IDENT-AFRICA/
├── src/
│   ├── components/       # React components
│   │   ├── ai-planner/   # AI concierge components
│   │   ├── auth/         # Authentication components
│   │   ├── booking/      # Booking flow components
│   │   ├── builder/      # Itinerary builder
│   │   ├── common/       # Shared components
│   │   ├── compare/      # Trip comparison
│   │   ├── dashboard/    # Admin/user dashboards
│   │   ├── destinations/ # Destination browsing
│   │   ├── home/         # Landing page sections
│   │   ├── hotels/       # Hotel/lodge components
│   │   └── supplier/     # Supplier portal
│   ├── context/          # React Context providers
│   ├── data/             # Mock data & constants
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── server.ts             # Express backend
├── schema.sql            # PostgreSQL schema
├── vercel.json           # Vercel configuration
└── .env.example          # Environment template
```

## 📝 License

Private - All rights reserved

## 🆘 Support

For issues or questions, please contact the development team.
