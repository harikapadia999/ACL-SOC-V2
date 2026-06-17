import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeTime, getSeverityBadge } from '@/lib/utils';
import { Alert } from '@/types';

interface RecentAlertsTableProps {
  alerts: Alert[];
}

export const RecentAlertsTable: React.FC<RecentAlertsTableProps> = ({ alerts }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Alerts</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-600">
              <th className="pb-3">Alert ID</th>
              <th className="pb-3">Description</th>
              <th className="pb-3">Severity</th>
              <th className="pb-3">Source</th>
              <th className="pb-3">Time</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {alerts.map((alert, index) => (
              <tr key={`${alert.id || alert.alert_id}-${index}`} className="text-sm hover:bg-slate-50">
                <td className="py-3">
                  <Link 
                    to={`/alerts/${alert.alert_id}`}
                    className="font-medium text-primary-600 hover:text-primary-700"
                  >
                    {alert.alert_id}
                  </Link>
                </td>
                <td className="py-3 text-slate-700">{alert.description}</td>
                <td className="py-3">
                  <Badge variant={alert.severity}>
                    {alert.severity}
                  </Badge>
                </td>
                <td className="py-3 text-slate-600">{alert.source}</td>
                <td className="py-3 text-slate-600">
                  {formatRelativeTime(alert.timestamp)}
                </td>
                <td className="py-3">
                  <Badge variant={alert.status === 'active' ? 'success' : 'default'}>
                    {alert.status}
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
