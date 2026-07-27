import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#C89A4B]`} />
      {text && (
        <p className="text-sm text-[#D3C5AE] font-medium">{text}</p>
      )}
    </div>
  );
};

// Full page loading overlay
interface LoadingOverlayProps {
  text?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  text = 'Loading...',
  fullScreen = true,
}) => {
  return (
    <div 
      className={`flex items-center justify-center ${fullScreen ? 'min-h-[50vh]' : ''} bg-transparent`}
    >
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-[#463D34] border-t-[#C89A4B] animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-r-[#D6B06A] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-sm font-medium text-[#D3C5AE] animate-pulse">{text}</p>
      </div>
    </div>
  );
};

// Card loading skeleton
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseClasses = 'bg-[#463D34]/50 animate-pulse';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full bg-[#463D34]/50 flex items-center justify-center mb-6">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-serif font-bold text-[#F4E8D5] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#D3C5AE] max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-[#C89A4B] text-[#2D2621] rounded-lg font-bold text-sm hover:bg-[#D6B06A] transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
