// Backend Alert Response Types
export interface BackendAlertResponse {
  id?: number;
  triggered_time?: string;
  created_at?: string;
  severity?: string;
  tenant_id?: number;
  alert_id?: string;
  source?: string;
  triage_result?: {
    display_id?: string;
    alert: BackendAlert;
    threat_intel: BackendThreatIntel[];
    analysis: BackendAnalysis;
    raw_alert?: any;
  };
  updated_at?: string;
  // Fallback properties backwards compatibility
  display_id?: string;
  alert?: BackendAlert;
  threat_intel?: BackendThreatIntel[];
  analysis?: BackendAnalysis;
}

export interface BackendAlert {
  alert_id: string;
  source: string;
  original_timestamp: string;
  severity: string | null;
  title: string | null;
  description: string | null;
  iocs: {
    ips: string[];
    domains: string[];
    hashes: string[];
    emails: string[];
  };
  mitre: string[];
  skipped_iocs: Array<{
    ioc: string;
    type: string;
    reason: string;
  }>;
}

export interface BackendThreatIntel {
  ioc: string;
  ioc_type: string;
  malicious_count: number;
  suspicious_count: number;
  total_engines: number;
  reputation_score: number;
  categories: string[];
  last_analysis_date: string | null;
  threat_verdict: string;
  confidence: number;
}

export interface BackendAnalysis {
  verdict: string;
  confidence_score: number;
  assessed_severity: string;
  executive_summary: string;
  detailed_analysis: string;
  attack_scenario: string;
  attack_phases: string[];
  ioc_analysis: Array<{
    ioc: string;
    ioc_type: string;
    analysis: string;
    severity_contribution: string;
  }>;
  recommended_actions: Array<{
    priority: number;
    action: string;
    rationale: string;
  }>;
  mitigation_steps: string[];
  detection_gaps: string[];
  affected_assets: string[];
  business_impact: string;
  analysis_timestamp: string;
  reasoning_path: string;
  supporting_evidence?: Array<{
    indicator: string;
    reasoning: string;
    severity_contribution: string;
  }>;
  contradicting_evidence?: Array<{
    indicator: string;
    reasoning: string;
    severity_contribution: string;
  }>;
}

// FinalAnalysis type for AIReasoning component
export interface FinalAnalysis {
  verdict: string;
  confidence_score: number;
  reasoning_path: string;
  recommended_actions: Array<{
    priority: number;
    action: string;
    rationale: string;
  }>;
}

// Frontend Alert Types (transformed from backend)
export interface Alert {
  id: string; // Unique identifier (uses display_id)
  alert_id: string;
  display_id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string;
  timestamp: string;
  triggered_time?: string; // Added for compatibility
  status: 'active' | 'triaged' | 'closed';
  verdict?: 'true_positive' | 'false_positive' | 'indeterminate';
  confidence_score?: number;
  ioc_count?: number;
  threat_level?: string;
}

export interface AlertDetail extends Alert {
  raw_alert: BackendAlert;
  threat_intel: BackendThreatIntel[];
  analysis: BackendAnalysis;
  timeline?: TimelineEvent[];
  iocs?: IOC[];
  mitre_techniques?: string[]; // Changed from MitreTechnique[] to string[]
  recommendations?: Array<{
    priority: number;
    action: string;
    rationale: string;
  }>;
  affected_assets?: string[];
  final_analysis?: FinalAnalysis; // Added for AlertDetailHeader
  response_time?: number; // Added for AlertDetailHeader
  enrichment_steps?: number; // Added for AlertDetailHeader
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'detection' | 'enrichment' | 'analysis' | 'action';
  title: string;
  description: string;
  metadata?: Record<string, any>;
  status?: string; // Added for EventTimeline component
  event_type?: string; // Added for EventTimeline component
  duration?: number; // Added for EventTimeline component
  details?: string; // Added for EventTimeline component
}

export interface IOC {
  value: string;
  type: 'ip' | 'domain' | 'hash' | 'email';
  reputation_score?: number;
  malicious_count?: number;
  suspicious_count?: number;
  total_engines?: number;
  categories?: string[];
  threat_verdict?: string;
  confidence?: number;
  malicious?: boolean; // Added for API compatibility
  source?: string; // Added for API compatibility
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  description?: string;
  url?: string;
}

// Dashboard Types
export interface DashboardMetrics {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  
  active_alerts: number;
  triaged_alerts: number;
  triaged_today: number; // Added to match API response
  closed_alerts: number;
  
  true_positives: number;
  false_positives: number;
  indeterminate: number;
  
  alerts_last_24h: number;
  alerts_last_7d: number;
  
  avg_confidence: number | null;
  
  trend_24h: number;
  trend_critical: number;
  trend_triaged: number;
  
  avg_triage_time_minutes: number;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: any;
  subtitle?: string; // Added for DashboardPage
}

export interface SeverityDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface TrendData {
  date: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

// Filter Types
export interface AlertFilters {
  alert_id?: string;
  from_time?: string;
  till_time?: string;
  verdict?: string;
  source?: string;
  severity?: string;
  mitre?: string;
  skipped_iocs?: string;
}

// Investigation Types
export interface Investigation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'completed';
  messages: InvestigationMessage[];
  alert_ids: string[];
}

export interface InvestigationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'new_alert' | 'alert_update' | 'investigation_update' | 'system_message';
  payload: any;
  timestamp: string;
}

// Utility function to validate timestamp
function isValidTimestamp(timestamp: string): boolean {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

// Utility function to transform backend alert to frontend alert
export function transformBackendAlert(backendAlert: BackendAlertResponse): Alert {
  const isWrapped = !!backendAlert.triage_result;
  const targetObj = isWrapped ? backendAlert.triage_result! : backendAlert;

  // Validate input
  if (!backendAlert || !targetObj.alert || !targetObj.analysis) {
    console.error("DEBUG_ALERT:", JSON.stringify(backendAlert, null, 2));
    throw new Error('Invalid backend alert response: missing required fields');
  }

  // Map severity with comprehensive handling
  const mapSeverity = (severity: string | null, assessedSeverity: string): Alert['severity'] => {
    const severityMap: Record<string, Alert['severity']> = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
      'info': 'info'
    };
    
    // Normalize to lowercase and trim
    const normalizedAssessed = assessedSeverity?.toLowerCase()?.trim();
    const normalizedSeverity = severity?.toLowerCase()?.trim();
    
    // Try assessed severity first
    if (normalizedAssessed && severityMap[normalizedAssessed]) {
      return severityMap[normalizedAssessed];
    }
    
    // Try direct severity
    if (normalizedSeverity && severityMap[normalizedSeverity]) {
      return severityMap[normalizedSeverity];
    }
    
    // Try numeric severity (use parseFloat for decimals)
    if (severity) {
      const numSeverity = parseFloat(severity);
      if (!isNaN(numSeverity)) {
        if (numSeverity >= 80) return 'critical';
        if (numSeverity >= 60) return 'high';
        if (numSeverity >= 40) return 'medium';
        return 'low';
      }
    }
    
    // Default to medium if nothing matches
    return 'medium';
  };

  // Map verdict with validation
  const mapVerdict = (verdict: string): Alert['verdict'] => {
    if (!verdict) return 'indeterminate';
    
    const verdictMap: Record<string, Alert['verdict']> = {
      'true_positive': 'true_positive',
      'false_positive': 'false_positive',
      'indeterminate': 'indeterminate'
    };
    
    const normalized = verdict.toLowerCase().trim();
    return verdictMap[normalized] || 'indeterminate';
  };

  // Determine status based on verdict and confidence
  const determineStatus = (verdict: string, confidence: number): Alert['status'] => {
    if (verdict === 'false_positive') return 'closed';
    if (verdict === 'true_positive' && confidence > 0.7) return 'triaged';
    return 'active';
  };

  // Count IOCs with null safety
  const countIOCs = (iocs: BackendAlert['iocs'] | null | undefined): number => {
    if (!iocs) return 0;
    
    return (
      (iocs.ips?.length || 0) +
      (iocs.domains?.length || 0) +
      (iocs.hashes?.length || 0) +
      (iocs.emails?.length || 0)
    );
  };

  // Validate and use timestamp
  const timestamp = isValidTimestamp(targetObj.alert.original_timestamp)
    ? targetObj.alert.original_timestamp
    : new Date().toISOString();

  // Transform the alert
  const alert: Alert = {
    id: targetObj.display_id || backendAlert.id?.toString() || targetObj.alert.alert_id,
    alert_id: targetObj.alert.alert_id,
    display_id: targetObj.display_id || targetObj.alert.alert_id,
    description: targetObj.analysis.executive_summary || targetObj.alert.title || 'No description available',
    severity: mapSeverity(targetObj.alert.severity, targetObj.analysis.assessed_severity),
    source: backendAlert.source || targetObj.alert.source || 'Unknown',
    timestamp,
    triggered_time: backendAlert.triggered_time || timestamp,
    status: determineStatus(targetObj.analysis.verdict, targetObj.analysis.confidence_score),
    verdict: mapVerdict(targetObj.analysis.verdict),
    confidence_score: targetObj.analysis.confidence_score,
    ioc_count: countIOCs(targetObj.alert.iocs),
    threat_level: targetObj.analysis.assessed_severity || 'medium',
  };

  return alert;
}
