import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminTrackingEvent } from "@/types/api";

export interface AddTrackingEventPayload {
  event_code: string;
  description: string;
  location?: string;
  event_at: string;
}

export function useAddTrackingEvent(bookingId: string) {
  const qc = useQueryClient();

  return useMutation<AdminTrackingEvent, Error, AddTrackingEventPayload>({
    mutationFn: (payload) =>
      api.post<AdminTrackingEvent>(`/admin/bookings/${bookingId}/tracking-event`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings", bookingId] });
    },
  });
}
