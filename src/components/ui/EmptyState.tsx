import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * EmptyState component for displaying when no data is available
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-slate-300 mb-4 flex items-center justify-center w-16 h-16">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
};
