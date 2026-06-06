import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminBookings, type AdminBookingsFilters } from "@/hooks/admin/useAdminBookings";
import { useDebounce } from "@/hooks/useDebounce";
import type { BookingStatus, AdminBookingListItem } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  picked_up:  "Picked Up",
  in_transit: "In Transit",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

const STATUS_COLOURS: Record<BookingStatus, string> = {
  pending:    "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed:  "bg-blue-100 text-blue-800 border-blue-200",
  picked_up:  "bg-purple-100 text-purple-800 border-purple-200",
  in_transit: "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered:  "bg-green-100 text-green-800 border-green-200",
  cancelled:  "bg-red-100 text-red-800 border-red-200",
};

const PAGE_SIZE = 50;

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_COLOURS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function AdminBookings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initialise status from URL search param (set by dashboard alert links)
  const [rawQ, setRawQ]             = useState("");
  const [status, setStatus]         = useState<BookingStatus | "all">(
    (searchParams.get("status") as BookingStatus) ?? "all"
  );
  const [carrier, setCarrier]       = useState("all");
  const [from, setFrom]             = useState("");
  const [to, setTo]                 = useState("");
  const [rawOrigin, setRawOrigin]   = useState("");
  const [rawDest, setRawDest]       = useState("");
  const [offset, setOffset]         = useState(0);

  const q           = useDebounce(rawQ,      400);
  const origin      = useDebounce(rawOrigin, 400);
  const destination = useDebounce(rawDest,   400);

  const filters: AdminBookingsFilters = {
    status:      status  === "all" ? "" : status,
    carrier:     carrier === "all" ? "" : carrier,
    q, from, to, origin, destination,
    limit: PAGE_SIZE, offset,
  };
  const { data, isLoading, isError, error } = useAdminBookings(filters);

  const bookings = data?.bookings ?? [];
  const total    = data?.total    ?? 0;
  const page     = Math.floor(offset / PAGE_SIZE) + 1;
  const pages    = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function resetOffset() { setOffset(0); }

  const hasFilters = rawQ || status !== "all" || carrier !== "all" || from || to || rawOrigin || rawDest;

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Bookings</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {total > 0 ? `${total} total` : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Booking ref or tracking no."
            value={rawQ}
            onChange={(e) => { setRawQ(e.target.value); resetOffset(); }}
            className="h-9 w-full pl-8 text-sm sm:h-8 sm:w-56"
          />
        </div>

        {/* Status */}
        <Select value={status} onValueChange={(v) => { setStatus(v as BookingStatus | "all"); resetOffset(); }}>
          <SelectTrigger className="h-9 flex-1 min-w-[8.5rem] text-sm sm:h-8 sm:flex-none sm:w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Carrier */}
        <Select value={carrier} onValueChange={(v) => { setCarrier(v); resetOffset(); }}>
          <SelectTrigger className="h-9 flex-1 min-w-[7rem] text-sm sm:h-8 sm:flex-none sm:w-28">
            <SelectValue placeholder="All carriers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All carriers</SelectItem>
            <SelectItem value="dhl">DHL</SelectItem>
            <SelectItem value="fedex">FedEx</SelectItem>
            <SelectItem value="ups">UPS</SelectItem>
          </SelectContent>
        </Select>

        {/* Date range */}
        <Input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); resetOffset(); }}
          className="h-9 flex-1 min-w-[8.5rem] text-sm sm:h-8 sm:flex-none sm:w-36"
          title="From date"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); resetOffset(); }}
          className="h-9 flex-1 min-w-[8.5rem] text-sm sm:h-8 sm:flex-none sm:w-36"
          title="To date"
        />

        {/* Route filters */}
        <Input
          placeholder="Origin country"
          value={rawOrigin}
          onChange={(e) => { setRawOrigin(e.target.value); resetOffset(); }}
          className="h-9 flex-1 min-w-[8rem] text-sm sm:h-8 sm:flex-none sm:w-32"
        />
        <Input
          placeholder="Destination"
          value={rawDest}
          onChange={(e) => { setRawDest(e.target.value); resetOffset(); }}
          className="h-9 flex-1 min-w-[8rem] text-sm sm:h-8 sm:flex-none sm:w-32"
        />

        {/* Clear */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 text-xs sm:h-8"
            onClick={() => {
              setRawQ(""); setStatus("all"); setCarrier("all");
              setFrom(""); setTo(""); setRawOrigin(""); setRawDest("");
              resetOffset();
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 py-20 text-center text-sm text-red-500">
          {(error as Error)?.message ?? "Failed to load bookings"}
        </div>
      )}

      {!isLoading && !isError && bookings.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white py-20 text-center text-sm text-gray-400">
          No bookings found
        </div>
      )}

      {!isLoading && !isError && bookings.length > 0 && (
        <>
          {/* Mobile card list */}
          <div className="space-y-3 lg:hidden">
            {bookings.map((b: AdminBookingListItem) => (
              <button
                key={b.id}
                onClick={() => navigate(`/admin/bookings/${b.id}`)}
                className="block w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-blue-50/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-sm font-semibold text-blue-700">{b.booking_ref}</p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(b.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400">Customer</span>
                    <p className="font-medium text-gray-900">{b.sender_company || b.sender_mobile}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400">Route</span>
                    <p className="text-gray-700">{b.origin_country} → {b.destination_country}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Carrier</span>
                    <p className="uppercase text-gray-700">{b.carrier_id}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Weight</span>
                    <p className="text-gray-700">{b.chargeable_weight_kg} kg</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Total</span>
                    <p className="font-semibold text-gray-900">₹{b.total_inr.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Payment</span>
                    <p>
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
                        Unpaid
                      </span>
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Booking Ref</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Carrier</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3 text-right">Weight</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3">Payment</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b: AdminBookingListItem) => (
                    <tr
                      key={b.id}
                      onClick={() => navigate(`/admin/bookings/${b.id}`)}
                      className="cursor-pointer transition-colors hover:bg-blue-50/50"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium text-blue-700">
                        {b.booking_ref}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(b.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {b.sender_company || b.sender_mobile}
                      </td>
                      <td className="px-4 py-3 uppercase text-gray-600">{b.carrier_id}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {b.origin_country} → {b.destination_country}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {b.chargeable_weight_kg} kg
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ₹{b.total_inr.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          Unpaid
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {pages}</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
