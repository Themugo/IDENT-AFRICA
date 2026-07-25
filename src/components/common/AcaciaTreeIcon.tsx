import React from 'react';

interface AcaciaTreeIconProps {
  className?: string;
  leafColor?: string;
  trunkColor?: string;
}

export const AcaciaTreeIcon: React.FC<AcaciaTreeIconProps> = ({
  className = "w-6 h-6",
  leafColor = "#4F6848", // Jungle Green
  trunkColor = "#2D3E2B"  // Dark Forest Wood
}) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Canopy Layer 1 - Soft Upper Leaf Cluster */}
      <ellipse cx="24" cy="14" rx="18" ry="4" fill="#5E7D56" />
      
      {/* Canopy Layer 2 - Primary Umbrella Leaf Layer (Jungle Green) */}
      <ellipse cx="24" cy="17" rx="21" ry="5" fill={leafColor} />
      
      {/* Canopy Layer 3 - Deep Jungle Green Shadows */}
      <ellipse cx="16" cy="19" rx="10" ry="3.5" fill="#3B5235" />
      <ellipse cx="32" cy="19" rx="10" ry="3.5" fill="#3B5235" />
      <ellipse cx="24" cy="21" rx="16" ry="3.5" fill={trunkColor} />

      {/* Spreading Natural Branches */}
      <path
        d="M24 38V23M24 27L14 19M24 25L34 18.5M24 30L9 21M24 29L39 20.5"
        stroke={trunkColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Strong Rooted Trunk */}
      <path
        d="M21.5 40H26.5V32C26.5 32 25.5 25 24 25C22.5 25 21.5 32 21.5 32V40Z"
        fill={trunkColor}
      />

      {/* Savanna Horizon Line */}
      <path
        d="M6 40.5C14 39.5 34 39.5 42 40.5"
        stroke={leafColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
