/**
 * AI Travel Concierge Service
 * 
 * Intelligent travel assistant for IDENT AFRICA.
 * Provides personalized recommendations and itinerary building.
 */

import { v4 as uuidv4 } from 'uuid';

// Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AIConversation {
  id: string;
  userId?: string;
  sessionId: string;
  messages: AIMessage[];
  createdAt: string;
  context: AIContext;
}

export interface AIContext {
  currentDestination?: string;
  tripDates?: { start: string; end: string };
  budget?: { min: number; max: number };
  travelers?: number;
  preferences?: string[];
  lastRecommendation?: AIRecommendation;
}

export interface AIRecommendation {
  type: 'destination' | 'package' | 'accommodation' | 'experience' | 'itinerary';
  id: string;
  title: string;
  description: string;
  image?: string;
  price?: number;
  currency?: string;
  rating?: number;
  matchScore: number;
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface AIIntent {
  intent: string;
  confidence: number;
  entities: string[];
  parameters: Record<string, unknown>;
}

export interface TravelProfile {
  id: string;
  userId?: string;
  travelStyle: string[];
  interests: string[];
  accommodationPreference: string;
  budgetLevel: 'low' | 'medium' | 'high' | 'luxury';
  budgetPerDay?: number;
  preferredActivities: string[];
  fitnessLevel: 'easy' | 'moderate' | 'active';
  safariExperience: 'first_timer' | 'intermediate' | 'experienced';
  tripDuration?: number;
  dietaryRequirements: string[];
}

// Intent detection patterns
const INTENT_PATTERNS = {
  recommendation: [
    /recommend/i, /suggest/i, /what.*best/i, /show.*me/i,
    /find.*for/i, /looking.*for/i, /want.*visit/i, /need.*help/i
  ],
  itinerary: [
    /plan.*trip/i, /itinerary/i, /day.*by.*day/i, /build.*行程/i,
    /create.*schedule/i, /how.*many.*days/i, /suggest.*行程/i
  ],
  destination_info: [
    /tell.*about/i, /information.*about/i, /what.*is/i, /learn.*about/i,
    /details.*on/i, /where.*is/i, /about.*destination/i
  ],
  price_inquiry: [
    /how.*much/i, /cost/i, /price/i, /budget/i, /expensive/i,
    /cheap/i, /affordable/i, /pricing/i
  ],
  booking_help: [
    /book/i, /reserve/i, /how.*to.*book/i, /make.*reservation/i,
    /secure.*spot/i, /check.*availability/i
  ],
  comparison: [
    /compare/i, /difference.*between/i, /which.*better/i, /versus/i,
    /vs\.?/i, /or.*better/i
  ],
  safety: [
    /safe/i, /danger/i, /crime/i, /security/i, /health.*risk/i,
    /vaccination/i, /malaria/i, /insurance/i
  ],
  general_help: [
    /help/i, /assist/i, /question/i, /can.*you.*do/i,
    /what.*can.*you/i, /features/i
  ]
};

// AI Response Templates
const AI_RESPONSES = {
  greeting: `Welcome to IDENT AFRICA's AI Travel Concierge! 🦁

I'm here to help you plan your perfect African safari adventure. I can:

• **Recommend destinations** based on your preferences
• **Build personalized itineraries** for your trip
• **Compare packages and accommodations**
• **Answer questions** about destinations, wildlife, and logistics
• **Help with booking** when you're ready

What would you like to explore today?`,

  recommendation_intro: `Based on your preferences, here are some excellent options for your African adventure:`,

  itinerary_intro: `I've created a personalized itinerary for you. Here's your day-by-day plan:`,

  clarification: `I'd love to help you find the perfect safari! To give you the best recommendations, could you share:`,

  fallback: `I'm here to help with your African safari planning! I can assist with:

• Destination recommendations
• Itinerary planning
• Package comparisons
• Travel advice

What would you like to know?`,

  safety_info: `Safety is a top priority for travel in East Africa. Here are key points to consider:

**Health:**
- Consult your doctor about malaria prophylaxis for lower elevations
- Yellow fever vaccination is recommended
- Pack sunscreen, insect repellent, and basic medications
- Drink bottled water

**General Safety:**
- Follow guide instructions in wildlife areas
- Never approach animals on foot
- Keep valuables secure
- Use hotel safes

**Travel Insurance:**
- Comprehensive travel insurance is essential
- Ensure coverage for safari activities and medical evacuation

Would you like more specific information about safety for any destination?`,

  booking_intro: `I'm excited to help you book your African adventure! Here's how I can assist:

1. **Browse recommended packages** that match your preferences
2. **Check availability** for your travel dates
3. **Review pricing and inclusions**
4. **Process your booking** when you're ready

Shall I show you some options that fit your requirements?`
};

// Mock data for recommendations
const MOCK_DESTINATIONS = [
  { id: '1', name: 'Masai Mara', country: 'Kenya', description: 'World-renowned wildlife destination, famous for the Great Migration', price: 1500, duration: 3, rating: 4.9, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e' },
  { id: '2', name: 'Serengeti', country: 'Tanzania', description: 'Endless plains with incredible wildlife viewing year-round', price: 1800, duration: 4, rating: 4.8, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801' },
  { id: '3', name: 'Bwindi', country: 'Uganda', description: 'Mountain gorilla trekking in misty rainforest', price: 2500, duration: 4, rating: 4.9, image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606' },
  { id: '4', name: 'Serengeti', country: 'Tanzania', description: 'Classic savanna safari experience', price: 2200, duration: 5, rating: 4.7, image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53' },
];

const MOCK_PACKAGES = [
  { id: '1', title: '3 Day Masai Mara Classic Safari', price: 1200, rating: 4.9, duration: 3, type: 'safari' },
  { id: '2', title: '5 Day Kenya Safari Adventure', price: 2400, rating: 4.8, duration: 5, type: 'safari' },
  { id: '3', title: 'Gorilla Trek Uganda', price: 3200, rating: 4.9, duration: 4, type: 'trekking' },
  { id: '4', title: 'Zanzibar Beach Extension', price: 800, rating: 4.6, duration: 3, type: 'beach' },
];

// AI Service Class
export class AIConciergeService {
  private conversations: Map<string, AIConversation> = new Map();
  private profiles: Map<string, TravelProfile> = new Map();

  /**
   * Detect user intent from message
   */
  detectIntent(message: string): AIIntent {
    const lowerMessage = message.toLowerCase();
    
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerMessage)) {
          return {
            intent,
            confidence: 0.85,
            entities: this.extractEntities(message),
            parameters: this.extractParameters(message),
          };
        }
      }
    }
    
    return {
      intent: 'general',
      confidence: 0.5,
      entities: [],
      parameters: {},
    };
  }

  /**
   * Extract entities from message
   */
  private extractEntities(message: string): string[] {
    const entities: string[] = [];
    const destinations = ['masai mara', 'serengeti', 'bwindi', 'ngorongoro', 'Amboseli', 'zanzibar', 'kenya', 'tanzania', 'uganda', 'rwanda'];
    const activities = ['safari', 'gorilla', 'beach', 'hiking', 'photography', 'game drive', 'balloon'];
    
    const lowerMessage = message.toLowerCase();
    
    for (const dest of destinations) {
      if (lowerMessage.includes(dest)) entities.push(dest);
    }
    
    for (const activity of activities) {
      if (lowerMessage.includes(activity)) entities.push(activity);
    }
    
    return [...new Set(entities)];
  }

  /**
   * Extract parameters from message
   */
  private extractParameters(message: string): Record<string, unknown> {
    const params: Record<string, unknown> = {};
    
    // Extract budget
    const budgetMatch = message.match(/\$?(\d+)[kK]?/);
    if (budgetMatch) {
      const amount = parseInt(budgetMatch[1]);
      params.budget = amount > 100 ? amount : amount * 1000;
    }
    
    // Extract duration
    const durationMatch = message.match(/(\d+)\s*(day|week|night)/i);
    if (durationMatch) {
      const num = parseInt(durationMatch[1]);
      params.duration = durationMatch[2].toLowerCase().startsWith('week') ? num * 7 : num;
    }
    
    // Extract travelers
    const travelerMatch = message.match(/(\d+)\s*(person|people|guest|adult|child)/i);
    if (travelerMatch) {
      params.travelers = parseInt(travelerMatch[1]);
    }
    
    return params;
  }

  /**
   * Generate AI response
   */
  generateResponse(
    message: string,
    context: AIContext,
    profile?: TravelProfile
  ): string {
    const intent = this.detectIntent(message);
    
    switch (intent.intent) {
      case 'recommendation':
        return this.generateRecommendationResponse(context, profile);
      case 'itinerary':
        return this.generateItineraryResponse(context, profile);
      case 'destination_info':
        return this.generateDestinationInfoResponse(intent);
      case 'price_inquiry':
        return this.generatePriceResponse(intent);
      case 'safety':
        return AI_RESPONSES.safety_info;
      case 'booking_help':
        return AI_RESPONSES.booking_intro;
      case 'comparison':
        return this.generateComparisonResponse(intent);
      default:
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
          return AI_RESPONSES.greeting;
        }
        return AI_RESPONSES.fallback;
    }
  }

  /**
   * Generate recommendation response
   */
  private generateRecommendationResponse(context: AIContext, profile?: TravelProfile): string {
    let response = `Based on your preferences, here are some excellent options for your African adventure:\n\n`;
    
    const relevantDestinations = this.filterDestinations(context, profile);
    
    relevantDestinations.slice(0, 3).forEach((dest, index) => {
      response += `**${index + 1}. ${dest.name} (${dest.country})**\n`;
      response += `   ${dest.description}\n`;
      response += `   💰 From $${dest.price} | ${dest.duration} days | ⭐ ${dest.rating}\n\n`;
    });
    
    response += `Would you like more details on any of these options, or shall I build a custom itinerary?`;
    
    return response;
  }

  /**
   * Generate itinerary response
   */
  private generateItineraryResponse(context: AIContext, profile?: TravelProfile): string {
    const days = context.tripDates ? 
      Math.ceil((new Date(context.tripDates.end).getTime() - new Date(context.tripDates.start).getTime()) / (1000 * 60 * 60 * 24)) : 5;
    
    const destination = context.currentDestination || 'Masai Mara';
    
    let response = `I've created a personalized ${days}-day itinerary for your trip to ${destination}:\n\n`;
    
    for (let day = 1; day <= Math.min(days, 5); day++) {
      response += `**Day ${day}**\n`;
      
      if (day === 1) {
        response += `🛫 Arrive in Nairobi\n`;
        response += `🏨 Overnight: Eka Hotel or similar\n`;
        response += `📝 Brief orientation and rest\n\n`;
      } else if (day === 2) {
        response += `🚐 Drive to ${destination} (5-6 hours)\n`;
        response += `🏕️ Arrive at camp, afternoon game drive\n`;
        response += `🌅 Sunset aperitivo at the savanna\n\n`;
      } else if (day < days) {
        response += `🌅 Early morning game drive\n`;
        response += `☕ Breakfast at camp\n`;
        response += `🎯 Optional: walking safari or visit to Maasai village\n`;
        response += `🌙 Evening game drive, dinner at camp\n\n`;
      } else {
        response += `🌅 Final morning game drive\n`;
        response += `🍳 Breakfast, check-out\n`;
        response += `🚐 Return to Nairobi or continue journey\n\n`;
      }
    }
    
    response += `---\n`;
    response += `📊 **Estimated Total**: $${this.calculateItineraryCost(days, context)}\n`;
    response += `💰 **Includes**: Transport, accommodation, meals, park fees, game drives\n\n`;
    response += `Shall I refine this itinerary or proceed with booking?`;
    
    return response;
  }

  /**
   * Generate destination info response
   */
  private generateDestinationInfoResponse(intent: AIIntent): string {
    const dest = intent.entities.find(e => 
      ['masai mara', 'serengeti', 'bwindi', 'ngorongoro', 'amboseli', 'zanzibar'].includes(e.toLowerCase())
    );
    
    if (dest) {
      const destInfo: Record<string, { description: string; bestTime: string; highlights: string[] }> = {
        'masai mara': {
          description: 'World-famous wildlife reserve in southwestern Kenya, part of the larger Serengeti ecosystem.',
          bestTime: 'July-October for Great Migration, June-October for general wildlife',
          highlights: ['Great Migration', 'Big Five', 'Hot Air Balloon', 'Maasai Culture']
        },
        'serengeti': {
          description: 'Vast savanna ecosystem spanning northern Tanzania, home to the largest mammal migration.',
          bestTime: 'Year-round wildlife viewing, December-March for calving',
          highlights: ['Endless Plains', 'Migration', 'Big Cats', 'Balloon Safari']
        },
        'bwindi': {
          description: 'Ancient rainforest in Uganda, home to nearly half the world\'s mountain gorillas.',
          bestTime: 'June-August and December-February (driest)',
          highlights: ['Gorilla Trekking', 'Birding', 'Nature Walks', 'Community Visits']
        },
      };
      
      const info = destInfo[dest.toLowerCase()];
      if (info) {
        return `**${dest.charAt(0).toUpperCase() + dest.slice(1)}**\n\n` +
          `${info.description}\n\n` +
          `📅 **Best Time to Visit**: ${info.bestTime}\n\n` +
          `⭐ **Highlights**: ${info.highlights.join(', ')}\n\n` +
          `Would you like me to create an itinerary or find packages for ${dest}?`;
      }
    }
    
    return `I'd be happy to share information about African destinations. Which destination are you interested in?`;
  }

  /**
   * Generate price response
   */
  private generatePriceResponse(intent: AIIntent): string {
    return `Safari pricing varies based on several factors:\n\n` +
      `**Budget Tiers:**\n` +
      `• **Budget**: $150-300/day - Basic camps, public parks\n` +
      `• **Mid-Range**: $300-600/day - Comfortable lodges, private reserves\n` +
      `• **Luxury**: $600-1500/day - Premium lodges, exclusive access\n` +
      `• **Ultra-Luxury**: $1500+/day - Top camps, private chefs, premium vehicles\n\n` +
      `**Typical Package Costs:**\n` +
      `• 3-day safari: $800-2500 per person\n` +
      `• 5-day safari: $1500-5000 per person\n` +
      `• 7-day safari: $2500-8000 per person\n` +
      `• Gorilla trekking: $1500-2500 per permit\n\n` +
      `What's your budget range? I can find options that match.`;
  }

  /**
   * Generate comparison response
   */
  private generateComparisonResponse(intent: AIIntent): string {
    return `Here's how our top packages compare:\n\n` +
      `| Package | Duration | Price | Rating | Best For |\n` +
      `|---------|----------|-------|--------|----------|\n` +
      `| 3-Day Masai Mara | 3 days | $1,200 | ⭐4.9 | First-timers |\n` +
      `| 5-Day Kenya Safari | 5 days | $2,400 | ⭐4.8 | Comprehensive |\n` +
      `| Gorilla Trek Uganda | 4 days | $3,200 | ⭐4.9 | Adventure |\n` +
      `| 7-Day Ultimate | 7 days | $3,800 | ⭐4.7 | Luxury |\n\n` +
      `Which aspect would you like to compare in more detail?`;
  }

  /**
   * Filter destinations based on context and profile
   */
  private filterDestinations(context: AIContext, profile?: TravelProfile): typeof MOCK_DESTINATIONS {
    let filtered = [...MOCK_DESTINATIONS];
    
    if (context.budget?.max) {
      filtered = filtered.filter(d => d.price <= context.budget!.max);
    }
    
    if (context.travelers) {
      // Could adjust pricing based on group size
    }
    
    if (profile?.interests?.includes('gorilla')) {
      filtered = filtered.filter(d => d.name.toLowerCase().includes('bwindi'));
      if (filtered.length === 0) filtered = [...MOCK_DESTINATIONS];
    }
    
    return filtered;
  }

  /**
   * Calculate itinerary cost
   */
  private calculateItineraryCost(days: number, context: AIContext): number {
    const basePricePerDay = 250;
    let multiplier = 1;
    
    if (context.budget?.max && context.budget.max > 2000) {
      multiplier = 1.5;
    }
    
    return Math.round(days * basePricePerDay * multiplier);
  }

  /**
   * Get recommendations
   */
  getRecommendations(context: AIContext, profile?: TravelProfile): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    
    // Add destination recommendations
    const destinations = this.filterDestinations(context, profile);
    destinations.slice(0, 3).forEach(dest => {
      recommendations.push({
        type: 'destination',
        id: dest.id,
        title: dest.name,
        description: dest.description,
        image: dest.image,
        price: dest.price,
        rating: dest.rating,
        matchScore: 0.85,
        reason: `Recommended based on your ${profile?.interests?.join(', ') || 'preferences'}`,
      });
    });
    
    // Add package recommendations
    MOCK_PACKAGES.slice(0, 2).forEach(pkg => {
      recommendations.push({
        type: 'package',
        id: pkg.id,
        title: pkg.title,
        description: `${pkg.duration} days of adventure`,
        price: pkg.price,
        rating: pkg.rating,
        matchScore: 0.78,
        reason: 'Popular choice among travelers',
      });
    });
    
    return recommendations;
  }

  /**
   * Create new conversation
   */
  createConversation(userId?: string): AIConversation {
    const id = uuidv4();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation: AIConversation = {
      id,
      userId,
      sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      context: {},
    };
    
    this.conversations.set(sessionId, conversation);
    return conversation;
  }

  /**
   * Add message to conversation
   */
  addMessage(sessionId: string, message: AIMessage): void {
    const conversation = this.conversations.get(sessionId);
    if (conversation) {
      conversation.messages.push(message);
    }
  }

  /**
   * Get conversation
   */
  getConversation(sessionId: string): AIConversation | undefined {
    return this.conversations.get(sessionId);
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, profile: Partial<TravelProfile>): void {
    const existing = this.profiles.get(userId);
    if (existing) {
      this.profiles.set(userId, { ...existing, ...profile });
    } else {
      this.profiles.set(userId, profile as TravelProfile);
    }
  }

  /**
   * Get user profile
   */
  getProfile(userId: string): TravelProfile | undefined {
    return this.profiles.get(userId);
  }
}

// Singleton instance
export const aiConcierge = new AIConciergeService();
