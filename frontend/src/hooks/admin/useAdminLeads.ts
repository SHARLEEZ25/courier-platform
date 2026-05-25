import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminLead } from "@/types/api";

export function useAdminLeads() {
  return useQuery<AdminLead[]>({
    queryKey: ["admin", "leads"],
    queryFn: () => api.get<AdminLead[]>("/admin/leads"),
    staleTime: 30_000,
  });
}

export function useUpdateLeadStatus(leadId: string) {
  const qc = useQueryClient();
  return useMutation<AdminLead, Error, AdminLead["status"]>({
    mutationFn: (status) => api.patch<AdminLead>(`/admin/leads/${leadId}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "leads"] }),
  });
}
