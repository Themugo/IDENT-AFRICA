/**
 * IDENT AFRICA - Local Business SEO Component
 * Google Business Profile optimization with structured data
 */

import React from 'react';
import { getLocalBusinessSchema } from '../../services/seo';

// Local Business structured data for Google Business Profile
export const LocalBusinessSEO: React.FC = () => {
  const schema = getLocalBusinessSchema();
  
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Google Business Profile Meta Tags */}
      <meta name="geo.region" content="KE" />
      <meta name="geo.placename" content="Nairobi" />
      <meta name="geo.position" content="-1.2921;36.8219" />
      <meta name="ICBM" content="-1.2921, 36.8219" />
      
      {/* Business-specific meta */}
      <meta name="business:contact_data:street_address" content="Westlands Business Park" />
      <meta name="business:contact_data:locality" content="Nairobi" />
      <meta name="business:contact_data:postal_code" content="00100" />
      <meta name="business:contact_data:country_name" content="Kenya" />
      <meta name="business:contact_data:phone_number" content="+254-20-712-8800" />
      <meta name="business:contact_data:email" content="hello@identafrica.com" />
    </>
  );
};

export default LocalBusinessSEO;
