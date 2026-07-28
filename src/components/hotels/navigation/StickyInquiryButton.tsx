import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Phone, Mail, ChevronUp, Sparkles } from 'lucide-react';

interface QuickContact {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  color?: string;
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
      icon: <Phone className="w-5 h-5" />,
      label: 'Call Us',
      value: '+254 20 800 SAFARI',
      href: 'tel:+2542080072734',
      color: '#4ADE80'
    },
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'Email',
      value: 'lounge@identafrica.com',
      href: 'mailto:lounge@identafrica.com',
      color: '#60A5FA'
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: 'WhatsApp',
      value: 'Start Chat',
      href: 'https://wa.me/2542080072734',
      color: '#25D366'
    }
  ];

  const handleInquiryClick = () => {
    navigateTo('ai-planner');
    setIsExpanded(false);
  };

  if (!isVisible) return null;

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isVisible ? 1 : 0, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3
        ${isMinimized ? 'opacity-50 hover:opacity-100' : 'opacity-100'}
      `}
    >
      {/* Expanded Contact Options with Staggered Animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="flex flex-col gap-3 mb-4"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Quick Contacts with Colored Icons */}
            {quickContacts.map((contact, idx) => (
              <motion.a
                key={idx}
                href={contact.href}
                target={contact.href.startsWith('http') ? '_blank' : undefined}
                rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 25,
                  delay: idx * 0.05
                }}
                className="group flex items-center gap-3 bg-[#FFF8EC] text-[#2A1E17] rounded-full pl-4 pr-6 py-3 shadow-2xl border border-[#C89A4B]/40 hover:border-[#C89A4B] transition-all"
              >
                <motion.div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: contact.color }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {contact.icon}
                </motion.div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#5A4738] block">{contact.label}</span>
                  <span className="text-sm font-bold">{contact.value}</span>
                </div>
              </motion.a>
            ))}

            {/* AI Planner CTA with Premium Animation */}
            <motion.button
              onClick={handleInquiryClick}
              initial={{ opacity: 0, x: 50, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: 'spring', 
                stiffness: 400, 
                damping: 25,
                delay: quickContacts.length * 0.05
              }}
              className="flex items-center gap-3 bg-gradient-to-r from-[#C89A4B] to-[#D6B06A] text-[#1a1008] rounded-full pl-4 pr-6 py-3 shadow-2xl hover:shadow-[0_8px_40px_rgba(200,154,75,0.5)] transition-all"
            >
              <motion.div 
                className="w-10 h-10 rounded-full bg-[#1a1008]/20 flex items-center justify-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#1a1008]/70 block">Plan Your Safari</span>
                <span className="text-sm font-bold">AI Concierge</span>
              </div>
            </motion.button>

            {/* Close Button */}
            <motion.button
              onClick={() => setIsExpanded(false)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ delay: 0.2 }}
              className="self-center p-3 rounded-full bg-[#2D2621] text-[#F4E8D5] hover:bg-[#C89A4B] hover:text-[#1a1008] transition-all shadow-lg"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <div className="flex items-center gap-3">
        {/* Scroll to Top */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9, rotate: -180 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 rounded-full bg-[#2D2621] text-[#C89A4B] hover:bg-[#C89A4B] hover:text-[#1a1008] shadow-xl border border-[#C89A4B]/40 hover:border-[#C89A4B] transition-all"
              title="Scroll to top"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main Inquiry Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            group relative flex items-center gap-3 px-6 py-4 rounded-full shadow-2xl
            ${isExpanded 
              ? 'bg-[#2D2621] text-[#C89A4B]' 
              : 'bg-gradient-to-r from-[#C89A4B] to-[#B08235] text-[#1a1008] hover:shadow-[0_8px_40px_rgba(200,154,75,0.5)]'
            }
            border-2 ${isExpanded ? 'border-[#C89A4B]' : 'border-transparent'}
          `}
        >
          {/* Premium Pulse Animation */}
          {!isExpanded && (
            <motion.span 
              className="absolute inset-0 rounded-full bg-[#C89A4B]"
              animate={{ 
                scale: [1, 1.4, 1],
                opacity: [0.4, 0, 0.4]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
          
          <motion.div 
            className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 transition-colors ${isExpanded ? 'bg-[#C89A4B]/20' : 'bg-[#1a1008]/20'}`}
            animate={{ rotate: isExpanded ? 0 : 0 }}
          >
            {isExpanded ? (
              <X className="w-6 h-6" />
            ) : (
              <MessageCircle className="w-6 h-6" />
            )}
          </motion.div>
          
          <div className="text-left pr-2 relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-wider block opacity-80">
              {isExpanded ? 'Close' : 'Safari'}
            </span>
            <span className="font-cinzel font-bold text-base tracking-wide">
              {isExpanded ? 'Menu' : 'Inquiry'}
            </span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};
