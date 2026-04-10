import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RateRequest, RateResult } from "@/types/api";

/**
 * Fetches carrier rates for a given shipment.
 * Auto-triggers when all required fields are present.
 * Results are cached per unique input — navigating back to the same
 * quote skips the network call.
 */
export function useRates(input: RateRequest | null) {
  return useQuery<RateResult[]>({
    queryKey: ["rates", input],
    queryFn: () => api.post<RateResult[]>("/rates/calculate", input),
    enabled: !!input && !!input.destination && input.weight > 0 && !!input.itemType,
    staleTime: 0, // always refetch — rates depend on live DB config
    retry: false,
  });
}
