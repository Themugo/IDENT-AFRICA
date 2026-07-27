/**
 * Browser Compatibility Utilities
 * 
 * Provides safe access to browser APIs that don't exist during SSR/hydration.
 * Use these utilities to prevent hydration mismatches and SSR errors.
 */

// Check if we're in a browser environment
export const isBrowser = typeof window !== 'undefined';
export const isServer = typeof window === 'undefined';

// Safe localStorage access with SSR protection
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    if (!isBrowser) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

// Safe sessionStorage access with SSR protection
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): boolean => {
    if (!isBrowser) return false;
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },
  removeItem: (key: string): boolean => {
    if (!isBrowser) return false;
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

// Safe document access with SSR protection
export const safeDocument = {
  getElementById: (id: string): HTMLElement | null => {
    if (!isBrowser) return null;
    return document.getElementById(id);
  },
  querySelector: (selector: string): Element | null => {
    if (!isBrowser) return null;
    return document.querySelector(selector);
  },
  get documentElement(): HTMLElement | null {
    if (!isBrowser) return null;
    return document.documentElement;
  },
};

// Safe window access with SSR protection
export const safeWindow = {
  scrollTo: (options?: ScrollToOptions): void => {
    if (!isBrowser) return;
    window.scrollTo(options);
  },
  get scrollY(): number {
    if (!isBrowser) return 0;
    return window.scrollY;
  },
  get scrollX(): number {
    if (!isBrowser) return 0;
    return window.scrollX;
  },
  alert: (message: string): void => {
    if (!isBrowser) return;
    window.alert(message);
  },
  confirm: (message: string): boolean => {
    if (!isBrowser) return false;
    return window.confirm(message);
  },
};

// Safe intersection observer
export const createSafeIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  if (!isBrowser) return null;
  return new IntersectionObserver(callback, options);
};

// Safe matchMedia
export const safeMatchMedia = (query: string): MediaQueryList | null => {
  if (!isBrowser) return null;
  return window.matchMedia(query);
};

// Safe requestAnimationFrame
export const safeRequestAnimationFrame = (callback: FrameRequestCallback): number => {
  if (!isBrowser) return 0;
  return requestAnimationFrame(callback);
};

// Safe cancelAnimationFrame
export const safeCancelAnimationFrame = (id: number): void => {
  if (!isBrowser) return;
  cancelAnimationFrame(id);
};
