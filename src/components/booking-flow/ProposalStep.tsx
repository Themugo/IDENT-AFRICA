import React from 'react';
import { motion } from 'motion/react';
import { 
  Check, Clock, MapPin, Calendar, Users,
  ChevronDown, ChevronRight, Heart, Star
} from 'lucide-react';
import type { SafariProposal } from './LuxuryBookingFlow';

interface ProposalStepProps {
  proposal: SafariProposal;
  onAccept: () => void;
  onModify: () => void;
  isLoading: boolean;
}

export const ProposalStep: React.FC<ProposalStepProps> = ({ 
  proposal, 
  onAccept, 
  onModify,
  isLoading 
}) => {
  const [expandedDay, setExpandedDay] = React.useState<number | null>(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-full bg-[#4F6848]/20 flex items-center justify-center mx-auto mb-4"
        >
          <Star className="w-8 h-8 text-[#4F6848]" />
        </motion.div>
        <h2 className="font-cormorant text-3xl text-[#F4E8D5] font-light mb-2">
          Your Custom Safari Proposal
        </h2>
        <p className="text-[#D3C5AE]/70 text-sm">
          Crafted by our safari specialists based on your preferences
        </p>
      </div>

      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden h-48"
      >
        <img 
          src={proposal.image}
          alt={proposal.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008] via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-cormorant text-2xl text-[#F4E8D5] font-light">{proposal.title}</h3>
          <p className="text-[#D3C5AE]/80 text-sm">{proposal.subtitle}</p>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#2D2621] rounded-xl p-4 text-center border border-[#C89A4B]/20">
          <Calendar className="w-5 h-5 text-[#C89A4B] mx-auto mb-2" />
          <div className="font-cormorant text-lg text-[#F4E8D5]">{proposal.duration}</div>
          <div className="text-[10px] text-[#D3C5AE]/50 uppercase tracking-wider">Duration</div>
        </div>
        <div className="bg-[#2D2621] rounded-xl p-4 text-center border border-[#C89A4B]/20">
          <Users className="w-5 h-5 text-[#C89A4B] mx-auto mb-2" />
          <div className="font-cormorant text-lg text-[#F4E8D5]">2 Adults</div>
          <div className="text-[10px] text-[#D3C5AE]/50 uppercase tracking-wider">Travelers</div>
        </div>
        <div className="bg-[#2D2621] rounded-xl p-4 text-center border border-[#C89A4B]/20">
          <MapPin className="w-5 h-5 text-[#C89A4B] mx-auto mb-2" />
          <div className="font-cormorant text-lg text-[#F4E8D5]">Private</div>
          <div className="text-[10px] text-[#D3C5AE]/50 uppercase tracking-wider">Experience</div>
        </div>
      </div>

      {/* Highlights */}
      <div>
        <h4 className="text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
          Safari Highlights
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {proposal.highlights.map((highlight, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-[#D3C5AE]">
              <Check className="w-4 h-4 text-[#4F6848] flex-shrink-0" />
              {highlight}
            </div>
          ))}
        </div>
      </div>

      {/* Itinerary Preview */}
      <div>
        <h4 className="text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
          Your Itinerary
        </h4>
        <div className="space-y-2">
          {proposal.itinerary.slice(0, 3).map((day) => (
            <div 
              key={day.day}
              className="bg-[#2D2621] rounded-xl overflow-hidden border border-[#C89A4B]/20"
            >
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#C89A4B]/20 flex items-center justify-center text-[#C89A4B] font-cormorant text-sm">
                    {day.day}
                  </span>
                  <div>
                    <div className="font-serif text-[#F4E8D5]">{day.title}</div>
                    <div className="text-[10px] text-[#D3C5AE]/50">{day.accommodation}</div>
                  </div>
                </div>
                {expandedDay === day.day ? (
                  <ChevronDown className="w-5 h-5 text-[#C89A4B]" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-[#D3C5AE]/50" />
                )}
              </button>
              {expandedDay === day.day && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="px-4 pb-4 text-sm text-[#D3C5AE]/80"
                >
                  <p>{day.description}</p>
                  <div className="flex gap-2 mt-2">
                    {day.activities.map((act, i) => (
                      <span key={i} className="px-2 py-1 bg-[#1A1008] rounded text-xs">
                        {act}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          {proposal.itinerary.length > 3 && (
            <div className="text-center py-2 text-xs text-[#D3C5AE]/50">
              + {proposal.itinerary.length - 3} more days
            </div>
          )}
        </div>
      </div>

      {/* Included */}
      <div>
        <h4 className="text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
          What's Included
        </h4>
        <div className="flex flex-wrap gap-2">
          {proposal.included.map((item, idx) => (
            <span key={idx} className="px-3 py-1 bg-[#4F6848]/20 rounded-full text-xs text-[#4F6848]">
              ✓ {item}
            </span>
          ))}
        </div>
      </div>

      {/* Expert */}
      <div className="bg-[#2D2621] rounded-xl p-4 border border-[#C89A4B]/20">
        <div className="flex items-center gap-4">
          <img 
            src={proposal.expert.image}
            alt={proposal.expert.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#C89A4B]/30"
          />
          <div className="flex-1">
            <div className="font-serif text-[#F4E8D5]">{proposal.expert.name}</div>
            <div className="text-xs text-[#C89A4B]">{proposal.expert.title}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[#C89A4B]">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm">Your Curator</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Preview */}
      <div className="bg-gradient-to-r from-[#C89A4B]/10 to-[#4F6848]/10 rounded-xl p-6 border border-[#C89A4B]/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#D3C5AE]/70">Price per person</span>
          <span className="font-cormorant text-xl text-[#F4E8D5]">
            ${proposal.price.perPerson.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-[#C89A4B]/20">
          <span className="text-[#F4E8D5] font-medium">Total for your party</span>
          <span className="font-cormorant text-2xl text-[#C89A4B]">
            ${proposal.price.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onModify}
          className="flex-1 py-4 px-6 bg-[#2D2621] text-[#D3C5AE] rounded-xl font-cinzel text-xs tracking-wider uppercase hover:bg-[#3D3631] transition-colors"
        >
          Modify Request
        </button>
        <motion.button
          onClick={onAccept}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-4 px-6 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#D6B06A] transition-colors"
        >
          Accept Proposal
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

export default ProposalStep;
