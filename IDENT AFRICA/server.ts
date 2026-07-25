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

  // API Route: Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'SafariFlow', timestamp: new Date().toISOString() });
  });

  // API Route: Gemini AI Safari Planner
  app.post('/api/ai-planner', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in the environment. Please check your secrets configuration.'
        });
      }

      const {
        durationDays = 7,
        budgetPerPersonUSD = 5000,
        travelersCount = 2,
        travelMonth = 'August',
        countries = ['Kenya', 'Tanzania'],
        wildlifePriorities = ['The Big Five', 'Great Wildebeest Migration'],
        luxuryLevel = 'Ultra-Luxe Canvas',
        specialInterests = ''
      } = req.body;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are SafariFlow's Master East African Wildlife Naturalist & Luxury Trip Designer.
Create a bespoke, realistic, high-end safari itinerary based on these traveler requirements:

- Duration: ${durationDays} Days / ${durationDays - 1} Nights
- Target Budget: $${budgetPerPersonUSD} USD per traveler
- Group Size: ${travelersCount} Travelers
- Month of Travel: ${travelMonth}
- Preferred Countries: ${countries.join(', ')}
- Wildlife Focus: ${wildlifePriorities.join(', ')}
- Accommodation Tier: ${luxuryLevel}
- Special Notes / Interests: ${specialInterests || 'None specified'}

IMPORTANT: Respond strictly in VALID JSON format with NO markdown wrapping or surrounding text.
The JSON object MUST match this EXACT structure:
{
  "tripTitle": "A captivating 2-5 word luxury trip name",
  "overview": "2-3 sentences introducing the journey narrative and ecosystem highlights",
  "estimatedCostPerPerson": number (close to requested budget),
  "recommendedSeasonReasoning": "Why ${travelMonth} is excellent for this specific route",
  "countriesVisited": ["Country1", "Country2"],
  "keyParks": ["Park 1", "Park 2"],
  "itineraryDays": [
    {
      "day": 1,
      "destinationName": "Name of Park / Reserve / Location",
      "country": "Kenya/Tanzania/Uganda/Rwanda",
      "highlights": ["Highlight 1", "Highlight 2"],
      "suggestedLodge": "An authentic high-end lodge name",
      "activitySummary": "Specific game drive or activity details for this day"
    }
  ],
  "insiderConservationTip": "1 practical insider wildlife ranger advice or eco-tip for this route"
}
Provide exactly ${durationDays} days in the itineraryDays array. Make sure park locations and wildlife migration seasonal timings are authentic for East Africa.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const responseText = response.text || '';
      const parsedData = JSON.parse(responseText);

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
