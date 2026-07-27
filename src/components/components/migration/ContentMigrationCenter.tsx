'use client';

/**
 * Content Migration Center
 * Admin tools for content management and migration
 */

import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileEdit,
  Archive,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  RefreshCw,
  Search,
  User,
  Users,
  Server,
  History,
  AlertTriangle,
} from 'lucide-react';

interface ContentOverview {
  destinations: { total: number; by_status: Record<string, number>; by_ownership: Record<string, number> };
  packages: { total: number; by_status: Record<string, number>; by_ownership: Record<string, number> };
  experiences: { total: number; by_status: Record<string, number>; by_ownership: Record<string, number> };
  media: { total: number; by_status: Record<string, number> };
}

interface MigrationHistory {
  id: string;
  migration_type: string;
  description: string;
  content_type: string;
  performed_by: string;
  items_processed: number;
  items_succeeded: number;
  items_failed: number;
  status: string;
  created_at: string;
}

interface DefaultContent {
  content_id: string;
  content_type: string;
  name: string;
  is_active: boolean;
  can_be_modified: boolean;
}

interface ContentRules {
  display_priority: Array<{ status: string; ownership: string; label: string }>;
  fallback_chain: string[];
  show_rules: { never_show_empty: boolean; default_fallback: boolean; draft_hidden: boolean };
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  default: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: <Server className="w-4 h-4" /> },
  draft: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <FileEdit className="w-4 h-4" /> },
  published: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <Eye className="w-4 h-4" /> },
  archived: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <Archive className="w-4 h-4" /> },
};

const OWNERSHIP_ICONS: Record<string, React.ReactNode> = {
  system: <Server className="w-4 h-4" />,
  admin: <User className="w-4 h-4" />,
  supplier: <Users className="w-4 h-4" />,
};

export function ContentMigrationCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bulk' | 'import' | 'replace' | 'history'>('overview');
  const [overview, setOverview] = useState<ContentOverview | null>(null);
  const [history, setHistory] = useState<MigrationHistory[]>([]);
  const [defaultContent, setDefaultContent] = useState<DefaultContent[]>([]);
  const [rules, setRules] = useState<ContentRules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOwnership, setFilterOwnership] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, historyRes, defaultRes, rulesRes] = await Promise.all([
        fetch('/api/migration/overview'),
        fetch('/api/migration/history'),
        fetch('/api/migration/default-content'),
        fetch('/api/migration/content-rules'),
      ]);

      const [overviewData, historyData, defaultData, rulesData] = await Promise.all([
        overviewRes.json(),
        historyRes.json(),
        defaultRes.json(),
        rulesRes.json(),
      ]);

      if (overviewData.success) setOverview(overviewData.data);
      if (historyData.success) setHistory(historyData.data.migrations || []);
      if (defaultData.success) setDefaultContent(defaultData.data.items || []);
      if (rulesData.success) setRules(rulesData.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) return;
    
    try {
      const endpoint = `/api/migration/${action}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: selectedItems, performedBy: 'admin' }),
      });
      
      const data = await response.json();
      if (data.success) {
        setSelectedItems([]);
        loadData();
      }
    } catch (err) {
      console.error('Bulk action failed:', err);
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C89A4B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cinzel font-bold text-[#C89A4B]">
            Content Migration Center
          </h1>
          <p className="text-[#8B7355]">Manage content status, ownership, and migration</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-[#3D2B1F] text-[#F4E8D5] rounded-lg hover:bg-[#4B321F] transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Content Rules Banner */}
      {rules && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#C89A4B] mt-0.5" />
            <div>
              <h3 className="font-medium text-[#D6B06A]">Production Content Rules</h3>
              <div className="mt-2 text-sm text-[#8B7355] space-y-1">
                <p>• <span className="text-emerald-400">Never show empty pages</span> - Default content displays if no live content exists</p>
                <p>• <span className="text-emerald-400">Priority order:</span> Admin Published → Supplier Published → System Default</p>
                <p>• <span className="text-emerald-400">Draft content is hidden</span> - Only Published status is visible to users</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#C89A4B]/20">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Overview" />
        <TabButton active={activeTab === 'bulk'} onClick={() => setActiveTab('bulk')} label="Bulk Operations" />
        <TabButton active={activeTab === 'import'} onClick={() => setActiveTab('import')} label="Import" />
        <TabButton active={activeTab === 'replace'} onClick={() => setActiveTab('replace')} label="Replace Images" />
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="History" />
      </div>

      {/* Content */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard
              title="Destinations"
              total={overview.destinations.total}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="text-emerald-400"
            />
            <OverviewCard
              title="Packages"
              total={overview.packages.total}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
              color="text-blue-400"
            />
            <OverviewCard
              title="Experiences"
              total={overview.experiences.total}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              color="text-purple-400"
            />
            <OverviewCard
              title="Media Files"
              total={overview.media.total}
              icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              color="text-amber-400"
            />
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusBreakdown
              title="Destinations"
              byStatus={overview.destinations.by_status}
              byOwnership={overview.destinations.by_ownership}
            />
            <StatusBreakdown
              title="Packages"
              byStatus={overview.packages.by_status}
              byOwnership={overview.packages.by_ownership}
            />
            <StatusBreakdown
              title="Experiences"
              byStatus={overview.experiences.by_status}
              byOwnership={overview.experiences.by_ownership}
            />
          </div>

          {/* Default Content */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#C89A4B]/20">
              <h3 className="font-medium text-[#D6B06A] flex items-center gap-2">
                <Server className="w-5 h-5" />
                Default System Content
              </h3>
              <p className="text-sm text-[#8B7355] mt-1">Pre-loaded content that shows when no live content exists</p>
            </div>
            <div className="divide-y divide-[#C89A4B]/10">
              {defaultContent.slice(0, 5).map((item) => (
                <div key={item.content_id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {OWNERSHIP_ICONS.system}
                    <div>
                      <p className="font-medium text-[#F4E8D5]">{item.name}</p>
                      <p className="text-sm text-[#8B7355]">{item.content_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded">System Default</span>
                    {item.can_be_modified ? (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">Modifiable</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Locked</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="space-y-4">
          {/* Selection Info */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#F4E8D5]">
                  {selectedItems.length > 0 ? `${selectedItems.length} items selected` : 'No items selected'}
                </p>
                <p className="text-sm text-[#8B7355]">Select items from the content list below</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('bulk-publish')}
                  disabled={selectedItems.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('bulk-unpublish')}
                  disabled={selectedItems.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-700 transition-colors"
                >
                  <EyeOff className="w-4 h-4" />
                  Unpublish
                </button>
                <button
                  onClick={() => handleBulkAction('bulk-archive')}
                  disabled={selectedItems.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
            <div className="flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5]"
              >
                <option value="all">All Status</option>
                <option value="default">Default</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={filterOwnership}
                onChange={(e) => setFilterOwnership(e.target.value)}
                className="px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5]"
              >
                <option value="all">All Ownership</option>
                <option value="system">System</option>
                <option value="admin">Admin</option>
                <option value="supplier">Supplier</option>
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B7355]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search content..."
                  className="w-full pl-10 pr-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355]"
                />
              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C89A4B]/20">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(['dest_1', 'dest_2', 'pkg_1', 'pkg_2']);
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Ownership</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Created By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C89A4B]/10">
                {[
                  { id: 'dest_1', name: 'Serengeti', type: 'destination', status: 'published', ownership: 'system', createdBy: 'system' },
                  { id: 'dest_2', name: 'Masai Mara', type: 'destination', status: 'published', ownership: 'admin', createdBy: 'admin_001' },
                  { id: 'pkg_1', name: 'Classic Safari', type: 'package', status: 'published', ownership: 'supplier', createdBy: 'sup_001' },
                  { id: 'pkg_2', name: 'Budget Safari', type: 'package', status: 'draft', ownership: 'admin', createdBy: 'admin_002' },
                ].map((item) => {
                  const statusConfig = STATUS_COLORS[item.status];
                  return (
                    <tr key={item.id} className="hover:bg-[#3D2B1F]/50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                        />
                      </td>
                      <td className="px-4 py-3 text-[#F4E8D5]">{item.name}</td>
                      <td className="px-4 py-3 text-[#8B7355] capitalize">{item.type}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${statusConfig.bg} ${statusConfig.text}`}>
                          {statusConfig.icon}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[#8B7355]">
                          {OWNERSHIP_ICONS[item.ownership]}
                          <span className="capitalize">{item.ownership}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#8B7355]">{item.createdBy}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#C89A4B]/20">
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Operation</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Items</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Performed By</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C89A4B]/10">
                  {history.map((migration) => (
                    <tr key={migration.id} className="hover:bg-[#3D2B1F]/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-[#3D2B1F] rounded text-xs text-[#F4E8D5]">
                          {migration.migration_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#F4E8D5]">{migration.description}</td>
                      <td className="px-4 py-3">
                        <span className="text-emerald-400">{migration.items_succeeded}</span>
                        {migration.items_failed > 0 && (
                          <span className="text-red-400 ml-1">/ {migration.items_failed} failed</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#8B7355]">{migration.performed_by}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 ${
                          migration.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {migration.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                          {migration.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8B7355]">
                        {new Date(migration.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {history.length === 0 && (
                <div className="p-12 text-center text-[#8B7355]">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No migration history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-6">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-[#C89A4B] opacity-60" />
            <h3 className="text-lg font-medium text-[#D6B06A] mb-2">Import Content</h3>
            <p className="text-[#8B7355] mb-4">Upload JSON or CSV files to import content</p>
            <button className="px-6 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors">
              Select File
            </button>
          </div>
        </div>
      )}

      {activeTab === 'replace' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#8B7355] mb-2">Old Image URL</label>
              <input
                type="text"
                placeholder="https://old-cdn.example.com/image.jpg"
                className="w-full px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8B7355] mb-2">New Image URL</label>
              <input
                type="text"
                placeholder="https://new-cdn.example.com/image.jpg"
                className="w-full px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-[#3D2B1F] text-[#F4E8D5] rounded-lg hover:bg-[#4B321F] transition-colors">
                Preview
              </button>
              <button className="px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors">
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'text-[#C89A4B] border-[#C89A4B]' : 'text-[#8B7355] border-transparent hover:text-[#D6B06A]'
      }`}
    >
      {label}
    </button>
  );
}

function OverviewCard({ title, total, icon, color }: { title: string; total: number; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-[#8B7355]">{title}</p>
          <p className="text-2xl font-bold text-[#D6B06A]">{total.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBreakdown({
  title,
  byStatus,
  byOwnership,
}: {
  title: string;
  byStatus: Record<string, number>;
  byOwnership: Record<string, number>;
}) {
  return (
    <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
      <h4 className="font-medium text-[#D6B06A] mb-3">{title}</h4>
      <div className="space-y-3">
        <div>
          <p className="text-xs text-[#8B7355] mb-1">By Status</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(byStatus).map(([status, count]) => {
              const config = STATUS_COLORS[status];
              return (
                <span key={status} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${config.bg} ${config.text}`}>
                  {config.icon}
                  {count}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs text-[#8B7355] mb-1">By Ownership</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(byOwnership).map(([owner, count]) => (
              <span key={owner} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#3D2B1F] rounded text-xs text-[#F4E8D5]">
                {OWNERSHIP_ICONS[owner]}
                {count}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContentMigrationCenter;
