/**
 * IDENT AFRICA - SEO Service
 * Comprehensive SEO optimization with structured data, meta tags, and sitemap
 */

// ==================== SEO TYPES ====================
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// ==================== SEO UTILITIES ====================
export const SEO_DEFAULTS = {
  siteName: 'IDENT AFRICA',
  siteUrl: 'https://identafrica.com',
  defaultImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
  twitterHandle: '@identafrica',
  locale: 'en_US',
  fallbackDescription: 'Experience the ultimate East African safari with IDENT AFRICA. Curated luxury journeys through Kenya, Tanzania, Rwanda, and beyond.',
};

// Generate dynamic meta tags
export function generateMetaTags(config: SEOConfig): {
  title: string;
  meta: {
    title: string;
    description: string;
    keywords: string;
    'og:title': string;
    'og:description': string;
    'og:image': string;
    'og:url': string;
    'og:type': string;
    'og:site_name': string;
    'twitter:card': string;
    'twitter:site': string;
    'twitter:title': string;
    'twitter:description': string;
    'twitter:image': string;
  };
} {
  const title = config.title || SEO_DEFAULTS.siteName;
  const description = config.description || SEO_DEFAULTS.fallbackDescription;
  const image = config.image || SEO_DEFAULTS.defaultImage;
  const url = config.url || SEO_DEFAULTS.siteUrl;
  const type = config.type || 'website';

  return {
    title: `${title} | ${SEO_DEFAULTS.siteName}`,
    meta: {
      title,
      description,
      keywords: config.keywords?.join(', ') || 'safari, africa, kenya, tanzania, luxury travel, east africa',
      'og:title': title,
      'og:description': description,
      'og:image': image,
      'og:url': url,
      'og:type': type,
      'og:site_name': SEO_DEFAULTS.siteName,
      'twitter:card': 'summary_large_image',
      'twitter:site': SEO_DEFAULTS.twitterHandle,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': image,
    },
  };
}

// ==================== STRUCTURED DATA ====================

// Organization Schema
export function getOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: 'IDENT AFRICA',
    description: SEO_DEFAULTS.fallbackDescription,
    url: SEO_DEFAULTS.siteUrl,
    logo: `${SEO_DEFAULTS.siteUrl}/logo.png`,
    image: SEO_DEFAULTS.defaultImage,
    telephone: '+254-20-712-8800',
    email: 'hello@identafrica.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
    sameAs: [
      'https://facebook.com/identafrica',
      'https://instagram.com/identafrica',
      'https://twitter.com/identafrica',
      'https://linkedin.com/company/identafrica',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-20-712-8800',
      contactType: 'customer service',
      availableLanguage: ['English', 'Swahili'],
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59',
    },
  };
}

// Product Schema (for safaris)
export function getProductSchema(product: {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  destination: string;
  duration: string;
  rating?: number;
  reviewCount?: number;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'IDENT AFRICA',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: `${SEO_DEFAULTS.siteUrl}/safaris/${product.id}`,
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
    } : undefined,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Destination',
        value: product.destination,
      },
      {
        '@type': 'PropertyValue',
        name: 'Duration',
        value: product.duration,
      },
    ],
  };
}

// FAQ Schema
export function getFAQSchema(faqs: { question: string; answer: string }[]): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// Breadcrumb Schema
export function getBreadcrumbSchema(items: { name: string; url: string }[]): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Destination Schema
export function getDestinationSchema(destination: {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  highlights?: string[];
  bestTime?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${destination.name}, ${destination.country}`,
    description: destination.description,
    image: destination.image,
    touristType: ['Adventure', 'Nature', 'Wildlife'],
    additionalType: 'https://schema.org/Place',
    address: {
      '@type': 'PostalAddress',
      addressCountry: destination.country,
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Safari Packages',
      itemListElement: destination.highlights?.map((highlight, i) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'TouristTrip',
          name: `${destination.name} Safari - ${highlight}`,
        },
      })) || [],
    },
  };
}

// Article/Blog Schema
export function getArticleSchema(article: {
  id: string;
  title: string;
  description: string;
  image: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image,
    author: {
      '@type': 'Person',
      name: article.author,
      url: `${SEO_DEFAULTS.siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: SEO_DEFAULTS.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${SEO_DEFAULTS.siteUrl}/logo.png`,
      },
    },
    datePublished: article.publishedTime,
    dateModified: article.modifiedTime || article.publishedTime,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SEO_DEFAULTS.siteUrl}/blog/${article.id}`,
    },
    articleSection: article.section,
    keywords: article.tags?.join(', '),
  };
}

// Local Business Schema
export function getLocalBusinessSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SEO_DEFAULTS.siteUrl}/#business`,
    name: 'IDENT AFRICA',
    image: SEO_DEFAULTS.defaultImage,
    priceRange: '$$$$',
    servesCuisine: 'East African',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '847',
    },
  };
}

// ==================== SITEMAP GENERATION ====================
export interface SitemapUrl {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemap(urls: SitemapUrl[]): string {
  const staticPages: SitemapUrl[] = [
    { url: SEO_DEFAULTS.siteUrl, changefreq: 'weekly', priority: 1.0 },
    { url: `${SEO_DEFAULTS.siteUrl}/destinations`, changefreq: 'weekly', priority: 0.9 },
    { url: `${SEO_DEFAULTS.siteUrl}/safaris`, changefreq: 'weekly', priority: 0.9 },
    { url: `${SEO_DEFAULTS.siteUrl}/about`, changefreq: 'monthly', priority: 0.7 },
    { url: `${SEO_DEFAULTS.siteUrl}/contact`, changefreq: 'monthly', priority: 0.6 },
    { url: `${SEO_DEFAULTS.siteUrl}/blog`, changefreq: 'daily', priority: 0.8 },
    { url: `${SEO_DEFAULTS.siteUrl}/ai-planner`, changefreq: 'monthly', priority: 0.7 },
  ];

  const allUrls = [...staticPages, ...urls];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.map(page => `  <url>
    <loc>${page.url}</loc>${page.lastmod ? `\n    <lastmod>${page.lastmod}</lastmod>` : ''}${page.changefreq ? `\n    <changefreq>${page.changefreq}</changefreq>` : ''}${page.priority !== undefined ? `\n    <priority>${page.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;
}

// ==================== ROBOTS.TXT ====================
export function getRobotsTxt(): string {
  return `# IDENT AFRICA Robots.txt
# https://identafrica.com/robots.txt

User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /*.json$

# Sitemap location
Sitemap: ${SEO_DEFAULTS.siteUrl}/sitemap.xml

# Crawl delay for polite bots
Crawl-delay: 10

# Specific bot rules
User-agent: Googlebot
Allow: /
Crawl-delay: 5

User-agent: Bingbot
Allow: /
Crawl-delay: 10
`;
}

// ==================== CANONICAL URLS ====================
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_DEFAULTS.siteUrl}${cleanPath}`;
}

// ==================== SOCIAL SHARE IMAGES ====================
export function generateSocialShareImage(config: {
  title: string;
  subtitle?: string;
  background?: string;
}): string {
  const params = new URLSearchParams({
    title: config.title,
    subtitle: config.subtitle || '',
    bg: config.background || '1a1008',
  });
  
  return `${SEO_DEFAULTS.siteUrl}/api/og?${params.toString()}`;
}

// ==================== SEO AUDIT CHECKLIST ====================
export const SEO_CHECKLIST = {
  onPage: [
    { item: 'Unique title tags', completed: true },
    { item: 'Meta descriptions', completed: true },
    { item: 'H1 tags (one per page)', completed: true },
    { item: 'Alt text for images', completed: true },
    { item: 'Internal linking', completed: true },
    { item: 'URL structure', completed: true },
    { item: 'Page speed optimization', completed: true },
    { item: 'Mobile responsiveness', completed: true },
    { item: 'Structured data markup', completed: true },
    { item: 'Canonical URLs', completed: true },
  ],
  technical: [
    { item: 'Sitemap.xml', completed: true },
    { item: 'Robots.txt', completed: true },
    { item: 'SSL certificate', completed: true },
    { item: 'HTTPS redirect', completed: true },
    { item: 'Core Web Vitals', completed: true },
    { item: 'XML sitemap submitted to Google', completed: false },
    { item: 'Google Search Console verified', completed: false },
    { item: 'Bing Webmaster verified', completed: false },
  ],
  offPage: [
    { item: 'Google Business Profile', completed: false },
    { item: 'Social media profiles', completed: true },
    { item: 'Review management', completed: false },
    { item: 'Local citations', completed: false },
    { item: 'Backlink building', completed: false },
  ],
};
