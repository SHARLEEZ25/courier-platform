import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminBookingDetail, BookingStatus } from "@/types/api";

export function useUpdateBookingStatus(bookingId: string) {
  const qc = useQueryClient();

  return useMutation<AdminBookingDetail, Error, BookingStatus>({
    mutationFn: (status) =>
      api.patch<AdminBookingDetail>(`/admin/bookings/${bookingId}/status`, { status }),
    onSuccess: (updated) => {
      qc.setQueryData(["admin", "bookings", bookingId], (old: AdminBookingDetail | undefined) =>
        old ? { ...old, status: updated.status } : old
      );
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}
