import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Security headers
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

// Database and routes
import { initDatabase } from './src/db/index.js';
import destinationsRouter from './src/routes/destinations.js';
import lodgesRouter from './src/routes/lodges.js';
import bookingsRouter from './src/routes/bookings.js';
import usersRouter from './src/routes/users.js';
import paymentsRouter from './src/routes/payments.js';
import suppliersRouter from './src/routes/suppliers.js';
import adminRouter from './src/routes/admin.js';
import cmsRouter from './src/routes/cms.js';
import pageBuilderRouter from './src/routes/pageBuilder.js';
import mediaRouter from './src/routes/media.js';
import pricingRouter from './src/routes/pricing.js';
import searchRouter from './src/routes/search.js';
import inventoryRouter from './src/routes/inventory.js';
import notificationsRouter from './src/routes/notifications.js';
import communicationRouter from './src/routes/communication.js';
import documentsRouter from './src/routes/documents.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration with validation
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
const API_TIMEOUT = 10000; // 10 second timeout for external APIs

// Request validation helpers
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  timestamp: string;
  requestId?: string;
}

function createResponse<T>(success: boolean, data?: T, error?: string, details?: string): ApiResponse<T> {
  return {
    success,
    ...(success ? { data } : { error, details }),
    timestamp: new Date().toISOString(),
  };
}

// Generate unique request ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Input sanitization helper
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 1000); // Limit length and trim
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (basic)
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{8,20}$/;
  return phoneRegex.test(phone);
}

// Production CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    if (ALLOWED_ORIGINS.includes(origin) || NODE_ENV === 'development') {
      return callback(null, true);
    }
    callback(new Error(`CORS policy violation: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

async function startServer() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://ai.google.dev"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "https://open.er-api.com", "https://generativelanguage.googleapis.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS
  app.use(cors(corsOptions));

  // Compression
  app.use(compression());

  // Body parsing with size limits
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = generateRequestId();
    res.setHeader('X-Request-Id', requestId);
    
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      if (NODE_ENV !== 'test') {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms) [${requestId}]`);
      }
    });
    
    next();
  });

  // Initialize database connection
  await initDatabase();

  // Register REST API routes
  app.use('/api/destinations', destinationsRouter);
  app.use('/api/lodges', lodgesRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/suppliers', suppliersRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/cms', cmsRouter);
  app.use('/api/page-builder', pageBuilderRouter);
  app.use('/api/media', mediaRouter);
  app.use('/api/pricing', pricingRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/inventory', inventoryRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/communication', communicationRouter);
  app.use('/api/documents', documentsRouter);

  // API Route: Live Exchange Rates
  app.get('/api/exchange-rates', async (_req, res) => {
    const DEFAULT_RATES = {
      USD: { rate: 1, symbol: '$', prefix: true },
      EUR: { rate: 0.92, symbol: '€', prefix: true },
      GBP: { rate: 0.78, symbol: '£', prefix: true },
      KES: { rate: 129.5, symbol: 'KSh ', prefix: true },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      if (data && data.rates) {
        const liveRates = {
          USD: { rate: 1, symbol: '$', prefix: true },
          EUR: { rate: data.rates.EUR || 0.92, symbol: '€', prefix: true },
          GBP: { rate: data.rates.GBP || 0.78, symbol: '£', prefix: true },
          KES: { rate: data.rates.KES || 129.5, symbol: 'KSh ', prefix: true },
        };

        return res.status(200).json({
          success: true,
          source: 'live',
          baseCurrency: 'USD',
          rates: liveRates,
          lastUpdated: data.time_last_update_utc || new Date().toISOString(),
        });
      }

      throw new Error('Invalid rate payload');
    } catch (err: any) {
      console.warn('Live exchange rates fetch warning (using default rates):', err.message);
      return res.status(200).json({
        success: true,
        source: 'default',
        baseCurrency: 'USD',
        rates: DEFAULT_RATES,
        lastUpdated: new Date().toISOString(),
      });
    }
  });

  // API Route: Health check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      app: 'Ident Africa', 
      version: '1.0.0',
      environment: NODE_ENV,
      timestamp: new Date().toISOString() 
    });
  });

  // API Route: Stripe Payment Intent
  app.post('/api/payments/stripe/create-intent', (req, res) => {
    try {
      const { amountUSD, currency = 'USD', travelerEmail, travelerName } = req.body;

      // Validate required fields
      if (!amountUSD || typeof amountUSD !== 'number' || amountUSD <= 0) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid amount', 'amountUSD must be a positive number'));
      }
      if (amountUSD > 1000000) {
        return res.status(400).json(createResponse(false, undefined, 'Amount exceeds limit', 'Maximum payment amount is $1,000,000 USD'));
      }
      if (travelerEmail && !isValidEmail(travelerEmail)) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid email', 'Please provide a valid email address'));
      }
      if (travelerName && typeof travelerName !== 'string') {
        return res.status(400).json(createResponse(false, undefined, 'Invalid name', 'Traveler name must be a string'));
      }

      const paymentIntentId = `pi_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
      const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;

      res.status(200).json(createResponse(true, {
        gateway: 'Stripe',
        paymentIntentId,
        clientSecret,
        amountUSD,
        currency,
        status: 'requires_payment_method',
        receiptUrl: `https://pay.stripe.com/receipts/safariflow/${paymentIntentId}`,
      }));
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      res.status(500).json(createResponse(false, undefined, 'Payment processing failed', 'An unexpected error occurred'));
    }
  });

  // API Route: Flutterwave Pan-African Charge
  app.post('/api/payments/flutterwave/charge', (req, res) => {
    try {
      const { amountUSD, currency = 'USD', travelerEmail, travelerName, channel = 'card', country = 'KE' } = req.body;

      // Validate required fields
      if (!amountUSD || typeof amountUSD !== 'number' || amountUSD <= 0) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid amount', 'amountUSD must be a positive number'));
      }
      if (!isValidEmail(travelerEmail)) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid email', 'Please provide a valid email address'));
      }
      if (travelerName && typeof travelerName !== 'string') {
        return res.status(400).json(createResponse(false, undefined, 'Invalid name', 'Traveler name must be a string'));
      }

      const tx_ref = `FLW-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;

      res.status(200).json(createResponse(true, {
        status: 'success',
        message: 'Flutterwave payment authorized',
        tx_ref,
        flw_ref: `FLW_REF_${Date.now()}`,
        amount: amountUSD,
        currency,
        channel,
        country,
        customer: { email: sanitizeString(travelerEmail), name: sanitizeString(travelerName || '') },
      }));
    } catch (error) {
      console.error('Flutterwave payment error:', error);
      res.status(500).json(createResponse(false, undefined, 'Payment processing failed', 'An unexpected error occurred'));
    }
  });

  // API Route: M-Pesa Express STK Push
  app.post('/api/payments/mpesa/stk-push', (req, res) => {
    try {
      const { phoneNumber, amountUSD } = req.body;

      // Validate required fields
      if (!phoneNumber || !isValidPhone(phoneNumber)) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid phone number', 'Please provide a valid phone number with country code'));
      }
      if (!amountUSD || typeof amountUSD !== 'number' || amountUSD <= 0) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid amount', 'amountUSD must be a positive number'));
      }
      if (amountUSD > 150000) {
        return res.status(400).json(createResponse(false, undefined, 'Amount exceeds limit', 'M-Pesa maximum single transaction is KES 150,000'));
      }

      const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      const merchantRequestId = `29182-${Math.floor(1000000 + Math.random() * 9000000)}-1`;

      res.status(200).json(createResponse(true, {
        MerchantRequestID: merchantRequestId,
        CheckoutRequestID: checkoutRequestId,
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage: `Success. Prompt sent to ${sanitizeString(phoneNumber)}. Enter M-Pesa PIN to complete payment of $${amountUSD}.`,
      }));
    } catch (error) {
      console.error('M-Pesa STK push error:', error);
      res.status(500).json(createResponse(false, undefined, 'Payment processing failed', 'An unexpected error occurred'));
    }
  });

  // API Route: Refund Workflow Process
  app.post('/api/refunds/process', (req, res) => {
    try {
      const { bookingId, requestedAmountUSD, reason, payoutAccount } = req.body;

      // Validate required fields
      if (!bookingId || typeof bookingId !== 'string') {
        return res.status(400).json(createResponse(false, undefined, 'Invalid booking ID', 'A valid booking ID is required'));
      }
      if (!requestedAmountUSD || typeof requestedAmountUSD !== 'number' || requestedAmountUSD <= 0) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid amount', 'Requested amount must be a positive number'));
      }
      if (!reason || typeof reason !== 'string') {
        return res.status(400).json(createResponse(false, undefined, 'Invalid reason', 'A refund reason is required'));
      }
      if (payoutAccount && !isValidEmail(payoutAccount) && !isValidPhone(payoutAccount)) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid payout account', 'Please provide a valid email or phone number for payout'));
      }

      const refundTicketId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

      res.status(200).json(createResponse(true, {
        refundTicketId,
        bookingId: sanitizeString(bookingId),
        requestedAmountUSD,
        reason: sanitizeString(reason),
        payoutAccount: payoutAccount ? sanitizeString(payoutAccount) : undefined,
        status: 'Submitted',
        estimatedDisbursementHours: 24,
        message: `Refund claim ${refundTicketId} logged successfully into escrow auditor queue.`,
      }));
    } catch (error) {
      console.error('Refund processing error:', error);
      res.status(500).json(createResponse(false, undefined, 'Refund processing failed', 'An unexpected error occurred'));
    }
  });

  // API Route: Gemini AI Safari Concierge
  app.post('/api/ai-planner', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json(createResponse(false, undefined, 'AI service not configured', 'GEMINI_API_KEY is not configured'));
      }

      const {
        budgetPerPersonUSD = 5500,
        startDate = '2026-09-10',
        endDate = '2026-09-17',
        durationDays = 7,
        travelersCount = 2,
        travelMonth = 'September',
        countries = ['Kenya', 'Tanzania'],
        wildlifePriorities = ['The Big Five', 'Great Wildebeest Migration'],
        luxuryLevel = 'Ultra-Luxe Canvas',
        interests = ['Big Five Game Viewing', 'Luxury Tented Camps'],
        specialInterests = ''
      } = req.body;

      // Validate input
      if (budgetPerPersonUSD < 100 || budgetPerPersonUSD > 100000) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid budget', 'Budget must be between $100 and $100,000 USD'));
      }
      if (travelersCount < 1 || travelersCount > 50) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid traveler count', 'Number of travelers must be between 1 and 50'));
      }
      if (durationDays < 1 || durationDays > 60) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid duration', 'Duration must be between 1 and 60 days'));
      }
      if (!Array.isArray(countries) || countries.length === 0) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid countries', 'At least one country must be specified'));
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'ident-africa/1.0'
          },
          timeout: API_TIMEOUT
        }
      });

      const prompt = `You are SafariFlow's Master East African Wildlife Naturalist & Luxury AI Safari Concierge.
Create an authentic, bespoke, high-end East African safari package based on these traveler requirements:

- Target Budget: $${budgetPerPersonUSD} USD per person (Total Group Budget: $${budgetPerPersonUSD * travelersCount} USD)
- Travel Dates: ${startDate} to ${endDate} (${durationDays} Days / ${durationDays - 1} Nights)
- Number of Travelers: ${travelersCount} Guests
- Month of Travel: ${travelMonth}
- Target Countries: ${countries.join(', ')}
- Wildlife Focus: ${wildlifePriorities.join(', ')}
- Accommodation Tier: ${luxuryLevel}
- Key Interests: ${interests.join(', ')} ${specialInterests ? `| Special Notes: ${specialInterests}` : ''}

IMPORTANT: Respond strictly in VALID JSON format matching the schema below. No Markdown code block wrapping (no triple backticks).

JSON Schema Structure:
{
  "tripTitle": "A captivating 2-5 word luxury expedition title",
  "overview": "3-4 sentences describing the safari narrative, ecosystems, and unique safari highlights",
  "estimatedCostPerPerson": number,
  "totalGroupCostUSD": number,
  "recommendedSeasonReasoning": "Detailed explanation of why dates (${startDate} to ${endDate}) and season (${travelMonth}) match wildlife movements, weather, and river crossings",
  "countriesVisited": ["Kenya", "Tanzania"],
  "keyParks": ["Masai Mara National Reserve", "Serengeti National Park"],
  
  "destinations": [
    {
      "name": "Destination Park / Region Name",
      "country": "Kenya or Tanzania or Uganda or Rwanda",
      "description": "Rich 2-sentence description of ecosystem and wildlife density",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
      "bestTime": "Best season window"
    }
  ],

  "hotels": [
    {
      "name": "Luxury Lodge or Tented Camp Name",
      "location": "Park / Reserve Location",
      "tier": "Ultra-Luxe / Eco-Luxury / Classic Safari",
      "roomType": "Suite / Luxury Tent Villa",
      "amenities": ["Private Plunge Pool", "Bush Butler Service", "Solar Power", "Fine Dining"],
      "nightlyRateUSD": number
    }
  ],

  "activities": [
    {
      "title": "Activity Name",
      "category": "Game Drive / Aerial / Cultural / Water / Bush Dining",
      "duration": "e.g. 3 Hours, Half Day, Sunrise",
      "description": "Vivid description of the experience",
      "estCostUSD": number
    }
  ],

  "transport": [
    {
      "type": "Bush Charter Flight / Private 4x4 Land Cruiser / Helicopter Transfer",
      "routeSegment": "e.g. Nairobi Wilson (WIL) → Mara Serena Airstrip (MRE)",
      "details": "Description of vehicle or aircraft (custom pop-top roof, leather seats, fridge)",
      "estimatedHours": "e.g. 45 mins flight or 4 hours scenic drive"
    }
  ],

  "itineraryDays": [
    {
      "day": 1,
      "destinationName": "Park or Location",
      "country": "Kenya / Tanzania",
      "highlights": ["Key highlight 1", "Key highlight 2"],
      "suggestedLodge": "Lodge Name",
      "activitySummary": "Brief overview of the day",
      "morningActivity": "Morning safari / transfer details",
      "afternoonActivity": "Afternoon game drive / experience details",
      "eveningActivity": "Sundowner & bush dinner details"
    }
  ],

  "costBreakdown": {
    "lodgingAndMealsUSD": number,
    "parkPermitsAndConservationUSD": number,
    "transportAndBushFlightsUSD": number,
    "guidedActivitiesUSD": number,
    "taxesAndEscrowUSD": number,
    "totalCostUSD": number,
    "costPerPersonUSD": number
  },

  "insiderConservationTip": "Ranger advice or eco-conservation insight for this journey"
}

Ensure all prices sum up logically in costBreakdown, lodging aligns with duration (${durationDays} days), transport covers transfers between parks, activities match interests (${interests.join(', ')}), and itineraryDays contains exactly ${durationDays} days.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const responseText = response.text || '';
      let parsedData;
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        // Fallback cleanup if response has markdown fences
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(cleanText);
      }

      return res.status(200).json(createResponse(true, parsedData));
    } catch (err: any) {
      console.error('Error generating AI Safari itinerary:', err);
      
      // Don't expose internal error details in production
      const errorMessage = NODE_ENV === 'development' 
        ? err.message || String(err) 
        : 'Failed to generate AI itinerary. Please try again.';
        
      return res.status(500).json(createResponse(false, undefined, 'AI generation failed', errorMessage));
    }
  });

  // =============================================================================
  // AUTHENTICATION ROUTES
  // =============================================================================
  
  // POST /api/auth/register - User registration
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, phone, role = 'traveler' } = req.body;
      
      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid name', 'Name must be at least 2 characters'));
      }
      if (!email || !isValidEmail(email)) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid email', 'Please provide a valid email address'));
      }
      if (!password || password.length < 8) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid password', 'Password must be at least 8 characters'));
      }
      if (phone && !isValidPhone(phone)) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid phone', 'Please provide a valid phone number'));
      }
      if (!['traveler', 'ranger_partner'].includes(role)) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid role', 'Role must be traveler or ranger_partner'));
      }
      
      const userId = `usr-${Date.now()}`;
      const newUser = {
        id: userId,
        email: sanitizeString(email).toLowerCase(),
        name: sanitizeString(name),
        role: role as 'traveler' | 'ranger_partner',
        phone: phone ? sanitizeString(phone) : undefined,
        createdAt: new Date().toISOString(),
      };
      
      const { createToken } = await import('./src/auth/index.ts');
      const token = createToken(newUser);
      
      res.status(201).json(createResponse(true, {
        token,
        user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
        expiresIn: '24h',
        message: 'Registration successful',
      }));
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json(createResponse(false, undefined, 'Registration failed', 'An unexpected error occurred'));
    }
  });

  // POST /api/auth/login - User login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !isValidEmail(email)) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid email', 'Please provide a valid email address'));
      }
      if (!password || password.length < 6) {
        return res.status(400).json(createResponse(false, undefined, 'Invalid password', 'Password must be at least 6 characters'));
      }

      // Import auth functions dynamically to avoid circular deps
      const { findUserByCredentials, createToken } = await import('./src/auth/index.ts');
      
      const user = findUserByCredentials(email, password);
      if (!user) {
        return res.status(401).json(createResponse(false, undefined, 'Authentication failed', 'Invalid email or password'));
      }

      const token = createToken(user);

      res.status(200).json(createResponse(true, {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        expiresIn: '24h',
      }));
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json(createResponse(false, undefined, 'Login failed', 'An unexpected error occurred'));
    }
  });

  // GET /api/auth/me - Get current user
  app.get('/api/auth/me', async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json(createResponse(false, undefined, 'Not authenticated', 'Please log in'));
    }

    const { verifyToken, DEMO_USERS } = await import('./src/auth/index.ts');
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json(createResponse(false, undefined, 'Invalid token', 'Your session has expired'));
    }

    const user = DEMO_USERS.find(u => u.id === payload.userId);
    if (!user) {
      return res.status(404).json(createResponse(false, undefined, 'User not found', 'User account not found'));
    }

    res.status(200).json(createResponse(true, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    }));
  });

  // POST /api/auth/logout - User logout
  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    // For JWT, logout is handled client-side by removing the token
    // This endpoint can be used for token blacklisting in production
    res.status(200).json(createResponse(true, { message: 'Logged out successfully' }));
  });

  // =============================================================================
  // ADMIN ROUTES (Protected)
  // =============================================================================

  // GET /api/admin/stats - Admin dashboard statistics
  // Note: Uses routes/admin.ts when database is connected
  app.get('/api/admin/stats', async (req: Request, res: Response) => {
    // Mock admin statistics
    const stats = {
      totalRevenueUSD: 2485000,
      activeExpeditionsCount: 38,
      totalTravelersCount: 1420,
      verifiedRangersCount: 84,
      popularParksCount: 12,
      monthlyBookings: [
        { month: 'Jan', bookings: 42, revenueUSD: 285000 },
        { month: 'Feb', bookings: 38, revenueUSD: 260000 },
        { month: 'Mar', bookings: 29, revenueUSD: 195000 },
        { month: 'Apr', bookings: 22, revenueUSD: 148000 },
        { month: 'May', bookings: 31, revenueUSD: 210000 },
        { month: 'Jun', bookings: 65, revenueUSD: 440000 },
        { month: 'Jul', bookings: 88, revenueUSD: 590000 },
        { month: 'Aug', bookings: 94, revenueUSD: 640000 },
      ],
      pendingSupplierApplications: 2,
      pendingBookingApprovals: 5,
      recentRefunds: 3,
    };

    res.status(200).json(createResponse(true, stats));
  });

  // =============================================================================
  // DATABASE HEALTH CHECK
  // =============================================================================

  // GET /api/db/health - Database health check
  app.get('/api/db/health', async (_req: Request, res: Response) => {
    try {
      const db = await import('./src/database/index.ts');
      const health = await db.healthCheck();
      
      res.status(200).json(createResponse(true, {
        database: health,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      res.status(200).json(createResponse(true, {
        database: { status: 'not_configured' },
        timestamp: new Date().toISOString(),
      }));
    }
  });

  // Global error handler - must be after all routes
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    
    // Don't expose internal error details
    res.status(500).json(createResponse(
      false, 
      undefined, 
      'Internal server error',
      NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    ));
  });

  // 404 handler for unknown routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json(createResponse(false, undefined, 'Route not found', 'The requested API endpoint does not exist'));
  });

  // Vite Integration for Dev / Static Serving for Production
  if (NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`  Ident Africa Server`);
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`  Environment: ${NODE_ENV}`);
    console.log(`  Server:     http://localhost:${PORT}`);
    console.log(`  Health:     http://localhost:${PORT}/api/health`);
    console.log(`═══════════════════════════════════════════════════════════`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
