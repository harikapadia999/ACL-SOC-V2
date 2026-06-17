import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { alertsApi } from "@/services/api";
import { Alert } from "@/types";

interface AlertTriageItem {
  id: string;
  alert_id: string;
  display_id: string;
  description: string;
  severity: "P1 Critical" | "P2 High" | "P3 Medium" | "P4 Low";
  source: string;
  response_time: string;
  triggered_time: string;
  verdict: "true_positive" | "false_positive" | "indeterminate";
}

export const AlertTriageListPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("triggered_time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [alerts, setAlerts] = useState<AlertTriageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch alerts from backend
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("📤 Fetching alerts from backend...");
        const backendAlerts = await alertsApi.getAllAlerts();
        console.log("📥 Received alerts:", backendAlerts);

        if (!backendAlerts) {
          throw new Error("Failed to load alerts from backend");
        }
        
        if (backendAlerts.length === 0) {
          setAlerts([]);
          setLoading(false);
          return;
        }

        // Fetch detailed data for each alert to get analysis timestamps and verdict
        const detailedAlertsPromises = backendAlerts.map(
          async (alert: Alert) => {
            try {
              const detailData = await alertsApi.getAlertById(alert.display_id);
              return { alert, detailData };
            } catch (err) {
              console.warn(
                `Failed to fetch details for ${alert.display_id}:`,
                err
              );
              return { alert, detailData: null };
            }
          }
        );

        const detailedAlerts = await Promise.all(detailedAlertsPromises);

        // Transform backend alerts to AlertTriageItem format
        const transformedAlerts: AlertTriageItem[] = detailedAlerts.map(
          ({ alert, detailData }) => {
            // Map severity to P1/P2/P3/P4 format
            let severity: "P1 Critical" | "P2 High" | "P3 Medium" | "P4 Low";
            switch (alert.severity.toLowerCase()) {
              case "critical":
                severity = "P1 Critical";
                break;
              case "high":
                severity = "P2 High";
                break;
              case "medium":
                severity = "P3 Medium";
                break;
              case "low":
                severity = "P4 Low";
                break;
              default:
                severity = "P3 Medium";
            }

            // Format timestamp
            const triggeredTime = new Date(alert.timestamp).toLocaleDateString(
              "en-US",
              {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }
            );

            // Calculate response time from original_timestamp and analysis_timestamp
            let responseTime = "N/A";
            if (
              detailData?.raw_alert?.original_timestamp &&
              detailData?.analysis?.analysis_timestamp
            ) {
              try {
                const originalTime = new Date(
                  detailData.raw_alert.original_timestamp
                ).getTime();
                const analysisTime = new Date(
                  detailData.analysis.analysis_timestamp
                ).getTime();
                const diffMs = analysisTime - originalTime;

                if (diffMs >= 0) {
                  const diffSeconds = Math.floor(diffMs / 1000);
                  const diffMinutes = Math.floor(diffSeconds / 60);
                  const diffHours = Math.floor(diffMinutes / 60);

                  if (diffHours > 0) {
                    const remainingMinutes = diffMinutes % 60;
                    responseTime = `${diffHours}h ${remainingMinutes}m`;
                  } else if (diffMinutes > 0) {
                    const remainingSeconds = diffSeconds % 60;
                    responseTime = `${diffMinutes}m ${remainingSeconds}s`;
                  } else {
                    responseTime = `${diffSeconds}s`;
                  }
                }
              } catch (err) {
                console.warn(
                  `Failed to calculate response time for ${alert.display_id}:`,
                  err
                );
              }
            }

            // Get verdict from analysis.verdict - must be exactly one of: true_positive, false_positive, indeterminate
            let verdict: "true_positive" | "false_positive" | "indeterminate" =
              "indeterminate";
            if (detailData?.analysis?.verdict) {
              const normalizedVerdict = detailData.analysis.verdict
                .toLowerCase()
                .trim();
              if (
                normalizedVerdict === "true_positive" ||
                normalizedVerdict === "false_positive" ||
                normalizedVerdict === "indeterminate"
              ) {
                verdict = normalizedVerdict as
                  | "true_positive"
                  | "false_positive"
                  | "indeterminate";
              }
            }

            return {
              id: alert.id,
              alert_id: alert.alert_id,
              display_id: alert.display_id,
              description: alert.description,
              severity,
              source: alert.source || "Unknown",
              response_time: responseTime,
              triggered_time: triggeredTime,
              verdict,
            };
          }
        );

        setAlerts(transformedAlerts);
        console.log("✅ Transformed alerts:", transformedAlerts);
      } catch (err: any) {
        if ((err?.response?.status === 401 || err?.response?.status === 403) || err.code === "ERR_NETWORK" || err.message === "Network Error") return;
        console.warn("❌ Failed to fetch alerts:", err.message);
        setError("Unable to load full triage list currently. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(
      (alert) =>
        alert.display_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.source.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [alerts, searchQuery]);

  const sortedAlerts = useMemo(() => {
    return [...filteredAlerts].sort((a, b) => {
      const aValue: any = a[sortColumn as keyof AlertTriageItem];
      const bValue: any = b[sortColumn as keyof AlertTriageItem];

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredAlerts, sortColumn, sortDirection]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "P1 Critical":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "P2 High":
        return "bg-orange-100 text-orange-900 border-orange-200";
      case "P3 Medium":
        return "bg-yellow-100 text-yellow-900 border-yellow-200";
      case "P4 Low":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-900 border-slate-200";
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "true_positive":
        return "bg-red-100 text-red-900 border-red-200";
      case "false_positive":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      case "indeterminate":
        return "bg-amber-100 text-amber-900 border-amber-200";
      default:
        return "bg-slate-100 text-slate-900 border-slate-200";
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case "true_positive":
        return "True Positive";
      case "false_positive":
        return "False Positive";
      case "indeterminate":
        return "Indeterminate";
      default:
        return "Unknown";
    }
  };

  const SortIcon: React.FC<{ column: string }> = ({ column }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-primary-600" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-primary-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Alert Triage</h1>
        <p className="mt-2 text-slate-600">
          AI Powered alert analysis and decision reasoning
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex gap-3 items-start p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">
              Failed to load alerts
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <p className="mt-2 text-xs text-red-600">
              Please check backend connection and try again
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search"
          className="py-2 pr-4 pl-10 w-full text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col justify-center items-center p-12 card">
          <Loader2 className="mb-4 w-8 h-8 animate-spin text-primary-600" />
          <p className="text-slate-600">Loading alerts from backend...</p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left">
                    <button
                      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        sortColumn === "display_id"
                          ? "text-primary-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      onClick={() => handleSort("display_id")}
                    >
                      Alert ID
                      <SortIcon column="display_id" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold tracking-wider text-left uppercase text-slate-600">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        sortColumn === "source"
                          ? "text-primary-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      onClick={() => handleSort("source")}
                    >
                      Source
                      <SortIcon column="source" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        sortColumn === "severity"
                          ? "text-primary-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      onClick={() => handleSort("severity")}
                    >
                      Severity
                      <SortIcon column="severity" />
                    </button>
                  </th>

                  <th className="px-4 py-3 text-left">
                    <button
                      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        sortColumn === "response_time"
                          ? "text-primary-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      onClick={() => handleSort("response_time")}
                    >
                      Response time
                      <SortIcon column="response_time" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        sortColumn === "triggered_time"
                          ? "text-primary-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      onClick={() => handleSort("triggered_time")}
                    >
                      Triggered Time
                      <SortIcon column="triggered_time" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
                        sortColumn === "verdict"
                          ? "text-primary-600"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      onClick={() => handleSort("verdict")}
                    >
                      Verdict
                      <SortIcon column="verdict" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {sortedAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <p className="text-slate-500">
                        {error
                          ? "Failed to load alerts from backend"
                          : "No alerts found"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  sortedAlerts.map((alert, index) => (
                    <tr
                      key={`${alert.id}-${index}`}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-4 py-4">
                        <Link
                          to={`/alert-triage/${alert.display_id}`}
                          className="font-mono text-sm font-medium transition-colors text-primary-600 hover:text-primary-800 hover:underline"
                        >
                          {alert.display_id}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-900">
                          {alert.description}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-900">
                          {alert.source}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getSeverityColor(
                            alert.severity
                          )}`}
                        >
                          <span className="w-2 h-2 bg-current rounded-full"></span>
                          {alert.severity}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-900">
                          {alert.response_time}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-slate-600">
                          {alert.triggered_time}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getVerdictColor(
                            alert.verdict
                          )}`}
                        >
                          {getVerdictLabel(alert.verdict)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
