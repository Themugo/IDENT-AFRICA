/**
 * RTL Support Utilities
 * 
 * Right-to-left language support for Arabic and other RTL languages.
 */

import type { Language } from './index';
import type { ReactNode } from 'react';

// RTL languages
export const RTL_LANGUAGES: Language[] = ['ar'];

/**
 * Check if language is RTL
 */
export function isRTL(language: Language): boolean {
  return RTL_LANGUAGES.includes(language);
}

/**
 * Get text direction
 */
export function getDirection(language: Language): 'ltr' | 'rtl' {
  return isRTL(language) ? 'rtl' : 'ltr';
}

/**
 * Apply RTL classes
 */
export function getRTLClasses(language: Language): string {
  if (!isRTL(language)) return '';
  
  return 'rtl';
}

/**
 * Mirror icons for RTL
 */
export function shouldMirrorIcon(icon: string): boolean {
  const mirroredIcons = [
    'arrow-left',
    'arrow-right',
    'chevron-left',
    'chevron-right',
    'chevrons-left',
    'chevrons-right',
    'back',
    'forward',
    'login',
    'logout',
  ];
  
  return mirroredIcons.includes(icon);
}

/**
 * Get margin/padding for RTL
 */
export function getRTLValue(
  ltrValue: string,
  rtlValue: string,
  direction: 'ltr' | 'rtl'
): string {
  return direction === 'rtl' ? rtlValue : ltrValue;
}

/**
 * RTL-aware margin
 */
export function rtlMargin(
  direction: 'ltr' | 'rtl',
  options: {
    marginLeft?: string;
    marginRight?: string;
  }
): string {
  if (direction === 'rtl') {
    return `margin-right: ${options.marginRight || options.marginLeft || '0'}; margin-left: ${options.marginLeft || options.marginRight || '0'};`;
  }
  return `margin-left: ${options.marginLeft || '0'}; margin-right: ${options.marginRight || '0'};`;
}

/**
 * RTL-aware padding
 */
export function rtlPadding(
  direction: 'ltr' | 'rtl',
  options: {
    paddingLeft?: string;
    paddingRight?: string;
  }
): string {
  if (direction === 'rtl') {
    return `padding-right: ${options.paddingRight || options.paddingLeft || '0'}; padding-left: ${options.paddingLeft || options.paddingRight || '0'};`;
  }
  return `padding-left: ${options.paddingLeft || '0'}; padding-right: ${options.paddingRight || '0'};`;
}

/**
 * Get text alignment for RTL
 */
export function getTextAlign(direction: 'ltr' | 'rtl', align?: 'left' | 'right' | 'center'): string {
  if (align === 'center') return 'text-center';
  
  if (direction === 'rtl') {
    return align === 'left' ? 'text-right' : 'text-left';
  }
  
  return align === 'right' ? 'text-right' : 'text-left';
}

/**
 * Create RTL-specific Tailwind classes
 */
export function rtlClass(
  direction: 'ltr' | 'rtl',
  ltrClass: string,
  rtlClass: string
): string {
  return direction === 'rtl' ? rtlClass : ltrClass;
}

/**
 * Common RTL class mappings
 */
export const RTL_CLASS_MAP: Record<string, { ltr: string; rtl: string }> = {
  'left-0': { ltr: 'left-0', rtl: 'right-0' },
  'right-0': { ltr: 'right-0', rtl: 'left-0' },
  'ml-auto': { ltr: 'ml-auto', rtl: 'mr-auto' },
  'mr-auto': { ltr: 'mr-auto', rtl: 'ml-auto' },
  'pl-4': { ltr: 'pl-4', rtl: 'pr-4' },
  'pr-4': { ltr: 'pr-4', rtl: 'pl-4' },
  'text-left': { ltr: 'text-left', rtl: 'text-right' },
  'text-right': { ltr: 'text-right', rtl: 'text-left' },
  'items-start': { ltr: 'items-start', rtl: 'items-end' },
  'items-end': { ltr: 'items-end', rtl: 'items-start' },
  'justify-start': { ltr: 'justify-start', rtl: 'justify-end' },
  'justify-end': { ltr: 'justify-end', rtl: 'justify-start' },
};

/**
 * Get RTL-aware class
 */
export function getRTLAwareClass(
  direction: 'ltr' | 'rtl',
  baseClass: string
): string {
  const mapping = RTL_CLASS_MAP[baseClass];
  if (!mapping) return baseClass;
  
  return direction === 'rtl' ? mapping.rtl : mapping.ltr;
}

/**
 * CSS for RTL layout
 */
export const RTL_CSS = `
/* RTL Base Styles */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* RTL Typography */
[dir="rtl"] .font-arabic {
  font-family: 'Noto Sans Arabic', 'Arabic Typesetting', Arial, sans-serif;
}

/* RTL Icons */
[dir="rtl"] .rtl-mirror {
  transform: scaleX(-1);
}

/* RTL Navigation */
[dir="rtl"] .rtl-nav-icon {
  margin-right: 0;
  margin-left: 0.5rem;
}

/* RTL Forms */
[dir="rtl"] input,
[dir="rtl"] textarea,
[dir="rtl"] select {
  text-align: right;
}

/* RTL Lists */
[dir="rtl"] ul {
  padding-right: 1.5rem;
  padding-left: 0;
}

/* RTL Breadcrumbs */
[dir="rtl"] .breadcrumb-separator::before {
  content: "\\0000bb";
  margin-left: 0.5rem;
  margin-right: 0;
}

/* RTL Cards */
[dir="rtl"] .rtl-card-icon {
  margin-right: 0;
  margin-left: 1rem;
}

/* RTL Buttons */
[dir="rtl"] .btn-icon-left {
  margin-left: 0;
  margin-right: 0.5rem;
}

[dir="rtl"] .btn-icon-right {
  margin-right: 0;
  margin-left: 0.5rem;
}
`;

// Arabic font import (add to layout)
export const ARABIC_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap');
`;

/**
 * RTL Layout wrapper component props
 */
export interface RTLLayoutProps {
  direction: 'ltr' | 'rtl';
  language: string;
  children: ReactNode;
}
