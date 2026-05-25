import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminBookingDetail } from "@/types/api";

export function useAdminBookingDetail(id: string | undefined) {
  return useQuery<AdminBookingDetail>({
    queryKey: ["admin", "bookings", id],
    queryFn: () => api.get<AdminBookingDetail>(`/admin/bookings/${id}`),
    enabled: !!id,
    staleTime: 30_000,
  });
}
