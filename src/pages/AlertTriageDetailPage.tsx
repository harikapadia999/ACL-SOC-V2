import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronDown,
  AlertCircle,
  Bell,
  Clock,
  CheckCircle,
  Activity,
  Loader2,
  XCircle,
} from "lucide-react";
import { alertsApi } from "@/services/api";
import { AlertDetail } from "@/types";
import toast from "react-hot-toast";

interface TimelineItem {
  id: string;
  date: string;
  time: string;
  duration: string;
  title: string;
  subtitle: string;
  badge: {
    text: string;
    color: "blue" | "amber" | "indigo" | "green";
  };
  icon: "check" | "activity" | "alert";
  expandable?: boolean;
  expanded?: boolean;
  details?: string;
}

export const AlertTriageDetailPage: React.FC = () => {
  const { alertId } = useParams<{ alertId: string }>();
  const navigate = useNavigate();

  const [alertDetail, setAlertDetail] = useState<AlertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [reasoningPathExpanded, setReasoningPathExpanded] = useState(true); // Changed to true - expanded by default

  // Fetch alert details from backend
  useEffect(() => {
    const fetchAlertDetail = async () => {
      if (!alertId) {
        setError("No alert ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`📤 Fetching alert details for: ${alertId}`);
        const detail = await alertsApi.getAlertById(alertId);
        console.log("📥 Received alert detail:", detail);
        console.log("🔍 Reasoning Path Data:", detail.analysis?.reasoning_path); // Debug log

        setAlertDetail(detail);

        // Build timeline from alert data
        const timeline = buildTimeline(detail);
        setTimelineItems(timeline);

        console.log("✅ Alert detail loaded successfully");
      } catch (err: any) {
        if ((err?.response?.status === 401 || err?.response?.status === 403) || err.code === "ERR_NETWORK" || err.message === "Network Error") return;
        console.warn("❌ Failed to fetch alert detail:", err.message);
        setError("Unable to load alert details currently. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlertDetail();
  }, [alertId]);

  // Build timeline from alert detail
  const buildTimeline = (detail: AlertDetail): TimelineItem[] => {
    const timeline: TimelineItem[] = [];
    const alertTime = new Date(detail.timestamp);

    // 1. Alert Received
    timeline.push({
      id: "1",
      date: alertTime.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      time: alertTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      duration: "0ms",
      title: "Alert received",
      subtitle: detail.source || "SIEM Integration",
      badge: { text: "Detection", color: "blue" },
      icon: "check",
    });

    // 2. IOC Extraction (if IOCs exist or skipped_iocs exist)
    if (
      detail.raw_alert &&
      (detail.raw_alert.iocs || detail.raw_alert.skipped_iocs)
    ) {
      const extractionTime = new Date(alertTime.getTime() + 500);

      // Build detailed IOC information
      let iocDetails = "";

      // Add extracted IOCs
      if (detail.raw_alert.iocs) {
        const {
          ips = [],
          domains = [],
          hashes = [],
          emails = [],
        } = detail.raw_alert.iocs;
        const totalExtracted =
          ips.length + domains.length + hashes.length + emails.length;

        if (totalExtracted > 0) {
          iocDetails += "📋 Extracted IOCs:\n\n";

          if (ips.length > 0) {
            iocDetails += `🌐 IP Addresses (${ips.length}):\n`;
            ips.forEach((ip) => (iocDetails += `  • ${ip}\n`));
            iocDetails += "\n";
          }

          if (domains.length > 0) {
            iocDetails += `🔗 Domains (${domains.length}):\n`;
            domains.forEach((domain) => (iocDetails += `  • ${domain}\n`));
            iocDetails += "\n";
          }

          if (hashes.length > 0) {
            iocDetails += `#️⃣ Hashes (${hashes.length}):\n`;
            hashes.forEach((hash) => (iocDetails += `  • ${hash}\n`));
            iocDetails += "\n";
          }

          if (emails.length > 0) {
            iocDetails += `📧 Emails (${emails.length}):\n`;
            emails.forEach((email) => (iocDetails += `  • ${email}\n`));
            iocDetails += "\n";
          }
        }
      }

      // Add skipped IOCs
      if (
        detail.raw_alert.skipped_iocs &&
        detail.raw_alert.skipped_iocs.length > 0
      ) {
        iocDetails += `⚠️ Skipped IOCs (${detail.raw_alert.skipped_iocs.length}):\n\n`;
        detail.raw_alert.skipped_iocs.forEach((skipped) => {
          iocDetails += `  • ${skipped.ioc} (${skipped.type})\n`;
          iocDetails += `    Reason: ${skipped.reason}\n\n`;
        });
      }

      // Calculate total IOCs
      const totalIocs = detail.ioc_count || 0;
      const skippedCount = detail.raw_alert.skipped_iocs?.length || 0;

      timeline.push({
        id: "2",
        date: extractionTime.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        time: extractionTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        duration: "942ms",
        title: "IOC Extraction",
        subtitle: `${totalIocs} IOCs extracted${
          skippedCount > 0 ? `, ${skippedCount} skipped` : ""
        }`,
        badge: { text: "Extraction", color: "amber" },
        icon: "activity",
        expandable: true,
        expanded: false,
        details: iocDetails.trim() || "No IOC details available",
      });
    }

    // 3. Threat Enrichment
    if (detail.threat_intel && detail.threat_intel.length > 0) {
      const threatTime = new Date(alertTime.getTime() + 1500);
      const maliciousCount = detail.threat_intel.filter(
        (ti) => ti.threat_verdict === "malicious"
      ).length;
      const suspiciousCount = detail.threat_intel.filter(
        (ti) => ti.threat_verdict === "suspicious"
      ).length;

      // Build detailed threat intelligence information
      let threatDetails = "";

      // Group by verdict
      const maliciousIOCs = detail.threat_intel.filter(
        (ti) => ti.threat_verdict === "malicious"
      );
      const suspiciousIOCs = detail.threat_intel.filter(
        (ti) => ti.threat_verdict === "suspicious"
      );
      const cleanIOCs = detail.threat_intel.filter(
        (ti) => ti.threat_verdict === "clean"
      );

      // Malicious IOCs
      if (maliciousIOCs.length > 0) {
        threatDetails += `🚨 Malicious IOCs (${maliciousIOCs.length}):\n\n`;
        maliciousIOCs.forEach((ti) => {
          threatDetails += `  • ${ti.ioc} (${ti.ioc_type})\n`;
          threatDetails += `    Verdict: ${ti.threat_verdict?.toUpperCase() || 'UNKNOWN'}\n`;
          threatDetails += `    Confidence: ${ti.confidence}%\n`;
          threatDetails += `    Reputation Score: ${ti.reputation_score}\n`;
          threatDetails += `    Detection: ${ti.malicious_count}/${ti.total_engines} engines flagged as malicious\n`;
          if (ti.categories && ti.categories.length > 0) {
            threatDetails += `    Categories: ${ti.categories.join(", ")}\n`;
          }
          if (ti.last_analysis_date) {
            threatDetails += `    Last Analysis: ${new Date(
              ti.last_analysis_date
            ).toLocaleString()}\n`;
          }
          threatDetails += "\n";
        });
      }

      // Suspicious IOCs
      if (suspiciousIOCs.length > 0) {
        threatDetails += `⚠️ Suspicious IOCs (${suspiciousIOCs.length}):\n\n`;
        suspiciousIOCs.forEach((ti) => {
          threatDetails += `  • ${ti.ioc} (${ti.ioc_type})\n`;
          threatDetails += `    Verdict: ${ti.threat_verdict?.toUpperCase() || 'UNKNOWN'}\n`;
          threatDetails += `    Confidence: ${ti.confidence}%\n`;
          threatDetails += `    Reputation Score: ${ti.reputation_score}\n`;
          threatDetails += `    Detection: ${ti.suspicious_count}/${ti.total_engines} engines flagged as suspicious\n`;
          if (ti.categories && ti.categories.length > 0) {
            threatDetails += `    Categories: ${ti.categories.join(", ")}\n`;
          }
          if (ti.last_analysis_date) {
            threatDetails += `    Last Analysis: ${new Date(
              ti.last_analysis_date
            ).toLocaleString()}\n`;
          }
          threatDetails += "\n";
        });
      }

      // Clean IOCs
      if (cleanIOCs.length > 0) {
        threatDetails += `✅ Clean IOCs (${cleanIOCs.length}):\n\n`;
        cleanIOCs.forEach((ti) => {
          threatDetails += `  • ${ti.ioc} (${ti.ioc_type})\n`;
          threatDetails += `    Verdict: ${ti.threat_verdict?.toUpperCase() || 'UNKNOWN'}\n`;
          threatDetails += `    Confidence: ${ti.confidence}%\n`;
          threatDetails += `    Reputation Score: ${ti.reputation_score}\n`;
          if (ti.last_analysis_date) {
            threatDetails += `    Last Analysis: ${new Date(
              ti.last_analysis_date
            ).toLocaleString()}\n`;
          }
          threatDetails += "\n";
        });
      }

      timeline.push({
        id: "3",
        date: threatTime.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        }),
        time: threatTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        duration: "1.2s",
        title: "Threat Enrichment",
        subtitle: `${maliciousCount} malicious, ${suspiciousCount} suspicious indicators found`,
        badge: { text: "Enrichment", color: "indigo" },
        icon: maliciousCount > 0 ? "alert" : "check",
        expandable: true,
        expanded: false,
        details:
          threatDetails.trim() || "No threat intelligence data available",
      });
    }

    // 4. AI Analysis
    const analysisTime = new Date(
      detail.analysis.analysis_timestamp || alertTime.getTime() + 2000
    );

    // Build comprehensive AI Analysis details
    let analysisDetails = "";

    // Analysis Timestamp
    analysisDetails += `🕐 Analysis Timestamp:\n`;
    analysisDetails += `  ${new Date(
      detail.analysis.analysis_timestamp
    ).toLocaleString()}\n\n`;

    // Verdict and Confidence
    analysisDetails += `⚖️ Verdict: ${detail.analysis?.verdict?.toUpperCase() || 'UNKNOWN'}\n`;
    analysisDetails += `📊 Confidence Score: ${(
      (detail.analysis?.confidence_score || 0) * 100
    ).toFixed(0)}%\n`;
    analysisDetails += `🎯 Assessed Severity: ${detail.analysis?.assessed_severity?.toUpperCase() || 'UNKNOWN'}\n\n`;

    // Executive Summary
    analysisDetails += `📝 Executive Summary:\n`;
    analysisDetails += `${detail.analysis.executive_summary}\n\n`;

    // Supporting Evidence - FIXED: Access object fields
    if (
      detail.analysis.supporting_evidence &&
      detail.analysis.supporting_evidence.length > 0
    ) {
      analysisDetails += `✅ Supporting Evidence (${detail.analysis.supporting_evidence.length}):\n\n`;
      detail.analysis.supporting_evidence.forEach((evidence, index) => {
        analysisDetails += `  ${index + 1}. Indicator: ${evidence.indicator}\n`;
        analysisDetails += `     Reasoning: ${evidence.reasoning}\n`;
        analysisDetails += `     Severity Contribution: ${evidence.severity_contribution}\n\n`;
      });
    }

    // Contradicting Evidence - FIXED: Access object fields
    if (
      detail.analysis.contradicting_evidence &&
      detail.analysis.contradicting_evidence.length > 0
    ) {
      analysisDetails += `❌ Contradicting Evidence (${detail.analysis.contradicting_evidence.length}):\n\n`;
      detail.analysis.contradicting_evidence.forEach((evidence, index) => {
        analysisDetails += `  ${index + 1}. Indicator: ${evidence.indicator}\n`;
        analysisDetails += `     Reasoning: ${evidence.reasoning}\n`;
        analysisDetails += `     Severity Contribution: ${evidence.severity_contribution}\n\n`;
      });
    }

    // Attack Scenario
    if (detail.analysis.attack_scenario) {
      analysisDetails += `🎭 Attack Scenario:\n`;
      analysisDetails += `${detail.analysis.attack_scenario}\n\n`;
    }

    // Attack Phases
    if (
      detail.analysis.attack_phases &&
      detail.analysis.attack_phases.length > 0
    ) {
      analysisDetails += `📍 Attack Phases:\n`;
      detail.analysis.attack_phases.forEach((phase, index) => {
        analysisDetails += `  ${index + 1}. ${phase}\n`;
      });
      analysisDetails += "\n";
    }

    // Business Impact
    if (detail.analysis.business_impact) {
      analysisDetails += `💼 Business Impact:\n`;
      analysisDetails += `${detail.analysis.business_impact}\n\n`;
    }

    // Affected Assets
    if (
      detail.analysis.affected_assets &&
      detail.analysis.affected_assets.length > 0
    ) {
      analysisDetails += `🖥️ Affected Assets (${detail.analysis.affected_assets.length}):\n`;
      detail.analysis.affected_assets.forEach((asset, index) => {
        analysisDetails += `  ${index + 1}. ${asset}\n`;
      });
      analysisDetails += "\n";
    }

    timeline.push({
      id: "4",
      date: analysisTime.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      time: analysisTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      duration: "2.5s",
      title: "AI Analysis Complete",
      subtitle: `Verdict: ${detail.verdict || "Unknown"} (${(
        detail.analysis.confidence_score * 100
      ).toFixed(0)}% confidence)`,
      badge: { text: "AI Analysis", color: "green" },
      icon: "check",
      expandable: true,
      expanded: false,
      details: analysisDetails.trim() || "No analysis details available",
    });

    return timeline;
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "amber":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "indigo":
        return "bg-indigo-100 text-indigo-900 border-indigo-200";
      case "green":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "check":
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case "activity":
        return <Activity className="w-5 h-5 text-blue-500" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "P1 Critical";
      case "high":
        return "P2 High";
      case "medium":
        return "P3 Medium";
      case "low":
        return "P4 Low";
      default:
        return "P3 Medium";
    }
  };

  const getDecisionText = (verdict?: string, severity?: string) => {
    if (
      verdict === "true_positive" &&
      (severity === "critical" || severity === "high")
    ) {
      return "Escalated to CSRIT Team";
    } else if (verdict === "true_positive") {
      return "Under Investigation";
    } else if (verdict === "false_positive") {
      return "Resolved - False Positive";
    }
    return "Pending Review";
  };

  // Helper function to format confidence score as percentage
  const formatConfidenceScore = (score?: number): string => {
    if (score === undefined || score === null) return "N/A";

    // Handle both formats: 0-1 (decimal) and 0-100 (percentage)
    const percentage = score <= 1 ? score * 100 : score;
    return `${percentage.toFixed(0)}%`;
  };

  const toggleExpand = (id: string) => {
    setTimelineItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, expanded: !item.expanded } : item
      )
    );
  };

  // Loading State
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate("/alert-triage")}
            className="flex gap-2 items-center transition-colors text-slate-600 hover:text-primary-600"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        <div className="flex flex-col justify-center items-center p-12 card">
          <Loader2 className="mb-4 w-8 h-8 animate-spin text-primary-600" />
          <p className="text-slate-600">Loading alert details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !alertDetail) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate("/alert-triage")}
            className="flex gap-2 items-center transition-colors text-slate-600 hover:text-primary-600"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        <div className="flex flex-col justify-center items-center p-12 card">
          <XCircle className="mb-4 w-12 h-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-slate-900">
            Failed to Load Alert
          </h3>
          <p className="mb-4 text-center text-slate-600">
            {error || "Alert not found"}
          </p>
          <button
            onClick={() => navigate("/alert-triage")}
            className="btn btn-primary"
          >
            Back to Alert Triage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => navigate("/alert-triage")}
            className="flex gap-2 items-center mb-4 transition-colors text-slate-600 hover:text-primary-600"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Alert Triage</h1>
          <p className="mt-2 text-slate-600">
            AI Powered alert analysis and decision reasoning
          </p>
        </div>

        {/* Alert ID Display */}
        <div className="px-4 py-2 bg-white rounded-lg border border-slate-200">
          <span className="font-mono text-sm font-medium text-slate-900">
            {alertDetail.display_id}
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Alert ID Card */}
        <div className="card">
          <h3 className="mb-3 text-xs font-medium tracking-wider uppercase text-slate-600">
            Alert ID
          </h3>
          <div className="flex gap-3 items-center">
            <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-blue-100 rounded-full">
              <Bell className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-mono text-xl font-semibold text-slate-900">
                {alertDetail.display_id}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {new Date(alertDetail.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        {/* Verdict Card */}
        <div className="card">
          <h3 className="mb-3 text-xs font-medium tracking-wider uppercase text-slate-600">
            Verdict
          </h3>
          <div className="flex gap-3 items-center">
            <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-red-100 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight text-slate-900">
                {getDecisionText(alertDetail.verdict, alertDetail.severity)}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Priority {getSeverityLabel(alertDetail.severity)}
              </p>
            </div>
          </div>
        </div>

        {/* Confidence Score Card */}
        <div className="card">
          <h3 className="mb-3 text-xs font-medium tracking-wider uppercase text-slate-600">
            Confidence Score
          </h3>
          <div className="flex gap-3 items-center">
            <div className="flex flex-shrink-0 justify-center items-center w-10 h-10 bg-purple-100 rounded-full">
              <Clock className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">
                {formatConfidenceScore(alertDetail.analysis.confidence_score)}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {alertDetail.ioc_count || 0} IOCs analyzed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="card">
        <h2 className="mb-2 text-lg font-semibold text-slate-900">
          Enrichment Timeline
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Step-by-step analysis and enrichment process
        </p>

        {/* Timeline */}
        <div className="space-y-6">
          {timelineItems.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Vertical Line */}
              {index < timelineItems.length - 1 && (
                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
              )}

              {/* Timeline Item */}
              <div className="flex gap-4">
                {/* Icon */}
                <div className="flex z-10 flex-shrink-0 justify-center items-center w-10 h-10 bg-white rounded-full border-2 border-slate-200">
                  {getIcon(item.icon)}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-3 items-center text-xs text-slate-600">
                      <span className="font-medium">{item.date}</span>
                      <span>{item.time}</span>
                      <span>{item.duration}</span>
                    </div>
                    {item.expandable && (
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="transition-colors text-slate-400 hover:text-slate-600"
                      >
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            item.expanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="mb-1 text-base font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="mb-2 text-sm text-slate-600">{item.subtitle}</p>

                  {/* Badge */}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getBadgeColor(
                      item.badge.color
                    )}`}
                  >
                    {item.badge.text}
                  </span>

                  {/* Expanded Content */}
                  {item.expandable && item.expanded && item.details && (
                    <div className="p-4 mt-4 rounded-lg border bg-slate-50 border-slate-200">
                      <p className="text-sm whitespace-pre-wrap text-slate-700">
                        {item.details}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Reasoning Section */}
      <div className="p-5 rounded-lg border border-l-4 bg-slate-50 border-slate-200 border-l-primary-500">
        <h3 className="mb-4 text-base font-semibold text-slate-900">
          AI Reasoning
        </h3>

        {/* Verdict */}
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-slate-600">Verdict:</p>
          <div className="inline-flex gap-2 items-center px-3 py-2 bg-red-100 rounded-md border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-semibold text-red-900">
              {getDecisionText(alertDetail.verdict, alertDetail.severity)}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-slate-600">
            Executive Summary:
          </p>
          <p className="text-sm text-slate-900">
            {alertDetail.analysis.executive_summary}
          </p>
        </div>

        {/* Detailed Analysis */}
        {alertDetail.analysis.detailed_analysis && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-slate-600">
              Detailed Analysis:
            </p>
            <p className="text-sm whitespace-pre-wrap text-slate-900">
              {alertDetail.analysis.detailed_analysis}
            </p>
          </div>
        )}

        {/* Recommended Actions */}
        {alertDetail.recommendations &&
          alertDetail.recommendations.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-600">
                Recommended Actions:
              </p>
              <ol className="space-y-2 text-sm list-decimal list-inside text-slate-900">
                {alertDetail.recommendations.map((rec, index) => (
                  <li key={index}>
                    <span className="font-medium">{rec.action}</span>
                    {rec.rationale && (
                      <p className="mt-1 ml-6 text-slate-600">
                        {rec.rationale}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

        {/* Mitigation Steps */}
        {alertDetail.analysis.mitigation_steps &&
          alertDetail.analysis.mitigation_steps.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-600">
                Mitigation Steps:
              </p>
              <ol className="space-y-2 text-sm list-decimal list-inside text-slate-900">
                {alertDetail.analysis.mitigation_steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

        {/* Detection Gaps */}
        {alertDetail.analysis.detection_gaps &&
          alertDetail.analysis.detection_gaps.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-600">
                Detection Gaps:
              </p>
              <ul className="space-y-1 text-sm list-disc list-inside text-slate-900">
                {alertDetail.analysis.detection_gaps.map((gap, index) => (
                  <li key={index}>{gap}</li>
                ))}
              </ul>
            </div>
          )}

        {/* Affected Assets */}
        {alertDetail.analysis.affected_assets &&
          alertDetail.analysis.affected_assets.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-600">
                Affected Assets:
              </p>
              <ul className="space-y-1 text-sm list-disc list-inside text-slate-900">
                {alertDetail.analysis.affected_assets.map((asset, index) => (
                  <li key={index}>{asset}</li>
                ))}
              </ul>
            </div>
          )}

        {/* Business Impact */}
        {alertDetail.analysis.business_impact && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-slate-600">
              Business Impact:
            </p>
            <p className="text-sm text-slate-900">
              {alertDetail.analysis.business_impact}
            </p>
          </div>
        )}

        {/* Reasoning Path - Now expanded by default */}
        {alertDetail.analysis.reasoning_path && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium text-slate-600">
                Reasoning Path:
              </p>
              <button
                onClick={() => setReasoningPathExpanded(!reasoningPathExpanded)}
                className="transition-colors text-slate-400 hover:text-slate-600"
              >
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    reasoningPathExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
            {reasoningPathExpanded && (
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <p className="text-sm whitespace-pre-wrap text-slate-700">
                  {alertDetail.analysis.reasoning_path}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
