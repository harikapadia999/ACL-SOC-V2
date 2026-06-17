import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { AlertFiltersBar } from "@/components/alerts/AlertFiltersBar";
import { AlertsTable } from "@/components/alerts/AlertsTable";
import { Pagination } from "@/components/ui/Pagination";
import { Alert as AlertComponent } from "@/components/ui/Alert";
import { SkeletonTable } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { alertsApi } from "@/services/api";
import { Alert } from "@/types";
import toast from "react-hot-toast";

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching alerts from backend...");
      console.log(
        "📡 API URL: https://ai-soc.onrender.com/api/v1/alerts/alerts"
      );

      const data = await alertsApi.getAllAlerts();
      console.log("✅ Backend response received:", data.length, "alerts");
      console.log("📊 Sample alert:", data[0]);

      if (data && Array.isArray(data)) {
        setAlerts(data);
        setFilteredAlerts(data);

        if (data.length === 0) {
          console.warn("No alerts found in backend database");
        } else {
          console.log(`✅ Loaded ${data.length} alerts from backend`);
        }
      } else {
        console.warn("Invalid response format from backend, using empty array");
        setAlerts([]);
        setFilteredAlerts([]);
      }
    } catch (err: any) {
      if ((err?.response?.status === 401 || err?.response?.status === 403) || err.code === "ERR_NETWORK" || err.message === "Network Error") return;
      console.warn("❌ Failed to load alerts:", err.message);
      setError("Unable to load alerts currently. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...alerts];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (alert) =>
          alert.alert_id?.toLowerCase().includes(searchLower) ||
          alert.display_id?.toLowerCase().includes(searchLower) ||
          alert.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply severity filter
    if (filters.severity) {
      filtered = filtered.filter(
        (alert) =>
          alert.severity?.toLowerCase() === filters.severity.toLowerCase()
      );
    }

    // Apply verdict filter
    if (filters.verdict) {
      filtered = filtered.filter(
        (alert) =>
          alert.verdict?.toLowerCase() === filters.verdict.toLowerCase()
      );
    }

    // Apply source filter
    if (filters.source) {
      filtered = filtered.filter((alert) =>
        alert.source?.toLowerCase().includes(filters.source.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(
        (alert) => alert.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter((alert) => {
        const alertDate = new Date(alert.timestamp);
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

        if (fromDate && alertDate < fromDate) return false;
        if (toDate && alertDate > toDate) return false;
        return true;
      });
    }

    setFilteredAlerts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate statistics with safe checks and memoization
  const stats = useMemo(
    () => ({
      total: alerts.length,
      critical: alerts.filter((a) => a.severity?.toLowerCase() === "critical")
        .length,
      high: alerts.filter((a) => a.severity?.toLowerCase() === "high").length,
      active: alerts.filter((a) => a.status?.toLowerCase() === "active").length,
      triaged: alerts.filter((a) => a.status?.toLowerCase() === "triaged")
        .length,
      truePositive: alerts.filter(
        (a) => a.verdict?.toLowerCase() === "true_positive"
      ).length,
      falsePositive: alerts.filter(
        (a) => a.verdict?.toLowerCase() === "false_positive"
      ).length,
      indeterminate: alerts.filter(
        (a) => a.verdict?.toLowerCase() === "indeterminate"
      ).length,
    }),
    [alerts]
  );

  // Paginate filtered alerts
  const paginatedAlerts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAlerts.slice(startIndex, endIndex);
  }, [filteredAlerts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Alert Triage</h1>
        </div>
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Alert Triage</h1>
        </div>

        <AlertComponent
          type="error"
          title="Failed to load alerts"
          message={error}
        />

        <div className="flex justify-center">
          <Button onClick={loadAlerts} className="flex gap-2 items-center">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alert Triage</h1>
          <p className="mt-1 text-slate-600">
            {alerts.length === 0
              ? "No alerts in database"
              : `Showing ${paginatedAlerts.length} of ${filteredAlerts.length} filtered alerts (${alerts.length} total)`}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={loadAlerts}
          className="flex gap-2 items-center"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats Cards - Row 1: Severity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Total Alerts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total}
              </p>
            </div>
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Critical</p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {stats.critical}
              </p>
            </div>
            <div className="flex justify-center items-center w-8 h-8 bg-red-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">High</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">
                {stats.high}
              </p>
            </div>
            <div className="flex justify-center items-center w-8 h-8 bg-orange-100 rounded-full">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {stats.active}
              </p>
            </div>
            <div className="flex justify-center items-center w-8 h-8 bg-amber-100 rounded-full">
              <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Triaged</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {stats.triaged}
              </p>
            </div>
            <div className="flex justify-center items-center w-8 h-8 bg-green-100 rounded-full">
              <TrendingDown className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards - Row 2: Verdicts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">True Positives</p>
              <p className="mt-1 text-2xl font-bold text-red-600">
                {stats.truePositive}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.total > 0
                  ? Math.round((stats.truePositive / stats.total) * 100)
                  : 0}
                % of total
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-red-100 rounded-full">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">False Positives</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {stats.falsePositive}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.total > 0
                  ? Math.round((stats.falsePositive / stats.total) * 100)
                  : 0}
                % of total
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-green-100 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-600">Indeterminate</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {stats.indeterminate}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.total > 0
                  ? Math.round((stats.indeterminate / stats.total) * 100)
                  : 0}
                % of total
              </p>
            </div>
            <div className="flex justify-center items-center w-10 h-10 bg-amber-100 rounded-full">
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Info */}
      {alerts.length === 0 && (
        <AlertComponent
          type="info"
          title="No alerts in database"
          message="The backend database is empty. Alerts will appear here once they are created in the system."
        />
      )}

      {/* Filters */}
      {alerts.length > 0 && (
        <AlertFiltersBar onFilterChange={handleFilterChange} />
      )}

      {/* Alerts Table */}
      {alerts.length > 0 && (
        <div className="overflow-hidden card">
          <AlertsTable alerts={paginatedAlerts} />

          {/* Pagination */}
          {filteredAlerts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAlerts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};
