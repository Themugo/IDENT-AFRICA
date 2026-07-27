/**
 * Block-Based Page Builder Types
 * 
 * Protected block system where admin controls content, not structure.
 * Blocks are predefined components with configurable content.
 */

// ============ BLOCK TYPES ============

export type BlockType = 
  | 'hero'
  | 'destination'
  | 'experience'
  | 'hotel'
  | 'package'
  | 'gallery'
  | 'testimonial'
  | 'partner'
  | 'cta';

export type PageType = 
  | 'homepage'
  | 'destinations'
  | 'accommodation'
  | 'experiences'
  | 'packages'
  | 'about'
  | 'contact';

// ============ BASE BLOCK INTERFACE ============

export interface BlockSettings {
  visible: boolean;
  containerWidth?: 'full' | 'wide' | 'narrow';
  backgroundColor?: string;
  paddingTop?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  stylePreset?: string;
  [key: string]: unknown;
}

export interface BlockContent {
  [key: string]: unknown;
}

export interface Block {
  id: string;
  page: PageType;
  sectionType: BlockType;
  content: BlockContent;
  settings: BlockSettings;
  displayOrder: number;
  visible?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============ HERO BLOCK ============

export interface HeroBlockContent extends BlockContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  overlayOpacity: number;
  alignment: 'left' | 'center' | 'right';
  minHeight: 'full' | 'large' | 'medium' | 'small';
}

export interface HeroBlock extends Block {
  sectionType: 'hero';
  content: HeroBlockContent;
}

// ============ DESTINATION BLOCK ============

export interface DestinationBlockContent extends BlockContent {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'carousel' | 'list';
  columns: 2 | 3 | 4;
  destinationIds: string[];
  showFilters: boolean;
  filterCountries?: ('Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda')[];
  limit?: number;
}

export interface DestinationBlock extends Block {
  sectionType: 'destination';
  content: DestinationBlockContent;
}

// ============ EXPERIENCE BLOCK ============

export interface ExperienceBlockContent extends BlockContent {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'carousel' | 'list';
  columns: 2 | 3 | 4;
  category?: string;
  experienceIds?: string[];
  showViewAll: boolean;
  viewAllLink?: string;
}

export interface ExperienceBlock extends Block {
  sectionType: 'experience';
  content: ExperienceBlockContent;
}

// ============ HOTEL BLOCK ============

export interface HotelBlockContent extends BlockContent {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'carousel';
  columns: 2 | 3;
  hotelIds?: string[];
  country?: 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda';
  tier?: 'Ultra-Luxe Canvas' | 'Eco Luxury Lodge' | 'Classic Safari Camp' | 'Bespoke Private Villa';
  showViewAll: boolean;
}

export interface HotelBlock extends Block {
  sectionType: 'hotel';
  content: HotelBlockContent;
}

// ============ PACKAGE BLOCK ============

export interface PackageBlockContent extends BlockContent {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'carousel';
  columns: 2 | 3;
  packageIds?: string[];
  country?: 'Kenya' | 'Tanzania' | 'Uganda' | 'Rwanda';
  featured?: boolean;
  showViewAll: boolean;
}

export interface PackageBlock extends Block {
  sectionType: 'package';
  content: PackageBlockContent;
}

// ============ GALLERY BLOCK ============

export interface GalleryBlockContent extends BlockContent {
  title: string;
  subtitle?: string;
  layout: 'grid' | 'masonry' | 'slider';
  columns: 2 | 3 | 4;
  imageIds?: string[];
  folder?: string;
  lightboxEnabled: boolean;
  showCaptions: boolean;
}

export interface GalleryBlock extends Block {
  sectionType: 'gallery';
  content: GalleryBlockContent;
}

// ============ TESTIMONIAL BLOCK ============

export interface TestimonialBlockContent extends BlockContent {
  title: string;
  subtitle?: string;
  layout: 'slider' | 'grid' | 'single';
  testimonialIds?: string[];
  showRating: boolean;
  showAvatar: boolean;
  autoPlay: boolean;
}

export interface TestimonialBlock extends Block {
  sectionType: 'testimonial';
  content: TestimonialBlockContent;
}

// ============ PARTNER BLOCK ============

export interface PartnerBlockContent extends BlockContent {
  title: string;
  subtitle?: string;
  layout: 'logo-grid' | 'carousel' | 'list';
  partnerIds?: string[];
  type?: 'airline' | 'hotel_chain' | 'tour_operator' | 'conservation' | 'government';
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze';
  showLinks: boolean;
}

export interface PartnerBlock extends Block {
  sectionType: 'partner';
  content: PartnerBlockContent;
}

// ============ CTA BLOCK ============

export interface CTABlockContent extends BlockContent {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle: 'primary' | 'secondary' | 'outline';
  backgroundImage?: string;
  backgroundColor?: string;
  alignment: 'left' | 'center' | 'right';
}

export interface CTABlock extends Block {
  sectionType: 'cta';
  content: CTABlockContent;
}

// ============ TYPE GUARD ============

export function isHeroBlock(block: Block): block is HeroBlock {
  return block.sectionType === 'hero';
}

export function isDestinationBlock(block: Block): block is DestinationBlock {
  return block.sectionType === 'destination';
}

export function isExperienceBlock(block: Block): block is ExperienceBlock {
  return block.sectionType === 'experience';
}

export function isHotelBlock(block: Block): block is HotelBlock {
  return block.sectionType === 'hotel';
}

export function isPackageBlock(block: Block): block is PackageBlock {
  return block.sectionType === 'package';
}

export function isGalleryBlock(block: Block): block is GalleryBlock {
  return block.sectionType === 'gallery';
}

export function isTestimonialBlock(block: Block): block is TestimonialBlock {
  return block.sectionType === 'testimonial';
}

export function isPartnerBlock(block: Block): block is PartnerBlock {
  return block.sectionType === 'partner';
}

export function isCTABlock(block: Block): block is CTABlock {
  return block.sectionType === 'cta';
}

// ============ PAGE CONFIGURATION ============

export interface PageConfig {
  type: PageType;
  name: string;
  description: string;
  availableBlocks: BlockType[];
  defaultBlocks: BlockType[];
}

export const PAGE_CONFIGS: PageConfig[] = [
  {
    type: 'homepage',
    name: 'Homepage',
    description: 'Main landing page with all sections',
    availableBlocks: ['hero', 'destination', 'experience', 'hotel', 'package', 'gallery', 'testimonial', 'partner', 'cta'],
    defaultBlocks: ['hero', 'destination', 'experience', 'package', 'testimonial', 'cta'],
  },
  {
    type: 'destinations',
    name: 'Destinations',
    description: 'Wildlife destinations listing',
    availableBlocks: ['hero', 'destination', 'gallery', 'testimonial', 'cta'],
    defaultBlocks: ['hero', 'destination', 'cta'],
  },
  {
    type: 'accommodation',
    name: 'Accommodation',
    description: 'Lodges and camps listing',
    availableBlocks: ['hero', 'hotel', 'gallery', 'testimonial', 'cta'],
    defaultBlocks: ['hero', 'hotel', 'cta'],
  },
  {
    type: 'experiences',
    name: 'Experiences',
    description: 'Safari experiences and activities',
    availableBlocks: ['hero', 'experience', 'gallery', 'testimonial', 'cta'],
    defaultBlocks: ['hero', 'experience', 'cta'],
  },
  {
    type: 'packages',
    name: 'Safari Packages',
    description: 'Curated safari itineraries',
    availableBlocks: ['hero', 'package', 'destination', 'testimonial', 'cta'],
    defaultBlocks: ['hero', 'package', 'cta'],
  },
  {
    type: 'about',
    name: 'About',
    description: 'About page',
    availableBlocks: ['hero', 'testimonial', 'partner', 'cta'],
    defaultBlocks: ['hero', 'testimonial', 'partner'],
  },
  {
    type: 'contact',
    name: 'Contact',
    description: 'Contact page',
    availableBlocks: ['hero', 'cta'],
    defaultBlocks: ['hero', 'cta'],
  },
];

// ============ API RESPONSE ============

export interface PageBlocksResponse {
  page: PageType;
  blocks: Block[];
  total: number;
}

export interface BlockUpdateRequest {
  content?: BlockContent;
  settings?: Partial<BlockSettings>;
}

export interface BlockReorderRequest {
  blockIds: string[];
}
