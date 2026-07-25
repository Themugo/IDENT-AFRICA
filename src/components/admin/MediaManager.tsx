/**
 * Media Manager Admin Component
 * 
 * Professional media library with upload, replace, delete, and analytics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  Upload,
  Trash2,
  Edit2,
  Search,
  Filter,
  Grid,
  List,
  X,
  Check,
  AlertCircle,
  Loader2,
  FolderOpen,
  Tag,
  ExternalLink,
  Eye,
  BarChart3,
  RefreshCw,
  Download,
  Copy,
  MoreVertical,
  ChevronDown,
  Star,
  Clock,
  HardDrive,
} from 'lucide-react';
import type { MediaAsset, MediaStats, MediaCategory } from '../../types/media';

const CATEGORIES: { value: MediaCategory; label: string; icon: string }[] = [
  { value: 'hero', label: 'Hero Images', icon: '🖼️' },
  { value: 'destination', label: 'Destinations', icon: '🗺️' },
  { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { value: 'experience', label: 'Experiences', icon: '🎯' },
  { value: 'gallery', label: 'Gallery', icon: '📷' },
  { value: 'partner', label: 'Partners', icon: '🤝' },
  { value: 'testimonial', label: 'Testimonials', icon: '⭐' },
  { value: 'blog', label: 'Blog', icon: '📝' },
  { value: 'profile', label: 'Profile', icon: '👤' },
  { value: 'ui', label: 'UI Elements', icon: '🎨' },
  { value: 'banner', label: 'Banners', icon: '📊' },
  { value: 'other', label: 'Other', icon: '📁' },
];

// Mock data for demo
const MOCK_MEDIA: MediaAsset[] = [
  {
    id: 'media-1',
    filename: 'hero-safari-main.jpg',
    originalName: 'hero-safari-main.jpg',
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg',
    format: 'jpeg',
    size: 245000,
    width: 1920,
    height: 1080,
    storagePath: 'uploads/hero-safari-main.jpg',
    category: 'hero',
    altText: 'Safari wildlife in Masai Mara',
    description: 'Main hero image for homepage',
    source: 'uploaded',
    tags: ['hero', 'safari', 'wildlife'],
    usage: [{ entityType: 'homepage', usageType: 'primary', isRequired: true }],
    isOptimized: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-2',
    filename: 'masai-mara-hero.jpg',
    originalName: 'masai-mara-hero.jpg',
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1920&q=80',
    mimeType: 'image/jpeg',
    format: 'jpeg',
    size: 312000,
    width: 1920,
    height: 1080,
    storagePath: 'uploads/masai-mara-hero.jpg',
    category: 'destination',
    altText: 'Masai Mara wildlife',
    description: 'Primary image for Masai Mara destination',
    source: 'default',
    tags: ['destination', 'masai-mara', 'kenya'],
    usage: [],
    isOptimized: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'media-3',
    filename: 'luxury-lodge.jpg',
    originalName: 'luxury-lodge.jpg',
    url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    mimeType: 'image/jpeg',
    format: 'jpeg',
    size: 278000,
    width: 1920,
    height: 1080,
    storagePath: 'uploads/luxury-lodge.jpg',
    category: 'accommodation',
    altText: 'Luxury safari lodge',
    source: 'default',
    tags: ['lodge', 'luxury'],
    usage: [],
    isOptimized: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_STATS: MediaStats = {
  totalAssets: 24,
  totalSize: 5243000,
  byCategory: {
    hero: { count: 5, size: 1200000 },
    destination: { count: 6, size: 1500000 },
    accommodation: { count: 4, size: 980000 },
    experience: { count: 3, size: 720000 },
    gallery: { count: 4, size: 840000 },
    partner: { count: 2, size: 240000 },
    testimonial: { count: 0, size: 0 },
    blog: { count: 0, size: 0 },
    profile: { count: 0, size: 0 },
    ui: { count: 0, size: 0 },
    banner: { count: 0, size: 0 },
    other: { count: 0, size: 0 },
  },
  bySource: {
    default: { count: 20, size: 4200000 },
    uploaded: { count: 4, size: 1043000 },
  },
  unusedAssets: 2,
  lastUpload: new Date().toISOString(),
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${val} ${sizes[i]}`;
}

// ============ STATS CARD ============

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-stone-400">{title}</span>
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-stone-100">{value}</div>
    {subtitle && <div className="text-xs text-stone-500 mt-1">{subtitle}</div>}
  </div>
);

// ============ MEDIA GRID ITEM ============

interface MediaGridItemProps {
  media: MediaAsset;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const MediaGridItem: React.FC<MediaGridItemProps> = ({
  media,
  selected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
}) => (
  <div
    className={`group relative bg-stone-800 border rounded-xl overflow-hidden transition-all cursor-pointer ${
      selected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-700 hover:border-stone-600'
    }`}
    onClick={onSelect}
  >
    {/* Image */}
    <div className="aspect-square bg-stone-900">
      <img
        src={media.url}
        alt={media.altText || media.filename}
        className="w-full h-full object-cover"
      />
    </div>
    
    {/* Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-sm text-white font-medium truncate">{media.filename}</p>
        <p className="text-xs text-stone-400">{formatBytes(media.size)}</p>
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(); }}
          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white"
          title="Preview"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 bg-rose-500/50 hover:bg-rose-500 rounded-lg text-white"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
    
    {/* Source Badge */}
    <div className="absolute top-2 left-2">
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
        media.source === 'uploaded' 
          ? 'bg-emerald-500/90 text-white' 
          : 'bg-stone-700/90 text-stone-300'
      }`}>
        {media.source === 'uploaded' ? 'Uploaded' : 'Default'}
      </span>
    </div>
    
    {/* Selection Check */}
    {selected && (
      <div className="absolute top-2 left-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
        <Check size={14} className="text-stone-900" />
      </div>
    )}
  </div>
);

// ============ MAIN MEDIA MANAGER ============

export const MediaManager: React.FC = () => {
  const [media, setMedia] = useState<MediaAsset[]>(MOCK_MEDIA);
  const [stats] = useState<MediaStats>(MOCK_STATS);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<MediaCategory | 'all'>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'uploaded' | 'default'>('all');
  const [previewMedia, setPreviewMedia] = useState<MediaAsset | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaAsset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'stats' | 'defaults'>('library');
  
  // Filter media
  const filteredMedia = media.filter(m => {
    const matchesSearch = !searchQuery || 
      m.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.altText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    const matchesSource = filterSource === 'all' || m.source === filterSource;
    
    return matchesSearch && matchesCategory && matchesSource;
  });
  
  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };
  
  const handleSelectAll = () => {
    if (selectedIds.size === filteredMedia.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMedia.map(m => m.id)));
    }
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this media?')) {
      setMedia(prev => prev.filter(m => m.id !== id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };
  
  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.size} selected items?`)) {
      setMedia(prev => prev.filter(m => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
    }
  };
  
  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image size={24} className="text-amber-500" />
              <h1 className="text-lg font-semibold text-stone-100">Media Library</h1>
            </div>
            <span className="px-2 py-0.5 bg-stone-800 text-stone-400 text-sm rounded">
              {stats.totalAssets} assets
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2"
            >
              <Upload size={18} />
              Upload
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'library' ? 'bg-amber-500/10 text-amber-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'stats' ? 'bg-amber-500/10 text-amber-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Statistics
          </button>
          <button
            onClick={() => setActiveTab('defaults')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activeTab === 'defaults' ? 'bg-amber-500/10 text-amber-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Default Assets
          </button>
        </div>
      </header>
      
      <div className="p-6">
        {activeTab === 'library' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Total Assets"
                value={stats.totalAssets}
                subtitle={`${formatBytes(stats.totalSize)} used`}
                icon={<HardDrive size={18} className="text-blue-400" />}
                color="bg-blue-500/20"
              />
              <StatsCard
                title="Uploaded"
                value={stats.bySource.uploaded.count}
                subtitle={formatBytes(stats.bySource.uploaded.size)}
                icon={<Upload size={18} className="text-emerald-400" />}
                color="bg-emerald-500/20"
              />
              <StatsCard
                title="Default"
                value={stats.bySource.default.count}
                subtitle={formatBytes(stats.bySource.default.size)}
                icon={<Star size={18} className="text-amber-400" />}
                color="bg-amber-500/20"
              />
              <StatsCard
                title="Unused"
                value={stats.unusedAssets}
                subtitle="Can be cleaned up"
                icon={<AlertCircle size={18} className="text-rose-400" />}
                color="bg-rose-500/20"
              />
            </div>
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={18} />
                <input
                  type="text"
                  placeholder="Search by filename, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as MediaCategory | 'all')}
                className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                ))}
              </select>
              
              {/* Source Filter */}
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value as 'all' | 'uploaded' | 'default')}
                className="px-4 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
              >
                <option value="all">All Sources</option>
                <option value="uploaded">Uploaded Only</option>
                <option value="default">Default Only</option>
              </select>
              
              {/* View Toggle */}
              <div className="flex border border-stone-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 ${view === 'grid' ? 'bg-stone-700 text-stone-100' : 'bg-stone-800 text-stone-400'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 ${view === 'list' ? 'bg-stone-700 text-stone-100' : 'bg-stone-800 text-stone-400'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-6">
                <span className="text-sm text-amber-400 font-medium">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-sm flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-1.5 text-stone-400 hover:text-stone-200 text-sm"
                >
                  Clear
                </button>
              </div>
            )}
            
            {/* Media Grid */}
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12">
                <Image size={48} className="mx-auto mb-4 text-stone-600" />
                <h3 className="text-lg font-medium text-stone-300 mb-2">No media found</h3>
                <p className="text-stone-500 mb-4">Upload images or adjust your filters</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg"
                >
                  Upload Media
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 ${
                view === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' 
                  : 'grid-cols-1'
              }`}>
                {filteredMedia.map(item => (
                  <MediaGridItem
                    key={item.id}
                    media={item}
                    selected={selectedIds.has(item.id)}
                    onSelect={() => handleSelect(item.id)}
                    onPreview={() => setPreviewMedia(item)}
                    onEdit={() => setEditingMedia(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-stone-100">Storage Statistics</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* By Category */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                <h3 className="font-medium text-stone-200 mb-4">Assets by Category</h3>
                <div className="space-y-3">
                  {CATEGORIES.filter(c => stats.byCategory[c.value]?.count > 0).map(cat => (
                    <div key={cat.value} className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-stone-300">{cat.label}</span>
                          <span className="text-stone-500">{stats.byCategory[cat.value].count} ({formatBytes(stats.byCategory[cat.value].size)})</span>
                        </div>
                        <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${(stats.byCategory[cat.value].count / stats.totalAssets) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* By Source */}
              <div className="bg-stone-800/50 border border-stone-700 rounded-xl p-6">
                <h3 className="font-medium text-stone-200 mb-4">Assets by Source</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Upload size={20} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-stone-300">Uploaded</span>
                        <span className="text-stone-500">{stats.bySource.uploaded.count} assets</span>
                      </div>
                      <div className="text-lg font-semibold text-emerald-400">{formatBytes(stats.bySource.uploaded.size)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Star size={20} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-stone-300">Default</span>
                        <span className="text-stone-500">{stats.bySource.default.count} assets</span>
                      </div>
                      <div className="text-lg font-semibold text-amber-400">{formatBytes(stats.bySource.default.size)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Unused Assets */}
            {stats.unusedAssets > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle size={20} className="text-rose-400" />
                  <h3 className="font-medium text-stone-200">Unused Assets</h3>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-sm rounded">
                    {stats.unusedAssets} files
                  </span>
                </div>
                <p className="text-stone-400 text-sm mb-4">
                  These uploaded assets are not currently used anywhere on the website.
                </p>
                <button className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg text-sm">
                  Clean Up Unused Assets
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'defaults' && (
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star size={20} className="text-amber-400" />
                <h3 className="font-medium text-stone-200">Default Assets Registry</h3>
              </div>
              <p className="text-stone-400 text-sm mb-4">
                These are the built-in premium images from Unsplash that power the website when no custom uploads exist.
                They cannot be deleted but can be replaced with uploaded versions.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-800 rounded-lg">
                  <p className="text-2xl font-bold text-amber-400">{Object.keys(MOCK_MEDIA.filter(m => m.source === 'default')).length}</p>
                  <p className="text-sm text-stone-500">Hero Images</p>
                </div>
                <div className="p-4 bg-stone-800 rounded-lg">
                  <p className="text-2xl font-bold text-amber-400">{Object.keys(MOCK_MEDIA.filter(m => m.source === 'default')).length}</p>
                  <p className="text-sm text-stone-500">Destination Images</p>
                </div>
                <div className="p-4 bg-stone-800 rounded-lg">
                  <p className="text-2xl font-bold text-amber-400">{Object.keys(MOCK_MEDIA.filter(m => m.source === 'default')).length}</p>
                  <p className="text-sm text-stone-500">Experience Images</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80" onClick={() => setPreviewMedia(null)} />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden">
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute top-4 right-4 p-2 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-400"
              >
                <X size={20} />
              </button>
              <img
                src={previewMedia.url}
                alt={previewMedia.altText || previewMedia.filename}
                className="w-full max-h-[60vh] object-contain bg-stone-950"
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-100">{previewMedia.filename}</h3>
                    <p className="text-sm text-stone-400">{previewMedia.altText}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    previewMedia.source === 'uploaded' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-700 text-stone-400'
                  }`}>
                    {previewMedia.source === 'uploaded' ? 'Uploaded' : 'Default'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-stone-500">Dimensions</p>
                    <p className="text-stone-300">{previewMedia.width} x {previewMedia.height}</p>
                  </div>
                  <div>
                    <p className="text-stone-500">Size</p>
                    <p className="text-stone-300">{formatBytes(previewMedia.size)}</p>
                  </div>
                  <div>
                    <p className="text-stone-500">Category</p>
                    <p className="text-stone-300 capitalize">{previewMedia.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/70" onClick={() => setShowUploadModal(false)} />
          <div className="relative min-h-full flex items-center justify-center p-4">
            <div className="relative max-w-lg w-full bg-stone-900 border border-stone-700 rounded-2xl">
              <div className="flex items-center justify-between p-4 border-b border-stone-700">
                <h2 className="text-lg font-semibold text-stone-100">Upload Media</h2>
                <button onClick={() => setShowUploadModal(false)} className="p-1 text-stone-400 hover:text-stone-200">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="border-2 border-dashed border-stone-700 rounded-xl p-12 text-center">
                  <Upload size={48} className="mx-auto mb-4 text-stone-600" />
                  <p className="text-stone-400 mb-2">Drag and drop files here</p>
                  <p className="text-stone-500 text-sm mb-4">or</p>
                  <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg">
                    Browse Files
                  </button>
                  <p className="text-xs text-stone-500 mt-4">Supports: JPG, PNG, WebP, GIF (max 10MB)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaManager;
