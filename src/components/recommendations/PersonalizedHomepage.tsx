'use client';

/**
 * Personalized Homepage
 * 
 * Dynamic homepage sections based on user preferences.
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Calendar, ThumbsUp, ArrowRight } from 'lucide-react';
import { recommendationEngine, customerProfileService, learningSystem } from '../../services/recommendations';
import type { Recommendation, RecommendableItem, CustomerProfile } from '../../services/recommendations';

// Mock data for demo
const MOCK_DESTINATIONS: RecommendableItem[] = [
  {
    id: 'dest_1',
    type: 'destination',
    name: 'Maasai Mara',
    description: 'Iconic safari destination with great wildlife viewing',
    imageUrl: '/images/maasai-mara.jpg',
    price: 2500,
    rating: 4.9,
    reviewCount: 234,
    interests: ['wildlife', 'photography', 'nature'],
    travelStyles: ['luxury', 'adventure'],
    ageGroups: ['26-35', '36-45', '46-55'],
    bestMonths: [6, 7, 8, 9],
    country: 'Kenya',
    region: 'Rift Valley',
    popularity: 0.95,
    availability: 0.9,
    isTrending: true,
  },
  {
    id: 'dest_2',
    type: 'destination',
    name: 'Serengeti',
    description: 'Witness the great migration',
    imageUrl: '/images/serengeti.jpg',
    price: 3000,
    rating: 4.8,
    reviewCount: 189,
    interests: ['wildlife', 'photography', 'nature'],
    travelStyles: ['luxury', 'adventure'],
    ageGroups: ['26-35', '36-45', '46-55'],
    bestMonths: [6, 7, 8],
    country: 'Tanzania',
    region: 'North',
    popularity: 0.92,
    availability: 0.85,
    isTrending: true,
  },
  {
    id: 'dest_3',
    type: 'destination',
    name: 'Zanzibar',
    description: 'Tropical beach paradise',
    imageUrl: '/images/zanzibar.jpg',
    price: 1800,
    rating: 4.7,
    reviewCount: 156,
    interests: ['beach', 'wellness', 'food'],
    travelStyles: ['luxury', 'romantic'],
    ageGroups: ['26-35', '36-45'],
    bestMonths: [1, 2, 3, 4, 10, 11, 12],
    country: 'Tanzania',
    region: 'Coastal',
    popularity: 0.88,
    availability: 0.95,
    isTrending: false,
  },
  {
    id: 'dest_4',
    type: 'destination',
    name: 'Amboseli',
    description: 'Elephants with Kilimanjaro views',
    imageUrl: '/images/amboseli.jpg',
    price: 2200,
    rating: 4.6,
    reviewCount: 98,
    interests: ['wildlife', 'photography', 'nature'],
    travelStyles: ['adventure', 'family'],
    ageGroups: ['18-25', '26-35', '36-45'],
    bestMonths: [6, 7, 8, 9],
    country: 'Kenya',
    region: 'South',
    popularity: 0.75,
    availability: 0.9,
    isTrending: false,
  },
  {
    id: 'dest_5',
    type: 'destination',
    name: 'Ngorongoro',
    description: 'Wildlife paradise in a volcanic caldera',
    imageUrl: '/images/ngorongoro.jpg',
    price: 2800,
    rating: 4.9,
    reviewCount: 145,
    interests: ['wildlife', 'photography', 'nature'],
    travelStyles: ['luxury', 'adventure'],
    ageGroups: ['26-35', '36-45', '46-55'],
    bestMonths: [6, 7, 8, 9],
    country: 'Tanzania',
    region: 'North',
    popularity: 0.85,
    availability: 0.8,
    isTrending: true,
  },
];

interface PersonalizedHomepageProps {
  userId?: string;
  onItemClick?: (item: RecommendableItem) => void;
}

export default function PersonalizedHomepage({ userId = 'demo_user', onItemClick }: PersonalizedHomepageProps) {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [recommendations, setRecommendations] = useState<{
    recommendedForYou: Recommendation[];
    becauseYouLiked: Recommendation[];
    trending: Recommendation[];
    seasonal: Recommendation[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(`session_${Date.now()}`);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    setLoading(true);
    
    try {
      // Get or create profile
      let userProfile = await customerProfileService.getProfile(userId);
      if (!userProfile) {
        userProfile = await customerProfileService.createProfile(userId);
      }
      setProfile(userProfile);

      // Track some recent views for demo
      recommendationEngine.trackView(userId, 'dest_1');
      recommendationEngine.trackView(userId, 'dest_2');

      // Get recommendations
      const recs = await recommendationEngine.getHomepageRecommendations(userProfile, MOCK_DESTINATIONS);
      setRecommendations(recs);

      // Track impressions
      recs.recommendedForYou.forEach((rec, idx) => {
        learningSystem.trackImpression(userId, rec.item.id, rec.item.type, sessionId, idx, 'recommended_for_you', rec.score);
      });
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (rec: Recommendation, section: string) => {
    learningSystem.trackClick(
      userId,
      rec.item.id,
      rec.item.type,
      sessionId,
      rec.matchBreakdown ? 0 : 0,
      section,
      rec.score
    );
    onItemClick?.(rec.item);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-64 bg-stone-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Recommended For You */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-2xl font-bold text-stone-900">Recommended For You</h2>
        </div>
        <p className="text-stone-600 mb-4">
          Based on your {profile?.interests.join(', ')} interests and {profile?.travelStyle.join(', ')} style
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations?.recommendedForYou.slice(0, 4).map((rec, idx) => (
            <RecommendationCard
              key={rec.item.id}
              recommendation={rec}
              onClick={() => handleItemClick(rec, 'recommended_for_you')}
              rank={idx + 1}
            />
          ))}
        </div>
      </section>

      {/* Because You Liked */}
      {recommendations?.becauseYouLiked && recommendations.becauseYouLiked.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUp className="w-5 h-5 text-emerald-500" />
            <h2 className="text-2xl font-bold text-stone-900">Because You Liked {recommendations.becauseYouLiked[0]?.item.name}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.becauseYouLiked.slice(0, 3).map((rec, idx) => (
              <RecommendationCard
                key={rec.item.id}
                recommendation={rec}
                onClick={() => handleItemClick(rec, 'because_you_liked')}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          <h2 className="text-2xl font-bold text-stone-900">Trending Now</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations?.trending.slice(0, 3).map((rec, idx) => (
            <RecommendationCard
              key={rec.item.id}
              recommendation={rec}
              onClick={() => handleItemClick(rec, 'trending')}
              showBadge="Trending"
              badgeColor="bg-rose-500"
            />
          ))}
        </div>
      </section>

      {/* Seasonal Experiences */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h2 className="text-2xl font-bold text-stone-900">Perfect Time To Visit</h2>
        </div>
        <p className="text-stone-600 mb-4">
          Best destinations for July travel
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations?.seasonal.slice(0, 4).map((rec, idx) => (
            <RecommendationCard
              key={rec.item.id}
              recommendation={rec}
              onClick={() => handleItemClick(rec, 'seasonal')}
              showBadge="Best Season"
              badgeColor="bg-blue-500"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick: () => void;
  compact?: boolean;
  rank?: number;
  showBadge?: string;
  badgeColor?: string;
  key?: string;
}

function RecommendationCard({
  recommendation,
  onClick,
  compact = false,
  rank,
  showBadge,
  badgeColor = 'bg-amber-500',
}: RecommendationCardProps) {
  const { item, score, reasons } = recommendation;
  
  const matchPercentage = Math.round(score * 100);

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-xl border border-stone-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-amber-300 ${
        compact ? 'flex' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative ${compact ? 'w-24 h-24 flex-shrink-0' : 'h-40'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center">
          <span className="text-stone-400 text-sm">{item.name}</span>
        </div>
        
        {/* Rank badge */}
        {rank && (
          <div className="absolute top-2 left-2 w-6 h-6 bg-stone-900/80 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{rank}</span>
          </div>
        )}
        
        {/* Match score */}
        <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {matchPercentage}% match
        </div>
        
        {/* Badge */}
        {showBadge && (
          <div className={`absolute bottom-2 left-2 ${badgeColor} text-white text-xs font-medium px-2 py-1 rounded-full`}>
            {showBadge}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`p-3 ${compact ? 'flex-1' : ''}`}>
        <h3 className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
          {item.name}
        </h3>
        <p className="text-sm text-stone-500 mt-1">{item.country}</p>
        
        {!compact && (
          <>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-amber-500">★</span>
              <span className="text-sm font-medium">{item.rating}</span>
              <span className="text-sm text-stone-400">({item.reviewCount})</span>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-2">
              {item.interests.slice(0, 2).map(interest => (
                <span key={interest} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  {interest}
                </span>
              ))}
            </div>
          </>
        )}
        
        {!compact && reasons.length > 0 && (
          <p className="text-xs text-emerald-600 mt-2 line-clamp-1">
            {reasons[0]}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-stone-900">${item.price.toLocaleString()}</span>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}
