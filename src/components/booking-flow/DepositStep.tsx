import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CreditCard, Lock, Check, Shield, ChevronRight,
  Smartphone, Building2
} from 'lucide-react';
import type { SafariProposal } from './LuxuryBookingFlow';

interface DepositStepProps {
  proposal: SafariProposal;
  onComplete: () => void;
  formatPrice: (price: number) => string;
}

export const DepositStep: React.FC<DepositStepProps> = ({ 
  proposal, 
  onComplete,
  formatPrice 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mpesa' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const depositAmount = Math.round(proposal.price.total * 0.3);
  const balanceAmount = proposal.price.total - depositAmount;

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      setTimeout(onComplete, 1500);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-full bg-[#C89A4B]/20 flex items-center justify-center mx-auto mb-4"
        >
          <CreditCard className="w-8 h-8 text-[#C89A4B]" />
        </motion.div>
        <h2 className="font-cormorant text-3xl text-[#F4E8D5] font-light mb-2">
          Secure Your Safari
        </h2>
        <p className="text-[#D3C5AE]/70 text-sm">
          A 30% deposit holds your reservation. The balance is due 30 days before departure.
        </p>
      </div>

      {/* Price Breakdown */}
      <div className="bg-gradient-to-r from-[#C89A4B]/10 to-transparent rounded-2xl p-6 border border-[#C89A4B]/30">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#D3C5AE]/70">Safari Package</span>
            <span className="text-[#F4E8D5]">{formatPrice(proposal.price.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#D3C5AE]/70">Deposit (30%)</span>
            <span className="text-[#4F6848]">-{formatPrice(depositAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#D3C5AE]/70">Balance Due (30 days prior)</span>
            <span className="text-[#F4E8D5]">{formatPrice(balanceAmount)}</span>
          </div>
          <div className="pt-4 border-t border-[#C89A4B]/20">
            <div className="flex justify-between items-center">
              <span className="text-[#F4E8D5] font-medium">Due Today</span>
              <span className="font-cormorant text-3xl text-[#C89A4B]">
                {formatPrice(depositAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {!isComplete && (
        <>
          <div>
            <h4 className="text-[#C89A4B] text-xs font-cinzel tracking-wider uppercase mb-4">
              Select Payment Method
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                  paymentMethod === 'card'
                    ? 'bg-[#C89A4B]/10 border-[#C89A4B] text-[#F4E8D5]'
                    : 'bg-[#2D2621] border-[#C89A4B]/30 text-[#D3C5AE]/70 hover:border-[#C89A4B]/50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#1A1008] flex items-center justify-center">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Credit or Debit Card</div>
                  <div className="text-xs opacity-60">Visa, Mastercard, Amex</div>
                </div>
                {paymentMethod === 'card' && <Check className="w-5 h-5 text-[#C89A4B]" />}
              </button>

              <button
                onClick={() => setPaymentMethod('mpesa')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                  paymentMethod === 'mpesa'
                    ? 'bg-[#C89A4B]/10 border-[#C89A4B] text-[#F4E8D5]'
                    : 'bg-[#2D2621] border-[#C89A4B]/30 text-[#D3C5AE]/70 hover:border-[#C89A4B]/50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#1A1008] flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">M-Pesa</div>
                  <div className="text-xs opacity-60">Kenya, Tanzania, Rwanda</div>
                </div>
                {paymentMethod === 'mpesa' && <Check className="w-5 h-5 text-[#C89A4B]" />}
              </button>

              <button
                onClick={() => setPaymentMethod('bank')}
                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                  paymentMethod === 'bank'
                    ? 'bg-[#C89A4B]/10 border-[#C89A4B] text-[#F4E8D5]'
                    : 'bg-[#2D2621] border-[#C89A4B]/30 text-[#D3C5AE]/70 hover:border-[#C89A4B]/50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#1A1008] flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-xs opacity-60">USD, EUR, GBP, KES</div>
                </div>
                {paymentMethod === 'bank' && <Check className="w-5 h-5 text-[#C89A4B]" />}
              </button>
            </div>
          </div>

          {/* Card Details Form (simplified) */}
          {paymentMethod === 'card' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs text-[#D3C5AE]/70 block mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="w-full p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] placeholder:text-[#D3C5AE]/30 focus:border-[#C89A4B] focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#D3C5AE]/70 block mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] placeholder:text-[#D3C5AE]/30 focus:border-[#C89A4B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#D3C5AE]/70 block mb-2">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] placeholder:text-[#D3C5AE]/30 focus:border-[#C89A4B] focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* M-Pesa Form */}
          {paymentMethod === 'mpesa' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs text-[#D3C5AE]/70 block mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+254 712 345 678"
                  className="w-full p-4 bg-[#2D2621] border border-[#C89A4B]/30 rounded-xl text-[#F4E8D5] placeholder:text-[#D3C5AE]/30 focus:border-[#C89A4B] focus:outline-none"
                />
              </div>
              <p className="text-xs text-[#D3C5AE]/50">
                You will receive an M-Pesa prompt on your phone to confirm payment.
              </p>
            </motion.div>
          )}

          {/* Bank Transfer Info */}
          {paymentMethod === 'bank' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[#2D2621] rounded-xl p-4 space-y-2 text-sm"
            >
              <p className="text-[#D3C5AE]/70">Bank: Standard Chartered Bank</p>
              <p className="text-[#D3C5AE]/70">Account: IDENT AFRICA SAFARIS LTD</p>
              <p className="text-[#D3C5AE]/70">USD Account: 0180123456789</p>
              <p className="text-[#D3C5AE]/70">Reference: Your booking reference</p>
            </motion.div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-3 text-xs text-[#D3C5AE]/50">
            <Lock className="w-4 h-4" />
            <span>256-bit SSL encrypted. Your payment details are secure.</span>
          </div>

          {/* Pay Button */}
          <motion.button
            onClick={handlePayment}
            disabled={isProcessing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 bg-[#C89A4B] text-[#1a1008] rounded-xl font-cinzel text-xs tracking-wider uppercase flex items-center justify-center gap-3 hover:bg-[#D6B06A] transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-[#1a1008]/30 border-t-[#1a1008] rounded-full animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                Pay {formatPrice(depositAmount)}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </>
      )}

      {/* Success State */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 rounded-full bg-[#4F6848]/20 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-[#4F6848]" />
          </motion.div>
          <h3 className="font-cormorant text-2xl text-[#F4E8D5] mb-2">
            Payment Successful!
          </h3>
          <p className="text-[#D3C5AE]/70">
            Your safari is confirmed. Redirecting...
          </p>
        </motion.div>
      )}

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-[#2D2621]">
        <div className="flex items-center gap-2 text-[#D3C5AE]/50 text-xs">
          <Shield className="w-4 h-4" />
          Secure Payment
        </div>
        <div className="flex items-center gap-2 text-[#D3C5AE]/50 text-xs">
          <Lock className="w-4 h-4" />
          PCI Compliant
        </div>
        <div className="flex items-center gap-2 text-[#D3C5AE]/50 text-xs">
          <Check className="w-4 h-4" />
          Free Cancellation 48h
        </div>
      </div>
    </div>
  );
};

export default DepositStep;
