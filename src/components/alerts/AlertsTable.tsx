import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, ChevronUp, ChevronDown, ExternalLink, Clock, Shield, Activity, Target } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import { Alert } from '@/types';

interface AlertsTableProps {
  alerts: Alert[];
}

export const AlertsTable: React.FC<AlertsTableProps> = ({ alerts }) => {
  const [sortColumn, setSortColumn] = useState<string>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof Alert];
      let bValue: any = b[sortColumn as keyof Alert];

      // Handle timestamp sorting
      if (sortColumn === 'timestamp') {
        aValue = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        bValue = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      }

      // Handle severity sorting (critical > high > medium > low)
      if (sortColumn === 'severity') {
        const severityOrder: Record<string, number> = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
          info: 0,
        };
        aValue = a.severity ? severityOrder[a.severity.toLowerCase()] || 0 : 0;
        bValue = b.severity ? severityOrder[b.severity.toLowerCase()] || 0 : 0;
      }

      // Handle confidence score sorting
      if (sortColumn === 'confidence_score') {
        aValue = a.confidence_score || 0;
        bValue = b.confidence_score || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [alerts, sortColumn, sortDirection]);

  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'bg-slate-100 text-slate-800 border-slate-200';
    
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'info':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getVerdictColor = (verdict?: string) => {
    if (!verdict) return 'bg-slate-100 text-slate-800 border-slate-200';
    
    switch (verdict.toLowerCase()) {
      case 'true_positive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'false_positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'indeterminate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-slate-500';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-amber-600';
    return 'text-red-600';
  };

  const formatVerdict = (verdict?: string) => {
    if (!verdict) return 'Unknown';
    return verdict.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const SortIcon: React.FC<{ column: string }> = ({ column }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3 w-3 text-primary-600" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary-600" />
    );
  };

  if (alerts.length === 0) {
    return (
      <div className="card">
        <div className="py-12 text-center">
          <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-900 mb-2">No alerts found</p>
          <p className="text-sm text-slate-500">Try adjusting your filters or search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left">
                <button 
                  className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    sortColumn === 'display_id' 
                      ? 'text-primary-600' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => handleSort('display_id')}
                >
                  Display ID
                  <SortIcon column="display_id" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Description
              </th>
              <th className="px-4 py-3 text-left">
                <button 
                  className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    sortColumn === 'severity' 
                      ? 'text-primary-600' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => handleSort('severity')}
                >
                  Severity
                  <SortIcon column="severity" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Source
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Verdict
              </th>
              <th className="px-4 py-3 text-left">
                <button 
                  className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    sortColumn === 'confidence_score' 
                      ? 'text-primary-600' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => handleSort('confidence_score')}
                >
                  Confidence
                  <SortIcon column="confidence_score" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button 
                  className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    sortColumn === 'timestamp' 
                      ? 'text-primary-600' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  onClick={() => handleSort('timestamp')}
                >
                  Triggered Time
                  <SortIcon column="timestamp" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sortedAlerts.map((alert, index) => (
              <tr key={`${alert.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4">
                  <Link 
                    to={`/alerts/${alert.alert_id}`}
                    className="flex items-center gap-2 font-mono text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {alert.display_id || alert.alert_id || 'N/A'}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  {alert.ioc_count && alert.ioc_count > 0 && (
                    <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      <Target className="h-3 w-3" />
                      {alert.ioc_count} IOCs
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-md">
                    <p className="text-sm text-slate-900 font-medium line-clamp-2">
                      {alert.description || 'No description'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {alert.source || 'Unknown source'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                    <Activity className="h-3 w-3" />
                    {alert.severity ? alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1) : 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    <Shield className="h-3 w-3" />
                    {alert.source || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getVerdictColor(alert.verdict)}`}>
                    {formatVerdict(alert.verdict)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {alert.confidence_score !== undefined ? (
                    <span className={`text-sm font-semibold ${getConfidenceColor(alert.confidence_score)}`}>
                      {(alert.confidence_score * 100).toFixed(0)}%
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-slate-900">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDate(alert.timestamp)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={
                    alert.status === 'active' ? 'warning' :
                    alert.status === 'triaged' ? 'info' :
                    'success'
                  }>
                    {alert.status ? alert.status.charAt(0).toUpperCase() + alert.status.slice(1) : 'Unknown'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
