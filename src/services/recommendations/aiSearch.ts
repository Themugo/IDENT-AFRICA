/**
 * AI Search Service
 * 
 * Natural language search that converts queries to filters.
 */

// Search filters derived from natural language
export interface SearchFilters {
  query: string;
  budget?: { min?: number; max?: number };
  duration?: { min?: number; max?: number };
  travelStyle?: string[];
  interests?: string[];
  rating?: number;
  destination?: string[];
  accommodation?: string;
  groupSize?: 'solo' | 'couple' | 'small_group' | 'large_group';
  season?: string;
  attributes?: string[];
}

// NLP patterns for extraction
interface NLPPattern {
  pattern: RegExp;
  extract: (match: RegExpMatchArray) => Partial<SearchFilters>;
}

// Budget patterns
const BUDGET_PATTERNS: NLPPattern[] = [
  {
    pattern: /(\$[\d,]+)\s*(?:to|-)\s*(\$[\d,]+)/i,
    extract: (m) => ({
      budget: {
        min: parseInt(m[1].replace(/[$,]/g, '')),
        max: parseInt(m[2].replace(/[$,]/g, '')),
      },
    }),
  },
  {
    pattern: /(?:under|less than|below)\s*\$?([\d,]+)/i,
    extract: (m) => ({ budget: { max: parseInt(m[1].replace(/,/g, '')) } }),
  },
  {
    pattern: /(?:over|more than|above)\s*\$?([\d,]+)/i,
    extract: (m) => ({ budget: { min: parseInt(m[1].replace(/,/g, '')) } }),
  },
  {
    pattern: /\$([\d,]+)\s*(?:budget|range)/i,
    extract: (m) => ({
      budget: {
        min: parseInt(m[1].replace(/,/g, '')) * 0.8,
        max: parseInt(m[1].replace(/,/g, '')) * 1.2,
      },
    }),
  },
  {
    pattern: /(?:budget|cheap|affordable)/i,
    extract: () => ({ budget: { min: 0, max: 2000 } }),
  },
  {
    pattern: /(?:mid.range|moderate)/i,
    extract: () => ({ budget: { min: 2000, max: 5000 } }),
  },
  {
    pattern: /(?:luxury|upscale|premium)/i,
    extract: () => ({ budget: { min: 5000, max: 50000 } }),
  },
];

// Duration patterns
const DURATION_PATTERNS: NLPPattern[] = [
  {
    pattern: /(\d+)\s*(?:day|days)/i,
    extract: (m) => ({
      duration: {
        min: parseInt(m[1]),
        max: parseInt(m[1]) + 2,
      },
    }),
  },
  {
    pattern: /(?:weekend|short trip|quick)/i,
    extract: () => ({ duration: { min: 2, max: 4 } }),
  },
  {
    pattern: /(?:week|long trip)/i,
    extract: () => ({ duration: { min: 5, max: 14 } }),
  },
  {
    pattern: /(?:extended|longer)/i,
    extract: () => ({ duration: { min: 10, max: 30 } }),
  },
];

// Interest patterns
const INTEREST_PATTERNS: Record<string, RegExp> = {
  wildlife: /(?:safari|wildlife|animals|lions?|elephants?|big five)/i,
  photography: /(?:photo|photography|camera|snapshot)/i,
  hiking: /(?:hike|hiking|trek|trekking|walk)/i,
  beach: /(?:beach|ocean|swim|surf|coastal)/i,
  culture: /(?:culture|cultural|local|tribe|tribal)/i,
  history: /(?:history|historical|ancient|heritage)/i,
  food: /(?:food|dining|culinary|wine|restaurant)/i,
  nature: /(?:nature|natural|scenic|landscape|view)/i,
  wellness: /(?:spa|wellness|relax|relaxing|yoga|meditation)/i,
  adventure: /(?:adventure|adventurous|extreme|thrilling)/i,
  romance: /(?:romantic|honeymoon|romance|couple)/i,
  family: /(?:family|family.friendly| kids|children)/i,
};

// Travel style patterns
const STYLE_PATTERNS: Record<string, RegExp> = {
  luxury: /(?:luxury|luxurious|lux|upscale|premium|5.star)/i,
  budget: /(?:budget|cheap|affordable| economical|backpack)/i,
  adventure: /(?:adventure|adventurous|extreme|thrilling|active)/i,
  family: /(?:family|family.friendly|kids|children)/i,
  romantic: /(?:romantic|honeymoon|romance|couple|love)/i,
  cultural: /(?:cultural|culture|immersive|authentic)/i,
  eco: /(?:eco|sustainable|green|environment)/i,
  solo: /(?:solo|single|traveling alone)/i,
};

// Attribute patterns
const ATTRIBUTE_PATTERNS: Record<string, RegExp> = {
  quiet: /(?:quiet|peaceful|tranquil|serene|private)/i,
  crowded: /(?:crowded|popular|busy|bustling)/i,
  accessible: /(?:accessible|wheelchair|disability|easy access)/i,
  childFriendly: /(?:child.friendly|family|kids|children)/i,
  petFriendly: /(?:pet.friendly|dogs?|welcome)/i,
  couples: /(?:couple|romantic|two people)/i,
};

// Destination hints
const DESTINATION_HINTS: Record<string, RegExp> = {
  'maasai-mara': /(?:maasai mara|mara)/i,
  'serengeti': /(?:serengeti)/i,
  ' Amboseli': /(?:amboseli)/i,
  'ngorongoro': /(?:ngorongoro|ngoro)/i,
  'zanzibar': /(?:zanzibar|beach|island)/i,
  'kenya': /(?:kenya|nairobi|mombasa)/i,
  'tanzania': /(?:tanzania|dar es salaam)/i,
  'uganda': /(?:uganda|gorilla|bwindi)/i,
  'rwanda': /(?:rwanda|volcanoes)/i,
};

/**
 * AI Search Service
 */
class AISearchService {
  /**
   * Parse natural language query into structured filters
   */
  parseQuery(query: string): SearchFilters {
    const filters: SearchFilters = { query };

    // Extract budget
    for (const { pattern, extract } of BUDGET_PATTERNS) {
      const match = query.match(pattern);
      if (match) {
        const extracted = extract(match);
        filters.budget = { ...filters.budget, ...extracted.budget };
      }
    }

    // Extract duration
    for (const { pattern, extract } of DURATION_PATTERNS) {
      const match = query.match(pattern);
      if (match) {
        const extracted = extract(match);
        filters.duration = { ...filters.duration, ...extracted.duration };
      }
    }

    // Extract interests
    const interests: string[] = [];
    for (const [interest, pattern] of Object.entries(INTEREST_PATTERNS)) {
      if (pattern.test(query)) {
        interests.push(interest);
      }
    }
    if (interests.length > 0) {
      filters.interests = interests;
    }

    // Extract travel style
    const styles: string[] = [];
    for (const [style, pattern] of Object.entries(STYLE_PATTERNS)) {
      if (pattern.test(query)) {
        styles.push(style);
      }
    }
    if (styles.length > 0) {
      filters.travelStyle = styles;
    }

    // Extract attributes
    const attributes: string[] = [];
    for (const [attr, pattern] of Object.entries(ATTRIBUTE_PATTERNS)) {
      if (pattern.test(query)) {
        attributes.push(attr);
      }
    }
    if (attributes.length > 0) {
      filters.attributes = attributes;
    }

    // Extract destinations
    const destinations: string[] = [];
    for (const [dest, pattern] of Object.entries(DESTINATION_HINTS)) {
      if (pattern.test(query)) {
        destinations.push(dest);
      }
    }
    if (destinations.length > 0) {
      filters.destination = destinations;
    }

    // Extract rating requirement
    const ratingMatch = query.match(/(\d+(?:\.\d+)?)\s*(?:star|rating|stars)/i);
    if (ratingMatch) {
      filters.rating = parseFloat(ratingMatch[1]);
    }

    // Extract group size
    if (/solo|single\s*(?:person|traveler|trip)/i.test(query)) {
      filters.groupSize = 'solo';
    } else if (/couple|two\s*(?:people|person)/i.test(query)) {
      filters.groupSize = 'couple';
    } else if (/small\s*(?:group|team)/i.test(query)) {
      filters.groupSize = 'small_group';
    } else if (/large\s*(?:group|team)/i.test(query)) {
      filters.groupSize = 'large_group';
    }

    return filters;
  }

  /**
   * Generate search suggestions
   */
  generateSuggestions(query: string): string[] {
    const suggestions: string[] = [];
    
    // Check for missing elements
    const filters = this.parseQuery(query);
    
    if (!filters.travelStyle?.length) {
      suggestions.push('Try adding: luxury, adventure, or budget');
    }
    
    if (!filters.duration) {
      suggestions.push('Specify duration: 5 days, a week');
    }
    
    if (!filters.budget) {
      suggestions.push('Add budget: under $3000 or luxury');
    }
    
    if (!filters.interests?.length) {
      suggestions.push('Mention interests: wildlife, photography, culture');
    }
    
    return suggestions;
  }

  /**
   * Convert filters to search query
   */
  filtersToQuery(filters: SearchFilters): string {
    const parts: string[] = [];
    
    if (filters.travelStyle?.length) {
      parts.push(filters.travelStyle.join(' '));
    }
    
    if (filters.interests?.length) {
      parts.push(filters.interests.join(' '));
    }
    
    if (filters.destination?.length) {
      parts.push(filters.destination.join(' '));
    }
    
    if (filters.duration) {
      parts.push(`${filters.duration.min}-${filters.duration.max} days`);
    }
    
    if (filters.budget) {
      if (filters.budget.min && filters.budget.max) {
        parts.push(`$${filters.budget.min}-$${filters.budget.max}`);
      } else if (filters.budget.max) {
        parts.push(`under $${filters.budget.max}`);
      } else if (filters.budget.min) {
        parts.push(`over $${filters.budget.min}`);
      }
    }
    
    return parts.join(' ');
  }

  /**
   * Get example queries
   */
  getExampleQueries(): { query: string; description: string }[] {
    return [
      {
        query: 'luxury safari with elephants and photography',
        description: 'Find upscale wildlife experiences perfect for photographers',
      },
      {
        query: 'quiet romantic beach getaway under $3000',
        description: 'Secluded couple retreats on a budget',
      },
      {
        query: 'family adventure 7 days budget',
        description: 'Kid-friendly adventures that are easy on the wallet',
      },
      {
        query: 'cultural immersion with local tribes',
        description: 'Authentic cultural experiences and heritage tours',
      },
      {
        query: 'eco-friendly nature retreat',
        description: 'Sustainable travel for nature lovers',
      },
    ];
  }

  /**
   * Interpret intent
   */
  interpretIntent(query: string): {
    intent: 'search' | 'recommendation' | 'comparison' | 'information';
    confidence: number;
  } {
    const lowerQuery = query.toLowerCase();
    
    if (/find|search|looking for|show me|get me/i.test(lowerQuery)) {
      return { intent: 'search', confidence: 0.9 };
    }
    
    if (/recommend|suggest|what do you recommend|what would you suggest/i.test(lowerQuery)) {
      return { intent: 'recommendation', confidence: 0.9 };
    }
    
    if (/compare|versus|vs|difference between/i.test(lowerQuery)) {
      return { intent: 'comparison', confidence: 0.85 };
    }
    
    if (/what is|tell me about|explain|how does|when is/i.test(lowerQuery)) {
      return { intent: 'information', confidence: 0.8 };
    }
    
    return { intent: 'search', confidence: 0.6 };
  }
}

export const aiSearchService = new AISearchService();
