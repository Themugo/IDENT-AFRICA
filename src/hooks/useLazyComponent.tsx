/**
 * Lazy Loading Hook for React Components
 * 
 * Provides SSR-safe lazy loading with Suspense boundaries.
 */

import { lazy, Suspense, ReactNode, ComponentType } from 'react';

// Type for lazy loaded components
type LazyComponent<P = object> = ComponentType<P> & {
  preload: () => void;
};

// Cache for preloaded components
const preloadedModules = new Set<string>();

/**
 * Creates a lazy-loaded component with SSR safety.
 * SSR-safe: Will render fallback on server, then load on client.
 */
export function createLazyComponent<P = object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  fallback?: ReactNode
): LazyComponent<P> {
  // Create the lazy component
  const LazyComponent = lazy(factory);
  
  // Preload function
  const preload = () => {
    // SSR guard
    if (typeof window === 'undefined') return;
    
    // Prevent duplicate preloading
    const moduleId = factory.toString();
    if (preloadedModules.has(moduleId)) return;
    
    preloadedModules.add(moduleId);
    factory();
  };
  
  // Wrapper component for SSR safety
  const WrappedComponent = (props: P) => {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
  
  // Attach preload to wrapper
  (WrappedComponent as LazyComponent<P>).preload = preload;
  
  return WrappedComponent as LazyComponent<P>;
}

/**
 * Default loading fallback
 */
function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D6B06A]"></div>
    </div>
  );
}

/**
 * Preload multiple components
 */
export function preloadComponents(components: Array<() => Promise<unknown>>) {
  if (typeof window === 'undefined') return;
  components.forEach(factory => factory());
}
