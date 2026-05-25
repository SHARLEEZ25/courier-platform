import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminBookings } from "./useAdminBookings";
import { api } from "@/lib/api";

export function useOutscanQueue(carrier?: string) {
  return useAdminBookings({ status: "in_transit", carrier: carrier || undefined, limit: 100 });
}

export function useOutscanBooking(bookingId: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, { tracking_number: string }>({
    mutationFn: async ({ tracking_number }) => {
      // Assign AWB
      await api.patch(`/admin/bookings/${bookingId}/tracking-number`, { tracking_number });
      // Add OUTSCAN tracking event
      await api.post(`/admin/bookings/${bookingId}/tracking-event`, {
        event_code: "OUTSCAN",
        description: "Shipment handed to carrier for dispatch",
        event_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
