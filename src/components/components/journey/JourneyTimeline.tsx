'use client';

/**
 * Journey Timeline Component
 * 
 * Displays customer progress through the travel journey.
 */

import React from 'react';
import { Check, Circle, ArrowRight, MapPin, Calendar, CreditCard, Plane, Star } from 'lucide-react';
import { JourneyEntry, JourneyStage, JOURNEY_STAGES, STAGE_COLORS, formatStageLabel } from '../../services/journey/types';

interface JourneyTimelineProps {
  currentStage: JourneyStage | null;
  completedStages: JourneyStage[];
  entries: JourneyEntry[];
  showDetails?: boolean;
  compact?: boolean;
  onStageClick?: (stage: JourneyStage) => void;
}

export default function JourneyTimeline({
  currentStage,
  completedStages,
  entries,
  showDetails = true,
  compact = false,
  onStageClick,
}: JourneyTimelineProps) {
  return (
    <div className={`${compact ? 'space-y-4' : 'space-y-8'}`}>
      {JOURNEY_STAGES.map((stageInfo, index) => {
        const isCompleted = completedStages.includes(stageInfo.stage);
        const isCurrent = currentStage === stageInfo.stage;
        const isPending = !isCompleted && !isCurrent;
        
        // Find entry for this stage
        const stageEntry = entries.find(e => e.stage === stageInfo.stage);
        
        return (
          <div key={stageInfo.stage} className="relative">
            {/* Connector line */}
            {index < JOURNEY_STAGES.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-stone-200">
                {!isPending && (
                  <div 
                    className="absolute inset-0 bg-amber-500"
                    style={{ height: isCurrent ? '50%' : '100%' }}
                  />
                )}
              </div>
            )}
            
            {/* Stage card */}
            <div 
              className={`relative flex items-start gap-4 ${
                isPending ? 'opacity-50' : ''
              } ${onStageClick ? 'cursor-pointer hover:bg-stone-50' : ''} rounded-lg p-2 transition-colors`}
              onClick={() => onStageClick?.(stageInfo.stage)}
            >
              {/* Status icon */}
              <div 
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : isCurrent 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-stone-200 text-stone-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <span className="text-lg">{stageInfo.icon}</span>
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${
                    isCurrent ? 'text-amber-600' : isCompleted ? 'text-emerald-600' : 'text-stone-600'
                  }`}>
                    {stageInfo.title}
                  </h3>
                  {isCurrent && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                
                {!compact && (
                  <p className="text-sm text-stone-500 mt-1">
                    {stageInfo.description}
                  </p>
                )}
                
                {/* Stage details */}
                {showDetails && stageEntry && (
                  <StageDetails entry={stageEntry} stageInfo={stageInfo} />
                )}
                
                {/* Next action */}
                {isCurrent && !compact && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                    <span className="text-stone-600">Next: <span className="font-medium">{stageInfo.nextAction}</span></span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Stage details component
interface StageDetailsProps {
  entry: JourneyEntry;
  stageInfo: { icon: string; title: string };
}

function StageDetails({ entry, stageInfo }: StageDetailsProps) {
  const { stage, metadata, entityType, entityId } = entry;
  
  const details: { icon: React.ReactNode; label: string; value: string }[] = [];
  
  // Discovery details
  if (stage === 'DISCOVERY' && metadata.searchQuery) {
    details.push({
      icon: <MapPin className="w-4 h-4" />,
      label: 'Searched for',
      value: metadata.searchQuery,
    });
  }
  
  // Planning details
  if (stage === 'PLANNING') {
    if (metadata.plannedDuration) {
      details.push({
        icon: <Calendar className="w-4 h-4" />,
        label: 'Duration',
        value: `${metadata.plannedDuration} days`,
      });
    }
    if (metadata.plannedBudget) {
      details.push({
        icon: <span className="text-sm">$</span>,
        label: 'Budget',
        value: `$${metadata.plannedBudget.toLocaleString()}`,
      });
    }
  }
  
  // Booking details
  if (stage === 'BOOKING' && metadata.selectedDates) {
    details.push({
      icon: <Calendar className="w-4 h-4" />,
      label: 'Travel dates',
      value: `${new Date(metadata.selectedDates.start).toLocaleDateString()} - ${new Date(metadata.selectedDates.end).toLocaleDateString()}`,
    });
  }
  if (stage === 'BOOKING' && metadata.travelers) {
    details.push({
      icon: <span className="text-sm">👥</span>,
      label: 'Travelers',
      value: `${metadata.travelers} ${metadata.travelers === 1 ? 'person' : 'people'}`,
    });
  }
  
  // Payment details
  if (stage === 'PAYMENT' && metadata.amount) {
    details.push({
      icon: <CreditCard className="w-4 h-4" />,
      label: 'Amount paid',
      value: `$${metadata.amount.toLocaleString()}`,
    });
  }
  
  // Travel details
  if (stage === 'TRAVEL' && metadata.accommodation) {
    details.push({
      icon: <Plane className="w-4 h-4" />,
      label: 'Accommodation',
      value: metadata.accommodation,
    });
  }
  
  // Post-travel details
  if (stage === 'POST_TRAVEL' && metadata.rating) {
    details.push({
      icon: <Star className="w-4 h-4" />,
      label: 'Your rating',
      value: `${metadata.rating}/5 stars`,
    });
  }
  
  if (details.length === 0) return null;
  
  return (
    <div className="mt-3 flex flex-wrap gap-4">
      {details.map((detail, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <span className="text-stone-400">{detail.icon}</span>
          <span className="text-stone-500">{detail.label}:</span>
          <span className="font-medium text-stone-700">{detail.value}</span>
        </div>
      ))}
    </div>
  );
}

// Progress bar version
interface JourneyProgressBarProps {
  currentStage: JourneyStage | null;
  progress: number;
  stageInfo: { title: string; nextAction: string };
}

export function JourneyProgressBar({ currentStage, progress, stageInfo }: JourneyProgressBarProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-stone-500">Your Journey</p>
          <h3 className="font-semibold text-stone-900">
            {currentStage ? formatStageLabel(currentStage) : 'Not started'}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-amber-500">{progress}%</p>
          <p className="text-sm text-stone-500">Complete</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Next action */}
      {stageInfo.nextAction && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="text-stone-500">Next:</span>
          <span className="font-medium text-stone-700">{stageInfo.nextAction}</span>
        </div>
      )}
    </div>
  );
}

// Compact summary card
interface JourneySummaryCardProps {
  currentStage: JourneyStage | null;
  progress: number;
  entityName?: string;
  onViewDetails?: () => void;
}

export function JourneySummaryCard({ 
  currentStage, 
  progress, 
  entityName,
  onViewDetails 
}: JourneySummaryCardProps) {
  if (!currentStage) {
    return (
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
        <h3 className="font-semibold text-lg">Start Your Journey</h3>
        <p className="text-amber-100 mt-1">Explore destinations and plan your African adventure</p>
        <button className="mt-4 px-4 py-2 bg-white text-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors">
          Get Started
        </button>
      </div>
    );
  }
  
  const stageInfo = JOURNEY_STAGES.find(s => s.stage === currentStage);
  
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div 
        className="p-4"
        style={{ backgroundColor: `${STAGE_COLORS[currentStage]}15` }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{stageInfo?.icon}</span>
          <div>
            <p className="text-sm text-stone-500">Current Stage</p>
            <h3 className="font-semibold text-stone-900">{stageInfo?.title}</h3>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: STAGE_COLORS[currentStage],
                }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-stone-600">{progress}%</span>
        </div>
        
        {/* Details */}
        {entityName && (
          <p className="text-sm text-stone-600 mb-3">
            <span className="text-stone-500">Focus:</span> {entityName}
          </p>
        )}
        
        {/* Next action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <ArrowRight className="w-4 h-4" />
            <span>{stageInfo?.nextAction}</span>
          </div>
          
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-sm font-medium text-amber-600 hover:text-amber-700"
            >
              View details
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
