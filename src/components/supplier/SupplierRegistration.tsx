/**
 * Supplier Registration Component
 * 
 * Multi-step onboarding for new suppliers.
 */

import React, { useState } from 'react';
import {
  Building2,
  Upload,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Shield,
} from 'lucide-react';

const SUPPLIER_TYPES = [
  { value: 'lodge', label: 'Lodge', description: 'Safari lodges and camps' },
  { value: 'hotel', label: 'Hotel', description: 'Hotels and resorts' },
  { value: 'safari_operator', label: 'Safari Operator', description: 'Tour operators' },
  { value: 'tour_guide', label: 'Tour Guide', description: 'Professional guides' },
  { value: 'transport_company', label: 'Transport', description: 'Vehicles and transfers' },
  { value: 'activity_provider', label: 'Activity Provider', description: 'Activities and experiences' },
];

interface FormData {
  // Step 1: Company Info
  companyName: string;
  supplierType: string;
  tagline: string;
  description: string;
  // Step 2: Location
  address: string;
  city: string;
  country: string;
  region: string;
  // Step 3: Contact
  contactEmail: string;
  contactPhone: string;
  website: string;
  // Step 4: Documents
  businessRegNumber: string;
  taxId: string;
  // Step 5: Payment
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankSwiftCode: string;
  // User account
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userPhone: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  companyName: '',
  supplierType: '',
  tagline: '',
  description: '',
  address: '',
  city: '',
  country: 'Kenya',
  region: '',
  contactEmail: '',
  contactPhone: '',
  website: '',
  businessRegNumber: '',
  taxId: '',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankSwiftCode: '',
  userFirstName: '',
  userLastName: '',
  userEmail: '',
  userPhone: '',
  password: '',
  confirmPassword: '',
};

export const SupplierRegistration: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 6;

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.supplierType) newErrors.supplierType = 'Select a supplier type';
    }

    if (step === 2) {
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
    }

    if (step === 3) {
      if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Invalid email format';
      }
      if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Phone is required';
    }

    if (step === 5) {
      if (!formData.businessRegNumber.trim()) newErrors.businessRegNumber = 'Business registration is required';
    }

    if (step === 6) {
      if (!formData.userFirstName.trim()) newErrors.userFirstName = 'First name is required';
      if (!formData.userLastName.trim()) newErrors.userLastName = 'Last name is required';
      if (!formData.userEmail.trim()) newErrors.userEmail = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In production, this would call the registration API
    console.log('Registration data:', formData);

    setSubmitting(false);
    setSubmitted(true);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
        <React.Fragment key={step}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step < currentStep
                ? 'bg-emerald-500 text-white'
                : step === currentStep
                ? 'bg-amber-500 text-stone-900'
                : 'bg-stone-700 text-stone-400'
            }`}
          >
            {step < currentStep ? <Check size={16} /> : step}
          </div>
          {step < totalSteps && (
            <div className={`w-12 h-0.5 mx-2 ${
              step < currentStep ? 'bg-emerald-500' : 'bg-stone-700'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-100 mb-2">Company Information</h2>
              <p className="text-stone-500">Tell us about your business</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Company Name *</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                  errors.companyName ? 'border-rose-500' : 'border-stone-700'
                }`}
                placeholder="e.g., WildAfrica Tours Ltd"
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-rose-400">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Business Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {SUPPLIER_TYPES.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField('supplierType', type.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.supplierType === type.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-stone-700 bg-stone-800/50 hover:border-stone-600'
                    }`}
                  >
                    <p className="font-medium text-stone-100">{type.label}</p>
                    <p className="text-xs text-stone-500">{type.description}</p>
                  </button>
                ))}
              </div>
              {errors.supplierType && (
                <p className="mt-1 text-sm text-rose-400">{errors.supplierType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                placeholder="e.g., Your Gateway to African Wildlife"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 resize-none"
                placeholder="Describe your business and what makes you unique..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-100 mb-2">Location</h2>
              <p className="text-stone-500">Where is your business based?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Street Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                placeholder="123 Safari Road"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                    errors.city ? 'border-rose-500' : 'border-stone-700'
                  }`}
                  placeholder="Nairobi"
                />
                {errors.city && <p className="mt-1 text-sm text-rose-400">{errors.city}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Region</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => updateField('region', e.target.value)}
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                  placeholder="Westlands"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Country *</label>
              <select
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
                className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                  errors.country ? 'border-rose-500' : 'border-stone-700'
                }`}
              >
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
                <option value="Rwanda">Rwanda</option>
                <option value="South Africa">South Africa</option>
                <option value="Zimbabwe">Zimbabwe</option>
                <option value="Zambia">Zambia</option>
                <option value="Botswana">Botswana</option>
              </select>
              {errors.country && <p className="mt-1 text-sm text-rose-400">{errors.country}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-100 mb-2">Contact Information</h2>
              <p className="text-stone-500">How can we reach you?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Business Email *</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                  errors.contactEmail ? 'border-rose-500' : 'border-stone-700'
                }`}
                placeholder="info@yourcompany.com"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-rose-400">{errors.contactEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Business Phone *</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                  errors.contactPhone ? 'border-rose-500' : 'border-stone-700'
                }`}
                placeholder="+254 700 000 000"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-rose-400">{errors.contactPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                placeholder="https://www.yourcompany.com"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-100 mb-2">Business Documents</h2>
              <p className="text-stone-500">Upload your business registration documents</p>
            </div>

            <div className="border-2 border-dashed border-stone-700 rounded-xl p-8 text-center">
              <Upload size={48} className="mx-auto mb-4 text-stone-500" />
              <p className="text-stone-300 mb-2">Drag and drop files here, or click to upload</p>
              <p className="text-sm text-stone-500">PDF, JPG, PNG up to 10MB each</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Business Registration Number *</label>
                <input
                  type="text"
                  value={formData.businessRegNumber}
                  onChange={(e) => updateField('businessRegNumber', e.target.value)}
                  className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                    errors.businessRegNumber ? 'border-rose-500' : 'border-stone-700'
                  }`}
                  placeholder="e.g., CPR/2019/12345"
                />
                {errors.businessRegNumber && (
                  <p className="mt-1 text-sm text-rose-400">{errors.businessRegNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Tax ID Number</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => updateField('taxId', e.target.value)}
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                  placeholder="e.g., A123456789"
                />
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-400 mt-0.5" />
              <div>
                <p className="font-medium text-amber-400">Verification Process</p>
                <p className="text-sm text-stone-400 mt-1">
                  After submission, our team will review your documents and verify your business within 2-3 business days.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-100 mb-2">Payment Information</h2>
              <p className="text-stone-500">Where should we send your payouts?</p>
            </div>

            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 flex items-start gap-3">
              <Shield size={20} className="text-emerald-400 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-400">Secure Banking</p>
                <p className="text-sm text-stone-400 mt-1">
                  Your banking details are encrypted and stored securely. We use Stripe Connect for all payouts.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => updateField('bankName', e.target.value)}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                placeholder="e.g., Kenya Commercial Bank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Account Name</label>
              <input
                type="text"
                value={formData.bankAccountName}
                onChange={(e) => updateField('bankAccountName', e.target.value)}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                placeholder="Your registered business account name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => updateField('bankAccountNumber', e.target.value)}
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">SWIFT/BIC Code</label>
                <input
                  type="text"
                  value={formData.bankSwiftCode}
                  onChange={(e) => updateField('bankSwiftCode', e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                  placeholder="KCBLKENX"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-stone-100 mb-2">Create Your Account</h2>
              <p className="text-stone-500">Set up your login credentials</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">First Name *</label>
                <input
                  type="text"
                  value={formData.userFirstName}
                  onChange={(e) => updateField('userFirstName', e.target.value)}
                  className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                    errors.userFirstName ? 'border-rose-500' : 'border-stone-700'
                  }`}
                />
                {errors.userFirstName && (
                  <p className="mt-1 text-sm text-rose-400">{errors.userFirstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Last Name *</label>
                <input
                  type="text"
                  value={formData.userLastName}
                  onChange={(e) => updateField('userLastName', e.target.value)}
                  className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                    errors.userLastName ? 'border-rose-500' : 'border-stone-700'
                  }`}
                />
                {errors.userLastName && (
                  <p className="mt-1 text-sm text-rose-400">{errors.userLastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Email *</label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => updateField('userEmail', e.target.value)}
                className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                  errors.userEmail ? 'border-rose-500' : 'border-stone-700'
                }`}
              />
              {errors.userEmail && (
                <p className="mt-1 text-sm text-rose-400">{errors.userEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.userPhone}
                onChange={(e) => updateField('userPhone', e.target.value)}
                className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                placeholder="+254 700 000 000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                  errors.password ? 'border-rose-500' : 'border-stone-700'
                }`}
                placeholder="Minimum 8 characters"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-rose-400">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 bg-stone-800 border rounded-lg text-stone-100 ${
                  errors.confirmPassword ? 'border-rose-500' : 'border-stone-700'
                }`}
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-rose-400">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1" />
                <span className="text-sm text-stone-400">
                  I agree to the{' '}
                  <a href="#" className="text-amber-400 hover:underline">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-amber-400 hover:underline">Privacy Policy</a>
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-100 mb-4">Application Submitted!</h1>
          <p className="text-stone-400 mb-6">
            Thank you for applying to become a partner on IDENT Africa. Our team will review your application within 2-3 business days.
          </p>
          <p className="text-stone-500 mb-8">
            You'll receive an email at <span className="text-amber-400">{formData.contactEmail}</span> once your application has been reviewed.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-xl"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-100">Become a Partner</h1>
          <p className="text-stone-500 mt-2">Join the IDENT Africa supplier marketplace</p>
        </div>

        {renderStepIndicator()}

        {/* Form */}
        <div className="bg-stone-800/50 border border-stone-700 rounded-2xl p-6">
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-4 py-2 text-stone-400 hover:text-stone-200 ${
                currentStep === 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft size={18} />
              Back
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-xl"
              >
                Continue
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
                    <Check size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help */}
        <p className="text-center text-stone-500 text-sm mt-6">
          Need help?{' '}
          <a href="mailto:partners@identafrica.com" className="text-amber-400 hover:underline">
            Contact our partner team
          </a>
        </p>
      </div>
    </div>
  );
};

export default SupplierRegistration;
