import { getEnv } from './env';

/**
 * Application-wide constants
 * Centralizes magic numbers and strings for better maintainability
 */

// Time constants (in milliseconds)
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// API configuration
export const API = {
  TIMEOUT: 180 * TIME.SECOND, // Increased to 3 minutes for slow backend responses
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1 * TIME.SECOND,
  BASE_URL: import.meta.env?.MODE === 'production' ? 'https://aisoc-backend-production.up.railway.app' : '',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5,
} as const;

// Alert severity levels
export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
} as const;

export type SeverityLevel = typeof SEVERITY[keyof typeof SEVERITY];

// Alert status
export const STATUS = {
  ACTIVE: 'active',
  TRIAGED: 'triaged',
  CLOSED: 'closed',
  PENDING: 'pending',
} as const;

export type AlertStatus = typeof STATUS[keyof typeof STATUS];

// Alert verdict
export const VERDICT = {
  TRUE_POSITIVE: 'true_positive',
  FALSE_POSITIVE: 'false_positive',
  INDETERMINATE: 'indeterminate',
} as const;

export type AlertVerdict = typeof VERDICT[keyof typeof VERDICT];

// UI constants
export const UI = {
  TOAST_DURATION: 4 * TIME.SECOND,
  TOAST_SUCCESS_DURATION: 3 * TIME.SECOND,
  TOAST_ERROR_DURATION: 5 * TIME.SECOND,
  DEBOUNCE_DELAY: 300,
  SIDEBAR_WIDTH: 256,
  SIDEBAR_COLLAPSED_WIDTH: 64,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebar_collapsed',
} as const;

// Query keys for React Query
export const QUERY_KEYS = {
  DASHBOARD_METRICS: ['dashboard', 'metrics'],
  ALERTS: ['alerts'],
  ALERT_DETAIL: (id: string) => ['alerts', id],
  USER_PROFILE: ['user', 'profile'],
} as const;

// Stale time for React Query (how long data is considered fresh)
export const STALE_TIME = {
  SHORT: 1 * TIME.MINUTE,
  MEDIUM: 5 * TIME.MINUTE,
  LONG: 10 * TIME.MINUTE,
  VERY_LONG: 30 * TIME.MINUTE,
} as const;

// Cache time for React Query (how long unused data stays in cache)
export const CACHE_TIME = {
  SHORT: 5 * TIME.MINUTE,
  MEDIUM: 10 * TIME.MINUTE,
  LONG: 30 * TIME.MINUTE,
  VERY_LONG: 60 * TIME.MINUTE,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ALERTS: '/alerts',
  ALERT_DETAIL: (id: string) => `/alerts/${id}`,
  ALERT_TRIAGE: '/alert-triage',
  ALERT_TRIAGE_DETAIL: (id: string) => `/alert-triage/${id}`,
  INVESTIGATE: '/investigate',
  SETTINGS: '/settings',
  API_TEST: '/api-test',
  LOGIN: '/login',
  NOT_FOUND: '*',
} as const;

// Environment
export const ENV = {
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  MODE: import.meta.env.MODE,
} as const;
