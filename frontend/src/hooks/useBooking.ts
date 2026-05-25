import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { BookingCreate, BookingResponse } from "@/types/api";

/**
 * Submits a new booking to the backend.
 * The server re-validates and recalculates the price — the client total
 * is display-only; the authoritative price comes from the response.
 *
 * Usage:
 *   const { mutate, isPending, error } = useCreateBooking();
 *   mutate(payload, { onSuccess: (booking) => navigate(...) });
 */
export function useCreateBooking() {
  return useMutation<BookingResponse, Error, BookingCreate>({
    mutationFn: (payload) => api.post<BookingResponse>("/bookings", payload),
  });
}
