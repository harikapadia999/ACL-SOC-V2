import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AlertDetailHeader } from "@/components/alerts/AlertDetailHeader";
import { EventTimeline } from "@/components/alerts/EventTimeline";
import { AIReasoning } from "@/components/alerts/AIReasoning";
import { Button } from "@/components/ui/Button";
import { Alert as AlertComponent } from "@/components/ui/Alert";
import { LoadingPage } from "@/components/ui/Loading";
import { alertsApi } from "@/services/api";
import { AlertDetail } from "@/types";

export const AlertDetailPage: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (alertId) {
      loadAlertDetail(alertId);
    }
  }, [alertId]);

  const loadAlertDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertsApi.getAlertById(id);
      setAlert(data);
    } catch (err: any) {
      if ((err?.response?.status === 401 || err?.response?.status === 403) || err.code === "ERR_NETWORK" || err.message === "Network Error") return;
      console.warn("Failed to load alert detail:", err.message);
      setError("Unable to load alert detail. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div>
        <Link to="/alerts">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Alerts
          </Button>
        </Link>
        <AlertComponent type="error" message={error} />
      </div>
    );
  }

  if (!alert) {
    return (
      <div>
        <Link to="/alerts">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Alerts
          </Button>
        </Link>
        <AlertComponent type="info" message="Alert not found" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/alerts">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Alert Triage
        </Button>
      </Link>

      <div className="space-y-6">
        <AlertDetailHeader alert={alert} />

        <div className="grid gap-6 lg:grid-cols-2">
          {alert.timeline && alert.timeline.length > 0 && (
            <EventTimeline events={alert.timeline} />
          )}
          {alert.final_analysis && (
            <AIReasoning analysis={alert.final_analysis} />
          )}
        </div>

        {/* Raw Alert Data */}
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Raw Alert Data
          </h3>
          <div className="overflow-x-auto p-4 rounded-lg bg-slate-900">
            <pre className="font-mono text-xs text-green-400">
              {JSON.stringify(alert.raw_alert, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
