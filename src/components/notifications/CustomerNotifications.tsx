'use client';

/**
 * Customer Notifications Component
 * 
 * Notification preferences and history for customers.
 * Supports: Email, SMS, WhatsApp, Push notifications.
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Phone,
  MessageCircle,
  Smartphone,
  Check,
  CheckCheck,
  Settings,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  channel: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  read_at?: string;
}

interface Preferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
  bookingUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  systemAlerts: boolean;
}

export function CustomerNotifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    email: true,
    sms: false,
    whatsapp: true,
    push: true,
    bookingUpdates: true,
    promotions: false,
    newsletter: true,
    systemAlerts: true,
  });
  const [activeTab, setActiveTab] = useState<'history' | 'preferences'>('history');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/notifications?userId=${userId}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, status: 'read' } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      // In production, save to API
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Preferences saved successfully!');
    } catch (err) {
      alert('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'text-blue-400 bg-blue-400/10';
      case 'sms': return 'text-green-400 bg-green-400/10';
      case 'whatsapp': return 'text-emerald-400 bg-emerald-400/10';
      case 'push': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-4 h-4 text-blue-400" />;
      case 'delivered': return <CheckCheck className="w-4 h-4 text-emerald-400" />;
      case 'read': return <CheckCheck className="w-4 h-4 text-[#C89A4B]" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const unreadCount = notifications.filter(n => n.status !== 'read').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C89A4B] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-cinzel font-bold text-[#D6B06A]">
            Notifications
          </h1>
          <p className="text-[#8B7355]">
            Manage how you receive updates
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#C89A4B]/20">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'text-[#C89A4B] border-[#C89A4B]'
              : 'text-[#8B7355] border-transparent'
          }`}
        >
          <Bell className="w-4 h-4" />
          History
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preferences'
              ? 'text-[#C89A4B] border-[#C89A4B]'
              : 'text-[#8B7355] border-transparent'
          }`}
        >
          <Settings className="w-4 h-4" />
          Preferences
        </button>
      </div>

      {/* Content */}
      {activeTab === 'history' ? (
        <div className="space-y-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-[#C89A4B] hover:text-[#D6B06A] transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}

          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl divide-y divide-[#C89A4B]/10">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => notif.status !== 'read' && markAsRead(notif.id)}
                className={`p-4 transition-colors cursor-pointer ${
                  notif.status !== 'read' ? 'bg-[#C89A4B]/5' : ''
                } hover:bg-[#3D2B1F]/50`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getChannelColor(notif.channel)}`}>
                    {getChannelIcon(notif.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${notif.status !== 'read' ? 'text-[#F4E8D5]' : 'text-[#8B7355]'}`}>
                        {notif.subject}
                      </p>
                      {getStatusIcon(notif.status)}
                    </div>
                    <p className="text-sm text-[#8B7355] mt-1 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-[#8B7355]/60 mt-2">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-12 text-center text-[#8B7355]">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Notification Channels */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-6">
            <h3 className="text-lg font-medium text-[#D6B06A] mb-4">Notification Channels</h3>
            <p className="text-sm text-[#8B7355] mb-4">
              Choose how you want to receive notifications
            </p>
            <div className="space-y-4">
              <PreferenceToggle
                icon={<Mail className="w-5 h-5" />}
                label="Email"
                description="Receive notifications via email"
                enabled={preferences.email}
                onChange={(v) => setPreferences({ ...preferences, email: v })}
                color="text-blue-400"
              />
              <PreferenceToggle
                icon={<Phone className="w-5 h-5" />}
                label="SMS"
                description="Receive text messages"
                enabled={preferences.sms}
                onChange={(v) => setPreferences({ ...preferences, sms: v })}
                color="text-green-400"
              />
              <PreferenceToggle
                icon={<MessageCircle className="w-5 h-5" />}
                label="WhatsApp"
                description="Get updates on WhatsApp"
                enabled={preferences.whatsapp}
                onChange={(v) => setPreferences({ ...preferences, whatsapp: v })}
                color="text-emerald-400"
              />
              <PreferenceToggle
                icon={<Smartphone className="w-5 h-5" />}
                label="Push Notifications"
                description="Browser push notifications"
                enabled={preferences.push}
                onChange={(v) => setPreferences({ ...preferences, push: v })}
                color="text-amber-400"
              />
            </div>
          </div>

          {/* Notification Types */}
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-6">
            <h3 className="text-lg font-medium text-[#D6B06A] mb-4">Notification Types</h3>
            <p className="text-sm text-[#8B7355] mb-4">
              Choose what types of notifications you want to receive
            </p>
            <div className="space-y-4">
              <PreferenceToggle
                icon={<CheckCircle className="w-5 h-5" />}
                label="Booking Updates"
                description="Confirmation, reminders, and booking changes"
                enabled={preferences.bookingUpdates}
                onChange={(v) => setPreferences({ ...preferences, bookingUpdates: v })}
                color="text-emerald-400"
              />
              <PreferenceToggle
                icon={<AlertCircle className="w-5 h-5" />}
                label="System Alerts"
                description="Important system notifications and security alerts"
                enabled={preferences.systemAlerts}
                onChange={(v) => setPreferences({ ...preferences, systemAlerts: v })}
                color="text-red-400"
              />
              <PreferenceToggle
                icon={<Bell className="w-5 h-5" />}
                label="Promotions"
                description="Special offers, discounts, and deals"
                enabled={preferences.promotions}
                onChange={(v) => setPreferences({ ...preferences, promotions: v })}
                color="text-purple-400"
              />
              <PreferenceToggle
                icon={<Info className="w-5 h-5" />}
                label="Newsletter"
                description="Travel tips, destination guides, and updates"
                enabled={preferences.newsletter}
                onChange={(v) => setPreferences({ ...preferences, newsletter: v })}
                color="text-blue-400"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={savePreferences}
            disabled={isSaving}
            className="w-full px-6 py-3 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
}

// Preference Toggle Component
function PreferenceToggle({
  icon,
  label,
  description,
  enabled,
  onChange,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#3D2B1F] rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`${color}`}>{icon}</div>
        <div>
          <p className="font-medium text-[#F4E8D5]">{label}</p>
          <p className="text-sm text-[#8B7355]">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className="transition-colors"
      >
        {enabled ? (
          <ToggleRight className="w-10 h-10 text-[#C89A4B]" />
        ) : (
          <ToggleLeft className="w-10 h-10 text-[#8B7355]" />
        )}
      </button>
    </div>
  );
}

export default CustomerNotifications;
