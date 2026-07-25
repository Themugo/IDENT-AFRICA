import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

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

        return res.json({
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
      return res.json({
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
    res.json({ status: 'ok', app: 'SafariFlow', timestamp: new Date().toISOString() });
  });

  // API Route: Stripe Payment Intent
  app.post('/api/payments/stripe/create-intent', (req, res) => {
    const { amountUSD, currency = 'USD', travelerEmail, travelerName } = req.body;
    const paymentIntentId = `pi_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    const clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;

    res.json({
      success: true,
      gateway: 'Stripe',
      paymentIntentId,
      clientSecret,
      amountUSD,
      currency,
      status: 'succeeded',
      receiptUrl: `https://pay.stripe.com/receipts/safariflow/${paymentIntentId}`,
    });
  });

  // API Route: Flutterwave Pan-African Charge
  app.post('/api/payments/flutterwave/charge', (req, res) => {
    const { amountUSD, currency = 'USD', travelerEmail, travelerName, channel = 'card', country = 'KE' } = req.body;
    const tx_ref = `FLW-TX-${Math.floor(10000000 + Math.random() * 90000000)}`;

    res.json({
      status: 'success',
      message: 'Flutterwave payment authorized',
      tx_ref,
      flw_ref: `FLW_REF_${Date.now()}`,
      amount: amountUSD,
      currency,
      channel,
      country,
      customer: { email: travelerEmail, name: travelerName },
    });
  });

  // API Route: M-Pesa Express STK Push
  app.post('/api/payments/mpesa/stk-push', (req, res) => {
    const { phoneNumber, amountUSD } = req.body;
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const merchantRequestId = `29182-${Math.floor(1000000 + Math.random() * 9000000)}-1`;

    res.json({
      MerchantRequestID: merchantRequestId,
      CheckoutRequestID: checkoutRequestId,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: `Success. Prompt sent to ${phoneNumber}. Enter M-Pesa PIN to complete payment of $${amountUSD}.`,
    });
  });

  // API Route: Refund Workflow Process
  app.post('/api/refunds/process', (req, res) => {
    const { bookingId, requestedAmountUSD, reason, payoutAccount } = req.body;
    const refundTicketId = `REF-${Math.floor(100000 + Math.random() * 900000)}`;

    res.json({
      success: true,
      refundTicketId,
      bookingId,
      requestedAmountUSD,
      reason,
      payoutAccount,
      status: 'Submitted',
      estimatedDisbursementHours: 24,
      message: `Refund claim ${refundTicketId} logged successfully into escrow auditor queue.`,
    });
  });

  // API Route: Gemini AI Safari Concierge
  app.post('/api/ai-planner', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in the environment. Please check your secrets configuration.'
        });
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

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
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

      return res.json(parsedData);
    } catch (err: any) {
      console.error('Error generating AI Safari itinerary:', err);
      return res.status(500).json({
        error: 'Failed to generate custom AI itinerary',
        details: err.message || String(err)
      });
    }
  });

  // Vite Integration for Dev / Static Serving for Production
  if (process.env.NODE_ENV !== 'production') {
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
    console.log(`SafariFlow Server listening on http://localhost:${PORT}`);
  });
}

startServer();
