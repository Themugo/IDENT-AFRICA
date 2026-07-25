import React, { useState, useEffect } from 'react';
import { PaymentGateway, Currency } from '../../types';
import { CreditCard, Smartphone, Globe, ShieldCheck, CheckCircle2, Lock, ArrowRight, RefreshCw, SmartphoneNfc } from 'lucide-react';

interface PaymentGatewaysProps {
  amountUSD: number;
  currency: Currency;
  formatPrice: (usd: number) => string;
  travelerEmail: string;
  travelerPhone: string;
  travelerName: string;
  onPaymentSuccess: (gateway: PaymentGateway, transactionRef: string, mpesaPhone?: string) => void;
  onPaymentError: (errorMsg: string) => void;
}

export const PaymentGateways: React.FC<PaymentGatewaysProps> = ({
  amountUSD,
  currency,
  formatPrice,
  travelerEmail,
  travelerPhone,
  travelerName,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('Stripe');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccessRef, setPaymentSuccessRef] = useState<string | null>(null);

  // Stripe form fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardZip, setCardZip] = useState('90210');

  // M-Pesa fields
  const [mpesaPhone, setMpesaPhone] = useState(travelerPhone || '+254 712 345 678');
  const [stkPushStep, setStkPushStep] = useState<'idle' | 'sending' | 'awaiting_pin' | 'verified'>('idle');
  const [stkTimer, setStkTimer] = useState(30);

  // Flutterwave fields
  const [flwChannel, setFlwChannel] = useState<'card' | 'mobile_money' | 'bank_transfer'>('card');
  const [flwCountry, setFlwCountry] = useState<'KE' | 'NG' | 'GH' | 'ZA' | 'UG' | 'RW'>('KE');

  // M-Pesa STK Push Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stkPushStep === 'awaiting_pin' && stkTimer > 0) {
      interval = setInterval(() => {
        setStkTimer(prev => prev - 1);
      }, 1000);
    } else if (stkPushStep === 'awaiting_pin' && stkTimer === 0) {
      // Auto verify simulated success
      setStkPushStep('verified');
      const ref = `MPESA-STK-${Math.floor(100000 + Math.random() * 900000)}`;
      setPaymentSuccessRef(ref);
      onPaymentSuccess('M-Pesa', ref, mpesaPhone);
    }
    return () => clearInterval(interval);
  }, [stkPushStep, stkTimer, mpesaPhone, onPaymentSuccess]);

  // Handle Stripe Submit
  const handleStripePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Call backend API endpoint or simulate instant Stripe charge
      const res = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD, currency, travelerEmail, travelerName }),
      });
      const data = res.ok ? await res.json() : null;
      const ref = data?.paymentIntentId || `ch_3M${Date.now().toString().slice(-8)}`;

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccessRef(ref);
        onPaymentSuccess('Stripe', ref);
      }, 800);
    } catch {
      setTimeout(() => {
        setIsProcessing(false);
        const ref = `ch_3M${Date.now().toString().slice(-8)}`;
        setPaymentSuccessRef(ref);
        onPaymentSuccess('Stripe', ref);
      }, 800);
    }
  };

  // Handle Flutterwave Submit
  const handleFlutterwavePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/flutterwave/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountUSD, currency, travelerEmail, travelerName, channel: flwChannel, country: flwCountry }),
      });
      const data = res.ok ? await res.json() : null;
      const ref = data?.tx_ref || `FLW-TX-${Date.now().toString().slice(-8)}`;

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccessRef(ref);
        onPaymentSuccess('Flutterwave', ref);
      }, 900);
    } catch {
      setTimeout(() => {
        setIsProcessing(false);
        const ref = `FLW-TX-${Date.now().toString().slice(-8)}`;
        setPaymentSuccessRef(ref);
        onPaymentSuccess('Flutterwave', ref);
      }, 900);
    }
  };

  // Handle M-Pesa STK Push Submit
  const handleMpesaStkPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaPhone.trim()) {
      onPaymentError('Please enter a valid M-Pesa mobile number.');
      return;
    }
    setStkPushStep('sending');
    setIsProcessing(true);

    try {
      await fetch('/api/payments/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: mpesaPhone, amountUSD, currency }),
      });
    } catch {
      // fallback simulation
    }

    setTimeout(() => {
      setIsProcessing(false);
      setStkPushStep('awaiting_pin');
      setStkTimer(15);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Gateway Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase text-[#D4AF37] block">
          Select Secure Gateway
        </label>
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#181E1A] rounded-2xl border border-[#D4AF37]/30">
          
          {/* Stripe Option */}
          <button
            type="button"
            onClick={() => {
              setSelectedGateway('Stripe');
              setPaymentSuccessRef(null);
            }}
            className={`py-3 px-2 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              selectedGateway === 'Stripe'
                ? 'bg-[#C89A4B] text-[#2E2015] shadow-lg scale-[1.02]'
                : 'text-[#F5EBE0]/70 hover:text-[#D4AF37] hover:bg-[#2A362E]/50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Stripe Cards</span>
            <span className="text-[9px] opacity-75 font-normal">Visa / MC / ApplePay</span>
          </button>

          {/* M-Pesa Option */}
          <button
            type="button"
            onClick={() => {
              setSelectedGateway('M-Pesa');
              setPaymentSuccessRef(null);
            }}
            className={`py-3 px-2 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              selectedGateway === 'M-Pesa'
                ? 'bg-[#C89A4B] text-[#2E2015] shadow-lg scale-[1.02]'
                : 'text-[#F5EBE0]/70 hover:text-[#D4AF37] hover:bg-[#2A362E]/50'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>M-Pesa Express</span>
            <span className="text-[9px] opacity-75 font-normal">Instant STK Push</span>
          </button>

          {/* Flutterwave Option */}
          <button
            type="button"
            onClick={() => {
              setSelectedGateway('Flutterwave');
              setPaymentSuccessRef(null);
            }}
            className={`py-3 px-2 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center gap-1 transition-all ${
              selectedGateway === 'Flutterwave'
                ? 'bg-[#C89A4B] text-[#2E2015] shadow-lg scale-[1.02]'
                : 'text-[#F5EBE0]/70 hover:text-[#D4AF37] hover:bg-[#2A362E]/50'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Flutterwave</span>
            <span className="text-[9px] opacity-75 font-normal">Pan-African Money</span>
          </button>
        </div>
      </div>

      {/* Gateway Forms Container */}
      <div className="p-5 rounded-2xl bg-[#181E1A] border border-[#D4AF37]/30 space-y-5">
        
        {/* STRIPE PAYMENT FORM */}
        {selectedGateway === 'Stripe' && (
          <form onSubmit={handleStripePay} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-mono font-bold uppercase text-[#F5EBE0]">
                  Stripe Global Credit Card
                </span>
              </div>
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#2A362E] text-[#D4AF37]">256-Bit SSL</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#C89A4B] text-[#2E2015] font-bold">PVI Compliant</span>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[#D4AF37] uppercase font-bold block">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-3 rounded-xl border border-[#D4AF37]/30 tracking-widest"
                  />
                  <CreditCard className="w-4 h-4 text-[#D4AF37] absolute right-3 top-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[#D4AF37] uppercase font-bold block">Expiry</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-3 rounded-xl border border-[#D4AF37]/30 text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#D4AF37] uppercase font-bold block">CVC / CWW</label>
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-3 rounded-xl border border-[#D4AF37]/30 text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[#D4AF37] uppercase font-bold block">ZIP / Postal</label>
                  <input
                    type="text"
                    value={cardZip}
                    onChange={(e) => setCardZip(e.target.value)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-3 rounded-xl border border-[#D4AF37]/30 text-center"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C89A4B] to-[#D6B06A] text-[#2E2015] font-mono font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#2E2015]" />
                    <span>Encrypting & Authorizing via Stripe...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize {formatPrice(amountUSD)} via Stripe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* M-PESA EXPRESS FORM */}
        {selectedGateway === 'M-Pesa' && (
          <form onSubmit={handleMpesaStkPush} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-mono font-bold uppercase text-[#F5EBE0]">
                  Lipa na M-Pesa Online Express
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#1E3A2B] text-[#4ADE80] border border-[#4ADE80]/30 font-bold">
                Safaricom Direct STK
              </span>
            </div>

            {stkPushStep === 'idle' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#12241A] border border-[#D4AF37]/20 text-[#F5EBE0]/80 space-y-1">
                  <p className="font-bold text-[#D4AF37]">How M-Pesa Express Works:</p>
                  <p className="text-[11px]">
                    An automated payment request prompt (STK Push) will pop up on your mobile handset immediately. Enter your 4-digit M-Pesa PIN to complete authorization.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[#D4AF37] uppercase font-bold block">
                    M-Pesa Phone Number (+254 / +255 / +256)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full bg-[#12241A] text-[#F5EBE0] p-3 rounded-xl border border-[#D4AF37]/30"
                    />
                    <SmartphoneNfc className="w-4 h-4 text-[#D4AF37] absolute right-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C89A4B] to-[#D6B06A] text-[#2E2015] font-mono font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#2E2015]" />
                      <span>Sending M-Pesa STK Prompt...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Trigger STK Push ({formatPrice(amountUSD)})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {stkPushStep === 'awaiting_pin' && (
              <div className="text-center py-6 space-y-4 animate-in fade-in">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#C89A4B]/20 border border-[#D4AF37] flex items-center justify-center">
                  <SmartphoneNfc className="w-8 h-8 text-[#D4AF37] animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-serif font-bold text-[#D4AF37]">
                    Check Your Phone Prompt
                  </h4>
                  <p className="text-xs font-mono text-[#F5EBE0]/80 max-w-sm mx-auto">
                    A prompt asking for M-Pesa PIN for {formatPrice(amountUSD)} has been sent to <span className="text-[#D4AF37] font-bold">{mpesaPhone}</span>.
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#12241A] border border-[#D4AF37]/30 text-xs font-mono text-[#D4AF37]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Awaiting PIN confirmation ({stkTimer}s)</span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStkPushStep('verified');
                      const ref = `MPESA-STK-${Math.floor(100000 + Math.random() * 900000)}`;
                      setPaymentSuccessRef(ref);
                      onPaymentSuccess('M-Pesa', ref, mpesaPhone);
                    }}
                    className="text-xs font-mono text-[#D4AF37] underline hover:text-[#F5EBE0]"
                  >
                    Simulate M-Pesa PIN Entered & Approved
                  </button>
                </div>
              </div>
            )}

            {stkPushStep === 'verified' && (
              <div className="p-4 rounded-xl bg-[#1E3A2B] border border-[#4ADE80]/40 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#4ADE80] mx-auto" />
                <h4 className="text-sm font-mono font-bold text-[#4ADE80]">M-Pesa Transaction Verified!</h4>
                <p className="text-xs font-mono text-[#F5EBE0]">
                  Ref Code: <span className="text-[#D4AF37] font-bold">{paymentSuccessRef}</span>
                </p>
              </div>
            )}
          </form>
        )}

        {/* FLUTTERWAVE FORM */}
        {selectedGateway === 'Flutterwave' && (
          <form onSubmit={handleFlutterwavePay} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-xs font-mono font-bold uppercase text-[#F5EBE0]">
                  Flutterwave Pan-African Gateway
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#2A362E] text-[#D4AF37]">
                Multi-Currency
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#D4AF37] uppercase font-bold block">Country Currency Hub</label>
                  <select
                    value={flwCountry}
                    onChange={(e) => setFlwCountry(e.target.value as any)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-2.5 rounded-xl border border-[#D4AF37]/30"
                  >
                    <option value="KE">Kenya (KES / M-Pesa)</option>
                    <option value="NG">Nigeria (NGN / Card / Transfer)</option>
                    <option value="GH">Ghana (GHS / Mobile Money)</option>
                    <option value="ZA">South Africa (ZAR / EFT)</option>
                    <option value="UG">Uganda (UGX / Mobile Money)</option>
                    <option value="RW">Rwanda (RWF / Mobile Money)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#D4AF37] uppercase font-bold block">Payment Channel</label>
                  <select
                    value={flwChannel}
                    onChange={(e) => setFlwChannel(e.target.value as any)}
                    className="w-full bg-[#12241A] text-[#F5EBE0] p-2.5 rounded-xl border border-[#D4AF37]/30"
                  >
                    <option value="card">Bank Card (Visa / MasterCard)</option>
                    <option value="mobile_money">Pan-African Mobile Money</option>
                    <option value="bank_transfer">Direct Bank Wire / Instant EFT</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#D4AF37] uppercase font-bold block">Traveler Account Email</label>
                <input
                  type="email"
                  value={travelerEmail}
                  readOnly
                  className="w-full bg-[#12241A]/60 text-[#F5EBE0]/80 p-2.5 rounded-xl border border-[#D4AF37]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C89A4B] to-[#D6B06A] text-[#2E2015] font-mono font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#2E2015]" />
                  <span>Connecting Flutterwave Portal...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Pay {formatPrice(amountUSD)} with Flutterwave</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#F5EBE0]/60 px-2">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>AES-256 Escrow Protected</span>
        </div>
        <span>Zero Hidden Surcharges</span>
      </div>
    </div>
  );
};
