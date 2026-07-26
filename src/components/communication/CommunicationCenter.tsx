'use client';

/**
 * Communication Center Dashboard
 * 
 * Centralized communication hub with workflow triggers.
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Bell,
  Users,
  Workflow,
  Settings,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Check,
  CheckCheck,
  X,
  Loader2,
  Mail,
  Phone,
  MessageCircle,
  Smartphone,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Inbox,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface Conversation {
  id: string;
  conversation_code: string;
  type: string;
  participant_a: { id: string; name: string; type: string };
  participant_b: { id: string; name: string; type: string };
  subject?: string;
  status: string;
  last_message?: { content: string; at: string };
  unread_count: number;
  related_entity?: { type: string; id: string };
}

interface Workflow {
  id: string;
  trigger_type: string;
  trigger_entity_type: string;
  trigger_entity_id: string;
  channels: string[];
  recipient_id: string;
  status: string;
  scheduled_for?: string;
  created_at: string;
}

interface Stats {
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  pendingWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  byType: Record<string, number>;
}

const TRIGGER_TYPES = [
  { value: 'booking_created', label: 'Booking Created', icon: '📋', color: 'text-blue-400' },
  { value: 'booking_confirmed', label: 'Booking Confirmed', icon: '✅', color: 'text-emerald-400' },
  { value: 'booking_cancelled', label: 'Booking Cancelled', icon: '❌', color: 'text-red-400' },
  { value: 'payment_received', label: 'Payment Received', icon: '💰', color: 'text-green-400' },
  { value: 'payment_failed', label: 'Payment Failed', icon: '⚠️', color: 'text-amber-400' },
  { value: 'travel_reminder', label: 'Travel Reminder', icon: '✈️', color: 'text-purple-400' },
  { value: 'refund_initiated', label: 'Refund Initiated', icon: '💸', color: 'text-cyan-400' },
  { value: 'refund_completed', label: 'Refund Completed', icon: '✅', color: 'text-emerald-400' },
];

const CHANNELS = [
  { value: 'email', label: 'Email', icon: Mail, color: 'text-blue-400' },
  { value: 'sms', label: 'SMS', icon: Phone, color: 'text-green-400' },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400' },
  { value: 'push', label: 'Push', icon: Smartphone, color: 'text-amber-400' },
];

export function CommunicationCenter() {
  const [activeTab, setActiveTab] = useState<'conversations' | 'workflows' | 'settings'>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [convRes, wfRes, statsRes] = await Promise.all([
        fetch('/api/communication/conversations'),
        fetch('/api/communication/triggers'),
        fetch('/api/communication/stats'),
      ]);

      const convData = await convRes.json();
      const wfData = await wfRes.json();
      const statsData = await statsRes.json();

      if (convData.success) setConversations(convData.data.conversations || []);
      if (wfData.success) setWorkflows(wfData.data.workflows || []);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (filterType === 'all') return true;
    return conv.type === filterType;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'customer_admin': return 'Customer ↔ Admin';
      case 'customer_supplier': return 'Customer ↔ Supplier';
      case 'supplier_admin': return 'Supplier ↔ Admin';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer_admin': return 'text-blue-400 bg-blue-400/10';
      case 'customer_supplier': return 'text-emerald-400 bg-emerald-400/10';
      case 'supplier_admin': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Active</span>;
      case 'resolved':
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Resolved</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Pending</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Completed</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Failed</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">{status}</span>;
    }
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
          <h1 className="text-2xl font-cinzel font-bold text-[#D6B06A]">
            Communication Center
          </h1>
          <p className="text-[#8B7355]">Centralized messaging and workflow automation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNewConversation(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<MessageSquare className="w-5 h-5" />}
            label="Total Conversations"
            value={stats.totalConversations}
          />
          <StatCard
            icon={<Inbox className="w-5 h-5" />}
            label="Active"
            value={stats.activeConversations}
            highlight
          />
          <StatCard
            icon={<Workflow className="w-5 h-5" />}
            label="Pending Workflows"
            value={stats.pendingWorkflows}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Completed"
            value={stats.completedWorkflows}
          />
        </div>
      )}

      {/* Workflow Trigger Cards */}
      <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
        <h3 className="text-sm font-medium text-[#D6B06A] mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Quick Workflow Triggers
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TRIGGER_TYPES.slice(0, 4).map((trigger) => (
            <button
              key={trigger.value}
              onClick={() => setShowNewWorkflow(true)}
              className="flex items-center gap-2 p-3 bg-[#3D2B1F] rounded-lg hover:bg-[#4B321F] transition-colors text-left"
            >
              <span className="text-lg">{trigger.icon}</span>
              <span className="text-sm text-[#F4E8D5] truncate">{trigger.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#C89A4B]/20">
        <TabButton
          active={activeTab === 'conversations'}
          onClick={() => setActiveTab('conversations')}
          icon={<MessageSquare className="w-4 h-4" />}
          label="Conversations"
        />
        <TabButton
          active={activeTab === 'workflows'}
          onClick={() => setActiveTab('workflows')}
          icon={<Workflow className="w-4 h-4" />}
          label="Workflow Triggers"
        />
        <TabButton
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
          icon={<Settings className="w-4 h-4" />}
          label="Settings"
        />
      </div>

      {/* Content */}
      {activeTab === 'conversations' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-[#C89A4B]/20 flex gap-2 flex-wrap">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] text-sm focus:outline-none focus:border-[#C89A4B]"
            >
              <option value="all">All Types</option>
              <option value="customer_admin">Customer ↔ Admin</option>
              <option value="customer_supplier">Customer ↔ Supplier</option>
              <option value="supplier_admin">Supplier ↔ Admin</option>
            </select>
          </div>

          {/* Conversations List */}
          <div className="divide-y divide-[#C89A4B]/10">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className="p-4 hover:bg-[#3D2B1F]/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-[#3D2B1F] rounded-full flex items-center justify-center">
                      {conv.type === 'customer_admin' ? (
                        <Users className="w-6 h-6 text-[#C89A4B]" />
                      ) : conv.type === 'customer_supplier' ? (
                        <MessageSquare className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Bell className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[#F4E8D5]">
                          {conv.participant_a.name} <ArrowRight className="w-3 h-3 inline" /> {conv.participant_b.name}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="bg-[#C89A4B] text-[#2E2015] text-xs font-bold px-2 py-0.5 rounded-full">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#8B7355] mt-0.5">{conv.subject || 'No subject'}</p>
                      {conv.last_message && (
                        <p className="text-xs text-[#8B7355]/60 mt-1 truncate max-w-md">
                          {conv.last_message.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(conv.type)}`}>
                      {getTypeLabel(conv.type)}
                    </span>
                    {conv.last_message && (
                      <p className="text-xs text-[#8B7355] mt-2">
                        {new Date(conv.last_message.at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredConversations.length === 0 && (
              <div className="p-12 text-center text-[#8B7355]">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No conversations found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="space-y-4">
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#C89A4B]/20 flex items-center justify-between">
              <h3 className="font-medium text-[#D6B06A]">Workflow Triggers</h3>
              <button
                onClick={() => setShowNewWorkflow(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#C89A4B] text-[#2E2015] text-sm font-medium rounded-lg hover:bg-[#D6B06A] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Workflow
              </button>
            </div>
            <div className="divide-y divide-[#C89A4B]/10">
              {workflows.map((wf) => {
                const trigger = TRIGGER_TYPES.find(t => t.value === wf.trigger_type);
                return (
                  <div key={wf.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#3D2B1F] rounded-lg flex items-center justify-center">
                          <span className="text-lg">{trigger?.icon || '📋'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-[#F4E8D5]">{trigger?.label || wf.trigger_type}</p>
                          <p className="text-sm text-[#8B7355]">
                            {wf.trigger_entity_type}: {wf.trigger_entity_id}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {wf.channels.map((ch) => {
                              const channel = CHANNELS.find(c => c.value === ch);
                              const Icon = channel?.icon || Bell;
                              return (
                                <span key={ch} className={`${channel?.color || 'text-gray-400'}`}>
                                  <Icon className="w-4 h-4" />
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(wf.status)}
                        {wf.scheduled_for && (
                          <p className="text-xs text-[#8B7355] mt-2">
                            Scheduled: {new Date(wf.scheduled_for).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {workflows.length === 0 && (
                <div className="p-12 text-center text-[#8B7355]">
                  <Workflow className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No workflow triggers yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-6">
          <h3 className="text-lg font-medium text-[#D6B06A] mb-4">Communication Settings</h3>
          
          {/* Channel Configuration */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-[#F4E8D5] mb-3">Notification Channels</h4>
              <div className="grid grid-cols-2 gap-4">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <div key={channel.value} className="bg-[#3D2B1F] rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={channel.color}><Icon className="w-5 h-5" /></span>
                        <span className="text-[#F4E8D5]">{channel.label}</span>
                      </div>
                      <button className="w-12 h-6 bg-[#C89A4B]/20 rounded-full relative">
                        <div className="w-5 h-5 bg-[#C89A4B] rounded-full absolute right-0.5 top-0.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Workflow Templates */}
            <div className="pt-4 border-t border-[#C89A4B]/20">
              <h4 className="text-sm font-medium text-[#F4E8D5] mb-3">Workflow Triggers</h4>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_TYPES.map((trigger) => (
                  <div key={trigger.value} className="bg-[#3D2B1F] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{trigger.icon}</span>
                      <span className="text-sm text-[#F4E8D5]">{trigger.label}</span>
                    </div>
                    <button className="w-12 h-6 bg-[#C89A4B]/20 rounded-full relative">
                      <div className="w-5 h-5 bg-[#C89A4B] rounded-full absolute right-0.5 top-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Workflow Modal */}
      {showNewWorkflow && (
        <NewWorkflowModal
          onClose={() => setShowNewWorkflow(false)}
          onCreated={loadData}
        />
      )}
    </div>
  );
}

// Sub-components
function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`bg-[#2E2015] border ${highlight ? 'border-[#C89A4B]/50' : 'border-[#C89A4B]/20'} rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <div className={highlight ? 'text-[#C89A4B]' : 'text-[#8B7355]'}>{icon}</div>
        <div>
          <p className="text-sm text-[#8B7355]">{label}</p>
          <p className="text-2xl font-bold text-[#D6B06A]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active ? 'text-[#C89A4B] border-[#C89A4B]' : 'text-[#8B7355] border-transparent hover:text-[#D6B06A]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function NewWorkflowModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [triggerType, setTriggerType] = useState('booking_created');
  const [channels, setChannels] = useState<string[]>(['email']);
  const [entityId, setEntityId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/communication/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerType,
          entityType: 'booking',
          entityId,
          channels,
          recipientId,
          recipientType: 'customer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onCreated();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create workflow:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChannel = (ch: string) => {
    setChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2E2015] border border-[#C89A4B]/30 rounded-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#C89A4B]/20">
          <h2 className="text-lg font-semibold text-[#D6B06A]">Create Workflow</h2>
          <button onClick={onClose} className="text-[#8B7355] hover:text-[#F4E8D5]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-[#8B7355] mb-2">Trigger Type</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-2">Channels</label>
            <div className="flex gap-2">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.value}
                    onClick={() => toggleChannel(ch.value)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      channels.includes(ch.value)
                        ? 'bg-[#C89A4B] text-[#2E2015]'
                        : 'bg-[#3D2B1F] text-[#F4E8D5]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-2">Entity ID</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              placeholder="booking_xxx"
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>

          <div>
            <label className="block text-sm text-[#8B7355] mb-2">Recipient ID</label>
            <input
              type="text"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="user_xxx"
              className="w-full px-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[#C89A4B]/30 text-[#8B7355] rounded-lg hover:bg-[#3D2B1F] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !entityId || !recipientId}
              className="flex-1 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunicationCenter;
