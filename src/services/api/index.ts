import { apiClient } from "./client";
import { useAuthStore } from "@/store/authStore";
import {
  DashboardMetrics,
  Alert,
  AlertDetail,
  AlertFilters,
  BackendAlertResponse,
  transformBackendAlert,
} from "@/types";

/**
 * Backend Dashboard Metrics Response Structure
 */
interface BackendDashboardMetrics {
  "Triage Today": {
    date: string;
    triaged_today: number;
    percent_change: number;
  };
  "Critical Escalations": {
    date: string;
    today_count: number;
    percent_change: number;
  };
  "Mean Time To Triage": number; // in seconds
}

/**
 * Transform backend dashboard metrics to frontend format
 */
const transformBackendMetrics = (
  backendMetrics: Partial<BackendDashboardMetrics>,
  alerts: Alert[]
): DashboardMetrics => {
  // Calculate metrics from alerts
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentAlerts = alerts.filter((a) => {
    const date = new Date(a.timestamp);
    return !isNaN(date.getTime()) && date > last24h;
  });

  const weekAlerts = alerts.filter((a) => {
    const date = new Date(a.timestamp);
    return !isNaN(date.getTime()) && date > last7d;
  });

  // Calculate average confidence
  const alertsWithConfidence = alerts.filter(
    (a) =>
      a.confidence_score !== undefined &&
      a.confidence_score !== null &&
      !isNaN(a.confidence_score)
  );

  const avgConfidence =
    alertsWithConfidence.length > 0
      ? alertsWithConfidence.reduce((sum, a) => sum + a.confidence_score!, 0) /
        alertsWithConfidence.length
      : null;

  // Convert Mean Time To Triage from seconds to minutes
  const avgTriageTimeMinutes = Math.round(
    (backendMetrics?.["Mean Time To Triage"] || 0) / 60
  );

  return {
    total_alerts: alerts.length,
    critical_alerts: alerts.filter((a) => a.severity === "critical").length,
    high_alerts: alerts.filter((a) => a.severity === "high").length,
    medium_alerts: alerts.filter((a) => a.severity === "medium").length,
    low_alerts: alerts.filter((a) => a.severity === "low").length,

    active_alerts: alerts.filter((a) => a.status === "active").length,
    triaged_alerts: alerts.filter((a) => a.status === "triaged").length,
    triaged_today: backendMetrics?.["Triage Today"]?.triaged_today || 0, // Extract from backend
    closed_alerts: alerts.filter((a) => a.status === "closed").length,

    true_positives: alerts.filter((a) => a.verdict === "true_positive").length,
    false_positives: alerts.filter((a) => a.verdict === "false_positive")
      .length,
    indeterminate: alerts.filter((a) => a.verdict === "indeterminate").length,

    alerts_last_24h: recentAlerts.length,
    alerts_last_7d: weekAlerts.length,

    avg_confidence: avgConfidence,

    // Use backend-provided trends
    trend_24h: backendMetrics?.["Triage Today"]?.percent_change || 0,
    trend_critical:
      backendMetrics?.["Critical Escalations"]?.percent_change || 0,
    trend_triaged: backendMetrics?.["Triage Today"]?.percent_change || 0,

    // Use backend-provided average triage time
    avg_triage_time_minutes: avgTriageTimeMinutes || 0,
  };
};

/**
 * Calculate trend percentage between current and previous values
 */
const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Calculate average triage time from alerts with triage timestamps
 */
const calculateAvgTriageTime = (alerts: Alert[]): number => {
  const triagedAlerts = alerts.filter(
    (a) => a.status === "triaged" && a.timestamp
  );

  if (triagedAlerts.length === 0) return 0;

  // If backend provides triage_time field, use it
  // Otherwise, this is a placeholder that returns 0
  // Backend should provide actual triage timestamps
  return 0;
};

const ensureTenantId = async (): Promise<string> => {
  const { activeTenant, setActiveTenant } = useAuthStore.getState();
  if (
    typeof activeTenant === "string" &&
    activeTenant.length > 20 &&
    activeTenant !== "00000000-0000-0000-0000-000000000000"
  ) {
    return activeTenant;
  }

  try {
    const tenantsResp = await apiClient.get("/api/v1/tenants");
    if (tenantsResp.data && tenantsResp.data.length > 0) {
      const validId = tenantsResp.data[0].id || tenantsResp.data[0].tenant_id;
      if (validId) {
        setActiveTenant(validId);
        return validId;
      }
    }
  } catch (e) {
    console.warn("Failed to fetch tenants fallback:", e);
  }
  return "00000000-0000-0000-0000-000000000000"; // Absolute fallback
};

export const dashboardApi = {
  /**
   * Get dashboard metrics from backend
   * Combines backend metrics with calculated alert statistics
   */
  getMetrics: async (): Promise<DashboardMetrics> => {
    try {
      const tenantId = await ensureTenantId();

      // Only fetch alerts since dashboard metrics endpoint is missing from spec
      const alertsResponse = await apiClient
        .get<any[]>("/api/v1/alerts", { params: { tenant_id: tenantId } })
        .catch((e) => {
          if (e.response?.status === 401 || e.response?.status === 403) throw e;
          return { data: [] }; // Fallback to empty array if backend is failing
        });

      let alertsData = [];
      if (alertsResponse && Array.isArray(alertsResponse.data)) {
        alertsData = alertsResponse.data;
      }

      const alerts = alertsData
        .map((raw) => {
          try {
            return transformBackendAlert(raw);
          } catch (e) {
            console.warn("Alert transform error, skipping alert:", e);
            return null;
          }
        })
        .filter(Boolean) as Alert[];
      const metrics = transformBackendMetrics({}, alerts);
      return metrics;
    } catch (error: any) {
      console.warn("Failed to fetch dashboard metrics:", error.message);
      if (
        error.code === "ERR_NETWORK" ||
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        throw error;
      }
      let errMsg =
        error.response?.data?.message || "Failed to fetch dashboard metrics";
      if (error.response?.status === 422) {
        errMsg = `422 Error: ${JSON.stringify(error.response?.data)}`;
      }
      throw new Error(errMsg);
    }
  },
};

export const alertsApi = {
  /**
   * Get all alerts (basic search) and transform them to frontend format
   */
  getAllAlerts: async (): Promise<Alert[]> => {
    try {
      const tenantId = await ensureTenantId();
      const response = await apiClient
        .get<any[]>("/api/v1/alerts", {
          params: { tenant_id: tenantId },
        })
        .catch((e) => {
          if (e.response?.status === 401 || e.response?.status === 403) throw e;
          return { data: [] };
        });
      if (!response || !Array.isArray(response.data)) {
        return [];
      }
      return response.data
        .map((raw) => {
          try {
            return transformBackendAlert(raw);
          } catch (e) {
            console.warn("Alert transform error, skipping:", e);
            return null;
          }
        })
        .filter(Boolean) as Alert[];
    } catch (e: any) {
      console.warn("Failed to fetch alerts:", e.message);
      if (
        e.code === "ERR_NETWORK" ||
        e.response?.status === 401 ||
        e.response?.status === 403
      ) {
        throw e;
      }
      let errMsg = e.response?.data?.message || "Failed to fetch alerts";
      if (e.response?.status === 422) {
        errMsg = `422 Error: ${JSON.stringify(e.response?.data)}`;
      }
      throw new Error(errMsg);
    }
  },

  /**
   * Get a specific alert by ID with full details
   * Tries display_id first, then falls back to alert_id if needed
   */
  getAlertById: async (alertId: string): Promise<AlertDetail> => {
    try {
      console.log(`🔍 Attempting to fetch alert with ID: ${alertId}`);
      const tenantId = await ensureTenantId();
      const response = await apiClient.get<any[]>("/api/v1/alerts", {
        params: { tenant_id: tenantId },
      });

      const alerts = response.data;
      if (!Array.isArray(alerts))
        throw new Error("Invalid alerts data from backend");

      const alertData = alerts.find(
        (a: any) =>
          a.id?.toString() === alertId ||
          a.alert_id === alertId ||
          a.triage_result?.display_id === alertId ||
          a.triage_result?.alert?.alert_id === alertId
      );

      if (!alertData) throw new Error("Alert not found");

      const baseAlert = transformBackendAlert(alertData);
      const isWrapped = !!alertData.triage_result;
      const targetObj = isWrapped ? alertData.triage_result! : alertData;

      const rawAlert =
        alertData.raw_alert || targetObj.raw_alert || targetObj.alert || {};
      const threatIntel = targetObj.threat_intel || [];
      const analysis = targetObj.analysis || {};

      return {
        ...baseAlert,
        raw_alert: rawAlert,
        threat_intel: threatIntel,
        analysis: analysis,
        iocs: targetObj.alert?.iocs || {},
        mitre_techniques: targetObj.alert?.mitre || [],
        recommendations: analysis.recommended_actions || [],
        affected_assets: analysis.affected_assets || [],
      };
    } catch (error: any) {
      console.warn(
        `Failed to fetch alert detail for ${alertId}:`,
        error.message
      );
      if (
        error.code === "ERR_NETWORK" ||
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        throw error;
      }
      throw new Error(error.response?.data?.message || "Failed to fetch alert");
    }
  },

  /**
   * Search alerts with filters using the advanced search endpoint
   */
  searchAlerts: async (filters: AlertFilters): Promise<Alert[]> => {
    try {
      const tenantId = await ensureTenantId();
      const response = await apiClient
        .get<any[]>("/api/v1/alerts", {
          params: { ...filters, tenant_id: tenantId },
        })
        .catch((e) => {
          if (e.response?.status === 401 || e.response?.status === 403) throw e;
          console.warn("Alerts search backend failure:", e.message);
          return { data: [] };
        });
      if (!response || !Array.isArray(response.data)) return [];
      return response.data
        .map((raw) => {
          try {
            return transformBackendAlert(raw);
          } catch (e) {
            console.warn("Alert transform error, skipping:", e);
            return null;
          }
        })
        .filter(Boolean) as Alert[];
    } catch (e: any) {
      console.warn("Failed to search alerts:", e.message);
      if (
        e.code === "ERR_NETWORK" ||
        e.response?.status === 401 ||
        e.response?.status === 403
      ) {
        throw e;
      }
      throw new Error(e.response?.data?.message || "Failed to search alerts");
    }
  },

  /**
   * Update alert status
   */
  updateAlertStatus: async (
    alertId: string,
    status: string
  ): Promise<Alert> => {
    try {
      const response = await apiClient.patch<BackendAlertResponse>(
        `/api/v1/alerts/${alertId}`,
        { status }
      );
      if (!response.data) throw new Error("No data received from backend");
      return transformBackendAlert(response.data);
    } catch (error: any) {
      console.warn("Failed to update alert status:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to update alert status"
      );
    }
  },

  /**
   * Add comment to alert
   */
  addComment: async (alertId: string, comment: string): Promise<void> => {
    try {
      await apiClient.post(`/api/v1/alerts/${alertId}/comments`, { comment });
    } catch (error: any) {
      console.warn("Failed to add comment:", error.message);
      throw new Error(error.response?.data?.message || "Failed to add comment");
    }
  },
};

export const authApi = {
  login: async (credentials: any): Promise<any> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },
  getCurrentUser: async (): Promise<any> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};

export const tenantsApi = {
  listTenants: async (): Promise<any[]> => {
    const response = await apiClient.get("/api/v1/tenants");
    return response.data;
  },
  createTenant: async (data: any): Promise<any> => {
    const response = await apiClient.post("/api/v1/tenants", data);
    return response.data;
  },
  getTenant: async (tenantId: string): Promise<any> => {
    const response = await apiClient.get(`/api/v1/tenants/`, {
      params: { tenant_id: tenantId },
    });
    return response.data;
  },
  deleteTenant: async (tenantId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/tenants/`, {
      params: { tenant_id: tenantId },
    });
  },
  updateConfig: async (tenantId: string, config: any): Promise<any> => {
    const response = await apiClient.patch(
      `/api/v1/tenants/${tenantId}/config`,
      config
    );
    return response.data;
  },
};

export const providersApi = {
  list: async (tenantId?: string): Promise<any[]> => {
    // Adding tenant_id as query param to satisfy backend auth dependencies
    const response = await apiClient.get("/threat-intel/providers/tenant_id", {
      params: { tenant_id: tenantId },
    });
    return response.data;
  },
  create: async (data: any): Promise<any> => {
    const response = await apiClient.post("/threat-intel/providers", data);
    return response.data;
  },
};

export const integrationsApi = {
  listForTenant: async (tenantId: string): Promise<any[]> => {
    const response = await apiClient.get(`/tenants/${tenantId}/threat-intel/`);
    return response.data;
  },
  create: async (tenantId: string, data: any): Promise<any> => {
    const response = await apiClient.post(
      `/tenants/${tenantId}/threat-intel/`,
      data
    );
    return response.data;
  },
  update: async (
    tenantId: string,
    integrationId: string,
    data: any
  ): Promise<any> => {
    const response = await apiClient.patch(
      `/tenants/${tenantId}/threat-intel/${integrationId}`,
      data
    );
    return response.data;
  },
  delete: async (tenantId: string, integrationId: string): Promise<any> => {
    const response = await apiClient.delete(
      `/tenants/${tenantId}/threat-intel/${integrationId}`
    );
    return response.data;
  },
};

export const investigationApi = {
  /**
   * Run investigation on an IOC
   */
  investigateIOC: async (ioc: string, iocType: string): Promise<any> => {
    try {
      const response = await apiClient.post("/investigate", {
        ioc,
        ioc_type: iocType,
      });
      return response.data;
    } catch (error: any) {
      console.warn("Failed to investigate IOC:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to investigate IOC"
      );
    }
  },

  /**
   * Get investigation history
   */
  getInvestigationHistory: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get("/investigate/history");

      if (!Array.isArray(response.data)) {
        throw new Error("Invalid response format: expected array");
      }

      return response.data;
    } catch (error: any) {
      console.warn("Failed to get investigation history:", error.message);
      throw new Error(
        error.response?.data?.message || "Failed to get investigation history"
      );
    }
  },
};
