import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, Users, MapPin, Sparkles, Heart, Star,
  ChevronRight, Check
} from 'lucide-react';
import type { BookingInquiry } from './LuxuryBookingFlow';

interface InquiryStepProps {
  onSubmit: (data: BookingInquiry) => void;
  isLoading: boolean;
  targetInfo?: any;
}

const interests = [
  { id: 'big-five', label: 'Big Five Safari', icon: '🦁' },
  { id: 'migration', label: 'Great Migration', icon: '🦏' },
  { id: 'gorillas', label: 'Gorilla Trekking', icon: '🦍' },
  { id: 'photography', label: 'Photography', icon: '📷' },
  { id: 'culture', label: 'Cultural Immersion', icon: '🎭' },
  { id: 'birds', label: 'Bird Watching', icon: '🦅' },
  { id: 'bush-dining', label: 'Bush Dining', icon: '🍷' },
  { id: 'balloon', label: 'Hot Air Balloon', icon: '🎈' },
];

const destinations = [
  'Masai Mara, Kenya',
  'Serengeti, Tanzania',
  'Rwanda (Gorilla Trekking)',
  'Amboseli, Kenya',
  'Ngorongoro, Tanzania',
  'Samburu, Kenya',
  'Lake Nakuru, Kenya',
  'Zanzibar, Tanzania',
];

const occasions = [
  'Honeymoon',
  'Anniversary',
  'Family Reunion',
  'Milestone Birthday',
  'Corporate Retreat',
  'Just Because',
];

export const InquiryStep: React.FC<InquiryStepProps> = ({ onSubmit, isLoading, targetInfo }) => {
  const [formData, setFormData] = useState<Partial<BookingInquiry>>({
    destination: targetInfo?.name || '',
    travelDates: {
      start: '',
      end: '',
    },
    travelers: {
      adults: 2,
      children: 0,
    },
    accommodation: 'luxury',
    interests: [],
    specialOccasion: '',
    message: '',
  });

  const toggleInterest = (id: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests?.includes(id)
        ? prev.interests.filter(i => i !== id)
        : [...(prev.interests || []), id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as BookingInquiry);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-16 h-16 rounded-full bg-[#C89A4B]/20 flex items-center justify-center mx-auto mb-4"
        >
          <MapPin className="w-8 h-8 text-[#C89A4B]" />
        </motion.div>
        <h2 className="font-cormorant text-3xl text-[#F4E8D5] font-light mb-2">
          Tell Us About Your Dream Safari
        </h2>
        <p className="text-[#D3C5AE]/70 text-sm">
          Our safari specialists will craft a personalized proposal within 24 hours
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Destination */}
        <div>
          <label className="flex items-center gap-2 text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
            <MapPin className="w-4 h-4" />
            Preferred Destination
          </label>
          <div className="relative">
            <select
              value={formData.destination}
              onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
              className="w-full p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none transition-colors appearance-none"
              required
            >
              <option value="">Select your destination...</option>
              {destinations.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C89A4B]/50 rotate-90 pointer-events-none" />
          </div>
        </div>

        {/* Travel Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
              <Calendar className="w-4 h-4" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.travelDates?.start}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                travelDates: { ...prev.travelDates!, start: e.target.value }
              }))}
              className="w-full p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
              <Calendar className="w-4 h-4" />
              End Date
            </label>
            <input
              type="date"
              value={formData.travelDates?.end}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                travelDates: { ...prev.travelDates!, end: e.target.value }
              }))}
              className="w-full p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Travelers */}
        <div>
          <label className="flex items-center gap-2 text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
            <Users className="w-4 h-4" />
            Number of Travelers
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2D2621] rounded-xl p-4 border border-[#C89A4B]/30">
              <span className="text-[#D3C5AE]/60 text-xs block mb-2">Adults</span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    travelers: { ...prev.travelers!, adults: Math.max(1, (prev.travelers?.adults || 1) - 1) }
                  }))}
                  className="w-10 h-10 rounded-full bg-[#1A1008] text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-colors"
                >
                  −
                </button>
                <span className="font-cormorant text-2xl text-[#F4E8D5]">
                  {formData.travelers?.adults}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    travelers: { ...prev.travelers!, adults: (prev.travelers?.adults || 1) + 1 }
                  }))}
                  className="w-10 h-10 rounded-full bg-[#1A1008] text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="bg-[#2D2621] rounded-xl p-4 border border-[#C89A4B]/30">
              <span className="text-[#D3C5AE]/60 text-xs block mb-2">Children</span>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    travelers: { ...prev.travelers!, children: Math.max(0, (prev.travelers?.children || 0) - 1) }
                  }))}
                  className="w-10 h-10 rounded-full bg-[#1A1008] text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-colors"
                >
                  −
                </button>
                <span className="font-cormorant text-2xl text-[#F4E8D5]">
                  {formData.travelers?.children}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    travelers: { ...prev.travelers!, children: (prev.travelers?.children || 0) + 1 }
                  }))}
                  className="w-10 h-10 rounded-full bg-[#1A1008] text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Accommodation Level */}
        <div>
          <label className="flex items-center gap-2 text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
            <Sparkles className="w-4 h-4" />
            Accommodation Style
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['luxury', 'premium', 'classic'] as const).map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, accommodation: level }))}
                className={`p-4 rounded-xl border transition-all ${
                  formData.accommodation === level
                    ? 'bg-[#C89A4B]/20 border-[#C89A4B] text-[#F4E8D5]'
                    : 'bg-[#2D2621] border-[#C89A4B]/30 text-[#D3C5AE]/70 hover:border-[#C89A4B]/50'
                }`}
              >
                <span className="font-cinzel text-xs uppercase tracking-wider">
                  {level}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="flex items-center gap-2 text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
            <Star className="w-4 h-4" />
            Your Interests
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {interests.map(interest => (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${
                  formData.interests?.includes(interest.id)
                    ? 'bg-[#C89A4B]/20 border-[#C89A4B] text-[#F4E8D5]'
                    : 'bg-[#2D2621] border-[#C89A4B]/30 text-[#D3C5AE]/70 hover:border-[#C89A4B]/50'
                }`}
              >
                <span>{interest.icon}</span>
                <span className="text-xs">{interest.label}</span>
                {formData.interests?.includes(interest.id) && (
                  <Check className="w-4 h-4 text-[#C89A4B] ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Special Occasion */}
        <div>
          <label className="flex items-center gap-2 text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
            <Heart className="w-4 h-4" />
            Special Occasion? (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {occasions.map(occasion => (
              <button
                key={occasion}
                type="button"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  specialOccasion: prev.specialOccasion === occasion ? '' : occasion 
                }))}
                className={`px-4 py-2 rounded-full text-xs transition-all ${
                  formData.specialOccasion === occasion
                    ? 'bg-[#C89A4B] text-[#1a1008]'
                    : 'bg-[#2D2621] text-[#D3C5AE]/70 hover:text-[#F4E8D5]'
                }`}
              >
                {occasion}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="flex items-center gap-2 text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-3">
            <Sparkles className="w-4 h-4" />
            Anything Special? (Optional)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Dietary requirements, mobility needs, special celebrations..."
            className="w-full h-24 p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none transition-colors resize-none placeholder:text-[#D3C5AE]/30"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 px-6 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel text-xs tracking-wider uppercase flex items-center justify-center gap-3 hover:bg-[#D6B06A] transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#1a1008]/30 border-t-[#1a1008] rounded-full animate-spin" />
              Creating Your Proposal...
            </>
          ) : (
            <>
              Request My Safari Proposal
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default InquiryStep;
