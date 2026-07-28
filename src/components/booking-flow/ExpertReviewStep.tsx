import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  UserCheck, Clock, MessageCircle, Check, Star,
  Shield, Award, MapPin
} from 'lucide-react';
import type { SafariProposal } from './LuxuryBookingFlow';

interface ExpertReviewStepProps {
  proposal: SafariProposal;
  onContinue: () => void;
  onModify: () => void;
}

export const ExpertReviewStep: React.FC<ExpertReviewStepProps> = ({ 
  proposal, 
  onContinue,
  onModify 
}) => {
  const [isReviewing, setIsReviewing] = useState(true);
  const [reviewProgress, setReviewProgress] = useState(0);
  const [messages, setMessages] = useState<{from: 'expert' | 'system'; text: string}[]>([
    { from: 'system', text: 'Your proposal is being reviewed by ' + proposal.expert.name },
  ]);

  useEffect(() => {
    if (isReviewing) {
      const interval = setInterval(() => {
        setReviewProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsReviewing(false);
            setMessages(msgs => [...msgs, {
              from: 'expert',
              text: `I've personally reviewed your safari request. I've secured preferred accommodations at ${proposal.itinerary[0].accommodation} and arranged exclusive access to private game drives. This will be an exceptional experience!`
            }]);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      // Add progress messages
      setTimeout(() => {
        setMessages(msgs => [...msgs, {
          from: 'system',
          text: 'Checking lodge availability...'
        }]);
      }, 2000);

      setTimeout(() => {
        setMessages(msgs => [...msgs, {
          from: 'system',
          text: 'Confirming conservation area permits...'
        }]);
      }, 4000);

      setTimeout(() => {
        setMessages(msgs => [...msgs, {
          from: 'system',
          text: 'Arranging your private guide...'
        }]);
      }, 6000);

      return () => clearInterval(interval);
    }
  }, [isReviewing]);

  const expertCredentials = [
    { icon: <Award className="w-4 h-4" />, text: '22 Years Safari Experience' },
    { icon: <Shield className="w-4 h-4" />, text: 'Licensed Wildlife Guide' },
    { icon: <Star className="w-4 h-4" />, text: '4.98 Guest Rating' },
    { icon: <MapPin className="w-4 h-4" />, text: 'East Africa Specialist' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full bg-[#C89A4B]/20 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img 
              src={proposal.expert.image}
              alt={proposal.expert.name}
              className="w-full h-full object-cover"
            />
          </div>
          {isReviewing && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#4F6848] rounded-full text-[10px] text-[#F4E8D5] flex items-center gap-1">
              <div className="w-2 h-2 bg-[#F4E8D5] rounded-full animate-pulse" />
              Reviewing
            </div>
          )}
        </motion.div>
        <h2 className="font-cormorant text-3xl text-[#F4E8D5] font-light mb-2">
          {isReviewing ? 'Expert Review In Progress' : 'Expert Review Complete'}
        </h2>
        <p className="text-[#D3C5AE]/70 text-sm">
          {isReviewing 
            ? `${proposal.expert.name} is personally verifying your itinerary`
            : `${proposal.expert.name} has approved your safari`
          }
        </p>
      </div>

      {/* Expert Profile */}
      <div className="bg-[#2D2621] rounded-2xl p-6 border border-[#C89A4B]/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img 
              src={proposal.expert.image}
              alt={proposal.expert.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#C89A4B]/30"
            />
            {!isReviewing && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#4F6848] rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-[#F4E8D5]" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-serif text-xl text-[#F4E8D5]">{proposal.expert.name}</div>
            <div className="text-sm text-[#C89A4B]">{proposal.expert.title}</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[#C89A4B]">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-cormorant text-xl">4.98</span>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-2 gap-2">
          {expertCredentials.map((cred, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-[#D3C5AE]">
              <span className="text-[#4F6848]">{cred.icon}</span>
              {cred.text}
            </div>
          ))}
        </div>
      </div>

      {/* Review Progress */}
      {isReviewing && (
        <div className="space-y-4">
          <div className="h-2 bg-[#2D2621] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${reviewProgress}%` }}
              className="h-full bg-gradient-to-r from-[#C89A4B] to-[#4F6848]"
            />
          </div>
          
          {/* Live Updates */}
          <div className="bg-[#1A1008] rounded-xl p-4 space-y-3 max-h-40 overflow-y-auto">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${
                  msg.from === 'expert' ? 'flex-row-reverse' : ''
                }`}
              >
                {msg.from === 'system' && (
                  <div className="w-6 h-6 rounded-full bg-[#2D2621] flex items-center justify-center">
                    <Clock className="w-3 h-3 text-[#C89A4B]" />
                  </div>
                )}
                <div className={`flex-1 text-sm ${
                  msg.from === 'system' ? 'text-[#D3C5AE]/70' : 'text-[#F4E8D5]'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Expert Message */}
      {!isReviewing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1A1008] rounded-2xl p-6 border border-[#4F6848]/30"
        >
          <div className="flex items-start gap-4">
            <img 
              src={proposal.expert.image}
              alt={proposal.expert.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-serif text-[#F4E8D5]">{proposal.expert.name}</span>
                <span className="px-2 py-0.5 bg-[#4F6848] rounded-full text-[10px] text-[#F4E8D5] flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>
              <p className="text-[#D3C5AE]/80 leading-relaxed">
                {messages[messages.length - 1].text}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Verified Items */}
      {!isReviewing && (
        <div className="space-y-3">
          <h4 className="text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase">
            Verified & Secured
          </h4>
          {[
            'Preferred lodge accommodation confirmed',
            'Private game drive permits secured',
            'Expert ranger assigned to your party',
            'Conservation area access arranged',
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm text-[#D3C5AE]">
              <div className="w-6 h-6 rounded-full bg-[#4F6848]/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-[#4F6848]" />
              </div>
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {!isReviewing && (
        <div className="flex gap-4">
          <button
            onClick={onModify}
            className="flex-1 py-4 px-6 bg-[#2D2621] text-[#D3C5AE] rounded-xl font-cinzel text-xs tracking-wider uppercase hover:bg-[#3D3631] transition-colors"
          >
            Modify Anything
          </button>
          <motion.button
            onClick={onContinue}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 px-6 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#D6B06A] transition-colors"
          >
            Continue to Payment
            <MessageCircle className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default ExpertReviewStep;
