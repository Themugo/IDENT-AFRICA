import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, User, Lock, Mail, Phone, Compass, AlertCircle, Loader2 } from 'lucide-react';

interface AuthModalProps {
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ defaultTab = 'login' }) => {
  const { authModalOpen, setAuthModalOpen, loginAs } = useApp();
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleClose = () => {
    setAuthModalOpen(false);
    setError(null);
    setSuccess(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || 'Login failed');
      }

      // Store token
      localStorage.setItem('auth_token', data.data.token);
      
      setSuccess('Login successful!');
      setTimeout(() => {
        handleClose();
        // Refresh to update auth state
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || 'Registration failed');
      }

      // Store token
      localStorage.setItem('auth_token', data.data.token);
      
      setSuccess('Registration successful! Welcome to Ident Africa.');
      setTimeout(() => {
        handleClose();
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginAs('traveler');
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-[#12241A] text-[#F5EBE0] border border-[#D4AF37]/40 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#F5EBE0]/70 hover:text-[#D4AF37] hover:bg-[#1E3A2B] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] flex items-center justify-center mx-auto shadow-lg shadow-[#D4AF37]/30">
            <Compass className="w-7 h-7 text-[#0F1210]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">
            IDENT AFRICA
          </h2>
          <p className="text-xs font-mono text-[#F5EBE0]/70">
            Access your saved expeditions, bookings, and travel documents.
          </p>
        </div>

        {/* Demo Access */}
        <div className="p-4 rounded-2xl bg-[#4B321F] border border-[#C89A4B]/30 text-center space-y-2">
          <span className="text-[11px] font-bold text-[#D6B06A] uppercase block tracking-wider">
            Quick Demo Access
          </span>
          <button
            onClick={handleDemoLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-[#D4AF37] hover:bg-[#C89A4B] text-[#0F1210] font-bold text-xs transition-colors"
          >
            Continue as Guest Traveler
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#D4AF37]/20 font-mono text-xs">
          <button
            onClick={() => { setTab('login'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 font-bold text-center border-b-2 transition-all ${
              tab === 'login' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-[#F5EBE0]/60'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 font-bold text-center border-b-2 transition-all ${
              tab === 'register' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-[#F5EBE0]/60'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/50 border border-red-500/50 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-900/50 border border-green-500/50 text-green-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                required
                className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0] placeholder-[#F5EBE0]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0] placeholder-[#F5EBE0]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C89A4B] text-[#0F1210] font-bold text-xs shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>
        )}

        {/* Registration Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-2">
                <User className="w-3 h-3" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Makena Kamau"
                required
                minLength={2}
                className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0] placeholder-[#F5EBE0]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                required
                className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0] placeholder-[#F5EBE0]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-2">
                <Phone className="w-3 h-3" />
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 712 345 678"
                className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0] placeholder-[#F5EBE0]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#D4AF37] font-bold uppercase flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="w-full bg-[#181E1A] p-3 rounded-xl border border-[#D4AF37]/30 text-[#F5EBE0] placeholder-[#F5EBE0]/40 focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            <p className="text-[#F5EBE0]/50 text-[10px]">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#C89A4B] text-[#0F1210] font-bold text-xs shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
