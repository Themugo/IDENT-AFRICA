/**
 * Content Manager Component
 * 
 * Website Control Center for managing all content.
 */

import React, { useState } from 'react';
import {
  Globe,
  Layout,
  MapPin,
  Calendar,
  Building2,
  Package,
  Image,
  Star,
  ChevronRight,
  Eye,
  Edit2,
  Plus,
  Search,
  EyeOff,
  GripVertical,
  X,
  Save,
  Loader2,
  CheckCircle,
} from 'lucide-react';

// Mock data for sections
const HOMEPAGE_SECTIONS = [
  { id: 'hero-1', type: 'hero', title: 'Hero Banner', enabled: true, order: 1 },
  { id: 'dest-1', type: 'destination', title: 'Featured Destinations', enabled: true, order: 2 },
  { id: 'exp-1', type: 'experience', title: 'Safari Experiences', enabled: true, order: 3 },
  { id: 'pkg-1', type: 'package', title: 'Safari Packages', enabled: true, order: 4 },
  { id: 'test-1', type: 'testimonial', title: 'Customer Reviews', enabled: true, order: 5 },
  { id: 'cta-1', type: 'cta', title: 'Call to Action', enabled: false, order: 6 },
];

const PAGE_SETTINGS = [
  { id: 'homepage', name: 'Homepage', description: 'Main landing page', sections: 6, status: 'published' },
  { id: 'destinations', name: 'Destinations', description: 'Browse wildlife destinations', sections: 4, status: 'published' },
  { id: 'accommodation', name: 'Accommodation', description: 'Lodges and camps', sections: 3, status: 'published' },
  { id: 'experiences', name: 'Experiences', description: 'Safari activities', sections: 3, status: 'draft' },
  { id: 'packages', name: 'Packages', description: 'Curated safari itineraries', sections: 4, status: 'published' },
  { id: 'about', name: 'About Us', description: 'Company information', sections: 2, status: 'published' },
  { id: 'contact', name: 'Contact', description: 'Get in touch', sections: 2, status: 'published' },
];

const CONTENT_TYPES = [
  { type: 'destination', label: 'Destinations', icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  { type: 'experience', label: 'Experiences', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { type: 'accommodation', label: 'Accommodation', icon: Building2, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { type: 'package', label: 'Packages', icon: Package, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  { type: 'gallery', label: 'Gallery', icon: Image, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  { type: 'testimonial', label: 'Testimonials', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
];

// ============ SECTION CARD ============

interface SectionCardProps {
  section: typeof HOMEPAGE_SECTIONS[0];
  onToggle: () => void;
  onEdit: () => void;
}

const SectionCard: React.FC<SectionCardProps> = ({ section, onToggle, onEdit }) => {
  const typeIcons: Record<string, React.ReactNode> = {
    hero: <Globe size={20} />,
    destination: <MapPin size={20} />,
    experience: <Calendar size={20} />,
    package: <Package size={20} />,
    testimonial: <Star size={20} />,
    cta: <Layout size={20} />,
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
      section.enabled ? 'bg-stone-800/50 border-stone-700' : 'bg-stone-900/50 border-stone-800 opacity-60'
    }`}>
      <div className="cursor-grab text-stone-600 hover:text-stone-400">
        <GripVertical size={20} />
      </div>
      
      <div className={`p-2 rounded-lg ${section.enabled ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-700 text-stone-500'}`}>
        {typeIcons[section.type]}
      </div>
      
      <div className="flex-1">
        <p className="font-medium text-stone-100">{section.title}</p>
        <p className="text-xs text-stone-500 capitalize">{section.type} section</p>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`p-2 rounded-lg transition-colors ${
            section.enabled 
              ? 'text-emerald-400 hover:bg-emerald-500/20' 
              : 'text-stone-500 hover:bg-stone-700'
          }`}
          title={section.enabled ? 'Disable section' : 'Enable section'}
        >
          {section.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button
          onClick={onEdit}
          className="p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/20 rounded-lg transition-colors"
        >
          <Edit2 size={18} />
        </button>
      </div>
    </div>
  );
};

// ============ CONTENT TYPE CARD ============

interface ContentTypeCardProps {
  type: typeof CONTENT_TYPES[0];
  onClick: () => void;
}

const ContentTypeCard: React.FC<ContentTypeCardProps> = ({ type, onClick }) => {
  const Icon = type.icon;
  
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-6 bg-stone-800/50 border border-stone-700 rounded-xl hover:border-stone-600 hover:bg-stone-800 transition-all group"
    >
      <div className={`p-3 rounded-xl ${type.bg}`}>
        <Icon size={28} className={type.color} />
      </div>
      <span className="font-medium text-stone-100 group-hover:text-amber-400 transition-colors">{type.label}</span>
      <div className="flex items-center gap-1 text-xs text-stone-500">
        <Plus size={12} />
        <span>Add new</span>
      </div>
    </button>
  );
};

// ============ MAIN CONTENT MANAGER ============

export const ContentManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'sections' | 'content'>('pages');
  const [sections, setSections] = useState(HOMEPAGE_SECTIONS);
  const [editingSection, setEditingSection] = useState<typeof HOMEPAGE_SECTIONS[0] | null>(null);
  const [saving, setSaving] = useState(false);

  const handleToggleSection = (id: string) => {
    setSections(prev =>
      prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    );
  };

  const handleSaveSection = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setEditingSection(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe size={24} className="text-amber-500" />
              <h1 className="text-xl font-bold text-stone-100">Website Control Center</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2">
              <Eye size={18} />
              Preview Site
            </button>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2">
              <CheckCircle size={18} />
              Publish Changes
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-6">
          {[
            { id: 'pages', label: 'Pages', icon: Layout },
            { id: 'sections', label: 'Homepage Sections', icon: Globe },
            { id: 'content', label: 'Content', icon: Package },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-6">
        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-100">Website Pages</h2>
                <p className="text-sm text-stone-500">Manage all pages on your website</p>
              </div>
              <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 rounded-lg flex items-center gap-2">
                <Plus size={18} />
                Add Page
              </button>
            </div>

            <div className="grid gap-4">
              {PAGE_SETTINGS.map(page => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 bg-stone-800/50 border border-stone-700 rounded-xl hover:border-stone-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-stone-700 flex items-center justify-center">
                      <Layout size={20} className="text-stone-400" />
                    </div>
                    <div>
                      <p className="font-medium text-stone-100">{page.name}</p>
                      <p className="text-sm text-stone-500">{page.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      page.status === 'published' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {page.status}
                    </span>
                    <span className="text-sm text-stone-500">{page.sections} sections</span>
                    <button className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded-lg">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-stone-100">Homepage Sections</h2>
                <p className="text-sm text-stone-500">Drag to reorder, click to edit</p>
              </div>

              <div className="space-y-3">
                {sections.map(section => (
                  <SectionCard
                    key={section.id}
                    section={section}
                    onToggle={() => handleToggleSection(section.id)}
                    onEdit={() => setEditingSection(section)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-stone-100">Quick Stats</h2>
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Active Sections</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {sections.filter(s => s.enabled).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Disabled</span>
                  <span className="text-lg font-bold text-stone-500">
                    {sections.filter(s => !s.enabled).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Total</span>
                  <span className="text-lg font-bold text-stone-100">
                    {sections.length}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-stone-100">Add Section</h2>
              <div className="space-y-2">
                {['hero', 'destination', 'experience', 'package', 'testimonial', 'gallery'].map(type => (
                  <button
                    key={type}
                    className="w-full flex items-center gap-3 p-3 bg-stone-800/50 border border-stone-700 rounded-lg hover:border-stone-600 transition-colors text-left"
                  >
                    <Plus size={16} className="text-stone-500" />
                    <span className="text-stone-300 capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-stone-100">Content Management</h2>
                <p className="text-sm text-stone-500">Create and manage all your content</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search content..."
                    className="pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CONTENT_TYPES.map(type => (
                <ContentTypeCard
                  key={type.type}
                  type={type}
                  onClick={() => {}}
                />
              ))}
            </div>

            <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
              <h3 className="font-semibold text-stone-100 mb-4">Recent Content</h3>
              <div className="space-y-3">
                {[
                  { title: 'Masai Mara National Reserve', type: 'Destination', status: 'published', date: '2 hours ago' },
                  { title: '7 Day Gorilla Trek Uganda', type: 'Package', status: 'draft', date: '5 hours ago' },
                  { title: 'Balloon Safari Experience', type: 'Experience', status: 'published', date: '1 day ago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-800 rounded-lg">
                    <div>
                      <p className="font-medium text-stone-100">{item.title}</p>
                      <p className="text-xs text-stone-500">{item.type} • {item.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'published' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70" onClick={() => setEditingSection(null)} />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl">
              <div className="flex items-center justify-between p-4 border-b border-stone-700">
                <h2 className="text-lg font-semibold text-stone-100">
                  Edit {editingSection.title}
                </h2>
                <button onClick={() => setEditingSection(null)} className="p-1 text-stone-400 hover:text-stone-200">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Section Title</label>
                  <input
                    type="text"
                    defaultValue={editingSection.title}
                    className="w-full px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-stone-800 rounded-lg">
                  <div>
                    <p className="font-medium text-stone-100">Section Enabled</p>
                    <p className="text-sm text-stone-500">Show this section on the homepage</p>
                  </div>
                  <button
                    onClick={() => handleToggleSection(editingSection.id)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      editingSection.enabled ? 'bg-emerald-500' : 'bg-stone-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      editingSection.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-stone-700 flex justify-end gap-3">
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSection}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManager;
