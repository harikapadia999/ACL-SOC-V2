import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  trendValue?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  color?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trendValue,
  trend = 'neutral',
  icon: Icon,
  color,
  className,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
      case 'down':
        return <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-emerald-600 bg-emerald-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const trendPercentage = Math.abs(change || trendValue || 0);

  return (
    <div className={cn('card', className)}>
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-slate-600">{title}</h3>
        {Icon && <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />}
      </div>
      
      <div>
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-1.5 sm:mb-2">{value}</p>
        
        {(change !== undefined || trendValue !== undefined) && (
          <div className={cn('inline-flex items-center gap-0.5 sm:gap-1 rounded px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium', getTrendColor())}>
            {getTrendIcon()}
            <span>{trendPercentage}%</span>
            <span className="hidden sm:inline">from yesterday</span>
          </div>
        )}
      </div>
    </div>
  );
};
