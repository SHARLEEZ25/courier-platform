import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminBookings } from "./useAdminBookings";
import { api } from "@/lib/api";
import type { AdminBookingDetail } from "@/types/api";

export function useAdminPickups(filters: { q?: string; from?: string; to?: string } = {}) {
  return useAdminBookings({ status: "confirmed", ...filters, limit: 100 });
}

export function useMarkPickedUp(bookingId: string) {
  const qc = useQueryClient();
  return useMutation<AdminBookingDetail, Error, void>({
    mutationFn: () =>
      api.patch<AdminBookingDetail>(`/admin/bookings/${bookingId}/status`, { status: "picked_up" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
