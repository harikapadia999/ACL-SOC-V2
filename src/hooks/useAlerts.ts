import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alertsApi } from '@/services/api';
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants';
import type { Alert, AlertDetail, AlertFilters } from '@/types';

/**
 * Hook to fetch all alerts
 */
export function useAlerts() {
  return useQuery<Alert[]>({
    queryKey: QUERY_KEYS.ALERTS,
    queryFn: alertsApi.getAllAlerts,
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Hook to fetch a single alert by ID
 */
export function useAlert(alertId: string) {
  return useQuery<AlertDetail>({
    queryKey: QUERY_KEYS.ALERT_DETAIL(alertId),
    queryFn: () => alertsApi.getAlertById(alertId),
    staleTime: STALE_TIME.MEDIUM,
    enabled: !!alertId, // Only fetch if alertId is provided
  });
}

/**
 * Hook to filter alerts using the searchAlerts API
 */
export function useFilteredAlerts(filters: AlertFilters) {
  return useQuery<Alert[]>({
    queryKey: [...QUERY_KEYS.ALERTS, 'filtered', filters],
    queryFn: () => alertsApi.searchAlerts(filters),
    staleTime: STALE_TIME.SHORT,
  });
}

/**
 * Hook to refresh alerts
 */
export function useRefreshAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALERTS });
    },
  });
}
