import React from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { TimelineEvent } from '@/types';
import { cn } from '@/lib/utils';

interface EventTimelineProps {
  events: TimelineEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 border-green-200';
      case 'failed':
        return 'bg-red-100 border-red-200';
      case 'pending':
        return 'bg-yellow-100 border-yellow-200';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">API Integrations</h3>
      
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={cn('rounded-full border-2 p-2', getStatusColor(event.status))}>
                {getStatusIcon(event.status)}
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 flex-1 bg-slate-200 my-2"></div>
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h4 className="font-medium text-slate-900">{event.event_type || event.type}</h4>
                  <p className="text-sm text-slate-600">{event.description}</p>
                </div>
                {event.duration && (
                  <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                    {event.duration}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{formatDate(event.timestamp)}</p>
              
              {event.details && (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs">
                  <pre className="text-slate-700 whitespace-pre-wrap">
                    {JSON.stringify(event.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
