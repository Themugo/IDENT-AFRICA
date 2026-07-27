import React from 'react';
import { SafariExperts } from './SafariExperts';
import { SafariGuides } from './SafariGuides';
import { ConservationPartners } from './ConservationPartners';
import { RichTestimonials } from './RichTestimonials';
import { PressMedia } from './PressMedia';

/**
 * Trust and Authority Section
 * 
 * Comprehensive trust-building components for IDENT AFRICA:
 * - Safari Expert Profiles with credentials and specialties
 * - Field Guide biographies with experience and languages
 * - Conservation partnerships with impact metrics
 * - Rich traveler testimonials with photos and videos
 * - Press and media mentions with awards
 */
export const TrustAndAuthority: React.FC = () => {
  return (
    <>
      {/* Safari Experts - Master Curators */}
      <SafariExperts />
      
      {/* Field Guides - The Eyes of Your Safari */}
      <SafariGuides />
      
      {/* Conservation Partners - Impact Through Travel */}
      <ConservationPartners />
      
      {/* Rich Testimonials - Traveler Stories */}
      <RichTestimonials />
      
      {/* Press & Media - Authority Recognition */}
      <PressMedia />
    </>
  );
};

export default TrustAndAuthority;

// Re-export all trust components for individual use
export { SafariExperts } from './SafariExperts';
export { SafariGuides } from './SafariGuides';
export { ConservationPartners } from './ConservationPartners';
export { RichTestimonials } from './RichTestimonials';
export { PressMedia } from './PressMedia';
