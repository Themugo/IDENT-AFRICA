import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base Luxury Shimmer block with warm earthy and gold undertones
 */
export const LuxurySkeletonBlock: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      className={`relative overflow-hidden bg-[#2E2015]/10 dark:bg-[#2A362E]/40 rounded-xl ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-[#C89A4B]/20 dark:via-[#D4AF37]/20 to-transparent" />
    </div>
  );
};

/**
 * Skeleton for Destination Cards (Grid layout)
 */
export const DestinationCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] overflow-hidden shadow-lg flex flex-col justify-between">
      {/* Image Header Skeleton */}
      <div className="relative h-60 p-4 flex flex-col justify-between">
        <LuxurySkeletonBlock className="absolute inset-0 rounded-none h-full w-full" />
        <div className="relative z-10 flex justify-between items-start">
          <LuxurySkeletonBlock className="w-24 h-6 rounded-full" />
          <LuxurySkeletonBlock className="w-8 h-8 rounded-full" />
        </div>
        <div className="relative z-10 flex justify-between items-center">
          <LuxurySkeletonBlock className="w-28 h-5 rounded-md" />
          <LuxurySkeletonBlock className="w-12 h-5 rounded-md" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <LuxurySkeletonBlock className="w-3/4 h-6 rounded-md" />
          <LuxurySkeletonBlock className="w-1/2 h-4 rounded-md" />
        </div>

        <LuxurySkeletonBlock className="w-full h-12 rounded-lg" />

        {/* Tags */}
        <div className="flex gap-2">
          <LuxurySkeletonBlock className="w-20 h-5 rounded-full" />
          <LuxurySkeletonBlock className="w-24 h-5 rounded-full" />
          <LuxurySkeletonBlock className="w-16 h-5 rounded-full" />
        </div>

        {/* Footer Price & Button */}
        <div className="pt-3 border-t border-[#E6D5C3] dark:border-[#2A362E] flex justify-between items-center">
          <div className="space-y-1">
            <LuxurySkeletonBlock className="w-16 h-3 rounded" />
            <LuxurySkeletonBlock className="w-24 h-5 rounded" />
          </div>
          <LuxurySkeletonBlock className="w-28 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Hotel & Lodge Cards (Grid layout)
 */
export const HotelCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#D4AF37]/30 overflow-hidden shadow-xl flex flex-col justify-between">
      {/* Image Skeleton */}
      <div className="relative h-64 p-4 flex flex-col justify-between">
        <LuxurySkeletonBlock className="absolute inset-0 rounded-none h-full w-full" />
        <div className="relative z-10 flex justify-between items-start">
          <LuxurySkeletonBlock className="w-32 h-6 rounded-full" />
          <LuxurySkeletonBlock className="w-8 h-8 rounded-full" />
        </div>
        <div className="relative z-10 flex justify-between items-end">
          <LuxurySkeletonBlock className="w-36 h-6 rounded-md" />
          <LuxurySkeletonBlock className="w-14 h-6 rounded-md" />
        </div>
      </div>

      {/* Hotel Info Skeleton */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <LuxurySkeletonBlock className="w-4/5 h-6 rounded-md" />
          <LuxurySkeletonBlock className="w-2/3 h-4 rounded-md" />
        </div>

        <LuxurySkeletonBlock className="w-full h-10 rounded-lg" />

        {/* Amenities / Features */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <LuxurySkeletonBlock className="w-full h-6 rounded-md" />
          <LuxurySkeletonBlock className="w-full h-6 rounded-md" />
        </div>

        {/* Footer Price */}
        <div className="pt-4 border-t border-[#E6D5C3] dark:border-[#2A362E] flex items-center justify-between">
          <div className="space-y-1">
            <LuxurySkeletonBlock className="w-20 h-3 rounded" />
            <LuxurySkeletonBlock className="w-28 h-6 rounded" />
          </div>
          <div className="flex gap-2">
            <LuxurySkeletonBlock className="w-10 h-10 rounded-xl" />
            <LuxurySkeletonBlock className="w-28 h-10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Itinerary Cards
 */
export const ItineraryCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#181E1A] border border-[#E6D5C3] dark:border-[#2A362E] overflow-hidden shadow-lg space-y-4 p-5">
      <div className="relative h-52 rounded-xl overflow-hidden">
        <LuxurySkeletonBlock className="w-full h-full rounded-xl" />
      </div>
      <div className="space-y-2">
        <LuxurySkeletonBlock className="w-2/3 h-6 rounded-md" />
        <LuxurySkeletonBlock className="w-full h-12 rounded-md" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <LuxurySkeletonBlock className="w-24 h-5 rounded-full" />
        <LuxurySkeletonBlock className="w-28 h-7 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Skeleton for Detail View Pages (DestinationDetail, HotelDetail)
 */
export const DetailHeroSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner Skeleton */}
      <div className="relative h-96 rounded-3xl overflow-hidden bg-black/20">
        <LuxurySkeletonBlock className="w-full h-full rounded-none" />
        <div className="absolute bottom-8 left-8 right-8 space-y-4">
          <LuxurySkeletonBlock className="w-36 h-6 rounded-full" />
          <LuxurySkeletonBlock className="w-2/3 h-10 rounded-xl" />
          <LuxurySkeletonBlock className="w-1/2 h-5 rounded-lg" />
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <LuxurySkeletonBlock className="w-full h-32 rounded-2xl" />
          <LuxurySkeletonBlock className="w-full h-64 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <LuxurySkeletonBlock className="w-full h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

/**
 * Flexible Skeleton Grid Container
 */
export interface ListingGridSkeletonProps {
  type?: 'destination' | 'hotel' | 'itinerary';
  count?: number;
}

export const ListingGridSkeleton: React.FC<ListingGridSkeletonProps> = ({
  type = 'destination',
  count = 6,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }, (_, i) => (
        <React.Fragment key={i}>
          {type === 'hotel' ? (
            <HotelCardSkeleton />
          ) : type === 'itinerary' ? (
            <ItineraryCardSkeleton />
          ) : (
            <DestinationCardSkeleton />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
