import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { TrackingResponse } from "@/types/api";

/**
 * Looks up tracking events for a tracking number or booking ref.
 * Only fires when trackingId is a non-empty string.
 */
export function useTracking(trackingId: string | null) {
  return useQuery<TrackingResponse>({
    queryKey: ["tracking", trackingId],
    queryFn: () => api.get<TrackingResponse>(`/tracking/${trackingId}`),
    enabled: !!trackingId && trackingId.length >= 3,
    staleTime: 1000 * 60 * 2, // refresh every 2 min
    retry: false,
  });
}
