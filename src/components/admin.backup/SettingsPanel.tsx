/**
 * Settings Panel Component
 * 
 * System settings and configuration.
 */

import React, { useState } from 'react';
import {
  Settings,
  Palette,
  Building2,
  CreditCard,
  Globe,
  Mail,
  Shield,
  Save,
  Upload,
  Image,
  Check,
  AlertCircle,
  Database,
  Key,
  Bell,
} from 'lucide-react';

const SETTINGS_SECTIONS = [
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'business', label: 'Business', icon: Building2 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

// Mock settings data
const SETTINGS_DATA = {
  brand: {
    companyName: 'IDENT Africa',
    logo: null,
    favicon: null,
    primaryColor: '#F59E0B',
    secondaryColor: '#1C1917',
    tagline: 'Experience the Wild Heart of Africa',
  },
  business: {
    currency: 'USD',
    taxRate: 15,
    minBookingDays: 7,
    maxBookingDays: 365,
    cancellationDays: 14,
    contactEmail: 'info@identafrica.com',
    contactPhone: '+254 700 000 000',
    address: 'Nairobi, Kenya',
  },
  payments: {
    stripeEnabled: true,
    paypalEnabled: false,
    bankTransferEnabled: true,
    currency: 'USD',
  },
  integrations: {
    emailProvider: 'sendgrid',
    analyticsId: 'UA-XXXXXXXXX',
    chatbotEnabled: true,
  },
};

// ============ COLOR PICKER ============

const ColorPicker: React.FC<{ label: string; value: string; onChange: (color: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-stone-300 mb-2">{label}</label>
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border border-stone-700 cursor-pointer"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 uppercase"
      />
    </div>
  </div>
);

// ============ SETTINGS INPUT ============

interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  helpText?: string;
}

const SettingsInput: React.FC<SettingsInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  helpText,
}) => (
  <div>
    <label className="block text-sm font-medium text-stone-300 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
    />
    {helpText && <p className="mt-1 text-xs text-stone-500">{helpText}</p>}
  </div>
);

// ============ TOGGLE SWITCH ============

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between p-4 bg-stone-800/50 rounded-xl">
    <div>
      <p className="font-medium text-stone-100">{label}</p>
      {description && <p className="text-sm text-stone-500">{description}</p>}
    </div>
    <button
      onClick={() => onChange(!enabled)}
      className={`w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-stone-600'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-0.5'
      }`} />
    </button>
  </div>
);

// ============ MAIN SETTINGS PANEL ============

export const SettingsPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState('brand');
  const [settings, setSettings] = useState(SETTINGS_DATA);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings size={24} className="text-amber-500" />
              <h1 className="text-xl font-bold text-stone-100">System Settings</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 font-medium rounded-lg flex items-center gap-2 ${
                saved 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-amber-500 hover:bg-amber-600 text-stone-900'
              }`}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : saved ? (
                <Check size={18} />
              ) : (
                <Save size={18} />
              )}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-stone-800 p-4">
          <nav className="space-y-1">
            {SETTINGS_SECTIONS.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeSection === section.id
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          {/* Brand Settings */}
          {activeSection === 'brand' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-100 mb-1">Brand Settings</h2>
                <p className="text-sm text-stone-500">Customize your brand appearance</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={settings.brand.companyName}
                    onChange={(e) => updateSetting('brand', 'companyName', e.target.value)}
                    className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-stone-800 rounded-xl flex items-center justify-center border border-stone-700">
                      <Image size={32} className="text-stone-600" />
                    </div>
                    <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
                      <Upload size={18} />
                      Upload Logo
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={settings.brand.tagline}
                    onChange={(e) => updateSetting('brand', 'tagline', e.target.value)}
                    className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <ColorPicker
                    label="Primary Color"
                    value={settings.brand.primaryColor}
                    onChange={(color) => updateSetting('brand', 'primaryColor', color)}
                  />
                  <ColorPicker
                    label="Secondary Color"
                    value={settings.brand.secondaryColor}
                    onChange={(color) => updateSetting('brand', 'secondaryColor', color)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Business Settings */}
          {activeSection === 'business' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-100 mb-1">Business Settings</h2>
                <p className="text-sm text-stone-500">Configure business operations</p>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Currency</label>
                    <select
                      value={settings.business.currency}
                      onChange={(e) => updateSetting('business', 'currency', e.target.value)}
                      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={settings.business.taxRate}
                      onChange={(e) => updateSetting('business', 'taxRate', e.target.value)}
                      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Min Booking Days</label>
                    <input
                      type="number"
                      value={settings.business.minBookingDays}
                      onChange={(e) => updateSetting('business', 'minBookingDays', e.target.value)}
                      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Max Booking Days</label>
                    <input
                      type="number"
                      value={settings.business.maxBookingDays}
                      onChange={(e) => updateSetting('business', 'maxBookingDays', e.target.value)}
                      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Cancellation Notice</label>
                    <input
                      type="number"
                      value={settings.business.cancellationDays}
                      onChange={(e) => updateSetting('business', 'cancellationDays', e.target.value)}
                      className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-stone-100">Contact Information</h3>
                  <SettingsInput
                    label="Email"
                    value={settings.business.contactEmail}
                    onChange={(v) => updateSetting('business', 'contactEmail', v)}
                    type="email"
                  />
                  <SettingsInput
                    label="Phone"
                    value={settings.business.contactPhone}
                    onChange={(v) => updateSetting('business', 'contactPhone', v)}
                  />
                  <SettingsInput
                    label="Address"
                    value={settings.business.address}
                    onChange={(v) => updateSetting('business', 'address', v)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payments Settings */}
          {activeSection === 'payments' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-100 mb-1">Payment Settings</h2>
                <p className="text-sm text-stone-500">Configure payment methods</p>
              </div>

              <div className="space-y-4">
                <ToggleSwitch
                  enabled={settings.payments.stripeEnabled}
                  onChange={(v) => updateSetting('payments', 'stripeEnabled', v)}
                  label="Stripe Payments"
                  description="Accept credit cards and digital wallets"
                />
                <ToggleSwitch
                  enabled={settings.payments.paypalEnabled}
                  onChange={(v) => updateSetting('payments', 'paypalEnabled', v)}
                  label="PayPal"
                  description="Accept PayPal payments"
                />
                <ToggleSwitch
                  enabled={settings.payments.bankTransferEnabled}
                  onChange={(v) => updateSetting('payments', 'bankTransferEnabled', v)}
                  label="Bank Transfer"
                  description="Direct bank transfers for large bookings"
                />
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-400 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-400">Configure Payment Providers</p>
                  <p className="text-sm text-stone-400 mt-1">
                    Payment provider credentials should be configured through environment variables for security.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Settings */}
          {activeSection === 'integrations' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-100 mb-1">Integrations</h2>
                <p className="text-sm text-stone-500">Connect external services</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-stone-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Mail size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-100">Email Provider</p>
                        <p className="text-sm text-stone-500">SendGrid</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                      Connected
                    </span>
                  </div>
                  <button className="text-sm text-amber-400 hover:text-amber-300">Configure</button>
                </div>

                <div className="p-4 bg-stone-800/50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Database size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-100">Analytics</p>
                        <p className="text-sm text-stone-500">Google Analytics</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-stone-600/50 text-stone-400 rounded-full text-xs">
                      Not configured
                    </span>
                  </div>
                  <SettingsInput
                    label="Measurement ID"
                    value={settings.integrations.analyticsId}
                    onChange={(v) => updateSetting('integrations', 'analyticsId', v)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeSection === 'notifications' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-100 mb-1">Notifications</h2>
                <p className="text-sm text-stone-500">Configure email and system notifications</p>
              </div>

              <div className="space-y-4">
                <ToggleSwitch
                  enabled={true}
                  onChange={() => {}}
                  label="New Booking Email"
                  description="Email admins when a new booking is received"
                />
                <ToggleSwitch
                  enabled={true}
                  onChange={() => {}}
                  label="Payment Confirmation"
                  description="Email customers when payment is received"
                />
                <ToggleSwitch
                  enabled={true}
                  onChange={() => {}}
                  label="Booking Reminder"
                  description="Email customers 7 days before travel"
                />
                <ToggleSwitch
                  enabled={false}
                  onChange={() => {}}
                  label="Marketing Emails"
                  description="Send promotional content to subscribers"
                />
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-100 mb-1">Security</h2>
                <p className="text-sm text-stone-500">Manage security and access settings</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-stone-800/50 rounded-xl">
                  <h3 className="font-medium text-stone-100 mb-4">API Keys</h3>
                  <div className="flex items-center justify-between p-3 bg-stone-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key size={18} className="text-stone-500" />
                      <span className="text-stone-300">Production API Key</span>
                    </div>
                    <button className="text-sm text-amber-400 hover:text-amber-300">Regenerate</button>
                  </div>
                </div>

                <div className="p-4 bg-stone-800/50 rounded-xl">
                  <h3 className="font-medium text-stone-100 mb-4">User Permissions</h3>
                  <div className="space-y-2">
                    {['Super Admin', 'Content Manager', 'Booking Manager', 'Supplier Manager'].map(role => (
                      <div key={role} className="flex items-center justify-between p-3 bg-stone-800 rounded-lg">
                        <span className="text-stone-300">{role}</span>
                        <button className="text-sm text-amber-400 hover:text-amber-300">Manage</button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-stone-800/50 rounded-xl">
                  <h3 className="font-medium text-stone-100 mb-4">Session Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-300">Session Timeout</span>
                      <select className="px-3 py-1 bg-stone-800 border border-stone-700 rounded-lg text-stone-100">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>4 hours</option>
                        <option>24 hours</option>
                      </select>
                    </div>
                    <ToggleSwitch
                      enabled={true}
                      onChange={() => {}}
                      label="Two-Factor Authentication"
                      description="Require 2FA for admin accounts"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPanel;
