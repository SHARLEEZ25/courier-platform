import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOutscanQueue, useOutscanBooking } from "@/hooks/admin/useAdminOutscan";
import type { AdminBookingListItem } from "@/types/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, SendHorizonal, CheckCircle2, Package, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const CARRIER_LABELS: Record<string, string> = {
  dhl: "DHL", fedex: "FedEx", ups: "UPS", aramex: "Aramex",
};

function useOutscanActions(booking: AdminBookingListItem, onDone: () => void) {
  const { toast } = useToast();
  const outscan = useOutscanBooking(booking.id);
  const [awb, setAwb] = useState("");

  async function handleOutscan(e: React.FormEvent) {
    e.preventDefault();
    if (!awb.trim()) return;
    try {
      await outscan.mutateAsync({ tracking_number: awb.trim() });
      toast({ title: "Outscanned", description: `${booking.booking_ref} → AWB ${awb.trim()}` });
      onDone();
    } catch (err) {
      toast({ title: "Outscan failed", description: (err as Error).message, variant: "destructive" });
    }
  }

  return { outscan, awb, setAwb, handleOutscan };
}

function OutscanForm({
  booking, awb, onAwbChange, onSubmit, isPending, className,
}: {
  booking: AdminBookingListItem;
  awb: string;
  onAwbChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  className?: string;
}) {
  return (
    <form onSubmit={onSubmit} className={cn("flex gap-2", className)}>
      <Input
        placeholder={`${CARRIER_LABELS[booking.carrier_id] ?? "Carrier"} AWB…`}
        value={awb}
        onChange={(e) => onAwbChange(e.target.value)}
        required
        className="flex-1 h-8 text-sm"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!awb.trim() || isPending}
        className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
      >
        {isPending
          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
          : <><SendHorizonal className="h-3.5 w-3.5 mr-1" />Outscan</>}
      </Button>
    </form>
  );
}

function OutscanCard({ booking, onDone }: { booking: AdminBookingListItem; onDone: () => void }) {
  const navigate = useNavigate();
  const { outscan, awb, setAwb, handleOutscan } = useOutscanActions(booking, onDone);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
          className="font-mono text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          {booking.booking_ref}
          <ExternalLink className="h-3 w-3 opacity-60" />
        </button>
        <Badge variant="outline" className="text-xs font-semibold uppercase shrink-0">
          {CARRIER_LABELS[booking.carrier_id] ?? booking.carrier_id}
        </Badge>
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
        {new Date(booking.created_at).toLocaleDateString("en-IN")}
      </p>

      <div className="mt-3 space-y-1 text-sm">
        <p className="font-medium text-gray-800">{booking.sender_company}</p>
        <p className="text-xs text-gray-400">{booking.sender_mobile}</p>
        <p className="text-gray-700">{booking.origin_country} → {booking.destination_country}</p>
        <p className="font-semibold text-gray-800">{booking.chargeable_weight_kg} kg</p>
        <p className="text-xs text-gray-400">
          Inscanned {new Date(booking.updated_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
        </p>
      </div>

      <OutscanForm
        booking={booking}
        awb={awb}
        onAwbChange={setAwb}
        onSubmit={handleOutscan}
        isPending={outscan.isPending}
        className="mt-3"
      />
    </div>
  );
}

function OutscanRow({ booking, onDone }: { booking: AdminBookingListItem; onDone: () => void }) {
  const navigate = useNavigate();
  const { outscan, awb, setAwb, handleOutscan } = useOutscanActions(booking, onDone);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <button
          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
          className="font-mono text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          {booking.booking_ref}
          <ExternalLink className="h-3 w-3 opacity-60" />
        </button>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(booking.created_at).toLocaleDateString("en-IN")}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-800">{booking.sender_company}</p>
        <p className="text-xs text-gray-400">{booking.sender_mobile}</p>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="text-xs font-semibold uppercase">
          {CARRIER_LABELS[booking.carrier_id] ?? booking.carrier_id}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm text-gray-700">
        {booking.origin_country} → {booking.destination_country}
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-800">
        {booking.chargeable_weight_kg} kg
      </td>
      <td className="px-4 py-3 text-xs text-gray-400">
        {new Date(booking.updated_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
      </td>
      <td className="px-4 py-3 min-w-[280px]">
        <OutscanForm booking={booking} awb={awb} onAwbChange={setAwb} onSubmit={handleOutscan} isPending={outscan.isPending} />
      </td>
    </tr>
  );
}

export default function AdminOutscan() {
  const [carrier, setCarrier] = useState("");
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, isError } = useOutscanQueue(carrier || undefined);

  const bookings = (data?.bookings ?? []).filter(
    (b) => !b.tracking_number && !completedIds.has(b.id)
  );

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <SendHorizonal className="h-5 w-5 text-indigo-600" />
            Outscan Queue
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Assign carrier AWB and hand off to carrier
          </p>
        </div>
        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800">
          {bookings.length} awaiting outscan
        </span>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={carrier} onValueChange={setCarrier}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All carriers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dhl">DHL</SelectItem>
            <SelectItem value="fedex">FedEx</SelectItem>
            <SelectItem value="ups">UPS</SelectItem>
          </SelectContent>
        </Select>
        {carrier && (
          <Button variant="ghost" size="sm" onClick={() => setCarrier("")} className="text-xs">
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load outscan queue.
        </div>
      )}
      {!isLoading && !isError && (
        bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">All shipments outscanned</p>
            <p className="text-xs text-gray-400">No in-transit bookings are missing an AWB.</p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="space-y-3 lg:hidden">
              {bookings.map((b) => (
                <OutscanCard
                  key={b.id}
                  booking={b}
                  onDone={() => setCompletedIds((s) => new Set(s).add(b.id))}
                />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      {["Booking", "Customer", "Carrier", "Route", "Weight", "Inscanned At", "Assign AWB"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <OutscanRow
                        key={b.id}
                        booking={b}
                        onDone={() => setCompletedIds((s) => new Set(s).add(b.id))}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
