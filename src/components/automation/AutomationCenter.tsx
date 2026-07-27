'use client';

/**
 * Automation Center
 * 
 * Event-driven workflow automation management dashboard.
 */

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Play,
  Pause,
  Plus,
  RefreshCw,
  Loader2,
  Mail,
  Bell,
  FileText,
  Globe,
  MessageSquare,
  Smartphone,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Eye,
  Edit,
  AlertCircle,
} from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_event: string;
  actions: Array<{ type: string; [key: string]: unknown }>;
  status: 'active' | 'paused' | 'disabled';
  priority: number;
  trigger_count: number;
  success_count: number;
  failure_count: number;
  success_rate?: number;
}

interface WorkflowLog {
  id: string;
  workflow_id: string;
  workflow_name: string;
  execution_id: string;
  entity_type: string;
  entity_id: string;
  action_type: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'retrying';
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  error_message?: string;
}

interface AutomationEvent {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string;
  processed: boolean;
  triggered_workflows: string[];
  created_at: string;
}

interface Stats {
  total_workflows: number;
  active_workflows: number;
  total_events: number;
  events_today: number;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  success_rate: number;
}

interface EventType {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface ActionType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  send_email: <Mail className="w-4 h-4" />,
  send_notification: <Bell className="w-4 h-4" />,
  update_status: <Edit className="w-4 h-4" />,
  generate_document: <FileText className="w-4 h-4" />,
  notify_supplier: <MessageSquare className="w-4 h-4" />,
  webhook: <Globe className="w-4 h-4" />,
  slack_message: <MessageSquare className="w-4 h-4" />,
  sms: <Smartphone className="w-4 h-4" />,
  loyalty_award: <Star className="w-4 h-4" />,
};

const EVENT_COLORS: Record<string, string> = {
  booking: 'bg-blue-500/20 text-blue-400',
  payment: 'bg-green-500/20 text-green-400',
  supplier: 'bg-purple-500/20 text-purple-400',
  review: 'bg-amber-500/20 text-amber-400',
  document: 'bg-cyan-500/20 text-cyan-400',
  notification: 'bg-pink-500/20 text-pink-400',
  loyalty: 'bg-yellow-500/20 text-yellow-400',
};

export function AutomationCenter() {
  const [activeTab, setActiveTab] = useState<'workflows' | 'logs' | 'events' | 'settings'>('workflows');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [events, setEvents] = useState<AutomationEvent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [actionTypes, setActionTypes] = useState<ActionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEvent, setFilterEvent] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [workflowsRes, logsRes, eventsRes, statsRes, eventTypesRes, actionTypesRes] = await Promise.all([
        fetch('/api/automation/workflows'),
        fetch('/api/automation/logs?limit=50'),
        fetch('/api/automation/events?limit=50'),
        fetch('/api/automation/stats'),
        fetch('/api/automation/event-types'),
        fetch('/api/automation/action-types'),
      ]);

      const [workflowsData, logsData, eventsData, statsData, eventTypesData, actionTypesData] = await Promise.all([
        workflowsRes.json(),
        logsRes.json(),
        eventsRes.json(),
        statsRes.json(),
        eventTypesRes.json(),
        actionTypesRes.json(),
      ]);

      if (workflowsData.success) setWorkflows(workflowsData.data.workflows || []);
      if (logsData.success) setLogs(logsData.data.logs || []);
      if (eventsData.success) setEvents(eventsData.data.events || []);
      if (statsData.success) setStats(statsData.data);
      if (eventTypesData.success) setEventTypes(eventTypesData.data.event_types || []);
      if (actionTypesData.success) setActionTypes(actionTypesData.data.action_types || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkflowStatus = async (workflow: Workflow) => {
    const newStatus = workflow.status === 'active' ? 'paused' : 'active';
    try {
      await fetch(`/api/automation/workflows/${workflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadData();
    } catch (err) {
      console.error('Failed to update workflow:', err);
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    if (filterStatus !== 'all' && w.status !== filterStatus) return false;
    if (filterEvent !== 'all' && w.trigger_event !== filterEvent) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventCategory = (eventType: string): string => {
    return eventType.split('.')[0];
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
            Automation Center
          </h1>
          <p className="text-[#8B7355]">Event-driven workflow automation</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-[#3D2B1F] text-[#F4E8D5] rounded-lg hover:bg-[#4B321F] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Workflow
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Zap className="w-5 h-5" />} label="Active Workflows" value={`${stats.active_workflows}/${stats.total_workflows}`} />
          <StatCard icon={<Activity className="w-5 h-5" />} label="Events Today" value={stats.events_today} />
          <StatCard icon={<Play className="w-5 h-5" />} label="Total Executions" value={stats.total_executions} />
          <StatCard 
            icon={stats.success_rate >= 95 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />} 
            label="Success Rate" 
            value={`${stats.success_rate}%`}
            highlight={stats.success_rate < 95}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#C89A4B]/20">
        <TabButton active={activeTab === 'workflows'} onClick={() => setActiveTab('workflows')} label="Workflows" />
        <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Execution Logs" />
        <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} label="Event History" />
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label="Settings" />
      </div>

      {/* Content */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="disabled">Disabled</option>
              </select>
              <select
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
                className="px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] focus:outline-none focus:border-[#C89A4B]"
              >
                <option value="all">All Events</option>
                {eventTypes.map(et => (
                  <option key={et.id} value={et.id}>{et.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Workflow Cards */}
          <div className="grid gap-4">
            {filteredWorkflows.map((workflow) => {
              const eventCategory = getEventCategory(workflow.trigger_event);
              const successRate = workflow.trigger_count > 0 
                ? ((workflow.success_count / workflow.trigger_count) * 100).toFixed(1)
                : '0';
              
              return (
                <div key={workflow.id} className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4 hover:border-[#C89A4B]/40 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-[#F4E8D5]">{workflow.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          workflow.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          workflow.status === 'paused' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {workflow.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          EVENT_COLORS[eventCategory] || 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {workflow.trigger_event}
                        </span>
                      </div>
                      <p className="text-sm text-[#8B7355]">{workflow.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleWorkflowStatus(workflow)}
                        className={`p-2 rounded-lg transition-colors ${
                          workflow.status === 'active'
                            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        }`}
                        title={workflow.status === 'active' ? 'Pause' : 'Activate'}
                      >
                        {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setSelectedWorkflow(workflow)}
                        className="p-2 bg-[#3D2B1F] text-[#8B7355] rounded-lg hover:text-[#F4E8D5] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Actions Preview */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {workflow.actions.slice(0, 4).map((action, i) => (
                      <div key={i} className="flex items-center gap-1 px-2 py-1 bg-[#3D2B1F] rounded text-xs text-[#F4E8D5]">
                        {ACTION_ICONS[action.type] || <Zap className="w-3 h-3" />}
                        <span>{action.type.replace('_', ' ')}</span>
                      </div>
                    ))}
                    {workflow.actions.length > 4 && (
                      <span className="px-2 py-1 text-xs text-[#8B7355]">+{workflow.actions.length - 4} more</span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-[#8B7355]">Triggered: </span>
                      <span className="text-[#F4E8D5]">{workflow.trigger_count}</span>
                    </div>
                    <div>
                      <span className="text-[#8B7355]">Success: </span>
                      <span className="text-emerald-400">{workflow.success_count}</span>
                    </div>
                    <div>
                      <span className="text-[#8B7355]">Failed: </span>
                      <span className="text-red-400">{workflow.failure_count}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[#8B7355]">Rate: </span>
                      <span className={parseFloat(successRate) >= 95 ? 'text-emerald-400' : 'text-amber-400'}>{successRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C89A4B]/20">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Workflow</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Entity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Duration</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C89A4B]/10">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#3D2B1F]/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm text-[#F4E8D5]">{log.workflow_name}</p>
                      <p className="text-xs text-[#8B7355] font-mono">{log.execution_id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {ACTION_ICONS[log.action_type] || <Zap className="w-4 h-4" />}
                        <span className="text-sm text-[#F4E8D5]">{log.action_type.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#8B7355]">{log.entity_type}</span>
                      <span className="text-xs text-[#8B7355] font-mono ml-1">{log.entity_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm text-[#F4E8D5]">{log.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#8B7355]">{log.duration_ms ? `${log.duration_ms}ms` : '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-[#8B7355]">
                        {log.started_at ? new Date(log.started_at).toLocaleString() : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="p-12 text-center text-[#8B7355]">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No execution logs yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#C89A4B]/20">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Event Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Entity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Workflows</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#8B7355]">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C89A4B]/10">
                {events.map((event) => {
                  const category = getEventCategory(event.event_type);
                  return (
                    <tr key={event.id} className="hover:bg-[#3D2B1F]/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#C89A4B]" />
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            EVENT_COLORS[category] || 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {event.event_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#8B7355]">{event.entity_type}</span>
                        <span className="text-xs text-[#8B7355] font-mono ml-1">{event.entity_id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#F4E8D5]">{event.triggered_workflows?.length || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        {event.processed ? (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Processed</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#8B7355]">
                          {new Date(event.created_at).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {events.length === 0 && (
              <div className="p-12 text-center text-[#8B7355]">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No events recorded yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Event Types */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
            <h3 className="text-lg font-medium text-[#D6B06A] mb-4">Available Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {eventTypes.map((event) => (
                <div key={event.id} className="bg-[#3D2B1F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-[#C89A4B]" />
                    <span className="text-sm font-medium text-[#F4E8D5]">{event.name}</span>
                  </div>
                  <p className="text-xs text-[#8B7355]">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Types */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
            <h3 className="text-lg font-medium text-[#D6B06A] mb-4">Available Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {actionTypes.map((action) => (
                <div key={action.id} className="bg-[#3D2B1F] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    {ACTION_ICONS[action.id] || <Zap className="w-4 h-4" />}
                    <span className="text-sm font-medium text-[#F4E8D5]">{action.name}</span>
                  </div>
                  <p className="text-xs text-[#8B7355]">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`bg-[#2E2015] border rounded-xl p-4 ${highlight ? 'border-red-500/50' : 'border-[#C89A4B]/20'}`}>
      <div className="flex items-center gap-3">
        <div className={highlight ? 'text-red-400' : 'text-[#C89A4B]'}>{icon}</div>
        <div>
          <p className="text-sm text-[#8B7355]">{label}</p>
          <p className="text-2xl font-bold text-[#D6B06A]">{value}</p>
        </div>
      </div>
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

export default AutomationCenter;
