import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SupplierProfile, SupplierType, Country } from '../../types';
import {
  User,
  Building,
  ShieldCheck,
  FileText,
  CreditCard,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  Car,
  Compass,
  Award,
} from 'lucide-react';

interface SupplierProfileProps {
  supplier: SupplierProfile;
}

export const SupplierProfileComponent: React.FC<SupplierProfileProps> = ({ supplier }) => {
  const { updateSupplierProfile } = useApp();

  const [formData, setFormData] = useState<SupplierProfile>({ ...supplier });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Fleet Item form state
  const [newFleetName, setNewFleetName] = useState('');
  const [newFleetCapacity, setNewFleetCapacity] = useState(7);
  const [newFleetRate, setNewFleetRate] = useState(380);

  // Tour package state
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourDays, setNewTourDays] = useState(5);
  const [newTourPrice, setNewTourPrice] = useState(3500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupplierProfile(formData);
    setSaveSuccessMsg('Supplier profile and operational credentials saved successfully!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleAddFleetItem = () => {
    if (!newFleetName) return;
    const item = {
      id: `fleet-${Date.now()}`,
      name: newFleetName,
      mode: '4x4 Off-Road Vehicle',
      capacity: newFleetCapacity,
      dailyRateUSD: newFleetRate,
      availableCount: 3,
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    };
    setFormData((prev) => ({
      ...prev,
      fleet: [...(prev.fleet || []), item],
    }));
    setNewFleetName('');
  };

  const handleRemoveFleetItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      fleet: (prev.fleet || []).filter((f) => f.id !== id),
    }));
  };

  const handleAddTourPackage = () => {
    if (!newTourTitle) return;
    const packageItem = {
      id: `tour-${Date.now()}`,
      title: newTourTitle,
      durationDays: newTourDays,
      pricePerPersonUSD: newTourPrice,
      description: 'Custom luxury expedition package with top photofari equipment.',
    };
    setFormData((prev) => ({
      ...prev,
      offeredTours: [...(prev.offeredTours || []), packageItem],
    }));
    setNewTourTitle('');
  };

  const handleRemoveTourPackage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      offeredTours: (prev.offeredTours || []).filter((t) => t.id !== id),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 texture-earth">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C89A4B]" />
            <h2 className="text-xl font-cinzel font-bold text-[#D6B06A]">
              Supplier Operational & Compliance Profile
            </h2>
          </div>
          <p className="text-xs text-[#D3C5AE] mt-1">
            Maintain your legal entity details, official license credentials, bank settlement accounts, and asset catalog.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {formData.approvalStatus === 'approved' ? (
            <span className="px-3 py-1 bg-emerald-950 border border-emerald-500 text-emerald-400 text-xs font-bold uppercase rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Verified Partner
            </span>
          ) : (
            <span className="px-3 py-1 bg-amber-950 border border-amber-500 text-amber-300 text-xs font-bold uppercase rounded-full flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Pending Admin Review
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Business Identity */}
        <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-6">
          <h3 className="text-lg font-serif font-bold text-[#D6B06A] border-b border-[#C89A4B]/20 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-[#C89A4B]" />
            Organization & Partner Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Company / Guide Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Supplier Category Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SupplierType })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
              >
                <option value="Hotel">Hotel / Lodge / Tented Camp</option>
                <option value="Tour Operator">Tour Operator / Safari Company</option>
                <option value="Transport Company">Transport Fleet / Aviation Charter</option>
                <option value="Guide">Ranger Guide / Private Naturalist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Primary Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Operating Country
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value as Country })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
              >
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Uganda">Uganda</option>
                <option value="Rwanda">Rwanda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Region / Reserve Location
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
              Tagline / Headline
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
              Full Organization Overview
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Legal Licensing & Compliance */}
        <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-6">
          <h3 className="text-lg font-serif font-bold text-[#D6B06A] border-b border-[#C89A4B]/20 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C89A4B]" />
            Regulatory Licensing & Tax Credentials (Admin Verification Required)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Tax PIN Number (e.g. KRA PIN / TRA TIN)
              </label>
              <input
                type="text"
                value={formData.taxPinNumber}
                onChange={(e) => setFormData({ ...formData, taxPinNumber: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Official License / Permit No. (KTB/TALA / KPSGA Badge / AOC)
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Insurance Policy Certificate Number
              </label>
              <input
                type="text"
                value={formData.insurancePolicyNumber || ''}
                onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono focus:border-[#C89A4B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Insurance Expiry Date
              </label>
              <input
                type="date"
                value={formData.insuranceExpiryDate || ''}
                onChange={(e) => setFormData({ ...formData, insuranceExpiryDate: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-[#C89A4B]" />
              <div>
                <div className="text-xs font-bold text-[#D6B06A]">Uploaded Document PDF</div>
                <div className="text-[11px] text-[#D3C5AE] font-mono">
                  {formData.licenseDocumentName || 'KTB_TALA_Official_License.pdf'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert('Simulated document upload: File uploaded and staged for Warden verification.')}
              className="px-3 py-1.5 bg-[#C89A4B] text-[#2E2015] hover:bg-[#D6B06A] rounded text-xs font-bold uppercase tracking-wider"
            >
              Upload PDF
            </button>
          </div>
        </div>

        {/* Section 3: Bank & Settlement Payout Account */}
        <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-6">
          <h3 className="text-lg font-serif font-bold text-[#D6B06A] border-b border-[#C89A4B]/20 pb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#C89A4B]" />
            Bank & Settlement Payout Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Account Holder Name
              </label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono focus:border-[#C89A4B] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                SWIFT Code / M-Pesa Till Number
              </label>
              <input
                type="text"
                value={formData.mPesaTillNumber ? `Till: ${formData.mPesaTillNumber}` : formData.swiftCode || ''}
                onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded-lg p-2.5 text-xs text-[#F4E8D5] font-mono focus:border-[#C89A4B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Type-Specific Inventory / Asset Catalog */}
        {formData.type === 'Transport Company' && (
          <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#D6B06A] border-b border-[#C89A4B]/20 pb-3 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#C89A4B]" />
              Manage Fleet Vehicles & Aircraft
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#4B321F]/40 p-3 rounded-lg border border-[#C89A4B]/20">
              <input
                type="text"
                placeholder="Vehicle / Aircraft Name"
                value={newFleetName}
                onChange={(e) => setNewFleetName(e.target.value)}
                className="bg-[#4B321F] border border-[#C89A4B]/30 rounded p-2 text-xs text-[#F4E8D5]"
              />
              <input
                type="number"
                placeholder="Passenger Capacity"
                value={newFleetCapacity}
                onChange={(e) => setNewFleetCapacity(parseInt(e.target.value) || 1)}
                className="bg-[#4B321F] border border-[#C89A4B]/30 rounded p-2 text-xs text-[#F4E8D5] font-mono"
              />
              <input
                type="number"
                placeholder="Daily USD Rate"
                value={newFleetRate}
                onChange={(e) => setNewFleetRate(parseFloat(e.target.value) || 0)}
                className="bg-[#4B321F] border border-[#C89A4B]/30 rounded p-2 text-xs text-[#F4E8D5] font-mono"
              />
              <button
                type="button"
                onClick={handleAddFleetItem}
                className="btn-gold py-2 text-xs font-bold uppercase flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Asset
              </button>
            </div>

            <div className="space-y-2">
              {(formData.fleet || []).map((f) => (
                <div
                  key={f.id}
                  className="p-3 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#F4E8D5]">{f.name}</span>
                    <span className="ml-2 text-[#D3C5AE]">({f.capacity} Seats • ${f.dailyRateUSD}/day)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFleetItem(f.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.type === 'Tour Operator' && (
          <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#D6B06A] border-b border-[#C89A4B]/20 pb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#C89A4B]" />
              Offered Expedition Packages
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#4B321F]/40 p-3 rounded-lg border border-[#C89A4B]/20">
              <input
                type="text"
                placeholder="Tour Title"
                value={newTourTitle}
                onChange={(e) => setNewTourTitle(e.target.value)}
                className="bg-[#4B321F] border border-[#C89A4B]/30 rounded p-2 text-xs text-[#F4E8D5]"
              />
              <input
                type="number"
                placeholder="Duration Days"
                value={newTourDays}
                onChange={(e) => setNewTourDays(parseInt(e.target.value) || 1)}
                className="bg-[#4B321F] border border-[#C89A4B]/30 rounded p-2 text-xs text-[#F4E8D5] font-mono"
              />
              <input
                type="number"
                placeholder="Price / Person USD"
                value={newTourPrice}
                onChange={(e) => setNewTourPrice(parseFloat(e.target.value) || 0)}
                className="bg-[#4B321F] border border-[#C89A4B]/30 rounded p-2 text-xs text-[#F4E8D5] font-mono"
              />
              <button
                type="button"
                onClick={handleAddTourPackage}
                className="btn-gold py-2 text-xs font-bold uppercase flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Package
              </button>
            </div>

            <div className="space-y-2">
              {(formData.offeredTours || []).map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-[#4B321F]/60 border border-[#C89A4B]/30 rounded flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#F4E8D5]">{t.title}</span>
                    <span className="ml-2 text-[#D3C5AE]">({t.durationDays} Days • ${t.pricePerPersonUSD}/person)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTourPackage(t.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.type === 'Guide' && (
          <div className="p-6 bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl shadow-xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#D6B06A] border-b border-[#C89A4B]/20 pb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#C89A4B]" />
              KPSGA Guide Certification & Specialties
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                  KPSGA Guide Level
                </label>
                <input
                  type="text"
                  value={formData.guideDetails?.kpsgaLevel || 'Gold'}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded p-2 text-xs text-[#F4E8D5]"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#D3C5AE] uppercase tracking-wider mb-1">
                  Languages Spoken
                </label>
                <input
                  type="text"
                  value={formData.guideDetails?.languages?.join(', ') || 'English, Swahili, Maa'}
                  className="w-full bg-[#4B321F] border border-[#C89A4B]/40 rounded p-2 text-xs text-[#F4E8D5]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Submit Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#C89A4B]/30">
          {saveSuccessMsg ? (
            <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {saveSuccessMsg}
            </div>
          ) : (
            <span className="text-xs text-[#D3C5AE]">
              Changes will take immediate effect across your active listings.
            </span>
          )}

          <button
            type="submit"
            className="btn-gold py-3 px-8 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl"
          >
            <Save className="w-4 h-4" />
            Save Profile & Credentials
          </button>
        </div>
      </form>
    </div>
  );
};
