import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminBookingsResponse, BookingStatus } from "@/types/api";

export interface AdminBookingsFilters {
  status?: BookingStatus | "";
  carrier?: string;
  q?: string;
  from?: string;
  to?: string;
  origin?: string;
  destination?: string;
  limit?: number;
  offset?: number;
}

export function useAdminBookings(filters: AdminBookingsFilters = {}) {
  const { status, carrier, q, from, to, origin, destination, limit = 50, offset = 0 } = filters;

  const params = new URLSearchParams();
  if (status)      params.set("status",      status);
  if (carrier)     params.set("carrier",     carrier);
  if (q)           params.set("q",           q);
  if (from)        params.set("from",        from);
  if (to)          params.set("to",          to);
  if (origin)      params.set("origin",      origin);
  if (destination) params.set("destination", destination);
  params.set("limit",  String(limit));
  params.set("offset", String(offset));

  const qs = params.toString();

  return useQuery<AdminBookingsResponse>({
    queryKey: ["admin", "bookings", filters],
    queryFn: () => api.get<AdminBookingsResponse>(`/admin/bookings?${qs}`),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
