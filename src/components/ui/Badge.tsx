import React from 'react';
import { cn, getSeverityBadge } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'critical' | 'high' | 'medium' | 'low' | 'info' | 'success' | 'warning';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className 
}) => {
  const variantClass = variant !== 'default' ? getSeverityBadge(variant) : 'badge';
  
  return (
    <span className={cn('badge', variantClass, className)}>
      {children}
    </span>
  );
};
