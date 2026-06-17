import React from 'react';
import { Clock, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { AlertDetail } from '@/types';

interface AlertDetailHeaderProps {
  alert: AlertDetail;
}

export const AlertDetailHeader: React.FC<AlertDetailHeaderProps> = ({ alert }) => {
  return (
    <div className="card">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Left side - Alert info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{alert.alert_id}</h1>
            <Badge variant={alert.severity}>{alert.severity}</Badge>
          </div>
          
          <p className="text-slate-600 mb-4">{alert.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                Received {formatDate(alert.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">Source: {alert.source}</span>
            </div>
          </div>
        </div>

        {/* Right side - Decision */}
        {alert.final_analysis && (
          <div className="lg:w-80">
            <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Final Decision</h3>
              </div>
              <p className="text-lg font-bold text-red-900 mb-1">
                {alert.final_analysis.verdict}
              </p>
              <p className="text-sm text-red-700">
                Priority: {alert.verdict === 'true_positive' ? 'P1 Critical' : 'Normal'}
              </p>
            </div>

            {/* Metrics */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-600 mb-1">Avg Response Time</p>
                <p className="text-lg font-bold text-slate-900">{alert.response_time || 'N/A'}</p>
                <p className="text-xs text-slate-500">{alert.enrichment_steps || 0} Enrichment steps</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-600 mb-1">Confidence</p>
                <p className="text-lg font-bold text-slate-900">
                  {alert.final_analysis.confidence_score}%
                </p>
                <p className="text-xs text-slate-500">AI Analysis</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
