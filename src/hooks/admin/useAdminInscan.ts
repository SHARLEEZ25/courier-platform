import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminBookings } from "./useAdminBookings";
import { api } from "@/lib/api";

export function useInscanQueue() {
  return useAdminBookings({ status: "picked_up", limit: 100 });
}

export function useInscanBooking(bookingId: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { actual_weight_kg: number }>({
    mutationFn: (payload) =>
      api.patch(`/admin/bookings/${bookingId}/inscan`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
