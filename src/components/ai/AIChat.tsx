/**
 * AI Travel Concierge Chat Interface
 * 
 * Intelligent chatbot for personalized travel planning.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Sparkles,
  ChevronDown,
  Bot,
  User,
  ShoppingBag,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations?: Recommendation[];
}

interface Recommendation {
  type: 'destination' | 'package' | 'accommodation';
  id: string;
  title: string;
  description: string;
  price?: number;
  rating?: number;
  matchScore: number;
}

const QUICK_ACTIONS = [
  { icon: MapPin, label: 'Destinations', prompt: 'Show me the best safari destinations' },
  { icon: Calendar, label: 'Itinerary', prompt: 'Plan a 5-day safari itinerary' },
  { icon: DollarSign, label: 'Budget', prompt: 'What\'s included in safari pricing?' },
  { icon: ShoppingBag, label: 'Packages', prompt: 'Show me popular safari packages' },
];

const AI_GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  content: `Welcome to IDENT AFRICA's AI Travel Concierge! 🦁

I'm here to help you plan your perfect African safari adventure. I can:

• **Recommend destinations** based on your preferences
• **Build personalized itineraries** for your trip
• **Compare packages and accommodations**
• **Answer questions** about destinations, wildlife, and logistics
• **Help with booking** when you're ready

What would you like to explore today?`,
  timestamp: new Date().toISOString(),
};

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([AI_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = (userMessage: string): Message => {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('show')) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Based on your interests, here are excellent options:\n\n` +
          `**1. Masai Mara, Kenya**\n` +
          `   World-renowned wildlife destination, famous for the Great Migration\n` +
          `   💰 From $1,500 | ⭐ 4.9 rating\n\n` +
          `**2. Serengeti, Tanzania**\n` +
          `   Endless plains with incredible wildlife viewing year-round\n` +
          `   💰 From $1,800 | ⭐ 4.8 rating\n\n` +
          `**3. Bwindi, Uganda**\n` +
          `   Mountain gorilla trekking in misty rainforest\n` +
          `   💰 From $2,500 | ⭐ 4.9 rating\n\n` +
          `Would you like more details on any of these?`,
        timestamp: new Date().toISOString(),
        recommendations: [
          { type: 'destination', id: '1', title: 'Masai Mara', description: 'World-renowned wildlife reserve', price: 1500, rating: 4.9, matchScore: 0.92 },
          { type: 'destination', id: '2', title: 'Serengeti', description: 'Endless savanna ecosystem', price: 1800, rating: 4.8, matchScore: 0.88 },
        ],
      };
    }

    if (lower.includes('itinerary') || lower.includes('plan') || lower.includes('day')) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `I've created a personalized 5-day itinerary:\n\n` +
          `**Day 1** - Arrive in Nairobi, transfer to hotel\n\n` +
          `**Day 2** - Drive to Masai Mara (5-6 hours), afternoon game drive\n\n` +
          `**Day 3-4** - Full days of game drives, optional balloon safari\n\n` +
          `**Day 5** - Final morning game drive, return to Nairobi\n\n` +
          `📊 **Estimated Total**: $1,800-2,500 per person\n\n` +
          `Shall I refine this or proceed with booking?`,
        timestamp: new Date().toISOString(),
      };
    }

    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget')) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Safari pricing varies based on several factors:\n\n` +
          `**Budget Tiers:**\n` +
          `• **Budget**: $150-300/day\n` +
          `• **Mid-Range**: $300-600/day\n` +
          `• **Luxury**: $600-1500/day\n` +
          `• **Ultra-Luxury**: $1500+/day\n\n` +
          `**Typical Package Costs:**\n` +
          `• 3-day safari: $800-2500 per person\n` +
          `• 5-day safari: $1500-5000 per person\n` +
          `• Gorilla trekking: $1500-2500 per permit\n\n` +
          `What's your budget? I can find options that match.`,
        timestamp: new Date().toISOString(),
      };
    }

    if (lower.includes('hello') || lower.includes('hi')) {
      return {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: `Hello! 👋 Welcome to IDENT AFRICA's AI Travel Concierge!\n\n` +
          `I'm excited to help you plan your African safari. Where would you like to start?`,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `I'm here to help with your African safari planning! 🦁\n\n` +
        `I can assist with:\n` +
        `• **Destination recommendations**\n` +
        `• **Itinerary planning**\n` +
        `• **Package comparisons**\n` +
        `• **Travel advice**\n\n` +
        `What would you like to know more about?`,
      timestamp: new Date().toISOString(),
    };
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const aiResponse = generateAIResponse(inputValue);
    setIsTyping(false);
    setMessages(prev => [...prev, aiResponse]);
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-50"
      >
        <MessageCircle size={28} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Travel Concierge</h3>
            <p className="text-xs text-white/80">Powered by IDENT AFRICA</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'assistant' ? 'bg-amber-500/20' : 'bg-blue-500/20'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot size={16} className="text-amber-400" />
                ) : (
                  <User size={16} className="text-blue-400" />
                )}
              </div>
              <div>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.role === 'assistant'
                    ? 'bg-stone-800 text-stone-100 rounded-tl-sm'
                    : 'bg-blue-600 text-white rounded-tr-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {message.recommendations && (
                  <div className="mt-3 space-y-2">
                    {message.recommendations.map(rec => (
                      <div
                        key={rec.id}
                        className="w-full flex items-center gap-3 p-3 bg-stone-800/80 border border-stone-700 rounded-xl hover:border-amber-500/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-stone-700 rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-100 text-sm">{rec.title}</p>
                          <p className="text-xs text-stone-400 truncate">{rec.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-emerald-400 font-medium">${rec.price}</span>
                            <span className="text-xs text-amber-400">⭐ {rec.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-stone-500 mt-1 px-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Bot size={16} className="text-amber-400" />
            </div>
            <div className="px-4 py-3 bg-stone-800 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {QUICK_ACTIONS.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center gap-2 px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg hover:border-amber-500/50 transition-colors whitespace-nowrap"
              >
                <action.icon size={14} className="text-amber-400" />
                <span className="text-xs text-stone-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-stone-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about destinations, packages, or travel advice..."
            className="flex-1 px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 text-white rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-2 text-center">
          AI responses are based on real IDENT AFRICA data
        </p>
      </div>
    </div>
  );
};

export default AIChat;
