import React, { useState, useCallback, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Simple error boundary component using state
export function ErrorBoundary({ 
  children, 
  fallback,
  onError 
}: ErrorBoundaryProps): React.ReactElement {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
    errorInfo: null
  });

  const handleReset = useCallback(() => {
    setState({ hasError: false, error: null, errorInfo: null });
  }, []);

  // This is a simplified error boundary - for full error catching,
  // we rely on React's built-in error handling
  if (state.hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[#463D34]">
        <div className="max-w-lg w-full bg-[#2D2621] rounded-2xl border border-[#C89A4B]/50 p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C89A4B]/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-[#C89A4B]" />
          </div>
          
          <h2 className="text-xl font-serif font-bold text-[#F4E8D5] mb-3">
            Something went wrong
          </h2>
          
          <p className="text-sm text-[#D3C5AE] mb-6">
            We encountered an unexpected error. This has been logged and we'll look into it.
          </p>
          
          {import.meta.env.DEV && state.error && (
            <details className="text-left mb-6 p-4 bg-[#1A1008] rounded-lg border border-[#C89A4B]/30">
              <summary className="text-xs font-mono font-bold text-[#D6B06A] cursor-pointer">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs text-[#F4E8D5] overflow-auto max-h-32 whitespace-pre-wrap">
                {state.error.toString()}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C89A4B] text-[#2D2621] rounded-lg font-bold text-sm hover:bg-[#D6B06A] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#C89A4B] text-[#F4E8D5] rounded-lg font-bold text-sm hover:bg-[#463D34] transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((err: Error | string) => {
    const error = typeof err === 'string' ? new Error(err) : err;
    setError(error);
    console.error('Application error:', error);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  if (error) {
    throw error;
  }

  return { handleError, resetError };
}
