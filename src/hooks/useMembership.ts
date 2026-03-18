import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { MembershipPlan, MembershipSubscription } from "@/types/api";

/**
 * Fetches all available membership plans (public endpoint).
 */
export function useMembershipPlans() {
  return useQuery<MembershipPlan[]>({
    queryKey: ["membership", "plans"],
    queryFn: () => api.get<MembershipPlan[]>("/membership/plans"),
    staleTime: 1000 * 60 * 10, // plans rarely change
  });
}

/**
 * Subscribes the authenticated user to a plan.
 * Requires the user to be signed in — will throw ApiError(401) if not.
 *
 * Usage:
 *   const { mutate, isPending, error } = useSubscribe();
 *   mutate({ planId: "silver" }, { onSuccess: () => navigate(...) });
 */
export function useSubscribe() {
  return useMutation<MembershipSubscription, Error, { planId: string }>({
    mutationFn: (payload) =>
      api.post<MembershipSubscription>("/membership/subscribe", payload),
  });
}
