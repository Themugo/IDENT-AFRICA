import React from 'react';
import { motion } from 'motion/react';
import { 
  Check, Calendar, Users, MapPin, Plane,
  Mail, Phone, Download, MessageCircle, PartyPopper
} from 'lucide-react';
import type { SafariProposal, BookingInquiry } from './LuxuryBookingFlow';

interface ConfirmationStepProps {
  proposal: SafariProposal;
  inquiry: BookingInquiry;
  onClose: () => void;
  navigateTo: (page: string) => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ 
  proposal, 
  inquiry,
  onClose,
  navigateTo 
}) => {
  const bookingRef = `IA-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="space-y-8">
      {/* Celebration Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="relative inline-block mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C89A4B] to-[#D6B06A] flex items-center justify-center">
            <PartyPopper className="w-12 h-12 text-[#1a1008]" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#4F6848] flex items-center justify-center">
            <Check className="w-5 h-5 text-[#F4E8D5]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="font-cormorant text-4xl text-[#F4E8D5] font-light mb-2">
            Welcome to Your Safari
          </h2>
          <p className="text-[#D3C5AE]/70 text-lg mb-4">
            Asante! Your adventure awaits
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4F6848]/20 rounded-full">
            <span className="text-[10px] font-cinzel text-[#4F6848] uppercase tracking-wider">Booking Reference</span>
            <span className="font-mono text-[#F4E8D5] font-bold">{bookingRef}</span>
          </div>
        </motion.div>
      </div>

      {/* What's Next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#2D2621] rounded-2xl p-6 border border-[#C89A4B]/20"
      >
        <h3 className="font-serif text-lg text-[#F4E8D5] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#C89A4B] text-[#1a1008] flex items-center justify-center text-xs">1</span>
          What Happens Next
        </h3>
        <div className="space-y-4">
          {[
            { icon: Mail, title: 'Confirmation Email', desc: 'Detailed itinerary sent to your inbox within the hour', time: 'Within 1 hour' },
            { icon: Phone, title: 'Personal Call', desc: `${proposal.expert.name} will call to introduce themselves`, time: 'Within 24 hours' },
            { icon: Calendar, title: 'Pre-Safari Briefing', desc: 'Video call with your guide to discuss expectations', time: '1 week before' },
            { icon: Plane, title: 'Airport Transfer', desc: 'Private car meets you at arrivals', time: 'Travel day' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1A1008] flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-[#C89A4B]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-[#F4E8D5]">{item.title}</span>
                  <span className="text-xs text-[#C89A4B]">{item.time}</span>
                </div>
                <p className="text-sm text-[#D3C5AE]/70">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Safari Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-[#1A1008] rounded-2xl overflow-hidden border border-[#C89A4B]/20"
      >
        <div className="relative h-32">
          <img 
            src={proposal.image}
            alt={proposal.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1008] to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h3 className="font-cormorant text-xl text-[#F4E8D5]">{proposal.title}</h3>
            <p className="text-xs text-[#D3C5AE]/70">{proposal.duration}</p>
          </div>
        </div>
        
        <div className="p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <Calendar className="w-5 h-5 text-[#C89A4B] mx-auto mb-1" />
            <div className="text-xs text-[#D3C5AE]">{inquiry.travelDates.start}</div>
            <div className="text-[10px] text-[#D3C5AE]/50">Start Date</div>
          </div>
          <div className="text-center">
            <Users className="w-5 h-5 text-[#C89A4B] mx-auto mb-1" />
            <div className="text-xs text-[#D3C5AE]">
              {inquiry.travelers.adults + inquiry.travelers.children} Guests
            </div>
            <div className="text-[10px] text-[#D3C5AE]/50">Party Size</div>
          </div>
          <div className="text-center">
            <MapPin className="w-5 h-5 text-[#C89A4B] mx-auto mb-1" />
            <div className="text-xs text-[#D3C5AE]">{inquiry.destination.split(',')[0]}</div>
            <div className="text-[10px] text-[#D3C5AE]/50">Destination</div>
          </div>
        </div>
      </motion.div>

      {/* Your Expert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-[#2D2621] rounded-xl p-4 flex items-center gap-4 border border-[#C89A4B]/20"
      >
        <img 
          src={proposal.expert.image}
          alt={proposal.expert.name}
          className="w-14 h-14 rounded-full object-cover border-2 border-[#C89A4B]/30"
        />
        <div className="flex-1">
          <div className="font-serif text-[#F4E8D5]">{proposal.expert.name}</div>
          <div className="text-xs text-[#C89A4B]">{proposal.expert.title}</div>
        </div>
        <button className="p-3 bg-[#4F6848] rounded-xl text-[#F4E8D5]">
          <MessageCircle className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="space-y-3"
      >
        <button className="w-full py-4 px-6 bg-[#2D2621] text-[#F4E8D5] rounded-xl font-cinzel text-xs tracking-wider uppercase flex items-center justify-center gap-3 hover:bg-[#3D3631] transition-colors">
          <Download className="w-5 h-5" />
          Download Itinerary PDF
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigateTo('user-dashboard')}
            className="flex-1 py-4 px-6 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#D6B06A] transition-colors"
          >
            View My Safaris
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 px-6 border border-[#C89A4B]/30 text-[#F4E8D5] rounded-xl font-cinzel text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#2D2621] transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>

      {/* Footer Note */}
      <p className="text-center text-xs text-[#D3C5AE]/50">
        Questions? Contact us at <span className="text-[#C89A4B]">hello@identafrica.com</span> or <span className="text-[#C89A4B]">+254 20 712 8800</span>
      </p>
    </div>
  );
};

export default ConfirmationStep;
