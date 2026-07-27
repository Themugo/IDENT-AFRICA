import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'traveler' | 'supplier' | 'ranger_partner' | 'admin';
  allowedRoles?: Array<'traveler' | 'supplier' | 'ranger_partner' | 'admin'>;
  title?: string;
  description?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  allowedRoles,
  title = 'Protected Portal',
  description = 'Authentication and permissions required to access this area.',
}) => {
  const { user, setAuthModalOpen } = useApp();

  // If no user is logged in
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#0B130E] text-[#F5EBE0]">
        <div className="max-w-md w-full bg-[#121E16] border border-[#2A3B2E] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="w-16 h-16 rounded-full bg-[#1A2E20] border border-[#D4AF37]/40 flex items-center justify-center mx-auto mb-6 text-[#D4AF37]">
            <Lock className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
            Security Gate
          </span>

          <h2 className="text-2xl font-serif font-bold text-[#F5EBE0] mb-3">{title}</h2>
          <p className="text-sm text-[#F5EBE0]/70 mb-8 leading-relaxed">{description}</p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setAuthModalOpen(true);
              }}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0B130E] font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
            >
              Sign In to Continue <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setAuthModalOpen(true);
              }}
              className="w-full py-3 px-6 rounded-xl bg-[#1A2E20] border border-[#2A3B2E] text-[#F5EBE0] font-semibold hover:border-[#D4AF37]/50 transition-all text-xs"
            >
              Don't have an account? Register Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check roles if specified
  const effectiveAllowedRoles = allowedRoles || (requiredRole ? [requiredRole] : undefined);

  if (effectiveAllowedRoles && effectiveAllowedRoles.length > 0) {
    const hasRole = effectiveAllowedRoles.includes(user.role as any);

    if (!hasRole) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#0B130E] text-[#F5EBE0]">
          <div className="max-w-lg w-full bg-[#121E16] border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mx-auto mb-6 text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 inline-block">
              Access Restricted
            </span>

            <h2 className="text-2xl font-serif font-bold text-[#F5EBE0] mb-2">Insufficient Role Privileges</h2>
            <p className="text-xs text-[#F5EBE0]/70 mb-6 leading-relaxed">
              Your account (<strong className="text-[#D4AF37]">{user.email}</strong>) has the <span className="uppercase text-amber-400 font-bold">{user.role}</span> role, which lacks permission to view this section.
              This portal requires one of the following permissions: <span className="text-[#D4AF37] font-semibold">{effectiveAllowedRoles.join(', ')}</span>.
            </p>

            <div className="bg-[#0B130E]/80 border border-[#2A3B2E] rounded-xl p-4 text-left text-xs text-[#F5EBE0]/80 mb-6 space-y-1">
              <div className="text-[#D4AF37] font-bold mb-1">Demo Access Credentials:</div>
              <div>• <strong>Admin Role:</strong> admin@identafrica.com (pass: demo123)</div>
              <div>• <strong>Ranger Partner:</strong> ranger@identafrica.com (pass: demo123)</div>
              <div>• <strong>Traveler Role:</strong> kamauwamakena@gmail.com (pass: demo123)</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setAuthModalOpen(true);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#D4AF37] text-[#0B130E] font-bold text-xs hover:bg-[#c49f27] transition-all"
              >
                Switch Account
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
