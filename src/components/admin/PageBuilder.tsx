/**
 * Page Builder Admin Component
 * 
 * Protected block-based page builder.
 * Admin controls content, settings, visibility, and order.
 * Admin cannot modify block components or break styling.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Plus,
  GripVertical,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Save,
  Loader2,
  MapPin,
  Compass,
  Building2,
  Package,
  Image,
  MessageSquareQuote,
  Handshake,
  MousePointer,
  Layout,
  Check,
  AlertCircle,
} from 'lucide-react';
import type {
  Block,
  BlockType,
  PageType,
  PageBlocksResponse,
} from '../../types/blocks';

const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  hero: <Layout size={18} />,
  destination: <MapPin size={18} />,
  experience: <Compass size={18} />,
  hotel: <Building2 size={18} />,
  package: <Package size={18} />,
  gallery: <Image size={18} />,
  testimonial: <MessageSquareQuote size={18} />,
  partner: <Handshake size={18} />,
  cta: <MousePointer size={18} />,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  hero: 'Hero Section',
  destination: 'Destinations',
  experience: 'Experiences',
  hotel: 'Accommodation',
  package: 'Safari Packages',
  gallery: 'Gallery',
  testimonial: 'Testimonials',
  partner: 'Partners',
  cta: 'Call to Action',
};

const PAGES: { type: PageType; label: string }[] = [
  { type: 'homepage', label: 'Homepage' },
  { type: 'destinations', label: 'Destinations' },
  { type: 'accommodation', label: 'Accommodation' },
  { type: 'experiences', label: 'Experiences' },
  { type: 'packages', label: 'Packages' },
  { type: 'about', label: 'About' },
  { type: 'contact', label: 'Contact' },
];

// ============ BLOCK CONTENT EDITORS ============

interface HeroBlockEditorProps {
  block: Block;
  onChange: (content: Record<string, unknown>) => void;
}

const HeroBlockEditor: React.FC<HeroBlockEditorProps> = ({ block, onChange }) => {
  const content = block.content as Record<string, unknown>;
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Subtitle</label>
        <textarea
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Button Text</label>
          <input
            type="text"
            value={content.ctaText || ''}
            onChange={(e) => onChange({ ...content, ctaText: e.target.value })}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Button Link</label>
          <input
            type="text"
            value={content.ctaLink || ''}
            onChange={(e) => onChange({ ...content, ctaLink: e.target.value })}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Background Image URL</label>
        <input
          type="text"
          value={content.backgroundImage || ''}
          onChange={(e) => onChange({ ...content, backgroundImage: e.target.value })}
          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        />
        {content.backgroundImage && (
          <img src={content.backgroundImage as string} alt="" className="mt-2 h-32 object-cover rounded-lg" />
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">
          Overlay Opacity: {Math.round(((content.overlayOpacity as number) || 0.4) * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={content.overlayOpacity || 0.4}
          onChange={(e) => onChange({ ...content, overlayOpacity: parseFloat(e.target.value) })}
          className="w-full accent-amber-500"
        />
      </div>
    </div>
  );
};

interface SectionBlockEditorProps {
  block: Block;
  onChange: (content: Record<string, unknown>) => void;
}

const SectionBlockEditor: React.FC<SectionBlockEditorProps> = ({ block, onChange }) => {
  const content = block.content as Record<string, unknown>;
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Section Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Subtitle</label>
        <textarea
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Layout</label>
          <select
            value={content.layout as string || 'grid'}
            onChange={(e) => onChange({ ...content, layout: e.target.value })}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          >
            <option value="grid">Grid</option>
            <option value="carousel">Carousel</option>
            <option value="slider">Slider</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Columns</label>
          <select
            value={content.columns as number || 3}
            onChange={(e) => onChange({ ...content, columns: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          >
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
          </select>
        </div>
      </div>
    </div>
  );
};

interface CTABlockEditorProps {
  block: Block;
  onChange: (content: Record<string, unknown>) => void;
}

const CTABlockEditor: React.FC<CTABlockEditorProps> = ({ block, onChange }) => {
  const content = block.content as Record<string, unknown>;
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Title</label>
        <input
          type="text"
          value={content.title || ''}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Subtitle</label>
        <textarea
          value={content.subtitle || ''}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Button Text</label>
          <input
            type="text"
            value={content.buttonText || ''}
            onChange={(e) => onChange({ ...content, buttonText: e.target.value })}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Button Link</label>
          <input
            type="text"
            value={content.buttonLink || ''}
            onChange={(e) => onChange({ ...content, buttonLink: e.target.value })}
            className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">Button Style</label>
        <select
          value={content.buttonStyle as string || 'primary'}
          onChange={(e) => onChange({ ...content, buttonStyle: e.target.value })}
          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100"
        >
          <option value="primary">Primary (Dark)</option>
          <option value="secondary">Secondary (Light)</option>
          <option value="outline">Outline</option>
        </select>
      </div>
    </div>
  );
};

// ============ BLOCK EDITOR ============

interface BlockEditorProps {
  block: Block;
  onSave: (content: Record<string, unknown>) => void;
  onCancel: () => void;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ block, onSave, onCancel }) => {
  const [content, setContent] = useState(block.content as Record<string, unknown>);
  
  const renderEditor = () => {
    switch (block.sectionType) {
      case 'hero':
        return <HeroBlockEditor block={block} onChange={setContent} />;
      case 'cta':
        return <CTABlockEditor block={block} onChange={setContent} />;
      default:
        return <SectionBlockEditor block={block} onChange={setContent} />;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-stone-700">
            <div className="flex items-center gap-3">
              {BLOCK_ICONS[block.sectionType]}
              <h2 className="text-lg font-semibold text-stone-100">
                Edit {BLOCK_LABELS[block.sectionType]}
              </h2>
            </div>
            <button onClick={onCancel} className="p-1 text-stone-400 hover:text-stone-200">
              <X size={20} />
            </button>
          </div>
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {renderEditor()}
          </div>
          <div className="p-4 border-t border-stone-700 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(content)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-medium rounded-lg flex items-center gap-2"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN PAGE BUILDER ============

export const PageBuilder: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<PageType>('homepage');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  const fetchBlocks = useCallback(async (page: PageType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/page-builder/${page}`);
      const data = await response.json();
      if (data.success) {
        setBlocks(data.data.blocks || []);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchBlocks(selectedPage);
  }, [selectedPage, fetchBlocks]);
  
  const handleToggleVisibility = async (block: Block) => {
    const newVisible = !block.settings.visible;
    
    // Optimistic update
    setBlocks(prev =>
      prev.map(b =>
        b.id === block.id
          ? { ...b, settings: { ...b.settings, visible: newVisible }, visible: newVisible }
          : b
      )
    );
    
    try {
      await fetch(`/api/page-builder/blocks/${block.id}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visible: newVisible }),
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      // Revert on error
      fetchBlocks(selectedPage);
    }
  };
  
  const handleMoveBlock = async (blockId: string, direction: 'up' | 'down') => {
    const currentIndex = blocks.findIndex(b => b.id === blockId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    
    // Swap orders
    const newBlocks = [...blocks];
    const tempOrder = newBlocks[currentIndex].displayOrder;
    newBlocks[currentIndex].displayOrder = newBlocks[newIndex].displayOrder;
    newBlocks[newIndex].displayOrder = tempOrder;
    newBlocks.sort((a, b) => a.displayOrder - b.displayOrder);
    setBlocks(newBlocks);
    
    try {
      await fetch(`/api/page-builder/${selectedPage}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds: newBlocks.map(b => b.id) }),
      });
    } catch (error) {
      console.error('Error reordering blocks:', error);
      fetchBlocks(selectedPage);
    }
  };
  
  const handleDeleteBlock = async (blockId: string) => {
    if (!confirm('Are you sure you want to delete this block?')) return;
    
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    
    try {
      await fetch(`/api/page-builder/blocks/${blockId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting block:', error);
      fetchBlocks(selectedPage);
    }
  };
  
  const handleAddBlock = async (blockType: BlockType) => {
    setShowAddMenu(false);
    setSaving(true);
    
    try {
      const response = await fetch(`/api/page-builder/${selectedPage}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionType: blockType }),
      });
      const data = await response.json();
      if (data.success) {
        fetchBlocks(selectedPage);
      }
    } catch (error) {
      console.error('Error adding block:', error);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveBlock = async (blockId: string, content: Record<string, unknown>) => {
    setEditingBlock(null);
    setSaving(true);
    
    // Optimistic update
    setBlocks(prev =>
      prev.map(b =>
        b.id === blockId ? { ...b, content, updatedAt: new Date().toISOString() } : b
      )
    );
    
    try {
      await fetch(`/api/page-builder/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error('Error saving block:', error);
      fetchBlocks(selectedPage);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <LayoutDashboard size={24} className="text-amber-500" />
              <h1 className="text-lg font-semibold text-stone-100">Page Builder</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {saving && (
              <span className="flex items-center gap-2 text-sm text-stone-400">
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </span>
            )}
          </div>
        </div>
        
        {/* Page Tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
          {PAGES.map(page => (
            <button
              key={page.type}
              onClick={() => setSelectedPage(page.type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedPage === page.type
                  ? 'bg-amber-500 text-stone-900'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {page.label}
            </button>
          ))}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Blocks List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-stone-500" />
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-12 bg-stone-900 border border-stone-800 rounded-xl">
                <Layout size={48} className="mx-auto mb-4 text-stone-600" />
                <h3 className="text-lg font-medium text-stone-300 mb-2">No blocks yet</h3>
                <p className="text-stone-500 mb-4">Add blocks to build your page</p>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`bg-stone-900 border rounded-xl overflow-hidden transition-colors ${
                    block.settings.visible === false
                      ? 'border-stone-800 opacity-60'
                      : 'border-stone-700 hover:border-stone-600'
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Drag Handle */}
                    <div className="cursor-grab text-stone-600 hover:text-stone-400">
                      <GripVertical size={20} />
                    </div>
                    
                    {/* Block Icon & Info */}
                    <div className="flex-1 flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        block.settings.visible === false ? 'bg-stone-800' : 'bg-stone-800 text-amber-500'
                      }`}>
                        {BLOCK_ICONS[block.sectionType]}
                      </div>
                      <div>
                        <h3 className="font-medium text-stone-100">
                          {BLOCK_LABELS[block.sectionType]}
                        </h3>
                        <p className="text-sm text-stone-500">
                          Order: {block.displayOrder}
                        </p>
                      </div>
                    </div>
                    
                    {/* Visibility Badge */}
                    {block.settings.visible === false && (
                      <span className="px-2 py-1 bg-stone-700 text-stone-400 text-xs rounded">
                        Hidden
                      </span>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveBlock(block.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-stone-400 hover:text-stone-200 disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        onClick={() => handleMoveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                        className="p-2 text-stone-400 hover:text-stone-200 disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDown size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleVisibility(block)}
                        className={`p-2 ${block.settings.visible ? 'text-stone-400 hover:text-amber-400' : 'text-stone-400 hover:text-emerald-400'}`}
                        title={block.settings.visible ? 'Hide block' : 'Show block'}
                      >
                        {block.settings.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => setEditingBlock(block)}
                        className="p-2 text-stone-400 hover:text-amber-400"
                        title="Edit content"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-2 text-stone-400 hover:text-rose-400"
                        title="Delete block"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Add Block Button */}
          <div className="mt-6 relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-full py-4 border-2 border-dashed border-stone-700 hover:border-amber-500 rounded-xl text-stone-400 hover:text-amber-400 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Block
            </button>
            
            {/* Add Block Menu */}
            {showAddMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-stone-800 border border-stone-700 rounded-xl shadow-xl overflow-hidden">
                  {(Object.keys(BLOCK_ICONS) as BlockType[]).map(blockType => (
                    <button
                      key={blockType}
                      onClick={() => handleAddBlock(blockType)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-stone-300 hover:bg-stone-700 transition-colors"
                    >
                      {BLOCK_ICONS[blockType]}
                      {BLOCK_LABELS[blockType]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      {/* Block Editor Modal */}
      {editingBlock && (
        <BlockEditor
          block={editingBlock}
          onSave={(content) => handleSaveBlock(editingBlock.id, content)}
          onCancel={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
};

export default PageBuilder;
