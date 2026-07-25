import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User, Lock, Mail, ShieldCheck, Compass, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, loginAs } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  if (!authModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#12241A] text-[#F5EBE0] border border-[#D4AF37]/40 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-[#F5EBE0]/70 hover:text-[#D4AF37] hover:bg-[#1E3A2B]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] flex items-center justify-center mx-auto shadow-lg shadow-[#D4AF37]/30">
            <Compass className="w-7 h-7 text-[#0F1210]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">
            SAFARIFLOW PORTAL
          </h2>
          <p className="text-xs font-mono text-[#F5EBE0]/70">
            Access your saved safari itineraries, active vouchers, and ranger dispatch logs.
          </p>
        </div>

        {/* Quick Demo Traveler Sign In */}
        <div className="p-4 rounded-2xl bg-[#4B321F] border border-[#C89A4B]/30 text-center space-y-2">
          <span className="text-[11px] font-bold text-[#D6B06A] uppercase block tracking-wider">
            Guest Traveler Access
          </span>
          <button
            onClick={() => loginAs('traveler')}
            className="w-full py-2.5 px-3 rounded-xl btn-gold text-[11px] font-bold"
          >
            Sign In as Guest Traveler
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#D4AF37]/20 font-mono text-xs">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 font-bold text-center border-b-2 transition-all ${
              tab === 'login' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-[#F5EBE0]/60'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 font-bold text-center border-b-2 transition-all ${
              tab === 'register' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-[#F5EBE0]/60'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); loginAs('traveler'); }} className="space-y-4 text-xs font-mono">
          {tab === 'register' && (
            <div className="space-y-1">
              <label className="text-[#D4AF37] font-bold uppercase">Full Name</label>
              <input
                type="text"
                placeholder="Makena Kamau"
                className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0]"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[#D4AF37] font-bold uppercase">Email Address</label>
            <input
              type="email"
              placeholder="traveler@safariflow.com"
              className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[#D4AF37] font-bold uppercase">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0]"
            />
          </div>

          <button
            type="submit"
            className="w-full btn-gold py-3 rounded-xl font-bold text-xs shadow-xl"
          >
            {tab === 'login' ? 'Sign In to Portal' : 'Register Account'}
          </button>
        </form>

      </div>
    </div>
  );
};
