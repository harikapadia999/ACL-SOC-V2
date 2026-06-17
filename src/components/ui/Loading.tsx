import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary-600', sizeClasses[size], className)} 
    />
  );
};

export const LoadingPage: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-600">Loading...</p>
      </div>
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="card animate-pulse">
      <div className="h-4 w-24 bg-slate-200 rounded"></div>
      <div className="mt-4 h-8 w-16 bg-slate-200 rounded"></div>
      <div className="mt-2 h-3 w-32 bg-slate-200 rounded"></div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="h-4 w-24 bg-slate-200 rounded"></div>
          <div className="h-4 flex-1 bg-slate-200 rounded"></div>
          <div className="h-4 w-20 bg-slate-200 rounded"></div>
          <div className="h-4 w-16 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};
