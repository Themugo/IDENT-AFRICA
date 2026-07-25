/**
 * DropdownMenu - Reusable dropdown menu component
 */

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({ trigger, children, align = 'left', className = '' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown panel */}
          <div 
            className={`absolute z-50 mt-2 min-w-48 rounded-xl bg-stone-800 border border-stone-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <div 
              className="py-1 max-h-96 overflow-y-auto"
              onClick={() => setIsOpen(false)}
            >
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

export function DropdownItem({ children, onClick, icon, danger = false, disabled = false }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        danger
          ? 'text-red-400 hover:bg-red-900/50'
          : 'text-stone-300 hover:bg-stone-700/50 hover:text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-stone-700" />;
}

interface DropdownLabelProps {
  children: ReactNode;
}

export function DropdownLabel({ children }: DropdownLabelProps) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
      {children}
    </div>
  );
}

// Trigger button with chevron
interface DropdownTriggerProps {
  children: ReactNode;
  isOpen: boolean;
  className?: string;
}

export function DropdownTrigger({ children, isOpen, className = '' }: DropdownTriggerProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {children}
      <ChevronDown 
        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
      />
    </div>
  );
}
