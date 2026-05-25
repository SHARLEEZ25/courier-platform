import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminRemarketingRecord } from "@/types/api";

export function useAdminRemarketing() {
  return useQuery<AdminRemarketingRecord[]>({
    queryKey: ["admin", "remarketing"],
    queryFn: () => api.get<AdminRemarketingRecord[]>("/admin/remarketing/eligible"),
    staleTime: 60_000,
  });
}

export function useSendRemarketingEmails() {
  const qc = useQueryClient();
  return useMutation<{ queued: number }, Error, string[]>({
    mutationFn: (booking_ids) => api.post<{ queued: number }>("/admin/remarketing/send", { booking_ids }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "remarketing"] }),
  });
}
