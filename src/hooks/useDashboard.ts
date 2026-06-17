import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants';
import type { DashboardMetrics } from '@/types';

/**
 * Hook to fetch dashboard metrics
 */
export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: QUERY_KEYS.DASHBOARD_METRICS,
    queryFn: dashboardApi.getMetrics,
    staleTime: STALE_TIME.SHORT, // Refresh every minute
  });
}

/**
 * Hook to refresh dashboard metrics
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_METRICS });
    },
  });
}
