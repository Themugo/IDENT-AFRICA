import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupplierType, Country } from '../../types';
import {
  BedDouble,
  Compass,
  Car,
  UserCheck,
  Building,
  ShieldCheck,
  FileText,
  CreditCard,
  X,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface SupplierRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupplierRegisterModal: React.FC<SupplierRegisterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { registerSupplier, navigateTo } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Registration Form State
  const [type, setType] = useState<SupplierType>('Hotel');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState<Country>('Kenya');
  const [region, setRegion] = useState('Masai Mara');
  const [address, setAddress] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');

  // Licensing
  const [taxPinNumber, setTaxPinNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');

  // Banking
  const [bankName, setBankName] = useState('KCB Bank Kenya');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [mPesaTillNumber, setMPesaTillNumber] = useState('');

  if (!isOpen) return null;

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();

    const createdSupplier = registerSupplier({
      name,
      type,
      email,
      phone,
      country,
      region,
      address: address || `${region}, ${country}`,
      logoOrAvatar:
        type === 'Hotel'
          ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'
          : type === 'Transport Company'
          ? 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=400&q=80'
          : type === 'Guide'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=400&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      tagline: tagline || 'Premier East Africa Verified Partner',
      description: description || 'Luxury safari partner committed to eco-conservation and high guest satisfaction.',
      taxPinNumber: taxPinNumber || 'P051009988X',
      licenseNumber: licenseNumber || 'KTB/TALA/2026/0882',
      licenseDocumentName: 'License_Submitted_Verification.pdf',
      insurancePolicyNumber,
      insuranceExpiryDate: '2027-12-31',
      bankName,
      accountName: accountName || name,
      accountNumber,
      mPesaTillNumber,
    });

    onClose();
    navigateTo('supplier-portal');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#2E2015] border-2 border-[#C89A4B] text-[#F4E8D5] rounded-2xl max-w-2xl w-full p-8 shadow-2xl relative my-8 texture-earth">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#C89A4B] hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 mb-8">
          <span className="px-3 py-1 bg-[#4B321F] border border-[#C89A4B]/40 text-[#D6B06A] text-[10px] font-bold uppercase tracking-widest rounded-full inline-block">
            Ident Africa Partner Network
          </span>
          <h2 className="text-2xl font-cinzel font-black text-[#D6B06A]">
            Become a Verified Supplier Partner
          </h2>
          <p className="text-xs text-[#D3C5AE] max-w-md mx-auto">
            Join East Africa's premier luxury expedition marketplace. Provide your credentials for Warden verification.
          </p>
        </div>

        {/* Wizard Steps Bar */}
        <div className="flex items-center justify-center gap-4 mb-8 text-xs font-bold uppercase tracking-wider">
          <div
            className={`flex items-center gap-2 ${
              step === 1 ? 'text-[#D6B06A]' : 'text-[#D3C5AE]/60'
            }`}
          >
            <span className="w-6 h-6 rounded-full border border-[#C89A4B] flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Category</span>
          </div>
          <span className="text-[#C89A4B]">•</span>
          <div
            className={`flex items-center gap-2 ${
              step === 2 ? 'text-[#D6B06A]' : 'text-[#D3C5AE]/60'
            }`}
          >
            <span className="w-6 h-6 rounded-full border border-[#C89A4B] flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Entity Info</span>
          </div>
          <span className="text-[#C89A4B]">•</span>
          <div
            className={`flex items-center gap-2 ${
              step === 3 ? 'text-[#D6B06A]' : 'text-[#D3C5AE]/60'
            }`}
          >
            <span className="w-6 h-6 rounded-full border border-[#C89A4B] flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Compliance</span>
          </div>
        </div>

        {/* STEP 1: Select Supplier Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#D6B06A] uppercase tracking-wider text-center">
              Select Your Operational Business Type
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('Hotel')}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  type === 'Hotel'
                    ? 'bg-[#4B321F] border-[#C89A4B] shadow-lg'
                    : 'bg-[#2E2015] border-[#C89A4B]/30 hover:border-[#C89A4B]'
                }`}
              >
                <BedDouble className="w-8 h-8 text-[#C89A4B] mb-2" />
                <div className="font-bold text-[#F4E8D5] text-base">Hotel & Luxury Lodge</div>
                <p className="text-xs text-[#D3C5AE] mt-1">
                  Luxury tented camps, bush lodges, coastal villas, and boutique sanctuaries.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('Tour Operator')}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  type === 'Tour Operator'
                    ? 'bg-[#4B321F] border-[#C89A4B] shadow-lg'
                    : 'bg-[#2E2015] border-[#C89A4B]/30 hover:border-[#C89A4B]'
                }`}
              >
                <Compass className="w-8 h-8 text-[#C89A4B] mb-2" />
                <div className="font-bold text-[#F4E8D5] text-base">Tour Operator</div>
                <p className="text-xs text-[#D3C5AE] mt-1">
                  KATO/TATO licensed safari operators, gorilla trek organizers, and expedition agencies.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('Transport Company')}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  type === 'Transport Company'
                    ? 'bg-[#4B321F] border-[#C89A4B] shadow-lg'
                    : 'bg-[#2E2015] border-[#C89A4B]/30 hover:border-[#C89A4B]'
                }`}
              >
                <Car className="w-8 h-8 text-[#C89A4B] mb-2" />
                <div className="font-bold text-[#F4E8D5] text-base">Transport Company</div>
                <p className="text-xs text-[#D3C5AE] mt-1">
                  Aviation bush fly-in charters, 4x4 Land Cruiser fleets, helicopters, and dhows.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setType('Guide')}
                className={`p-5 rounded-xl border-2 text-left transition-all ${
                  type === 'Guide'
                    ? 'bg-[#4B321F] border-[#C89A4B] shadow-lg'
                    : 'bg-[#2E2015] border-[#C89A4B]/30 hover:border-[#C89A4B]'
                }`}
              >
                <UserCheck className="w-8 h-8 text-[#C89A4B] mb-2" />
                <div className="font-bold text-[#F4E8D5] text-base">Private Guide</div>
                <p className="text-xs text-[#D3C5AE] mt-1">
                  KPSGA Silver/Gold badge rangers, Master Primate Trackers, and photographic naturalists.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-gold py-3 px-8 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                Next: Entity Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Entity & Contact Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#D6B06A] uppercase tracking-wider border-b border-[#C89A4B]/20 pb-2">
              Step 2: Business & Location Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                  Company / Guide Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Serengeti Crown Eco Lodge"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  placeholder="partners@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+254 711 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                  Operating Country
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as Country)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5]"
                >
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Rwanda">Rwanda</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                Region / Reserve Base
              </label>
              <input
                type="text"
                placeholder="e.g. Masai Mara National Reserve / Wilson Airport"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                Tagline / Elevator Pitch
              </label>
              <input
                type="text"
                placeholder="e.g. Ultra-luxury solar powered tented camp on the riverbank"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5]"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-[#C89A4B]/40 text-[#D3C5AE] rounded text-xs font-bold uppercase"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-gold py-3 px-8 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              >
                Next: Licensing & Settlement <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Compliance & Bank Details */}
        {step === 3 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <h3 className="text-sm font-bold text-[#D6B06A] uppercase tracking-wider border-b border-[#C89A4B]/20 pb-2">
              Step 3: Regulatory Licensing & Bank Payout Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                  Tax PIN Number (e.g. KRA PIN)
                </label>
                <input
                  type="text"
                  placeholder="P051992018X"
                  value={taxPinNumber}
                  onChange={(e) => setTaxPinNumber(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                  Official License No. (KTB/TALA / Badge)
                </label>
                <input
                  type="text"
                  placeholder="KTB/TALA/2026/0912"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                  Settlement Bank Name
                </label>
                <input
                  type="text"
                  placeholder="KCB Bank Kenya / Standard Chartered"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="1109 8820 1901"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono"
                  required
                />
              </div>
            </div>

            <div className="p-3 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded-lg text-xs text-[#D3C5AE]">
              <strong className="text-[#D6B06A]">Notice:</strong> Upon submission, your account will enter <span className="font-mono text-amber-300">pending_approval</span> status. You will have immediate draft access to your Supplier Portal to add inventory and rates. Ident Africa Wardens verify compliance within 24 hours.
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-[#C89A4B]/40 text-[#D3C5AE] rounded text-xs font-bold uppercase"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-gold py-3 px-8 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl"
              >
                <ShieldCheck className="w-4 h-4" />
                Submit Partner Application
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
