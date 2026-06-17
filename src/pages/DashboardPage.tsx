// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import {
//   Target,
//   Activity,
//   Gauge,
//   Clock,
//   Search,
//   RefreshCw,
// } from "lucide-react";
// import { MetricCard } from "@/components/dashboard/MetricCard";
// import { dashboardApi, alertsApi } from "@/services/api";
// import { DashboardMetrics, Alert } from "@/types";
// import toast from "react-hot-toast";

// export const DashboardPage: React.FC = () => {
//   const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
//   const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loadingTime, setLoadingTime] = useState(0);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   // Track loading time
//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (loading) {
//       setLoadingTime(0);
//       interval = setInterval(() => {
//         setLoadingTime((prev) => prev + 1);
//       }, 1000);
//     }
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [loading]);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const [metricsData, alertsData] = await Promise.all([
//         dashboardApi.getMetrics(),
//         alertsApi.getAllAlerts(),
//       ]);

//       // Validate data
//       if (!metricsData) {
//         console.warn("No metrics data received from backend");
//       }

//       const safeAlerts = Array.isArray(alertsData) ? alertsData : [];
//       if (!Array.isArray(alertsData)) {
//         console.warn("Invalid alerts data received from backend");
//       }

//       setMetrics(
//         (metricsData || {
//           total_alerts: 0,
//           active_alerts: 0,
//           closed_alerts: 0,
//           triaged_alerts: 0,
//           triaged_today: 0,
//           critical_alerts: 0,
//           high_alerts: 0,
//           medium_alerts: 0,
//           low_alerts: 0,
//         }) as unknown as DashboardMetrics
//       );
//       setRecentAlerts(safeAlerts.slice(0, 6));

//       console.log(`✅ Dashboard loaded successfully`);
//     } catch (err: any) {
//       if (
//         err?.response?.status === 401 ||
//         err?.response?.status === 403 ||
//         err.code === "ERR_NETWORK" ||
//         err.message === "Network Error"
//       ) {
//         // App is already redirecting via interceptor, stay quiet
//         return;
//       }
//       console.warn("❌ Failed to load dashboard data:", err.message);

//       setError(
//         "Unable to connect to backend server. Please verify the API is running and accessible."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper to convert number trend to trend type
//   const getTrend = (value: number): "up" | "down" | "neutral" => {
//     if (value > 0) return "up";
//     if (value < 0) return "down";
//     return "neutral";
//   };

//   const getSeverityColor = (severity?: string) => {
//     if (!severity) return "bg-slate-100 text-slate-800 border-slate-200";

//     switch (severity.toLowerCase()) {
//       case "critical":
//         return "bg-red-100 text-red-900 border-red-200";
//       case "high":
//         return "bg-orange-100 text-orange-900 border-orange-200";
//       case "medium":
//         return "bg-amber-100 text-amber-900 border-amber-200";
//       case "low":
//         return "bg-emerald-100 text-emerald-900 border-emerald-200";
//       case "info":
//         return "bg-slate-100 text-slate-800 border-slate-200";
//       default:
//         return "bg-slate-100 text-slate-800 border-slate-200";
//     }
//   };

//   const getSeverityDotColor = (severity?: string) => {
//     if (!severity) return "bg-slate-500";

//     switch (severity.toLowerCase()) {
//       case "critical":
//         return "bg-red-500";
//       case "high":
//         return "bg-orange-500";
//       case "medium":
//         return "bg-amber-500";
//       case "low":
//         return "bg-emerald-500";
//       case "info":
//         return "bg-slate-500";
//       default:
//         return "bg-slate-500";
//     }
//   };

//   const filteredAlerts = recentAlerts.filter(
//     (alert) =>
//       alert.alert_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       alert.description?.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (loading) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
//           <p className="mb-2 text-slate-600">
//             Loading dashboard data from backend...
//           </p>
//           <p className="text-sm text-slate-500">
//             {loadingTime > 0 && `${loadingTime}s elapsed`}
//             {loadingTime > 30 && " - Backend is processing, please wait..."}
//             {loadingTime > 60 && " - This is taking longer than usual..."}
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="max-w-md text-center">
//           <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-6">
//             <h2 className="mb-2 text-xl font-semibold text-red-900">
//               Failed to Load Dashboard
//             </h2>
//             <p className="mb-4 text-red-700">{error}</p>
//             <button
//               onClick={loadDashboardData}
//               className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
//             >
//               Retry
//             </button>
//           </div>
//           <p className="text-sm text-slate-600">
//             Please ensure the backend server is running and accessible.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!metrics) {
//     return (
//       <div className="flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           <p className="text-slate-600">No dashboard data available</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6 p-4 sm:p-6">
//       {/* Header */}
//       <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
//             Dashboard
//           </h1>
//           <p className="mt-1 text-slate-600">
//             Real-time security operations overview
//           </p>
//         </div>
//         <button
//           onClick={loadDashboardData}
//           className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:justify-start"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Refresh
//         </button>
//       </div>

//       {/* Metrics Grid */}
//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
//         <MetricCard
//           title="Total Alerts"
//           value={metrics.total_alerts}
//           icon={Target}
//           change={metrics.trend_24h}
//           trend={getTrend(metrics.trend_24h)}
//         />
//         <MetricCard
//           title="Critical Alerts"
//           value={metrics.critical_alerts}
//           icon={Activity}
//           change={metrics.trend_critical}
//           trend={getTrend(metrics.trend_critical)}
//         />
//         <MetricCard
//           title="Triaged"
//           value={metrics.triaged_today}
//           icon={Gauge}
//           change={metrics.trend_triaged}
//           trend={getTrend(metrics.trend_triaged)}
//         />
//         <MetricCard
//           title="Avg Triage Time"
//           value={`${metrics.avg_triage_time_minutes}m`}
//           icon={Clock}
//         />
//       </div>

//       {/* Recent Alerts Table */}
//       <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
//         <div className="border-b border-slate-200 p-4 sm:p-6">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <h2 className="text-lg font-semibold text-slate-900">
//               Recent Alerts
//             </h2>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search alerts..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-64"
//               />
//             </div>
//           </div>
//         </div>

//         {filteredAlerts.length === 0 ? (
//           <div className="p-8 text-center text-slate-500">
//             <p>No alerts found</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="border-b border-slate-200 bg-slate-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
//                     Alert ID
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
//                     Description
//                   </th>

//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
//                     Source
//                   </th>
//                   <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
//                     Severity
//                   </th>
//                   <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell sm:px-6">
//                     Time
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-200 bg-white">
//                 {filteredAlerts.map((alert, index) => (
//                   <tr
//                     key={`${alert.id}-${index}`}
//                     className="transition-colors hover:bg-slate-50"
//                   >
//                     <td className="whitespace-nowrap px-4 py-4 sm:px-6">
//                       <Link
//                         to={`/alert-triage/${
//                           alert.display_id || alert.alert_id
//                         }`}
//                         className="font-mono text-sm font-medium text-primary-600 transition-colors hover:text-primary-800 hover:underline"
//                       >
//                         {alert.display_id || alert.alert_id}
//                       </Link>
//                     </td>
//                     <td className="px-4 py-4 sm:px-6">
//                       <div className="line-clamp-2 text-sm text-slate-900">
//                         {alert.description}
//                       </div>
//                     </td>
//                     <td className="whitespace-nowrap px-4 py-4 sm:px-6">
//                       <div className="text-sm text-slate-600">
//                         {alert.source}
//                       </div>
//                     </td>
//                     <td className="whitespace-nowrap px-4 py-4 sm:px-6">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(
//                           alert.severity
//                         )}`}
//                       >
//                         <span
//                           className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getSeverityDotColor(
//                             alert.severity
//                           )}`}
//                         ></span>
//                         {alert.severity}
//                       </span>
//                     </td>

//                     <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-slate-500 sm:table-cell sm:px-6">
//                       {new Date(alert.timestamp).toLocaleString()}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Activity,
  Gauge,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { dashboardApi, alertsApi } from "@/services/api";
import { DashboardMetrics, Alert } from "@/types";
import toast from "react-hot-toast";

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingTime, setLoadingTime] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Track loading time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingTime(0);
      interval = setInterval(() => {
        setLoadingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Loading dashboard data from backend...");

      const [metricsData, alertsData] = await Promise.all([
        dashboardApi.getMetrics(),
        alertsApi.getAllAlerts(),
      ]);

      console.log("📊 Metrics received:", metricsData);
      console.log("🚨 Alerts received:", alertsData);

      // Validate data
      if (!metricsData) {
        console.warn("No metrics data received from backend");
      }

      const safeAlerts = Array.isArray(alertsData) ? alertsData : [];
      if (!Array.isArray(alertsData)) {
        console.warn("Invalid alerts data received from backend");
      }

      setMetrics(
        (metricsData || {
          total_alerts: 0,
          active_alerts: 0,
          closed_alerts: 0,
          triaged_alerts: 0,
          triaged_today: 0,
          critical_alerts: 0,
          high_alerts: 0,
          medium_alerts: 0,
          low_alerts: 0,
        }) as unknown as DashboardMetrics
      );
      setRecentAlerts(safeAlerts.slice(0, 6));

      console.log(`✅ Dashboard loaded successfully`);
    } catch (err: any) {
      if (
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err.code === "ERR_NETWORK" ||
        err.message === "Network Error"
      ) {
        // App is already redirecting via interceptor, stay quiet
        return;
      }
      console.warn("❌ Failed to load dashboard data:", err.message);

      setError(
        "Unable to connect to backend server. Please verify the API is running and accessible."
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert number trend to trend type
  const getTrend = (value: number): "up" | "down" | "neutral" => {
    if (value > 0) return "up";
    if (value < 0) return "down";
    return "neutral";
  };

  const getSeverityColor = (severity?: string) => {
    if (!severity) return "bg-slate-100 text-slate-800 border-slate-200";

    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-900 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-900 border-orange-200";
      case "medium":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "low":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      case "info":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getSeverityDotColor = (severity?: string) => {
    if (!severity) return "bg-slate-500";

    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-emerald-500";
      case "info":
        return "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  const filteredAlerts = recentAlerts.filter(
    (alert) =>
      alert.alert_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mb-2 text-slate-600">
            Loading dashboard data from backend...
          </p>
          <p className="text-sm text-slate-500">
            {loadingTime > 0 && `${loadingTime}s elapsed`}
            {loadingTime > 30 && " - Backend is processing, please wait..."}
            {loadingTime > 60 && " - This is taking longer than usual..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-900">
              Failed to Load Dashboard
            </h2>
            <p className="mb-4 text-red-700">{error}</p>
            <button
              onClick={loadDashboardData}
              className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              Retry
            </button>
          </div>
          <p className="text-sm text-slate-600">
            Please ensure the backend server is running and accessible.
          </p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">No dashboard data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-600">
            Real-time security operations overview
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 sm:justify-start"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <MetricCard
          title="Total Alerts"
          value={metrics.total_alerts}
          icon={Target}
          change={metrics.trend_24h}
          trend={getTrend(metrics.trend_24h)}
        />
        <MetricCard
          title="Critical Alerts"
          value={metrics.critical_alerts}
          icon={Activity}
          change={metrics.trend_critical}
          trend={getTrend(metrics.trend_critical)}
        />
        <MetricCard
          title="Triaged"
          value={metrics.triaged_today}
          icon={Gauge}
          change={metrics.trend_triaged}
          trend={getTrend(metrics.trend_triaged)}
        />
        <MetricCard
          title="Avg Triage Time"
          value={`${metrics.avg_triage_time_minutes}m`}
          icon={Clock}
        />
      </div>

      {/* Recent Alerts Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Alerts
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-64"
              />
            </div>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>No alerts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
                    Alert ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
                    Description
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:px-6">
                    Severity
                  </th>
                  <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell sm:px-6">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredAlerts.map((alert, index) => (
                  <tr
                    key={`${alert.id}-${index}`}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <Link
                        to={`/alert-triage/${
                          alert.display_id || alert.alert_id
                        }`}
                        className="font-mono text-sm font-medium text-primary-600 transition-colors hover:text-primary-800 hover:underline"
                      >
                        {alert.display_id || alert.alert_id}
                      </Link>
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <div className="line-clamp-2 text-sm text-slate-900">
                        {alert.description}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <div className="text-sm text-slate-600">
                        {alert.source}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getSeverityDotColor(
                            alert.severity
                          )}`}
                        ></span>
                        {alert.severity}
                      </span>
                    </td>

                    <td className="hidden whitespace-nowrap px-4 py-4 text-sm text-slate-500 sm:table-cell sm:px-6">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
