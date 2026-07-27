/**
 * AI Search Parser
 * 
 * Converts natural language queries into structured search filters.
 */

import { SearchFilters, TravelStyle, AccommodationLevel, GroupType } from './types';

// Location patterns
const LOCATION_PATTERNS = [
  { pattern: /kenya|nairobi|mombasa|maasai\s*mara/i, country: 'Kenya' },
  { pattern: /tanzania|dar\s*es\s*salaam|serengeti|ngorongoro|zanzibar/i, country: 'Tanzania' },
  { pattern: /uganda|kampala|bwindi/i, country: 'Uganda' },
  { pattern: /rwanda|kigali|volcanoes/i, country: 'Rwanda' },
  { pattern: /south\s*africa|cape\s*town|kruger/i, country: 'South Africa' },
  { pattern: /nairobi/i, nearCity: 'Nairobi' },
  { pattern: /dar\s*es\s*salaam/i, nearCity: 'Dar es Salaam' },
];

// Region patterns
const REGION_PATTERNS = [
  { pattern: /east\s*africa/i, region: 'East Africa' },
  { pattern: /west\s*africa/i, region: 'West Africa' },
  { pattern: /southern\s*africa/i, region: 'Southern Africa' },
  { pattern: /masai\s*mara|maasai\s*mara/i, region: 'Rift Valley' },
  { pattern: /serengeti/i, region: 'Serengeti' },
  { pattern: /coast|beach|coastal/i, region: 'Coast' },
];

// Budget patterns
const BUDGET_PATTERNS = [
  { pattern: /(\$[\d,]+)\s*(?:to|-)\s*(\$[\d,]+)/i, extract: (m: RegExpMatchArray) => ({ min: parseInt(m[1].replace(/[$,]/g, '')), max: parseInt(m[2].replace(/[$,]/g, '')) }) },
  { pattern: /(?:under|less than|below|max(?:imum)?)\s*\$?([\d,]+)/i, extract: (_: RegExpMatchArray, max: string) => ({ max: parseInt(max.replace(/,/g, '')) }) },
  { pattern: /(?:over|more than|above|min(?:imum)?)\s*\$?([\d,]+)/i, extract: (_: RegExpMatchArray, min: string) => ({ min: parseInt(min.replace(/,/g, '')) }) },
  { pattern: /(\$[\d,]+)\s*(?:budget|range)/i, extract: (m: RegExpMatchArray) => ({ min: parseInt(m[1].replace(/[$,]/g, '')) * 0.8, max: parseInt(m[1].replace(/[$,]/g, '')) * 1.2 }) },
  { pattern: /(?:cheap|budget|affordable)/i, extract: () => ({ max: 1500 }) },
  { pattern: /(?:mid\s*range|moderate)/i, extract: () => ({ min: 1500, max: 4000 }) },
  { pattern: /(?:luxury|upscale|premium|high-end)/i, extract: () => ({ min: 4000 }) },
];

// Duration patterns
const DURATION_PATTERNS = [
  { pattern: /(\d+)\s*(?:day|days)/i, extract: (m: RegExpMatchArray) => ({ min: parseInt(m[1]), max: parseInt(m[1]) + 2 }) },
  { pattern: /(?:weekend|short\s*trip|quick)/i, extract: () => ({ min: 2, max: 4 }) },
  { pattern: /(?:week|long\s*trip)/i, extract: () => ({ min: 5, max: 14 }) },
  { pattern: /(?:extended|longer)/i, extract: () => ({ min: 10, max: 30 }) },
  { pattern: /(\d+)\s*-\s*(\d+)\s*(?:day|days)/i, extract: (m: RegExpMatchArray) => ({ min: parseInt(m[1]), max: parseInt(m[2]) }) },
];

// Travel style patterns
const STYLE_PATTERNS: Record<TravelStyle, RegExp[]> = {
  luxury: [/(?:luxury|luxurious|lux|upscale|premium|5\s*star|five\s*star)/i],
  budget: [/(?:budget|cheap|affordable|economical|backpack)/i],
  adventure: [/(?:adventure|adventurous|extreme|thrilling|active)/i],
  family: [/(?:family|family\s*friendly|kids|children)/i],
  romantic: [/(?:romantic|honeymoon|romance|couple|love)/i],
  cultural: [/(?:cultural|culture|immersive|authentic)/i],
  eco: [/(?:eco|sustainable|green|environment)/i],
  solo: [/(?:solo|single|traveling?\s*alone)/i],
  safari: [/(?:safari|game\s*drive|wildlife)/i],
  backpack: [/(?:backpack|backpacking)/i],
};

// Activity patterns
const ACTIVITY_PATTERNS: Record<string, RegExp[]> = {
  safari: [/(?:safari|game\s*drive|wildlife|big\s*five)/i],
  photography: [/(?:photo|photography|camera)/i],
  hiking: [/(?:hike|hiking|trek|trekking|walk)/i],
  beach: [/(?:beach|ocean|swim|surf|coastal)/i],
  culture: [/(?:culture|cultural|local|tribe|tribal)/i],
  history: [/(?:history|historical|ancient|heritage)/i],
  food: [/(?:food|dining|culinary|wine|restaurant)/i],
  nature: [/(?:nature|natural|scenic|landscape)/i],
  wellness: [/(?:spa|wellness|relax|yoga|meditation)/i],
  gorilla: [/(?:gorilla|gorilla\s*trekking|bwindi|volcanoes)/i],
  snorkeling: [/(?:snorkeling|snorkel|dive|diving)/i],
  fishing: [/(?:fishing|fish)/i],
};

// Accommodation patterns
const ACCOMMODATION_PATTERNS: Record<AccommodationLevel, RegExp[]> = {
  luxury_lodge: [/(?:luxury\s*lodge|luxury\s*camp|5\s*star|five\s*star|lodge)/i],
  boutique_hotel: [/(?:boutique\s*hotel|boutique)/i],
  mid_range: [/(?:mid\s*range|mid-range|3\s*star|three\s*star)/i],
  budget: [/(?:budget|cheap|hostel|backpacker)/i],
  camping: [/(?:camping|camp|tent)/i],
  homestay: [/(?:homestay|homestay|local\s*family)/i],
  resort: [/(?:resort|beach\s*resort)/i],
};

// Group patterns
const GROUP_PATTERNS: Record<GroupType, RegExp[]> = {
  solo: [/(?:solo|single\s*(?:person|traveler|trip)|alone)/i],
  couple: [/(?:couple|two\s*(?:people|person)|honeymoon|romantic)/i],
  family: [/(?:family|families|kids|children|parent)/i],
  friends: [/(?:friends|group\s*of\s*friends|buddies)/i],
  group: [/(?:group|team)/i],
};

// Season patterns
const SEASON_PATTERNS = [
  { pattern: /(?:january|jan\.?)/i, month: 1 },
  { pattern: /(?:february|feb\.?)/i, month: 2 },
  { pattern: /(?:march|mar\.?)/i, month: 3 },
  { pattern: /(?:april|apr\.?)/i, month: 4 },
  { pattern: /(?:may)/i, month: 5 },
  { pattern: /(?:june|jun\.?)/i, month: 6 },
  { pattern: /(?:july|jul\.?)/i, month: 7 },
  { pattern: /(?:august|aug\.?)/i, month: 8 },
  { pattern: /(?:september|sep\.?|sept\.?)/i, month: 9 },
  { pattern: /(?:october|oct\.?)/i, month: 10 },
  { pattern: /(?:november|nov\.?)/i, month: 11 },
  { pattern: /(?:december|dec\.?)/i, month: 12 },
  { pattern: /(?:dry\s*season)/i, months: [6, 7, 8, 9] },
  { pattern: /(?:wet\s*season|green\s*season)/i, months: [3, 4, 5, 11] },
  { pattern: /(?:great\s*migration)/i, months: [6, 7, 8, 9, 10] },
];

// Special requirements
const REQUIREMENT_PATTERNS = {
  wheelchair: [/(?:wheelchair|accessible|disability|disabled)/i],
  vegetarian: [/(?:vegetarian|vegan|plant\s*based)/i],
};

/**
 * AI Search Parser
 */
export class AISearchParser {
  /**
   * Parse natural language query into filters
   */
  parse(query: string): SearchFilters {
    const filters: SearchFilters = {
      query: query,
      raw: query,
    };

    // Parse location
    filters.location = this.parseLocation(query);

    // Parse budget
    filters.budget = this.parseBudget(query);

    // Parse duration
    filters.duration = this.parseDuration(query);

    // Parse travel style
    filters.travelStyle = this.parseTravelStyle(query);

    // Parse activities
    filters.activities = this.parseActivities(query);

    // Parse accommodation
    filters.accommodation = this.parseAccommodation(query);

    // Parse group
    filters.group = this.parseGroup(query);

    // Parse season
    filters.season = this.parseSeason(query);

    // Parse special requirements
    filters.requirements = this.parseRequirements(query);

    return filters;
  }

  private parseLocation(query: string): SearchFilters['location'] {
    const location: SearchFilters['location'] = {};

    for (const { pattern, country } of LOCATION_PATTERNS) {
      if (pattern.test(query)) {
        if (country) location.country = country;
        break;
      }
    }

    for (const { pattern, region } of REGION_PATTERNS) {
      if (pattern.test(query)) {
        location.region = region;
        break;
      }
    }

    for (const { pattern, nearCity } of LOCATION_PATTERNS) {
      if (pattern.test(query)) {
        if (nearCity) location.nearCity = nearCity;
        break;
      }
    }

    // Distance from city
    const distanceMatch = query.match(/(\d+)\s*(?:km|kilometer|kilometers)\s*(?:from|of|near)/i);
    if (distanceMatch) {
      location.maxDistance = parseInt(distanceMatch[1]);
    }

    return Object.keys(location).length > 0 ? location : undefined;
  }

  private parseBudget(query: string): SearchFilters['budget'] {
    const budget: SearchFilters['budget'] = {};

    for (const { pattern, extract } of BUDGET_PATTERNS) {
      const match = query.match(pattern);
      if (match) {
        const result = extract(match, match[1] || match[2] || '');
        Object.assign(budget, result);
        break;
      }
    }

    return Object.keys(budget).length > 0 ? budget : undefined;
  }

  private parseDuration(query: string): SearchFilters['duration'] {
    const duration: SearchFilters['duration'] = {};

    for (const { pattern, extract } of DURATION_PATTERNS) {
      const match = query.match(pattern);
      if (match) {
        const result = extract(match);
        Object.assign(duration, result);
        break;
      }
    }

    return Object.keys(duration).length > 0 ? duration : undefined;
  }

  private parseTravelStyle(query: string): TravelStyle[] {
    const styles: TravelStyle[] = [];

    for (const [style, patterns] of Object.entries(STYLE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          if (!styles.includes(style as TravelStyle)) {
            styles.push(style as TravelStyle);
          }
          break;
        }
      }
    }

    return styles;
  }

  private parseActivities(query: string): string[] {
    const activities: string[] = [];

    for (const [activity, patterns] of Object.entries(ACTIVITY_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          if (!activities.includes(activity)) {
            activities.push(activity);
          }
          break;
        }
      }
    }

    return activities;
  }

  private parseAccommodation(query: string): AccommodationLevel[] {
    const levels: AccommodationLevel[] = [];

    for (const [level, patterns] of Object.entries(ACCOMMODATION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          if (!levels.includes(level as AccommodationLevel)) {
            levels.push(level as AccommodationLevel);
          }
          break;
        }
      }
    }

    return levels;
  }

  private parseGroup(query: string): SearchFilters['group'] {
    const group: SearchFilters['group'] = {};

    for (const [type, patterns] of Object.entries(GROUP_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          group.type = type as GroupType;
          break;
        }
      }
      if (group.type) break;
    }

    // Parse numbers
    const adultMatch = query.match(/(\d+)\s*(?:adult|adults|people|travelers?|guests?)/i);
    if (adultMatch) {
      group.adults = parseInt(adultMatch[1]);
    }

    const childMatch = query.match(/(\d+)\s*(?:child|children|kids)/i);
    if (childMatch) {
      group.children = parseInt(childMatch[1]);
    }

    const totalMatch = query.match(/(?:total|of)\s*(\d+)\s*(?:people|persons|travelers?)/i);
    if (totalMatch) {
      group.total = parseInt(totalMatch[1]);
    }

    return Object.keys(group).length > 0 ? group : undefined;
  }

  private parseSeason(query: string): SearchFilters['season'] {
    const season: SearchFilters['season'] = {};
    const months: number[] = [];

    for (const { pattern, month, months: m } of SEASON_PATTERNS) {
      if (pattern.test(query)) {
        if (month) {
          months.push(month);
          season.exact = month;
        }
        if (m) {
          months.push(...m);
        }
        break;
      }
    }

    if (months.length > 0) {
      season.preferred = [...new Set(months)];
    }

    return Object.keys(season).length > 0 ? season : undefined;
  }

  private parseRequirements(query: string): SearchFilters['requirements'] {
    const requirements: SearchFilters['requirements'] = {};

    for (const [key, patterns] of Object.entries(REQUIREMENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          (requirements as Record<string, boolean>)[key] = true;
          break;
        }
      }
    }

    return Object.keys(requirements).length > 0 ? requirements : undefined;
  }

  /**
   * Generate suggestions based on query
   */
  suggest(query: string): string[] {
    const filters = this.parse(query);
    const suggestions: string[] = [];

    if (!filters.travelStyle?.length) {
      suggestions.push('Try adding: luxury, adventure, or budget');
    }
    if (!filters.duration) {
      suggestions.push('Specify duration: 7 days, a week');
    }
    if (!filters.budget) {
      suggestions.push('Add budget: under $3000 or luxury');
    }
    if (!filters.activities?.length) {
      suggestions.push('Mention activities: safari, beach, hiking');
    }
    if (!filters.location) {
      suggestions.push('Specify location: Kenya, Tanzania, Uganda');
    }
    if (!filters.accommodation?.length) {
      suggestions.push('Add preference: luxury lodge, camping');
    }

    return suggestions;
  }

  /**
   * Validate and complete filters
   */
  validate(filters: SearchFilters): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (filters.budget) {
      if (filters.budget.min && filters.budget.max && filters.budget.min > filters.budget.max) {
        errors.push('Minimum budget cannot be greater than maximum budget');
      }
    }

    if (filters.duration) {
      if (filters.duration.min && filters.duration.max && filters.duration.min > filters.duration.max) {
        errors.push('Minimum duration cannot be greater than maximum duration');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const aiSearchParser = new AISearchParser();
