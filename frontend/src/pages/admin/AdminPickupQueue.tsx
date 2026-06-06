import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminPickups, useMarkPickedUp } from "@/hooks/admin/useAdminPickups";
import { useAdminStaff } from "@/hooks/admin/useAdminStaff";
import { api } from "@/lib/api";
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
import { Loader2, Truck, Package, MapPin, Calendar, User, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, ms = 400): T {
  const [dv, setDv] = useState(value);
  useState(() => {
    const t = setTimeout(() => setDv(value), ms);
    return () => clearTimeout(t);
  });
  return dv;
}

function usePickupRowActions(booking: AdminBookingListItem) {
  const { toast } = useToast();
  const markPickedUp = useMarkPickedUp(booking.id);
  const { data: staffList } = useAdminStaff();
  const [assignedAgent, setAssignedAgent] = useState("");

  async function handleAssignAgent(staffId: string) {
    setAssignedAgent(staffId);
    try {
      await api.patch(`/admin/bookings/${booking.id}/assign-staff`, { staff_id: staffId });
      const name = staffList?.find((s) => s.id === staffId)?.name ?? staffId;
      toast({ title: "Agent assigned", description: `Assigned to ${name}` });
    } catch {
      toast({ title: "Assignment failed", variant: "destructive" });
    }
  }

  async function handleMarkPickedUp() {
    try {
      await markPickedUp.mutateAsync();
      toast({ title: "Marked as Picked Up", description: booking.booking_ref });
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return { staffList, assignedAgent, handleAssignAgent, handleMarkPickedUp, markPickedUp };
}

function AssignAgentSelect({
  staffList, value, onChange, className,
}: {
  staffList: ReturnType<typeof useAdminStaff>["data"];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-8 text-xs", className)}>
        <SelectValue placeholder="Assign agent…" />
      </SelectTrigger>
      <SelectContent>
        {(staffList ?? []).filter((s) => s.is_active && s.role === "pickup_agent").map((s) => (
          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function PickedUpButton({
  onClick, isPending, className,
}: { onClick: () => void; isPending: boolean; className?: string }) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      disabled={isPending}
      className={cn("bg-green-600 hover:bg-green-700 text-xs", className)}
    >
      {isPending
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <><Truck className="h-3.5 w-3.5 mr-1" />Picked Up</>}
    </Button>
  );
}

function PickupCard({ booking, onNavigate }: { booking: AdminBookingListItem; onNavigate: (id: string) => void }) {
  const { staffList, assignedAgent, handleAssignAgent, handleMarkPickedUp, markPickedUp } = usePickupRowActions(booking);
  const addr = [booking.pickup_address_1, booking.pickup_city, booking.pickup_state]
    .filter(Boolean).join(", ");

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onNavigate(booking.id)}
          className="font-mono text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
        >
          {booking.booking_ref}
          <ExternalLink className="h-3 w-3 opacity-60" />
        </button>
        <Badge variant="outline" className="text-xs uppercase shrink-0">{booking.carrier_id}</Badge>
      </div>
      <p className="text-xs text-gray-400 mt-0.5">
        {new Date(booking.created_at).toLocaleDateString("en-IN")}
      </p>

      <div className="mt-3 space-y-1.5 text-sm">
        <p className="font-medium text-gray-800">{booking.sender_company}</p>
        <p className="text-xs text-gray-400">{booking.sender_mobile}</p>
        <div className="flex items-start gap-1 text-xs text-gray-600">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-400" />
          <span>{addr} — {booking.pickup_pincode}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-700">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {booking.pickup_date} ({booking.pickup_slot})
        </div>
        <p className="text-xs text-gray-400">{booking.chargeable_weight_kg} kg</p>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <AssignAgentSelect staffList={staffList} value={assignedAgent} onChange={handleAssignAgent} className="flex-1" />
        <PickedUpButton onClick={handleMarkPickedUp} isPending={markPickedUp.isPending} className="w-full sm:w-auto" />
      </div>
    </div>
  );
}

function PickupRow({ booking, onNavigate }: { booking: AdminBookingListItem; onNavigate: (id: string) => void }) {
  const { staffList, assignedAgent, handleAssignAgent, handleMarkPickedUp, markPickedUp } = usePickupRowActions(booking);

  const addr = [booking.pickup_address_1, booking.pickup_city, booking.pickup_state]
    .filter(Boolean).join(", ");

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(booking.id)}
            className="font-mono text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            {booking.booking_ref}
            <ExternalLink className="h-3 w-3 opacity-60" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(booking.created_at).toLocaleDateString("en-IN")}
        </p>
      </td>
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-800">{booking.sender_company}</p>
        <p className="text-xs text-gray-400">{booking.sender_mobile}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-start gap-1 text-xs text-gray-600 max-w-[200px]">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gray-400" />
          <span className="truncate">{addr}</span>
        </div>
        <p className="mt-0.5 text-xs text-gray-400 pl-4">{booking.pickup_pincode}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-xs text-gray-700">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {booking.pickup_date}
        </div>
        <p className="text-xs text-gray-400 pl-4">{booking.pickup_slot}</p>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="text-xs uppercase">{booking.carrier_id}</Badge>
        <p className="mt-0.5 text-xs text-gray-400">{booking.chargeable_weight_kg} kg</p>
      </td>
      <td className="px-4 py-3 min-w-[160px]">
        <AssignAgentSelect staffList={staffList} value={assignedAgent} onChange={handleAssignAgent} />
      </td>
      <td className="px-4 py-3">
        <PickedUpButton onClick={handleMarkPickedUp} isPending={markPickedUp.isPending} />
      </td>
    </tr>
  );
}

export default function AdminPickupQueue() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isLoading, isError } = useAdminPickups({
    q: debouncedSearch || undefined,
    from: dateFrom || undefined,
  });

  const bookings = data?.bookings ?? [];

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-yellow-600" />
            Pickup Queue
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Confirmed bookings awaiting pickup by staff
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
            {data?.total ?? 0} pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search booking ref or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Pickup date from</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        {(search || dateFrom) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setDateFrom(""); }}
            className="text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      )}
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load pickup queue.
        </div>
      )}
      {!isLoading && !isError && (
        bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <Package className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-600">No pending pickups</p>
            <p className="text-xs text-gray-400">All confirmed bookings have been picked up.</p>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="space-y-3 lg:hidden">
              {bookings.map((b) => (
                <PickupCard key={b.id} booking={b} onNavigate={(id) => navigate(`/admin/bookings/${id}`)} />
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-100 bg-gray-50">
                    <tr>
                      {["Booking", "Customer", "Pickup Address", "Date / Slot", "Carrier", "Assign Agent", "Action"].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <PickupRow key={b.id} booking={b} onNavigate={(id) => navigate(`/admin/bookings/${id}`)} />
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
