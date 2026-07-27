/**
 * Default Hero Content
 * Premium hero sections for the homepage
 */

import safariHeroImg from '../../assets/images/safari_hero_1784973880507.jpg';

export const DEFAULT_HERO_CONTENT = {
  hero: {
    id: 'hero-default',
    title: 'East Africa\'s Finest Safari Expeditions',
    subtitle: 'Experience the wild heart of Africa with curated luxury expeditions across Kenya, Tanzania, Uganda & Rwanda',
    ctaText: 'Start Your Journey',
    ctaLink: '/destinations',
    backgroundImage: safariHeroImg as unknown as string,
    overlayOpacity: 0.4,
  },
  sections: [
    {
      id: 'section-trust',
      component: 'TrustPillars',
      title: 'Why Travel With Us',
      enabled: true,
      order: 1,
    },
    {
      id: 'section-destinations',
      component: 'FeaturedDestinations',
      title: 'Featured Destinations',
      subtitle: 'Discover our most sought-after wildlife destinations',
      enabled: true,
      order: 2,
    },
    {
      id: 'section-experiences',
      component: 'ExperiencePillars',
      title: 'Unforgettable Experiences',
      subtitle: 'From mountain gorilla encounters to great migration spectacles',
      enabled: true,
      order: 3,
    },
    {
      id: 'section-itineraries',
      component: 'ItineraryShowcase',
      title: 'Curated Safari Packages',
      subtitle: 'Expertly designed expeditions for every type of traveler',
      enabled: true,
      order: 4,
    },
    {
      id: 'section-map',
      component: 'InteractiveMap',
      title: 'Explore East Africa',
      subtitle: 'Discover destinations across Kenya, Tanzania, Uganda & Rwanda',
      enabled: true,
      order: 5,
    },
    {
      id: 'section-calendar',
      component: 'SeasonalCalendar',
      title: 'Best Time to Visit',
      subtitle: 'Plan your perfect safari based on wildlife migrations and seasons',
      enabled: true,
      order: 6,
    },
    {
      id: 'section-testimonials',
      component: 'Testimonials',
      title: 'Traveler Stories',
      subtitle: 'Hear from those who\'ve experienced the magic of East Africa',
      enabled: true,
      order: 7,
    },
  ],
  footer: {
    companyName: 'Ident Africa',
    tagline: 'Luxury East Africa Expeditions & Sanctuaries',
    contactEmail: 'hello@identafrica.com',
    contactPhone: '+254 700 123 456',
    socialLinks: [
      { platform: 'instagram', url: 'https://instagram.com/identafrica' },
      { platform: 'facebook', url: 'https://facebook.com/identafrica' },
      { platform: 'twitter', url: 'https://twitter.com/identafrica' },
      { platform: 'youtube', url: 'https://youtube.com/identafrica' },
    ],
  },
};

export type DefaultHeroContent = typeof DEFAULT_HERO_CONTENT;
