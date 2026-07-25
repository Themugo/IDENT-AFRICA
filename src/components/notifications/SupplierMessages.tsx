'use client';

/**
 * Supplier Messages Component
 * 
 * Messaging interface for suppliers to communicate with customers and admins.
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Bell,
  Search,
  Users,
  CheckCheck,
  Image,
  Paperclip,
  MoreVertical,
  Phone,
  Mail,
  Loader2,
  Plus,
} from 'lucide-react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'admin' | 'supplier';
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  sender_id: string;
  sender_type: string;
  sender_name: string;
  last_message: string;
  unread_count: number;
  updated_at: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function SupplierMessages({ supplierId }: { supplierId: string }) {
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [supplierId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [convRes, notifRes] = await Promise.all([
        fetch(`/api/notifications/conversations?userId=${supplierId}&userType=supplier`),
        fetch(`/api/notifications?userId=${supplierId}&userType=supplier&limit=20`),
      ]);

      const convData = await convRes.json();
      const notifData = await notifRes.json();

      if (convData.success) setConversations(convData.data.conversations || []);
      if (notifData.success) setNotifications(notifData.data.notifications || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/notifications/messages?conversationId=${conversationId}&userId=${supplierId}`);
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
          senderId: supplierId,
          senderType: 'supplier',
          senderName: 'Supplier',
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmation': return <CheckCheck className="w-5 h-5 text-emerald-400" />;
      case 'payment_received': return <CheckCheck className="w-5 h-5 text-emerald-400" />;
      case 'new_booking': return <Bell className="w-5 h-5 text-amber-400" />;
      default: return <Bell className="w-5 h-5 text-[#8B7355]" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C89A4B] animate-spin" />
      </div>
    );
  }

  const unreadMessages = conversations.reduce((sum, c) => sum + c.unread_count, 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#C89A4B]/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-[#C89A4B]/20 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-[#C89A4B]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#D6B06A]">Messages</h2>
            <p className="text-sm text-[#8B7355]">{unreadMessages} unread messages</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#C89A4B]/20 -mb-4">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'messages'
                ? 'text-[#C89A4B] border-[#C89A4B]'
                : 'text-[#8B7355] border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Messages
            {unreadMessages > 0 && (
              <span className="bg-[#C89A4B] text-[#2E2015] text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadMessages}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'notifications'
                ? 'text-[#C89A4B] border-[#C89A4B]'
                : 'text-[#8B7355] border-transparent'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
            {unreadNotifications > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'messages' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-[#C89A4B]/20 flex flex-col">
            <div className="p-3 border-b border-[#C89A4B]/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] text-sm focus:outline-none focus:border-[#C89A4B]"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-[#3D2B1F]/50 transition-colors border-b border-[#C89A4B]/10 ${
                    selectedConversation?.id === conv.id ? 'bg-[#3D2B1F]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#3D2B1F] rounded-full flex items-center justify-center">
                      {conv.sender_type === 'admin' ? (
                        <Bell className="w-5 h-5 text-[#C89A4B]" />
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
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No messages yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-[#1A1512]">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b border-[#C89A4B]/20 bg-[#2E2015]">
                  <h3 className="font-medium text-[#F4E8D5]">{selectedConversation.sender_name}</h3>
                  <p className="text-xs text-[#8B7355] capitalize">
                    {selectedConversation.sender_type === 'admin' ? 'IDENT Africa Support' : 'Customer'}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === supplierId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg ${
                          msg.sender_id === supplierId
                            ? 'bg-[#C89A4B] text-[#2E2015]'
                            : 'bg-[#2E2015] text-[#F4E8D5] border border-[#C89A4B]/20'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${
                          msg.sender_id === supplierId ? 'justify-end text-[#2E2015]/60' : 'text-[#8B7355]'
                        }`}>
                          <span className="text-xs">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {msg.sender_id === supplierId && (
                            <CheckCheck className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-[#C89A4B]/20 bg-[#2E2015]">
                  <div className="flex gap-2">
                    <button className="p-2 text-[#8B7355] hover:text-[#C89A4B] transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-[#8B7355] hover:text-[#C89A4B] transition-colors">
                      <Image className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-[#3D2B1F] border border-[#C89A4B]/20 rounded-lg text-[#F4E8D5] placeholder-[#8B7355] focus:outline-none focus:border-[#C89A4B] text-sm"
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
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border transition-colors ${
                notif.read
                  ? 'bg-[#2E2015] border-[#C89A4B]/20'
                  : 'bg-[#C89A4B]/10 border-[#C89A4B]/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#3D2B1F] rounded-lg">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#F4E8D5]">{notif.title}</p>
                  <p className="text-sm text-[#8B7355] mt-1">{notif.message}</p>
                  <p className="text-xs text-[#8B7355]/60 mt-2">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[#8B7355] py-12">
              <div className="text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No notifications</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SupplierMessages;
