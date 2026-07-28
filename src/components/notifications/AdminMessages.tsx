'use client';

/**
 * Admin Messages Dashboard
 * 
 * Centralized messaging hub for administrators.
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  MessageSquare,
  Send,
  Users,
  Mail,
  Phone,
  MessageCircle,
  Check,
  CheckCheck,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'supplier';
  sender_name: string;
  recipient_id: string;
  recipient_type: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_type: string;
  last_message: string;
  unread_count: number;
  updated_at: string;
}

interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  channel: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

export function AdminMessages() {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications' | 'broadcast'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<{
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    byChannel: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminId] = useState('admin_001');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [convRes, notifRes, statsRes] = await Promise.all([
        fetch('/api/notifications/conversations?userId=admin_001&userType=admin'),
        fetch('/api/notifications?userType=admin&limit=50'),
        fetch('/api/notifications/stats?userType=admin'),
      ]);

      const convData = await convRes.json();
      const notifData = await notifRes.json();
      const statsData = await statsRes.json();

      if (convData.success) setConversations(convData.data.conversations || []);
      if (notifData.success) setNotifications(notifData.data.notifications || []);
      if (statsData.success) setStats(statsData.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/notifications/messages?conversationId=${conversationId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    loadMessages(conv.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await fetch('/api/notifications/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          senderId: adminId,
          senderType: 'admin',
          senderName: 'Admin',
          recipientId: selectedConversation.sender_id,
          recipientType: selectedConversation.sender_type,
          content: newMessage,
        }),
      });
      setNewMessage('');
      loadMessages(selectedConversation.id);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
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
      default: return <Clock className="w-4 h-4 text-gray-400" />;
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
            Messages & Notifications
          </h1>
          <p className="text-[#8B7355]">Manage communications with customers and suppliers</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Send className="w-5 h-5" />} label="Sent" value={stats.totalSent} />
          <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Delivered" value={stats.totalDelivered} />
          <StatCard icon={<CheckCheck className="w-5 h-5" />} label="Read" value={stats.totalRead} />
          <StatCard 
            icon={<Users className="w-5 h-5" />} 
            label="Conversations" 
            value={conversations.length} 
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#C89A4B]/20">
        <TabButton
          active={activeTab === 'messages'}
          onClick={() => setActiveTab('messages')}
          icon={<MessageSquare className="w-4 h-4" />}
          label="Messages"
        />
        <TabButton
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          icon={<Bell className="w-4 h-4" />}
          label="Notifications"
          badge={notifications.filter(n => n.status !== 'read').length}
        />
        <TabButton
          active={activeTab === 'broadcast'}
          onClick={() => setActiveTab('broadcast')}
          icon={<Send className="w-4 h-4" />}
          label="Broadcast"
        />
      </div>

      {/* Content */}
      {activeTab === 'messages' && (
        <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-[#C89A4B]/20 overflow-y-auto">
              <div className="p-4 border-b border-[#C89A4B]/20">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full pl-9 pr-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
                  />
                </div>
              </div>
              <div className="divide-y divide-[#C89A4B]/10">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-[#3D2B1F]/50 transition-colors ${
                      selectedConversation?.id === conv.id ? 'bg-[#3D2B1F]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#C89A4B]/20 rounded-full flex items-center justify-center">
                        {conv.sender_type === 'supplier' ? (
                          <Users className="w-5 h-5 text-[#C89A4B]" />
                        ) : (
                          <Users className="w-5 h-5 text-[#8B7355]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-[#F4E8D5] truncate">{conv.sender_name}</p>
                          {conv.unread_count > 0 && (
                            <span className="bg-[#C89A4B] text-[#2E2015] text-xs font-bold px-2 py-0.5 rounded-full">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#8B7355] truncate mt-1">{conv.last_message}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {conversations.length === 0 && (
                  <div className="p-8 text-center text-[#8B7355]">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>No conversations yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-[#C89A4B]/20">
                    <h3 className="font-medium text-[#F4E8D5]">{selectedConversation.sender_name}</h3>
                    <p className="text-xs text-[#8B7355] capitalize">{selectedConversation.sender_type}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === adminId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender_id === adminId
                              ? 'bg-[#C89A4B] text-[#2E2015]'
                              : 'bg-[#3D2B1F] text-[#F4E8D5]'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_id === adminId ? 'text-[#2E2015]/60' : 'text-[#8B7355]'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-[#C89A4B]/20">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-[#C89A4B] text-[#2E2015] rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#8B7355]">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-40" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-[#D6B06A]">Notification History</h3>
          </div>
          <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl divide-y divide-[#C89A4B]/10">
            {notifications.map((notif) => (
              <div key={notif.id} className="p-4 hover:bg-[#3D2B1F]/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getChannelColor(notif.channel)}`}>
                    {getChannelIcon(notif.channel)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[#F4E8D5]">{notif.subject}</p>
                      {getStatusIcon(notif.status)}
                    </div>
                    <p className="text-sm text-[#8B7355] mt-1">{notif.message}</p>
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
      )}

      {activeTab === 'broadcast' && (
        <BroadcastPanel />
      )}
    </div>
  );
}

// Sub-components
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="text-[#C89A4B]">{icon}</div>
        <div>
          <p className="text-sm text-[#8B7355]">{label}</p>
          <p className="text-2xl font-bold text-[#D6B06A]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors relative ${
        active
          ? 'text-[#C89A4B] border-[#C89A4B]'
          : 'text-[#8B7355] border-transparent hover:text-[#D6B06A]'
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

function BroadcastPanel() {
  const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp' | 'push'>('email');
  const [recipients, setRecipients] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);

    try {
      // Send broadcast notification
      const recipientIds = recipients.split(',').map(r => r.trim()).filter(Boolean);
      
      for (const recipientId of recipientIds) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId,
            recipientType: 'customer',
            type: 'admin_message',
            channel,
            subject,
            message,
          }),
        });
      }

      alert('Broadcast sent successfully!');
      setRecipients('');
      setSubject('');
      setMessage('');
    } catch (err) {
      alert('Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#2E2015] border border-[#C89A4B]/20 rounded-xl p-6">
      <h3 className="text-lg font-medium text-[#D6B06A] mb-4">Send Broadcast Message</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-[#8B7355] mb-2">Channel</label>
          <div className="flex gap-2">
            {(['email', 'sms', 'whatsapp', 'push'] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  channel === ch
                    ? 'bg-[#C89A4B] text-[#2E2015]'
                    : 'bg-[#3D2B1F] text-[#F4E8D5] hover:bg-[#4B321F]'
                }`}
              >
                {ch.charAt(0).toUpperCase() + ch.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#8B7355] mb-2">Recipient IDs (comma-separated)</label>
          <input
            type="text"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="user_001, user_002, user_003"
            className="w-full px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
          />
        </div>

        <div>
          <label className="block text-sm text-[#8B7355] mb-2">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Message subject"
            className="w-full px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B]"
          />
        </div>

        <div>
          <label className="block text-sm text-[#8B7355] mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message..."
            rows={4}
            className="w-full px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B] resize-none"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="w-full px-4 py-3 bg-[#C89A4B] text-[#2E2015] font-medium rounded-lg hover:bg-[#D6B06A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
          <Send className="w-4 h-4" />
          Send Broadcast
        </button>
      </div>
    </div>
  );
}

// Helper component for Clock icon
function Clock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

export default AdminMessages;
