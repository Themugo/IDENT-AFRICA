/**
 * Block Renderer Component
 * 
 * Renders page blocks dynamically based on their type.
 * Admin controls content, not structure.
 */

import React from 'react';
import {
  MapPin,
  Compass,
  Building2,
  Package,
  Image,
  MessageSquareQuote,
  Handshake,
  MousePointer,
  Layout,
  Star,
  Users,
  Clock,
  DollarSign,
  ChevronRight,
  Camera,
} from 'lucide-react';
import type {
  Block,
  HeroBlock,
  DestinationBlock,
  ExperienceBlock,
  HotelBlock,
  PackageBlock,
  GalleryBlock,
  TestimonialBlock,
  PartnerBlock,
  CTABlock,
} from '../../types/blocks';

// Import content defaults
import { DEFAULT_DESTINATIONS } from '../../content/defaults/destinations';
import { DEFAULT_HOTELS } from '../../content/defaults/hotels';
import { DEFAULT_EXPERIENCES } from '../../content/defaults/experiences';
import { DEFAULT_PACKAGES } from '../../content/defaults/packages';
import { DEFAULT_TESTIMONIALS } from '../../content/defaults/testimonials';
import { DEFAULT_PARTNERS } from '../../content/defaults/partners';

// ============ HELPER FUNCTIONS ============

function getPaddingClass(padding?: string): string {
  const paddingMap: Record<string, string> = {
    none: 'py-0',
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12',
    xl: 'py-16',
  };
  return paddingMap[padding || 'lg'] || 'py-12';
}

function getContainerWidth(width?: string): string {
  const widthMap: Record<string, string> = {
    full: 'max-w-full px-0',
    wide: 'max-w-7xl mx-auto px-4',
    narrow: 'max-w-3xl mx-auto px-4',
  };
  return widthMap[width || 'wide'] || 'max-w-7xl mx-auto px-4';
}

// ============ HERO BLOCK ============

interface HeroBlockRendererProps {
  block: HeroBlock;
}

const HeroBlockRenderer: React.FC<HeroBlockRendererProps> = ({ block }) => {
  const { content, settings } = block;
  
  return (
    <section
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${getPaddingClass(settings.paddingTop)} ${getPaddingClass(settings.paddingBottom)}`}
      style={{ backgroundColor: '#1C1917' }}
    >
      {/* Background Image */}
      {content.backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${content.backgroundImage})`,
            opacity: 1 - (content.overlayOpacity || 0.4),
          }}
        />
      )}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-stone-950"
        style={{ opacity: content.overlayOpacity || 0.4 }}
      />
      
      {/* Content */}
      <div className={`relative z-10 text-center ${getContainerWidth(settings.containerWidth)} ${content.alignment === 'left' ? 'text-left' : content.alignment === 'right' ? 'text-right' : 'text-center'}`}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          {content.title}
        </h1>
        <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
        {content.ctaText && content.ctaLink && (
          <a
            href={content.ctaLink}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold rounded-lg transition-colors shadow-lg shadow-amber-500/30"
          >
            {content.ctaText}
            <ChevronRight size={20} />
          </a>
        )}
      </div>
    </section>
  );
};

// ============ DESTINATION BLOCK ============

interface DestinationBlockRendererProps {
  block: DestinationBlock;
}

const DestinationBlockRenderer: React.FC<DestinationBlockRendererProps> = ({ block }) => {
  const { content, settings } = block;
  
  const destinations = content.destinationIds?.length
    ? DEFAULT_DESTINATIONS.filter(d => content.destinationIds.includes(d.id))
    : DEFAULT_DESTINATIONS.slice(0, content.limit || 6);
  
  const columnsClass = content.columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
                       content.columns === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                       'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  
  return (
    <section className={`${getPaddingClass(settings.paddingTop)} ${getPaddingClass(settings.paddingBottom)} ${settings.backgroundColor || ''}`}>
      <div className={getContainerWidth(settings.containerWidth)}>
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">{content.title}</h2>
            {content.subtitle && <p className="text-lg text-stone-400">{content.subtitle}</p>}
          </div>
        )}
        
        <div className={`grid ${columnsClass} gap-6`}>
          {destinations.map(destination => (
            <a
              key={destination.id}
              href={`/destinations/${destination.id}`}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-stone-800"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block px-3 py-1 bg-amber-500/90 text-stone-900 text-xs font-semibold rounded-full mb-2">
                  {destination.country}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">{destination.name}</h3>
                <p className="text-sm text-stone-300 line-clamp-2">{destination.tagline}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-stone-400">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    {destination.rating}
                  </span>
                  <span>{destination.durationDays} days</span>
                  <span>From ${destination.startingPrice.toLocaleString()}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ EXPERIENCE BLOCK ============

interface ExperienceBlockRendererProps {
  block: ExperienceBlock;
}

const ExperienceBlockRenderer: React.FC<ExperienceBlockRendererProps> = ({ block }) => {
  const { content, settings } = block;
  
  const experiences = DEFAULT_EXPERIENCES.slice(0, 6);
  
  const columnsClass = content.columns === 4 ? 'grid-cols-2 lg:grid-cols-4' :
                       content.columns === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                       'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  
  return (
    <section className={`${getPaddingClass(settings.paddingTop)} ${getPaddingClass(settings.paddingBottom)} ${settings.backgroundColor || 'bg-stone-900'}`}>
      <div className={getContainerWidth(settings.containerWidth)}>
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">{content.title}</h2>
            {content.subtitle && <p className="text-lg text-stone-400">{content.subtitle}</p>}
          </div>
        )}
        
        <div className={`grid ${columnsClass} gap-6`}>
          {experiences.map(experience => (
            <div
              key={experience.id}
              className="group relative aspect-square rounded-xl overflow-hidden bg-stone-800"
            >
              <img
                src={experience.image}
                alt={experience.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-block px-2 py-1 bg-amber-500/90 text-stone-900 text-xs font-semibold rounded mb-2">
                  {experience.category}
                </span>
                <h3 className="text-lg font-bold text-white">{experience.name}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-stone-300">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {experience.durationHours}h
                  </span>
                  <span>${experience.costUSD}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ HOTEL BLOCK ============

interface HotelBlockRendererProps {
  block: HotelBlock;
}

const HotelBlockRenderer: React.FC<HotelBlockRendererProps> = ({ block }) => {
  const { content, settings } = block;
  
  const hotels = DEFAULT_HOTELS.slice(0, 3);
  
  return (
    <section className={`${getPaddingClass(settings.paddingTop)} ${getPaddingClass(settings.paddingBottom)} ${settings.backgroundColor || ''}`}>
      <div className={getContainerWidth(settings.containerWidth)}>
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">{content.title}</h2>
            {content.subtitle && <p className="text-lg text-stone-400">{content.subtitle}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(hotel => (
            <div
              key={hotel.id}
              className="group bg-stone-800 rounded-xl overflow-hidden border border-stone-700 hover:border-amber-500/50 transition-colors"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-amber-500/90 text-stone-900 text-xs font-semibold rounded">
                  {hotel.tier}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-stone-100 mb-2">{hotel.name}</h3>
                <p className="text-sm text-stone-400 mb-3">{hotel.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-400">${hotel.pricePerNight.toLocaleString()}<span className="text-sm font-normal text-stone-500">/night</span></span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm text-stone-300">{hotel.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ PACKAGE BLOCK ============

interface PackageBlockRendererProps {
  block: PackageBlock;
}

const PackageBlockRenderer: React.FC<PackageBlockRendererProps> = ({ block }) => {
  const { content, settings } = block;
  
  const packages = DEFAULT_PACKAGES.slice(0, 3);
  
  return (
    <section className={`${getPaddingClass(settings.paddingTop)} ${getPaddingClass(settings.paddingBottom)} ${settings.backgroundColor || ''}`}>
      <div className={getContainerWidth(settings.containerWidth)}>
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">{content.title}</h2>
            {content.subtitle && <p className="text-lg text-stone-400">{content.subtitle}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className="group bg-stone-800 rounded-xl overflow-hidden border border-stone-700 hover:border-amber-500/50 transition-colors"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={pkg.heroImage}
                  alt={pkg.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {pkg.migrationSeasonMatch && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-emerald-500/90 text-white text-xs font-semibold rounded">
                    🦌 Migration
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-stone-400">{pkg.countries.join(', ')}</span>
                  <span className="text-xs text-stone-500">•</span>
                  <span className="text-xs text-stone-400">{pkg.durationDays} days</span>
                </div>
                <h3 className="text-lg font-bold text-stone-100 mb-2">{pkg.title}</h3>
                <p className="text-sm text-stone-400 mb-4 line-clamp-2">{pkg.subtitle}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-amber-400">${pkg.priceUSD.toLocaleString()}</span>
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm text-stone-300">{pkg.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ TESTIMONIAL BLOCK ============

interface TestimonialBlockRendererProps {
  block: TestimonialBlock;
}

const TestimonialBlockRenderer: React.FC<TestimonialBlockRendererProps> = ({ block }) => {
  const { content, settings } = block;
  
  const testimonials = DEFAULT_TESTIMONIALS.slice(0, 4);
  
  return (
    <section className={`${getPaddingClass(settings.paddingTop)} ${getPaddingClass(settings.paddingBottom)} ${settings.backgroundColor || 'bg-stone-900'}`}>
      <div className={getContainerWidth(settings.containerWidth)}>
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">{content.title}</h2>
            {content.subtitle && <p className="text-lg text-stone-400">{content.subtitle}</p>}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map(testimonial => (
            <div
              key={testimonial.id}
              className="bg-stone-800/50 border border-stone-700 rounded-xl p-6"
            >
              {content.showRating && (
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-600'}
                    />
                  ))}
                </div>
              )}
              <p className="text-stone-300 mb-4 line-clamp-4">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                {content.showAvatar && testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-stone-100">{testimonial.name}</p>
                  <p className="text-sm text-stone-500">{testimonial.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ CTA BLOCK ============

interface CTABlockRendererProps {
  block: CTABlock;
}

const CTABlockRenderer: React.FC<CTABlockRendererProps> = ({ block }) => {
  const { content, settings } = block;
  
  const buttonStyles = {
    primary: 'bg-stone-900 hover:bg-stone-800 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/30',
    outline: 'border-2 border-current text-stone-900 hover:bg-stone-900 hover:text-white',
  };
  
  return (
    <section 
      className={`${getPaddingClass(settings.paddingTop)} ${getPaddingClass(settings.paddingBottom)}`}
      style={{ backgroundColor: settings.backgroundColor || '#F59E0B' }}
    >
      <div className={`${getContainerWidth(settings.containerWidth)} ${content.alignment === 'left' ? 'text-left' : content.alignment === 'right' ? 'text-right' : 'text-center'}`}>
        <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{content.title}</h2>
        {content.subtitle && <p className="text-lg text-stone-800 mb-8 max-w-xl mx-auto">{content.subtitle}</p>}
        <a
          href={content.buttonLink}
          className={`inline-flex items-center gap-2 px-8 py-4 font-semibold rounded-lg transition-colors ${buttonStyles[content.buttonStyle || 'primary']}`}
        >
          {content.buttonText}
          <ChevronRight size={20} />
        </a>
      </div>
    </section>
  );
};

// ============ MAIN BLOCK RENDERER ============

interface BlockRendererProps {
  blocks: Block[];
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks }) => {
  return (
    <div className="block-renderer">
      {blocks
        .filter(block => block.settings.visible !== false)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(block => {
          switch (block.sectionType) {
            case 'hero':
              return <HeroBlockRenderer key={block.id} block={block as HeroBlock} />;
            case 'destination':
              return <DestinationBlockRenderer key={block.id} block={block as DestinationBlock} />;
            case 'experience':
              return <ExperienceBlockRenderer key={block.id} block={block as ExperienceBlock} />;
            case 'hotel':
              return <HotelBlockRenderer key={block.id} block={block as HotelBlock} />;
            case 'package':
              return <PackageBlockRenderer key={block.id} block={block as PackageBlock} />;
            case 'testimonial':
              return <TestimonialBlockRenderer key={block.id} block={block as TestimonialBlock} />;
            case 'cta':
              return <CTABlockRenderer key={block.id} block={block as CTABlock} />;
            default:
              return null;
          }
        })}
    </div>
  );
};

export default BlockRenderer;
