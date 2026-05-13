import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminNDRRecord } from "@/types/api";

export function useAdminNDR() {
  return useQuery<AdminNDRRecord[]>({
    queryKey: ["admin", "ndr"],
    queryFn: () => api.get<AdminNDRRecord[]>("/admin/ndr"),
    staleTime: 60_000,
  });
}

export function useAddNDRNote(ndrId: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { reason: string; note: string }>({
    mutationFn: (payload) => api.post(`/admin/ndr/${ndrId}/note`, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "ndr"] }),
  });
}
