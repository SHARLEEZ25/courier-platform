import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAssignAWB(bookingId: string) {
  const qc = useQueryClient();
  return useMutation<{ id: string; tracking_number: string | null }, Error, string>({
    mutationFn: (tracking_number) =>
      api.patch(`/admin/bookings/${bookingId}/tracking-number`, { tracking_number }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings", bookingId] });
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
