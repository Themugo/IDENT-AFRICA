/**
 * IDENT AFRICA - Visual CMS Dashboard
 * Complete content management interface
 */

import React, { useState, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Compass, 
  Image, 
  Palette, 
  Package, 
  MessageSquareQuote,
  Handshake,
  Layers,
  Save,
  Eye,
  EyeOff,
  ChevronRight,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  Check,
  X,
  Upload,
  Settings,
  Home,
  MapPin,
  FileText,
  Loader2
} from 'lucide-react';
import type { 
  CMSEditorState,
  CMSHomepageConfig,
  CMSDestination,
  CMSMediaItem,
  CMSThemeConfig,
  CMSHeroContent,
  CMSSectionConfig
} from '../../types/cms';

// Tab definitions
const CMS_TABS = [
  { id: 'homepage', label: 'Homepage', icon: Home, color: 'text-amber-500' },
  { id: 'destinations', label: 'Destinations', icon: MapPin, color: 'text-emerald-500' },
  { id: 'accommodation', label: 'Accommodation', icon: Building2, color: 'text-blue-500' },
  { id: 'experiences', label: 'Experiences', icon: Compass, color: 'text-purple-500' },
  { id: 'packages', label: 'Packages', icon: Package, color: 'text-orange-500' },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote, color: 'text-cyan-500' },
  { id: 'partners', label: 'Partners', icon: Handshake, color: 'text-rose-500' },
  { id: 'media', label: 'Media Library', icon: Image, color: 'text-indigo-500' },
  { id: 'theme', label: 'Theme', icon: Palette, color: 'text-pink-500' },
] as const;

// ============ HELPER COMPONENTS ============

interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant, children }) => {
  const styles = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${styles[variant]}`}>
      {children}
    </span>
  );
};

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  onClick,
  disabled,
  className = '',
  icon 
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200';
  
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-lg shadow-amber-500/20',
    secondary: 'bg-stone-700 hover:bg-stone-600 text-stone-100 border border-stone-600',
    ghost: 'bg-transparent hover:bg-stone-700/50 text-stone-300',
    danger: 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

interface InputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'url' | 'email';
  error?: string;
  hint?: string;
}

const Input: React.FC<InputProps> = ({ label, value, onChange, placeholder, type = 'text', error, hint }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-stone-300">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 bg-stone-800 border rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${error ? 'border-rose-500' : 'border-stone-700'}`}
    />
    {hint && <p className="text-xs text-stone-500">{hint}</p>}
    {error && <p className="text-xs text-rose-400">{error}</p>}
  </div>
);

interface TextAreaProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const TextArea: React.FC<TextAreaProps> = ({ label, value, onChange, placeholder, rows = 4 }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-sm font-medium text-stone-300">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
    />
  </div>
);

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => (
  <label className="inline-flex items-center gap-3 cursor-pointer">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-amber-500' : 'bg-stone-600'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
    {label && <span className="text-sm text-stone-300">{label}</span>}
  </label>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-stone-800/50 border border-stone-700 rounded-xl overflow-hidden ${onClick ? 'cursor-pointer hover:border-stone-600 transition-colors' : ''} ${className}`}
  >
    {children}
  </div>
);

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full ${sizes[size]} bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl`}>
          <div className="flex items-center justify-between p-4 border-b border-stone-700">
            <h2 className="text-lg font-semibold text-stone-100">{title}</h2>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-200 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
          {footer && (
            <div className="p-4 border-t border-stone-700 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ IMAGE PICKER ============

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ value, onChange, label, hint }) => (
  <div className="space-y-2">
    {label && <label className="block text-sm font-medium text-stone-300">{label}</label>}
    <div className="flex gap-3">
      <div className="relative w-24 h-24 bg-stone-800 border border-stone-700 rounded-lg overflow-hidden flex-shrink-0">
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-stone-500">
            <Image size={24} />
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <Input 
          value={value} 
          onChange={onChange} 
          placeholder="https://example.com/image.jpg"
          hint={hint}
        />
        <p className="text-xs text-stone-500">Enter URL or select from Media Library</p>
      </div>
    </div>
  </div>
);

// ============ LIST TABLE ============

interface ListTableProps<T> {
  columns: { key: string; label: string; render?: (item: T) => React.ReactNode }[];
  data: T[];
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  onToggle: (item: T) => void;
  getId: (item: T) => string;
  emptyMessage?: string;
}

function ListTable<T>({ columns, data, onEdit, onDelete, onToggle, getId, emptyMessage = 'No items found' }: ListTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-stone-700">
            {columns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-700/50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-stone-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map(item => (
              <tr key={getId(item)} className="hover:bg-stone-800/30 transition-colors">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm text-stone-300">
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as string}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => onToggle(item)}
                      className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
                      title="Toggle active"
                    >
                      <ToggleLeft size={18} />
                    </button>
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(item)}
                      className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ============ HOMEPAGE EDITOR ============

interface HomepageEditorProps {
  config: CMSHomepageConfig;
  onChange: (config: CMSHomepageConfig) => void;
}

const HomepageEditor: React.FC<HomepageEditorProps> = ({ config, onChange }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  const updateHero = (updates: Partial<CMSHeroContent>) => {
    onChange({ ...config, hero: { ...config.hero, ...updates } });
  };
  
  const updateSection = (sectionId: string, updates: Partial<CMSSectionConfig>) => {
    onChange({
      ...config,
      sections: config.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s)
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-100">Hero Section</h3>
          <Toggle 
            checked={config.hero.isActive} 
            onChange={(v) => updateHero({ isActive: v })} 
            label={config.hero.isActive ? 'Visible' : 'Hidden'}
          />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Input 
            label="Title" 
            value={config.hero.title} 
            onChange={(v) => updateHero({ title: v })} 
          />
          <Input 
            label="Subtitle" 
            value={config.hero.subtitle} 
            onChange={(v) => updateHero({ subtitle: v })} 
          />
          <Input 
            label="Button Text" 
            value={config.hero.ctaText} 
            onChange={(v) => updateHero({ ctaText: v })} 
          />
          <Input 
            label="Button Link" 
            value={config.hero.ctaLink} 
            onChange={(v) => updateHero({ ctaLink: v })} 
          />
          <div className="md:col-span-2">
            <ImagePicker 
              label="Background Image" 
              value={config.hero.backgroundImage}
              onChange={(v) => updateHero({ backgroundImage: v })}
              hint="Use a high-quality landscape image (1920x1080 recommended)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">
              Overlay Opacity: {Math.round(config.hero.overlayOpacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.hero.overlayOpacity}
              onChange={(e) => updateHero({ overlayOpacity: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>
      </Card>
      
      {/* Sections */}
      <Card className="p-4">
        <h3 className="font-semibold text-stone-100 mb-4">Page Sections</h3>
        <p className="text-sm text-stone-400 mb-4">
          Reorder and toggle visibility of homepage sections. Click to edit individual section settings.
        </p>
        
        <div className="space-y-2">
          {config.sections.sort((a, b) => a.order - b.order).map((section) => (
            <div 
              key={section.id}
              className={`p-3 bg-stone-800/50 border rounded-lg transition-all ${
                activeSection === section.id ? 'border-amber-500/50' : 'border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers size={16} className="text-stone-500" />
                  <div>
                    <p className="font-medium text-stone-200">{section.title}</p>
                    <p className="text-xs text-stone-500">{section.component}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle 
                    checked={section.isActive} 
                    onChange={(v) => updateSection(section.id, { isActive: v })} 
                  />
                  <button 
                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                    className="p-1.5 text-stone-400 hover:text-stone-200"
                  >
                    <ChevronRight size={16} className={`transform transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
              
              {activeSection === section.id && (
                <div className="mt-4 pt-4 border-t border-stone-700 grid gap-4 md:grid-cols-2">
                  <Input 
                    label="Section Title" 
                    value={section.title} 
                    onChange={(v) => updateSection(section.id, { title: v })} 
                  />
                  <Input 
                    label="Section Subtitle" 
                    value={section.subtitle || ''} 
                    onChange={(v) => updateSection(section.id, { subtitle: v })} 
                  />
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-1.5">Display Order</label>
                    <input
                      type="number"
                      min="1"
                      value={section.order}
                      onChange={(e) => updateSection(section.id, { order: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
      
      {/* Footer Section */}
      <Card className="p-4">
        <h3 className="font-semibold text-stone-100 mb-4">Footer Configuration</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input 
            label="Company Name" 
            value={config.footer.companyName} 
            onChange={(v) => onChange({ 
              ...config, 
              footer: { ...config.footer, companyName: v } 
            })} 
          />
          <Input 
            label="Tagline" 
            value={config.footer.tagline} 
            onChange={(v) => onChange({ 
              ...config, 
              footer: { ...config.footer, tagline: v } 
            })} 
          />
          <Input 
            label="Contact Email" 
            value={config.footer.contactEmail} 
            onChange={(v) => onChange({ 
              ...config, 
              footer: { ...config.footer, contactEmail: v } 
            })} 
            type="email"
          />
          <Input 
            label="Contact Phone" 
            value={config.footer.contactPhone} 
            onChange={(v) => onChange({ 
              ...config, 
              footer: { ...config.footer, contactPhone: v } 
            })} 
          />
        </div>
      </Card>
    </div>
  );
};

// ============ DESTINATION MANAGER ============

interface DestinationManagerProps {
  destinations: CMSDestination[];
  onChange: (destinations: CMSDestination[]) => void;
}

const DestinationManager: React.FC<DestinationManagerProps> = ({ destinations, onChange }) => {
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [editingDestination, setEditingDestination] = useState<CMSDestination | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const countries = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda'];
  
  const filtered = destinations.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.country.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = filterCountry === 'all' || d.country === filterCountry;
    return matchesSearch && matchesCountry;
  });
  
  const handleSave = (destination: CMSDestination) => {
    const existing = destinations.find(d => d.id === destination.id);
    if (existing) {
      onChange(destinations.map(d => d.id === destination.id ? destination : d));
    } else {
      onChange([...destinations, { ...destination, createdAt: new Date().toISOString() }]);
    }
    setEditingDestination(null);
    setIsCreating(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      onChange(destinations.filter(d => d.id !== id));
    }
  };
  
  const createNew = () => {
    const newDest: CMSDestination = {
      id: `dest-${Date.now()}`,
      name: '',
      tagline: '',
      country: 'Kenya',
      region: '',
      category: 'Savanna & Plains',
      image: '',
      heroImage: '',
      gallery: [],
      description: '',
      highlights: [],
      rating: 0,
      reviewsCount: 0,
      startingPrice: 0,
      durationDays: 1,
      wildlifeHighlights: [],
      bestMonths: [],
      coordinates: { lat: 0, lng: 0 },
      featured: false,
      ecoScore: 0,
      isActive: true,
      seo: { title: '', description: '', keywords: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin'
    };
    setEditingDestination(newDest);
    setIsCreating(true);
  };
  
  const columns = [
    { key: 'name', label: 'Name', render: (d: CMSDestination) => (
      <div className="flex items-center gap-3">
        <img src={d.image} alt="" className="w-10 h-10 rounded object-cover" />
        <div>
          <p className="font-medium text-stone-100">{d.name}</p>
          <p className="text-xs text-stone-500">{d.region}</p>
        </div>
      </div>
    )},
    { key: 'country', label: 'Country' },
    { key: 'featured', label: 'Featured', render: (d: CMSDestination) => (
      d.featured ? <Badge variant="success">Featured</Badge> : null
    )},
    { key: 'isActive', label: 'Status', render: (d: CMSDestination) => (
      <Badge variant={d.isActive ? 'success' : 'error'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>
    )},
  ];
  
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
          <input
            type="text"
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
          />
        </div>
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        >
          <option value="all">All Countries</option>
          {countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button icon={<Plus size={18} />} onClick={createNew}>
          Add Destination
        </Button>
      </div>
      
      {/* Table */}
      <Card>
        <ListTable 
          columns={columns}
          data={filtered}
          onEdit={(d) => setEditingDestination(d)}
          onDelete={(d) => handleDelete(d.id)}
          onToggle={(d) => onChange(destinations.map(x => x.id === d.id ? { ...x, isActive: !x.isActive } : x))}
          getId={(d) => d.id}
        />
      </Card>
      
      {/* Edit Modal */}
      <Modal
        isOpen={!!editingDestination}
        onClose={() => { setEditingDestination(null); setIsCreating(false); }}
        title={isCreating ? 'Create Destination' : 'Edit Destination'}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setEditingDestination(null); setIsCreating(false); }}>
              Cancel
            </Button>
            <Button onClick={() => editingDestination && handleSave(editingDestination)}>
              {isCreating ? 'Create' : 'Save Changes'}
            </Button>
          </>
        }
      >
        {editingDestination && (
          <DestinationForm 
            destination={editingDestination}
            onChange={setEditingDestination}
          />
        )}
      </Modal>
    </div>
  );
};

interface DestinationFormProps {
  destination: CMSDestination;
  onChange: (d: CMSDestination) => void;
}

const DestinationForm: React.FC<DestinationFormProps> = ({ destination, onChange }) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Content' },
    { id: 'media', label: 'Media' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'seo', label: 'SEO' },
  ];
  
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-amber-500 text-amber-400' 
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" value={destination.name} onChange={(v) => onChange({ ...destination, name: v })} />
          <Input label="Tagline" value={destination.tagline} onChange={(v) => onChange({ ...destination, tagline: v })} />
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">Country</label>
            <select
              value={destination.country}
              onChange={(e) => onChange({ ...destination, country: e.target.value as CMSDestination['country'] })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
            >
              {['Kenya', 'Tanzania', 'Uganda', 'Rwanda'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Input label="Region" value={destination.region} onChange={(v) => onChange({ ...destination, region: v })} />
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-300 mb-1.5">Category</label>
            <select
              value={destination.category}
              onChange={(e) => onChange({ ...destination, category: e.target.value as CMSDestination['category'] })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
            >
              {['Savanna & Plains', 'Crater & Highlands', 'Impenetrable Forest', 'Tropical Coast & Beach', 'Alpine Mountain'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Toggle label="Featured destination" checked={destination.featured} onChange={(v) => onChange({ ...destination, featured: v })} />
          <Toggle label="Active" checked={destination.isActive} onChange={(v) => onChange({ ...destination, isActive: v })} />
        </div>
      )}
      
      {activeTab === 'content' && (
        <div className="space-y-4">
          <TextArea 
            label="Description" 
            value={destination.description} 
            onChange={(v) => onChange({ ...destination, description: v })} 
            rows={6}
          />
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">Highlights (one per line)</label>
            <textarea
              value={destination.highlights.join('\n')}
              onChange={(e) => onChange({ ...destination, highlights: e.target.value.split('\n').filter(Boolean) })}
              rows={4}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1.5">Latitude</label>
              <input
                type="number"
                step="any"
                value={destination.coordinates.lat}
                onChange={(e) => onChange({ ...destination, coordinates: { ...destination.coordinates, lat: parseFloat(e.target.value) } })}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1.5">Longitude</label>
              <input
                type="number"
                step="any"
                value={destination.coordinates.lng}
                onChange={(e) => onChange({ ...destination, coordinates: { ...destination.coordinates, lng: parseFloat(e.target.value) } })}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
              />
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'media' && (
        <div className="space-y-4">
          <ImagePicker 
            label="Main Image" 
            value={destination.image}
            onChange={(v) => onChange({ ...destination, image: v })}
          />
          <ImagePicker 
            label="Hero Image" 
            value={destination.heroImage}
            onChange={(v) => onChange({ ...destination, heroImage: v })}
          />
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">Gallery Images (URLs, one per line)</label>
            <textarea
              value={destination.gallery.join('\n')}
              onChange={(e) => onChange({ ...destination, gallery: e.target.value.split('\n').filter(Boolean) })}              rows={6}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            />
          </div>
        </div>
      )}
      
      {activeTab === 'pricing' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Starting Price (USD)" value={String(destination.startingPrice)} onChange={(v) => onChange({ ...destination, startingPrice: parseInt(v) || 0 })} type="number" />
          <Input label="Duration (Days)" value={String(destination.durationDays)} onChange={(v) => onChange({ ...destination, durationDays: parseInt(v) || 1 })} type="number" />
          <Input label="Rating (0-5)" value={String(destination.rating)} onChange={(v) => onChange({ ...destination, rating: parseFloat(v) || 0 })} type="number" />
          <Input label="Eco Score (0-10)" value={String(destination.ecoScore)} onChange={(v) => onChange({ ...destination, ecoScore: parseFloat(v) || 0 })} type="number" />
          <Input label="Reviews Count" value={String(destination.reviewsCount)} onChange={(v) => onChange({ ...destination, reviewsCount: parseInt(v) || 0 })} type="number" />
        </div>
      )}
      
      {activeTab === 'seo' && (
        <div className="space-y-4">
          <Input 
            label="SEO Title" 
            value={destination.seo.title} 
            onChange={(v) => onChange({ ...destination, seo: { ...destination.seo, title: v } })} 
            hint="Max 60 characters"
          />
          <TextArea 
            label="SEO Description" 
            value={destination.seo.description} 
            onChange={(v) => onChange({ ...destination, seo: { ...destination.seo, description: v } })} 
            hint="Max 160 characters"
            rows={3}
          />
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1.5">Keywords (comma separated)</label>
            <input
              value={destination.seo.keywords.join(', ')}
              onChange={(e) => onChange({ ...destination, seo: { ...destination.seo, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) } })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
            />
          </div>
          <ImagePicker 
            label="OG Image" 
            value={destination.seo.ogImage || ''}
            onChange={(v) => onChange({ ...destination, seo: { ...destination.seo, ogImage: v } })}
          />
        </div>
      )}
    </div>
  );
};

// ============ MEDIA MANAGER ============

interface MediaManagerProps {
  media: CMSMediaItem[];
  onChange: (media: CMSMediaItem[]) => void;
}

const MediaManager: React.FC<MediaManagerProps> = ({ media, onChange }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  
  const filtered = media.filter(m => {
    const matchesSearch = m.filename.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === 'all' || m.mimeType.startsWith(filterType);
    return matchesSearch && matchesType;
  });
  
  const handleUpload = () => {
    // Simulated upload - in production, this would use file input
    setIsUploading(true);
    setTimeout(() => {
      const newItem: CMSMediaItem = {
        id: `media-${Date.now()}`,
        filename: `upload-${Date.now()}.jpg`,
        originalName: 'uploaded-image.jpg',
        url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
        mimeType: 'image/jpeg',
        size: 512000,
        width: 1920,
        height: 1080,
        tags: [],
        uploadedBy: 'admin',
        createdAt: new Date().toISOString()
      };
      onChange([newItem, ...media]);
      setIsUploading(false);
    }, 1500);
  };
  
  const handleDelete = (ids: string[]) => {
    if (confirm(`Delete ${ids.length} item(s)?`)) {
      onChange(media.filter(m => !ids.includes(m.id)));
      setSelectedItems(new Set());
    }
  };
  
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedItems(newSet);
  };
  
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        >
          <option value="all">All Types</option>
          <option value="image/">Images</option>
          <option value="video/">Videos</option>
          <option value="application/pdf">PDFs</option>
        </select>
        <Button icon={isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} onClick={handleUpload}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
      
      {/* Selected Actions */}
      {selectedItems.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <span className="text-sm text-amber-400">{selectedItems.size} selected</span>
          <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => handleDelete(Array.from(selectedItems))}>
            Delete Selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedItems(new Set())}>
            Clear Selection
          </Button>
        </div>
      )}
      
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map(item => (
          <div 
            key={item.id}
            className={`group relative aspect-square bg-stone-800 border rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedItems.has(item.id) ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-700 hover:border-stone-500'
            }`}
            onClick={() => toggleSelect(item.id)}
          >
            {item.mimeType.startsWith('image/') ? (
              <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full text-stone-500">
                <FileText size={32} />
                <span className="text-xs mt-1">{item.mimeType.split('/')[1]}</span>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-xs text-white truncate">{item.filename}</p>
                <p className="text-xs text-stone-400">{(item.size / 1024).toFixed(1)} KB</p>
              </div>
              {selectedItems.has(item.id) && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-stone-900" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-12 text-stone-500">
          <Image size={48} className="mx-auto mb-4 opacity-50" />
          <p>No media items found</p>
        </div>
      )}
    </div>
  );
};

// ============ THEME EDITOR ============

interface ThemeEditorProps {
  config: CMSThemeConfig;
  onChange: (config: CMSThemeConfig) => void;
}

const ThemeEditor: React.FC<ThemeEditorProps> = ({ config, onChange }) => {
  const [activeSection, setActiveSection] = useState('colors');
  
  const sections = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: FileText },
    { id: 'buttons', label: 'Buttons', icon: Layers },
    { id: 'logo', label: 'Logo', icon: Image },
    { id: 'spacing', label: 'Spacing', icon: Settings },
  ];
  
  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card className="p-2">
          <nav className="space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                }`}
              >
                <section.icon size={16} />
                {section.label}
              </button>
            ))}
          </nav>
        </Card>
      </div>
      
      {/* Content */}
      <div className="lg:col-span-3">
        <Card className="p-6">
          {activeSection === 'colors' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-stone-100">Color Palette</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1.5">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.colors.primary}
                      onChange={(e) => onChange({ ...config, colors: { ...config.colors, primary: e.target.value } })}
                      className="w-12 h-10 rounded border border-stone-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colors.primary}
                      onChange={(e) => onChange({ ...config, colors: { ...config.colors, primary: e.target.value } })}
                      className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1.5">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.colors.secondary}
                      onChange={(e) => onChange({ ...config, colors: { ...config.colors, secondary: e.target.value } })}
                      className="w-12 h-10 rounded border border-stone-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colors.secondary}
                      onChange={(e) => onChange({ ...config, colors: { ...config.colors, secondary: e.target.value } })}
                      className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1.5">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.colors.accent}
                      onChange={(e) => onChange({ ...config, colors: { ...config.colors, accent: e.target.value } })}
                      className="w-12 h-10 rounded border border-stone-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colors.accent}
                      onChange={(e) => onChange({ ...config, colors: { ...config.colors, accent: e.target.value } })}
                      className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1.5">Background</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.colors.background}
                      onChange={(e) => onChange({ ...config, colors: { ...config.colors, background: e.target.value } })}
                      className="w-12 h-10 rounded border border-stone-700 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.colors.background}
                      onChange={(e) => onChange({ ...config, colors: { ...config.colors, background: e.target.value } })}
                      className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: config.colors.background }}>
                <p className="text-sm text-stone-400 mb-2">Preview</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: config.colors.primary, color: '#000' }}>
                    Primary Button
                  </button>
                  <button className="px-4 py-2 rounded-lg font-medium" style={{ backgroundColor: config.colors.secondary, color: '#fff' }}>
                    Secondary
                  </button>
                  <button className="px-4 py-2 rounded-lg font-medium border-2" style={{ borderColor: config.colors.accent, color: config.colors.accent }}>
                    Accent
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'typography' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-stone-100">Typography</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input 
                  label="Heading Font" 
                  value={config.typography.headingFont} 
                  onChange={(v) => onChange({ ...config, typography: { ...config.typography, headingFont: v } })}
                />
                <Input 
                  label="Body Font" 
                  value={config.typography.bodyFont} 
                  onChange={(v) => onChange({ ...config, typography: { ...config.typography, bodyFont: v } })}
                />
              </div>
              
              {/* Preview */}
              <div className="space-y-4 p-4 bg-stone-800/50 rounded-lg">
                <h1 className="text-3xl font-bold" style={{ fontFamily: config.typography.headingFont }}>Heading 1</h1>
                <h2 className="text-2xl font-semibold" style={{ fontFamily: config.typography.headingFont }}>Heading 2</h2>
                <p className="text-base" style={{ fontFamily: config.typography.bodyFont }}>
                  Body text preview. This is how body content will appear on the website.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'buttons' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-stone-100">Button Styles</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input 
                  label="Border Radius" 
                  value={config.button.borderRadius} 
                  onChange={(v) => onChange({ ...config, button: { ...config.button, borderRadius: v } })}
                  hint="e.g., 8px, 9999px"
                />
                <Input 
                  label="Padding X" 
                  value={config.button.paddingX} 
                  onChange={(v) => onChange({ ...config, button: { ...config.button, paddingX: v } })}
                />
                <Input 
                  label="Padding Y" 
                  value={config.button.paddingY} 
                  onChange={(v) => onChange({ ...config, button: { ...config.button, paddingY: v } })}
                />
                <Input 
                  label="Font Size" 
                  value={config.button.fontSize} 
                  onChange={(v) => onChange({ ...config, button: { ...config.button, fontSize: v } })}
                />
              </div>
              
              {/* Preview */}
              <div className="p-6 bg-stone-800/50 rounded-lg flex gap-4">
                <button 
                  className="font-medium transition-all"
                  style={{
                    padding: `${config.button.paddingY} ${config.button.paddingX}`,
                    borderRadius: config.button.borderRadius,
                    fontSize: config.button.fontSize,
                    backgroundColor: config.colors.primary,
                    boxShadow: config.button.shadow
                  }}
                >
                  Primary Button
                </button>
                <button 
                  className="font-medium transition-all"
                  style={{
                    padding: `${config.button.paddingY} ${config.button.paddingX}`,
                    borderRadius: config.button.borderRadius,
                    fontSize: config.button.fontSize,
                    backgroundColor: 'transparent',
                    border: `1px solid ${config.colors.secondary}`
                  }}
                >
                  Secondary
                </button>
              </div>
            </div>
          )}
          
          {activeSection === 'logo' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-stone-100">Logo & Branding</h3>
              <ImagePicker 
                label="Logo URL" 
                value={config.logo.url}
                onChange={(v) => onChange({ ...config, logo: { ...config.logo, url: v } })}
              />
              <ImagePicker 
                label="Favicon URL" 
                value={config.favicon}
                onChange={(v) => onChange({ ...config, favicon: v })}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input 
                  label="Logo Width" 
                  value={config.logo.width} 
                  onChange={(v) => onChange({ ...config, logo: { ...config.logo, width: v } })}
                />
                <Input 
                  label="Logo Height" 
                  value={config.logo.height} 
                  onChange={(v) => onChange({ ...config, logo: { ...config.logo, height: v } })}
                />
              </div>
            </div>
          )}
          
          {activeSection === 'spacing' && (
            <div className="space-y-6">
              <h3 className="font-semibold text-stone-100">Spacing Scale</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(config.spacing).map(([key, value]) => (
                  <Input 
                    key={key}
                    label={`Spacing ${key.toUpperCase()}`}
                    value={value}
                    onChange={(v) => onChange({ ...config, spacing: { ...config.spacing, [key]: v } })}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============ MAIN CMS DASHBOARD ============

export const CMSDashboard: React.FC = () => {
  const [editorState, setEditorState] = useState<CMSEditorState>({
    activeTab: 'homepage',
    isEditing: false,
    isSaving: false,
    hasUnsavedChanges: false,
    previewMode: false,
  });
  
  // Mock data states
  const [homepageConfig] = useState<CMSHomepageConfig>({
    id: 'homepage-1',
    hero: {
      id: 'hero-1',
      title: 'East Africa\'s Finest Safari Expeditions',
      subtitle: 'Experience the wild heart of Africa with curated luxury expeditions across Kenya, Tanzania, Uganda & Rwanda',
      ctaText: 'Start Your Journey',
      ctaLink: '/destinations',
      backgroundImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
      overlayOpacity: 0.4,
      isActive: true,
    },
    sections: [
      { id: 'trust', component: 'TrustPillars', title: 'Why Travel With Us', isActive: true, order: 1 },
      { id: 'destinations', component: 'FeaturedDestinations', title: 'Featured Destinations', isActive: true, order: 2 },
      { id: 'experiences', component: 'ExperiencePillars', title: 'Unforgettable Experiences', isActive: true, order: 3 },
      { id: 'itineraries', component: 'ItineraryShowcase', title: 'Curated Safari Packages', isActive: true, order: 4 },
      { id: 'map', component: 'InteractiveMap', title: 'Explore East Africa', isActive: true, order: 5 },
      { id: 'calendar', component: 'SeasonalCalendar', title: 'Best Time to Visit', isActive: true, order: 6 },
      { id: 'testimonials', component: 'Testimonials', title: 'Traveler Stories', isActive: true, order: 7 },
    ],
    footer: {
      companyName: 'Ident Africa',
      tagline: 'Luxury East Africa Expeditions & Sanctuaries',
      contactEmail: 'hello@identafrica.com',
      contactPhone: '+254 700 123 456',
      socialLinks: [
        { platform: 'instagram', url: 'https://instagram.com/identafrica' },
        { platform: 'facebook', url: 'https://facebook.com/identafrica' },
      ],
    },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin',
  });
  
  const [destinations, setDestinations] = useState<CMSDestination[]>([
    {
      id: 'dest-masai-mara',
      name: 'Masai Mara National Reserve',
      tagline: 'World-Famous Great Wildebeest Migration & Big Cat Empire',
      country: 'Kenya',
      region: 'Narok County, Rift Valley',
      category: 'Savanna & Plains',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      heroImage: '',
      gallery: [],
      description: 'The Masai Mara is one of Africa\'s greatest wildlife havens...',
      highlights: ['Great Migration', 'Big Five', 'Balloon Safari'],
      rating: 4.95,
      reviewsCount: 328,
      startingPrice: 3800,
      durationDays: 5,
      wildlifeHighlights: ['The Big Five', 'Great Wildebeest Migration'],
      bestMonths: ['July', 'August', 'September'],
      coordinates: { lat: -1.4061, lng: 35.1328 },
      featured: true,
      ecoScore: 9.9,
      isActive: true,
      seo: { title: '', description: '', keywords: [] },
      createdAt: '',
      updatedAt: '',
      createdBy: 'admin',
    },
  ]);
  
  const [media, setMedia] = useState<CMSMediaItem[]>([
    {
      id: 'media-1',
      filename: 'safari-hero.jpg',
      originalName: 'safari_hero.jpg',
      url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80',
      mimeType: 'image/jpeg',
      size: 245000,
      width: 1920,
      height: 1080,
      tags: ['hero', 'safari'],
      uploadedBy: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'media-2',
      filename: 'luxury-lodge.jpg',
      originalName: 'luxury_lodge.jpg',
      url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80',
      mimeType: 'image/jpeg',
      size: 312000,
      width: 1920,
      height: 1080,
      tags: ['lodge', 'luxury'],
      uploadedBy: 'admin',
      createdAt: new Date().toISOString(),
    },
  ]);
  
  const [themeConfig] = useState<CMSThemeConfig>({
    id: 'theme-1',
    logo: { url: '/logo.svg', alt: 'Ident Africa', width: '150px', height: '40px' },
    favicon: '/favicon.ico',
    colors: {
      primary: '#F59E0B',
      primaryHover: '#D97706',
      secondary: '#78716C',
      secondaryHover: '#57534E',
      accent: '#10B981',
      background: '#1C1917',
      backgroundAlt: '#292524',
      surface: '#292524',
      text: '#FAFAF9',
      textMuted: '#A8A29E',
      border: '#44403C',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    typography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Inter, sans-serif',
      fontWeights: { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 },
    },
    button: {
      borderRadius: '8px',
      paddingX: '24px',
      paddingY: '12px',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      shadowHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
    borderRadius: { sm: '4px', md: '8px', lg: '12px', full: '9999px' },
    shadows: { sm: '0 1px 2px', md: '0 4px 6px', lg: '0 10px 15px', xl: '0 20px 25px' },
    updatedAt: new Date().toISOString(),
    updatedBy: 'admin',
  });
  
  const [homepage, setHomepage] = useState(homepageConfig);
  
  const handleSave = useCallback(async () => {
    setEditorState(prev => ({ ...prev, isSaving: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEditorState(prev => ({ 
      ...prev, 
      isSaving: false, 
      hasUnsavedChanges: false 
    }));
  }, []);
  
  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={24} className="text-amber-500" />
              <h1 className="text-lg font-semibold text-stone-100">Content Manager</h1>
            </div>
            {editorState.hasUnsavedChanges && (
              <Badge variant="warning">Unsaved Changes</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant={editorState.previewMode ? 'primary' : 'ghost'}
              size="sm"
              icon={editorState.previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
              onClick={() => setEditorState(prev => ({ ...prev, previewMode: !prev.previewMode }))}
            >
              {editorState.previewMode ? 'Exit Preview' : 'Preview'}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!editorState.hasUnsavedChanges || editorState.isSaving}
              icon={editorState.isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            >
              {editorState.isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-stone-800 bg-stone-900/50 min-h-[calc(100vh-57px)]">
          <nav className="p-3 space-y-1">
            {CMS_TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setEditorState(prev => ({ ...prev, activeTab: tab.id as typeof prev.activeTab }))}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    editorState.activeTab === tab.id
                      ? `bg-stone-800 text-stone-100`
                      : 'text-stone-400 hover:bg-stone-800/50 hover:text-stone-200'
                  }`}
                >
                  <Icon size={18} className={tab.color} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {editorState.activeTab === 'homepage' && (
            <HomepageEditor config={homepage} onChange={(config) => {
              setHomepage(config);
              setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
            }} />
          )}
          
          {editorState.activeTab === 'destinations' && (
            <DestinationManager destinations={destinations} onChange={(d) => {
              setDestinations(d);
              setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
            }} />
          )}
          
          {editorState.activeTab === 'media' && (
            <MediaManager media={media} onChange={(m) => {
              setMedia(m);
              setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
            }} />
          )}
          
          {editorState.activeTab === 'theme' && (
            <ThemeEditor config={themeConfig} onChange={() => {
              setEditorState(prev => ({ ...prev, hasUnsavedChanges: true }));
            }} />
          )}
          
          {editorState.activeTab === 'accommodation' && (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto mb-4 text-stone-600" />
              <h2 className="text-xl font-semibold text-stone-300 mb-2">Accommodation Manager</h2>
              <p className="text-stone-500">Manage lodges, hotels, camps, and rooms</p>
            </div>
          )}
          
          {editorState.activeTab === 'experiences' && (
            <div className="text-center py-12">
              <Compass size={48} className="mx-auto mb-4 text-stone-600" />
              <h2 className="text-xl font-semibold text-stone-300 mb-2">Experience Manager</h2>
              <p className="text-stone-500">Manage safari, culture, adventure, and wildlife experiences</p>
            </div>
          )}
          
          {editorState.activeTab === 'packages' && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto mb-4 text-stone-600" />
              <h2 className="text-xl font-semibold text-stone-300 mb-2">Package Manager</h2>
              <p className="text-stone-500">Manage safari itineraries and packages</p>
            </div>
          )}
          
          {editorState.activeTab === 'testimonials' && (
            <div className="text-center py-12">
              <MessageSquareQuote size={48} className="mx-auto mb-4 text-stone-600" />
              <h2 className="text-xl font-semibold text-stone-300 mb-2">Testimonials</h2>
              <p className="text-stone-500">Manage traveler reviews and testimonials</p>
            </div>
          )}
          
          {editorState.activeTab === 'partners' && (
            <div className="text-center py-12">
              <Handshake size={48} className="mx-auto mb-4 text-stone-600" />
              <h2 className="text-xl font-semibold text-stone-300 mb-2">Partners</h2>
              <p className="text-stone-500">Manage conservation and tourism partners</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CMSDashboard;
