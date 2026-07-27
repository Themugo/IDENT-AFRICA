import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { InquiryStep } from './InquiryStep';
import { ProposalStep } from './ProposalStep';
import { ExpertReviewStep } from './ExpertReviewStep';
import { DepositStep } from './DepositStep';
import { ConfirmationStep } from './ConfirmationStep';
import { 
  MessageCircle, FileText, UserCheck, CreditCard, CheckCircle,
  ChevronRight, ChevronLeft
} from 'lucide-react';

export type BookingStep = 'inquiry' | 'proposal' | 'expert' | 'deposit' | 'confirmation';

export interface BookingInquiry {
  destination: string;
  travelDates: {
    start: string;
    end: string;
  };
  travelers: {
    adults: number;
    children: number;
  };
  accommodation: 'luxury' | 'premium' | 'classic';
  interests: string[];
  specialOccasion?: string;
  dietaryRequirements?: string;
  mobilityRequirements?: string;
  message: string;
}

export interface SafariProposal {
  title: string;
  subtitle: string;
  duration: string;
  highlights: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    accommodation: string;
    activities: string[];
  }[];
  included: string[];
  price: {
    base: number;
    perPerson: number;
    total: number;
    currency: string;
  };
  image: string;
  expert: {
    name: string;
    title: string;
    image: string;
  };
}

export const LuxuryBookingFlow: React.FC = () => {
  const { 
    bookingModalOpen, 
    bookingModalTarget,
    closeBookingModal,
    formatPrice,
    navigateTo,
    user 
  } = useApp();

  const [currentStep, setCurrentStep] = useState<BookingStep>('inquiry');
  const [inquiry, setInquiry] = useState<BookingInquiry | null>(null);
  const [proposal, setProposal] = useState<SafariProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(1);

  const steps: { id: BookingStep; label: string; icon: React.ReactNode }[] = [
    { id: 'inquiry', label: 'Inquiry', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'proposal', label: 'Proposal', icon: <FileText className="w-5 h-5" /> },
    { id: 'expert', label: 'Expert Review', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'deposit', label: 'Deposit', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'confirmation', label: 'Confirmation', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setDirection(1);
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setDirection(-1);
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const handleInquirySubmit = (data: BookingInquiry) => {
    setInquiry(data);
    setIsLoading(true);
    
    // Simulate AI proposal generation
    setTimeout(() => {
      const generatedProposal: SafariProposal = {
        title: `Exclusive ${data.destination} Safari`,
        subtitle: 'Curated for your party by our safari specialists',
        duration: `${Math.ceil((new Date(data.travelDates.end).getTime() - new Date(data.travelDates.start).getTime()) / (1000 * 60 * 60 * 24))} Days`,
        highlights: [
          'Private game drives with expert rangers',
          'Exclusive access to conservation areas',
          'Luxury tented camp or lodge accommodation',
          'Bush dinners under the African stars',
          'Optional hot air balloon experience',
        ],
        itinerary: generateItinerary(data),
        included: [
          'All accommodations',
          'All meals and beverages',
          'Private game drives',
          'Park fees and conservation levies',
          'Airport transfers',
          'Dedicated safari guide',
        ],
        price: {
          base: 2500 + Math.floor(Math.random() * 1500),
          perPerson: 3500 + Math.floor(Math.random() * 2000),
          total: (3500 + Math.floor(Math.random() * 2000)) * data.travelers.adults,
          currency: 'USD',
        },
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
        expert: {
          name: 'James Kioko',
          title: 'Senior Safari Curator',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        },
      };
      
      setProposal(generatedProposal);
      setIsLoading(false);
      goToNextStep();
    }, 2500);
  };

  const generateItinerary = (data: BookingInquiry) => {
    const days = Math.ceil((new Date(data.travelDates.end).getTime() - new Date(data.travelDates.start).getTime()) / (1000 * 60 * 60 * 24));
    const itinerary = [];
    
    const activities = [
      { title: 'Arrival & Welcome', desc: 'Private airstrip transfer to camp. Welcome ceremony with sundowners overlooking the plains.', acc: 'Luxury Tented Camp' },
      { title: 'Morning Game Drive', desc: 'Early morning safari with experienced tracker. Big cat sightings and elephant herds.', acc: 'Luxury Tented Camp' },
      { title: 'Cultural Immersion', desc: 'Visit to local Maasai village. Learn traditional crafts and dances.', acc: 'Luxury Tented Camp' },
      { title: 'Hot Air Balloon', desc: 'Sunrise balloon safari over the Serengeti. Champagne breakfast in the bush.', acc: 'Luxury Tented Camp' },
      { title: 'Walking Safari', desc: 'Guided bush walk with armed ranger. Track wildlife on foot.', acc: 'Fly Camp' },
      { title: 'River Crossing', desc: 'Witness the great migration at the Mara River. Predator action guaranteed.', acc: 'Riverside Lodge' },
      { title: 'Conservation Visit', desc: 'Tour the anti-poaching unit and wildlife rehabilitation center.', acc: 'Riverside Lodge' },
      { title: 'Farewell Safari', desc: 'Final morning game drive. Transfer to airstrip for departure.', acc: 'Riverside Lodge' },
    ];

    for (let i = 0; i < Math.min(days, 8); i++) {
      itinerary.push({
        day: i + 1,
        ...activities[i % activities.length],
        activities: ['Game Drive', 'Photography', 'Nature Walk'].slice(0, (i % 3) + 1),
      });
    }

    return itinerary;
  };

  const handleProposalAccept = () => {
    goToNextStep();
  };

  const handleDepositComplete = () => {
    goToNextStep();
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  if (!bookingModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0806]/95 backdrop-blur-lg">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C89A4B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative w-full max-w-4xl mx-4 my-8 bg-[#1A1008] rounded-3xl overflow-hidden border border-[#C89A4B]/30 shadow-2xl">
        
        {/* Progress Header */}
        <div className="bg-[#2D2621] px-8 py-6 border-b border-[#C89A4B]/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C89A4B]/20 flex items-center justify-center">
                <span className="font-cormorant text-xl text-[#C89A4B]">IA</span>
              </div>
              <div>
                <h3 className="font-serif text-[#F4E8D5]">Book Your Safari</h3>
                <p className="text-xs text-[#D3C5AE]/60">Guided by experts, crafted for you</p>
              </div>
            </div>
            
            {/* Close */}
            <button
              onClick={closeBookingModal}
              className="p-2 text-[#D3C5AE]/60 hover:text-[#F4E8D5] transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      idx < currentStepIndex 
                        ? 'bg-[#4F6848] text-[#F4E8D5]' 
                        : idx === currentStepIndex 
                          ? 'bg-[#C89A4B] text-[#1a1008]' 
                          : 'bg-[#2D2621] text-[#D3C5AE]/40 border border-[#2D2621]'
                    }`}
                  >
                    {idx < currentStepIndex ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className={`hidden sm:block text-xs font-cinzel ${
                    idx <= currentStepIndex ? 'text-[#F4E8D5]' : 'text-[#D3C5AE]/40'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div 
                    className={`flex-1 h-px mx-4 ${
                      idx < currentStepIndex ? 'bg-[#4F6848]' : 'bg-[#2D2621]'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="relative min-h-[500px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="p-8"
            >
              {currentStep === 'inquiry' && (
                <InquiryStep 
                  onSubmit={handleInquirySubmit}
                  isLoading={isLoading}
                  targetInfo={bookingModalTarget}
                />
              )}
              
              {currentStep === 'proposal' && proposal && (
                <ProposalStep 
                  proposal={proposal}
                  onAccept={handleProposalAccept}
                  onModify={() => goToPrevStep()}
                  isLoading={isLoading}
                />
              )}
              
              {currentStep === 'expert' && proposal && (
                <ExpertReviewStep
                  proposal={proposal}
                  onContinue={goToNextStep}
                  onModify={() => setCurrentStep('inquiry')}
                />
              )}
              
              {currentStep === 'deposit' && proposal && (
                <DepositStep
                  proposal={proposal}
                  onComplete={handleDepositComplete}
                  formatPrice={formatPrice}
                />
              )}
              
              {currentStep === 'confirmation' && proposal && inquiry && (
                <ConfirmationStep
                  proposal={proposal}
                  inquiry={inquiry}
                  onClose={closeBookingModal}
                  navigateTo={navigateTo}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LuxuryBookingFlow;
