import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageCircle, X, Send, Phone, Mail, ChevronUp } from 'lucide-react';

interface QuickContact {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}

export const StickyInquiryButton: React.FC = () => {
  const { currentPage, navigateTo } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Show button after scrolling past hero
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.7;
      setIsVisible(window.scrollY > heroHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-minimize on certain pages
  useEffect(() => {
    const autoMinimizePages = ['user-dashboard', 'admin-dashboard', 'supplier-portal'];
    if (autoMinimizePages.includes(currentPage)) {
      setIsMinimized(true);
    } else {
      setIsMinimized(false);
    }
  }, [currentPage]);

  const quickContacts: QuickContact[] = [
    {
      icon: <Phone className="w-4 h-4" />,
      label: 'Call Us',
      value: '+254 20 800 SAFARI',
      href: 'tel:+2542080072734'
    },
    {
      icon: <Mail className="w-4 h-4" />,
      label: 'Email',
      value: 'lounge@identafrica.com',
      href: 'mailto:lounge@identafrica.com'
    },
    {
      icon: <MessageCircle className="w-4 h-4" />,
      label: 'WhatsApp',
      value: 'Start Chat',
      href: 'https://wa.me/2542080072734'
    }
  ];

  const handleInquiryClick = () => {
    navigateTo('ai-planner');
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3
        transition-all duration-500 ease-out
        ${isMinimized ? 'opacity-50 hover:opacity-100' : 'opacity-100'}
      `}
    >
      {/* Expanded Contact Options */}
      <div 
        className={`
          flex flex-col gap-3 mb-3 transition-all duration-500 ease-out
          ${isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}
        `}
      >
        {/* Quick Contacts */}
        {quickContacts.map((contact, idx) => (
          <a
            key={idx}
            href={contact.href}
            target={contact.href.startsWith('http') ? '_blank' : undefined}
            rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            className="group flex items-center gap-3 bg-[#FFF8EC] text-[#2A1E17] rounded-full pl-4 pr-5 py-3 shadow-xl border border-[#C89A4B]/40 hover:border-[#C89A4B] hover:shadow-2xl transition-all"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="w-8 h-8 rounded-full bg-[#2D2621] flex items-center justify-center text-[#C89A4B] group-hover:bg-[#C89A4B] group-hover:text-[#1a1008] transition-colors">
              {contact.icon}
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#5A4738] block">{contact.label}</span>
              <span className="text-xs font-bold">{contact.value}</span>
            </div>
          </a>
        ))}

        {/* AI Planner CTA */}
        <button
          onClick={handleInquiryClick}
          className="flex items-center gap-3 bg-[#C89A4B] text-[#1a1008] rounded-full pl-4 pr-5 py-3 shadow-xl hover:bg-[#D6B06A] hover:shadow-2xl transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#1a1008]/20 flex items-center justify-center">
            <Send className="w-4 h-4" />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#1a1008]/70 block">Plan Your Safari</span>
            <span className="text-xs font-bold">AI Concierge</span>
          </div>
        </button>

        {/* Close Button */}
        <button
          onClick={() => setIsExpanded(false)}
          className="self-center p-2 rounded-full bg-[#2D2621] text-[#F4E8D5] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Toggle Button */}
      <div className="flex items-center gap-3">
        {/* Scroll to Top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 rounded-full bg-[#2D2621] text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all shadow-xl border border-[#C89A4B]/40 hover:border-[#C89A4B]"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

        {/* Main Inquiry Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            group relative flex items-center gap-3 px-5 py-4 rounded-full shadow-2xl transition-all duration-500
            ${isExpanded 
              ? 'bg-[#2D2621] text-[#C89A4B]' 
              : 'bg-[#C89A4B] text-[#1a1008] hover:bg-[#D6B06A]'
            }
            border-2 ${isExpanded ? 'border-[#C89A4B]' : 'border-transparent hover:border-[#D6B06A]'}
          `}
        >
          {/* Pulse Animation */}
          {!isExpanded && (
            <span className="absolute inset-0 rounded-full bg-[#C89A4B] animate-ping opacity-30" />
          )}
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#C89A4B]/20' : 'bg-[#1a1008]/20'}`}>
            {isExpanded ? (
              <X className="w-5 h-5" />
            ) : (
              <MessageCircle className="w-5 h-5" />
            )}
          </div>
          
          <div className="text-left pr-2">
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-80">
              {isExpanded ? 'Close' : 'Safari'}
            </span>
            <span className="font-cinzel font-bold text-sm tracking-wide">
              {isExpanded ? 'Menu' : 'Inquiry'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
