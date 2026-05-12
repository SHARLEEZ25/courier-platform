import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminStaff } from "@/types/api";

export function useAdminStaff() {
  return useQuery<AdminStaff[]>({
    queryKey: ["admin", "staff"],
    queryFn: () => api.get<AdminStaff[]>("/admin/staff"),
    staleTime: 60_000,
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation<AdminStaff, Error, Partial<AdminStaff>>({
    mutationFn: (payload) => api.post<AdminStaff>("/admin/staff", payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "staff"] }),
  });
}

export function useUpdateStaff(staffId: string) {
  const qc = useQueryClient();
  return useMutation<AdminStaff, Error, Partial<AdminStaff>>({
    mutationFn: (payload) => api.patch<AdminStaff>(`/admin/staff/${staffId}`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "staff"] }),
  });
}
