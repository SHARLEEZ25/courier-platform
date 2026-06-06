import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdminBookingDetail } from "@/hooks/admin/useAdminBookingDetail";
import { useUpdateBookingStatus } from "@/hooks/admin/useUpdateBookingStatus";
import { useAddTrackingEvent } from "@/hooks/admin/useAddTrackingEvent";
import { useAssignAWB } from "@/hooks/admin/useAssignAWB";
import { useAdminStaff } from "@/hooks/admin/useAdminStaff";
import { api } from "@/lib/api";
import type { BookingStatus, AdminTrackingEvent } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, MapPin, Clock, AlertTriangle, CheckCircle2, ScanLine, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_ORDER: Record<BookingStatus, number> = {
  pending: 0, confirmed: 1, picked_up: 2, in_transit: 3, delivered: 4, cancelled: 99,
};

const ALL_STATUSES: BookingStatus[] = [
  "pending", "confirmed", "picked_up", "in_transit", "delivered", "cancelled",
];

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

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_COLOURS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-2 py-1.5">
      <span className="w-36 shrink-0 text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

function PriceRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  if (value === 0) return null;
  return (
    <div className={cn("flex justify-between py-1 text-sm", highlight && "font-semibold")}>
      <span className={highlight ? "text-gray-900" : "text-gray-500"}>{label}</span>
      <span className={highlight ? "text-gray-900" : "text-gray-700"}>₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}

export default function AdminBookingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: booking, isLoading, isError } = useAdminBookingDetail(id);
  const updateStatus = useUpdateBookingStatus(id!);
  const addEvent     = useAddTrackingEvent(id!);
  const assignAWB    = useAssignAWB(id!);
  const { data: staffList } = useAdminStaff();

  const [newStatus, setNewStatus]         = useState<BookingStatus | "">("");
  const [eventCode, setEventCode]         = useState("");
  const [eventDesc, setEventDesc]         = useState("");
  const [eventLoc, setEventLoc]           = useState("");
  const [eventAt, setEventAt]             = useState(new Date().toISOString().slice(0, 16));
  const [awbInput, setAwbInput]           = useState("");
  const [inscanWeight, setInscanWeight]   = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="p-6 text-center text-sm text-red-500">
        Booking not found.{" "}
        <button onClick={() => navigate("/admin/bookings")} className="underline">
          Back to list
        </button>
      </div>
    );
  }

  // Next valid statuses: forward only + cancelled always allowed
  const currentOrder = STATUS_ORDER[booking.status];
  const allowedStatuses = ALL_STATUSES.filter((s) =>
    s === "cancelled" ? booking.status !== "cancelled" && booking.status !== "delivered"
    : STATUS_ORDER[s] > currentOrder
  );

  async function handleStatusUpdate() {
    if (!newStatus) return;
    try {
      await updateStatus.mutateAsync(newStatus);
      toast({ title: "Status updated", description: `Booking is now ${STATUS_LABELS[newStatus]}.` });
      setNewStatus("");
    } catch (e) {
      toast({ title: "Failed to update status", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addEvent.mutateAsync({
        event_code:  eventCode.trim(),
        description: eventDesc.trim(),
        location:    eventLoc.trim() || undefined,
        event_at:    new Date(eventAt).toISOString(),
      });
      toast({ title: "Tracking event added" });
      setEventCode(""); setEventDesc(""); setEventLoc("");
      setEventAt(new Date().toISOString().slice(0, 16));
    } catch (e) {
      toast({ title: "Failed to add event", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function handleAssignAWB(e: React.FormEvent) {
    e.preventDefault();
    if (!awbInput.trim()) return;
    try {
      await assignAWB.mutateAsync(awbInput.trim());
      toast({ title: "AWB assigned", description: `Tracking number set to ${awbInput.trim()}` });
      setAwbInput("");
    } catch (e) {
      toast({ title: "Failed to assign AWB", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function handleInscan(e: React.FormEvent) {
    e.preventDefault();
    const kg = parseFloat(inscanWeight);
    if (!kg || kg <= 0) return;
    try {
      await api.patch(`/admin/bookings/${id}/inscan`, { actual_weight_kg: kg });
      toast({ title: "Inscan confirmed", description: `Actual weight: ${kg} kg. Status advanced to In Transit.` });
      setInscanWeight("");
      updateStatus.mutate("in_transit");
    } catch (e) {
      toast({ title: "Inscan failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function handleAssignStaff(staffId: string) {
    if (!staffId) return;
    try {
      await api.patch(`/admin/bookings/${id}/assign-staff`, { staff_id: staffId });
      setAssignedStaff(staffId);
      const name = staffList?.find((s) => s.id === staffId)?.name ?? staffId;
      toast({ title: "Staff assigned", description: `Assigned to ${name}` });
    } catch (e) {
      toast({ title: "Failed to assign staff", description: (e as Error).message, variant: "destructive" });
    }
  }

  const bookedKg = booking?.actual_weight_kg ?? 0;
  const actualKg = parseFloat(inscanWeight) || 0;
  const weightDiffPct = bookedKg > 0 && actualKg > 0 ? Math.abs(actualKg - bookedKg) / bookedKg * 100 : 0;
  const weightMismatchLevel = weightDiffPct > 20 ? "error" : weightDiffPct > 10 ? "warn" : actualKg > 0 ? "ok" : "none";

  return (
    <div className="p-4 sm:p-6">
      {/* Back + Header */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/bookings")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="font-mono text-base font-semibold text-gray-900">{booking.booking_ref}</h1>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Left column: booking info ── */}
        <div className="space-y-4">

          {/* Shipment summary */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Shipment</h2>
            <InfoRow label="Carrier"      value={booking.carrier_id.toUpperCase()} />
            <InfoRow label="Route"        value={`${booking.origin_country} → ${booking.destination_country}`} />
            <InfoRow label="Actual weight"      value={`${booking.actual_weight_kg} kg`} />
            {booking.volumetric_weight_kg && (
              <InfoRow label="Volumetric weight" value={`${booking.volumetric_weight_kg} kg`} />
            )}
            <InfoRow label="Chargeable weight" value={`${booking.chargeable_weight_kg} kg`} />
            <InfoRow label="Pieces"       value={booking.num_pieces} />
            <InfoRow label="Contents"     value={booking.contents_desc} />
            <InfoRow label="Item type"    value={booking.item_type_id} />
            <InfoRow label="Tracking no." value={booking.tracking_number} />
            {booking.carrier_id === "dhl" && booking.dhl_service !== "standard" && (
              <InfoRow label="DHL service"  value={booking.dhl_service} />
            )}
            {booking.carrier_id === "fedex" && (
              <InfoRow label="FedEx service" value={booking.fedex_service} />
            )}
          </div>

          {/* Sender */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Sender</h2>
            <InfoRow label="Company"   value={booking.sender_company} />
            <InfoRow label="Mobile"    value={booking.sender_mobile} />
            <InfoRow label="Telephone" value={booking.sender_telephone} />
            <InfoRow label="Email"     value={booking.sender_email} />
            <InfoRow label="KYC"       value={booking.sender_kyc} />
            <InfoRow label="Pincode"   value={booking.pickup_pincode} />
            <InfoRow label="Address"   value={[booking.pickup_address_1, booking.pickup_address_2].filter(Boolean).join(", ")} />
            <InfoRow label="City"      value={`${booking.pickup_city}, ${booking.pickup_state}`} />
            <InfoRow label="Pickup date" value={`${booking.pickup_date} (${booking.pickup_slot})`} />
          </div>

          {/* Receiver */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Receiver</h2>
            <InfoRow label="Company"   value={booking.receiver_company} />
            <InfoRow label="Mobile"    value={booking.receiver_mobile} />
            <InfoRow label="Telephone" value={booking.receiver_telephone} />
            <InfoRow label="Email"     value={booking.receiver_email} />
            <InfoRow label="Address"   value={[booking.delivery_address_1, booking.delivery_address_2].filter(Boolean).join(", ")} />
            <InfoRow label="City"      value={`${booking.delivery_city}, ${booking.delivery_state} ${booking.delivery_zip}`} />
          </div>

          {/* Payment status */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Payment</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                Unpaid
              </span>
              <span className="text-xs text-gray-400">Payment gateway not yet connected</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Pricing (locked at booking)</h2>
            <PriceRow label="Base rate"          value={booking.base_rate_inr} />
            <PriceRow label="Discount"           value={booking.discount_inr} />
            <PriceRow label="Margin (internal)"  value={booking.margin_inr} />
            <PriceRow label="FSC"                value={booking.fsc_inr} />
            <PriceRow label="Demand surcharge"   value={booking.demand_surcharge_inr} />
            <PriceRow label="Premium service"    value={booking.premium_service_inr} />
            <PriceRow label="Peak surcharge"     value={booking.peak_surcharge_inr} />
            <PriceRow label="US inbound"         value={booking.us_inbound_inr} />
            <PriceRow label="UPS fixed"          value={booking.ups_fixed_inr} />
            <PriceRow label="Pickup surcharge"   value={booking.pickup_surcharge_inr} />
            <PriceRow label="Packaging"          value={booking.packaging_inr} />
            <PriceRow label="Insurance"          value={booking.insurance_inr} />
            <div className="my-2 border-t border-gray-100" />
            <PriceRow label="Subtotal"           value={booking.subtotal_inr} />
            <PriceRow label="GST (18%)"          value={booking.gst_inr} />
            <div className="my-2 border-t border-gray-100" />
            <PriceRow label="Total"              value={booking.total_inr} highlight />
          </div>
        </div>

        {/* ── Right column: status + tracking ── */}
        <div className="space-y-4">

          {/* Staff Assignment */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" /> Assign Staff
            </h2>
            <div className="flex items-center gap-2">
              <Select value={assignedStaff} onValueChange={handleAssignStaff}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select pickup agent…" />
                </SelectTrigger>
                <SelectContent>
                  {(staffList ?? []).filter((s) => s.is_active).map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} — {s.role.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="mt-1.5 text-[10px] text-gray-400">Staff assignment is not persisted until the staff table is created.</p>
          </div>

          {/* Inscan Weight — shown only when picked_up */}
          {booking.status === "picked_up" && (
            <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-purple-600 flex items-center gap-1.5">
                <ScanLine className="h-3.5 w-3.5" /> Confirm Inscan
              </h2>
              <form onSubmit={handleInscan} className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Booked Weight</Label>
                  <p className="text-sm font-semibold text-gray-800">{booking.actual_weight_kg} kg</p>
                </div>
                <div>
                  <Label htmlFor="inscan-weight" className="text-xs text-gray-600">Actual Weight (kg) *</Label>
                  <Input
                    id="inscan-weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="e.g. 2.5"
                    value={inscanWeight}
                    onChange={(e) => setInscanWeight(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                {weightMismatchLevel === "error" && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Large discrepancy ({weightDiffPct.toFixed(1)}%) — contact customer before proceeding.
                  </div>
                )}
                {weightMismatchLevel === "warn" && (
                  <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Weight mismatch ({weightDiffPct.toFixed(1)}%) — proceed with caution.
                  </div>
                )}
                {weightMismatchLevel === "ok" && (
                  <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    Weight matches booked weight (±5%).
                  </div>
                )}
                <Button type="submit" disabled={!inscanWeight} className="w-full bg-purple-600 hover:bg-purple-700">
                  Confirm Inscan & Advance to In Transit
                </Button>
              </form>
            </div>
          )}

          {/* AWB Assignment — shown when in_transit and no tracking number */}
          {booking.status === "in_transit" && !booking.tracking_number && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Assign Carrier AWB
              </h2>
              <form onSubmit={handleAssignAWB} className="flex gap-2">
                <Input
                  placeholder="Enter AWB / tracking number…"
                  value={awbInput}
                  onChange={(e) => setAwbInput(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!awbInput.trim() || assignAWB.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {assignAWB.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
                </Button>
              </form>
            </div>
          )}

          {/* AWB already assigned callout */}
          {booking.tracking_number && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              AWB assigned: <span className="ml-1 font-mono font-semibold">{booking.tracking_number}</span>
            </div>
          )}

          {/* Update Status */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Update Status</h2>
            {allowedStatuses.length === 0 ? (
              <p className="text-sm text-gray-400">No further status changes allowed.</p>
            ) : (
              <div className="flex items-center gap-2">
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as BookingStatus)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select new status…" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStatuses.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus || updateStatus.isPending}
                >
                  {updateStatus.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Tracking Events ({booking.tracking_events.length})
            </h2>
            {booking.tracking_events.length === 0 ? (
              <p className="text-sm text-gray-400">No tracking events yet.</p>
            ) : (
              <ol className="relative border-l border-gray-200">
                {booking.tracking_events.map((ev: AdminTrackingEvent) => (
                  <li key={ev.id} className="mb-4 ml-4">
                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-blue-600" />
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-mono text-xs font-semibold text-blue-700">{ev.event_code}</span>
                      <span className="text-sm text-gray-800">{ev.description}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ev.event_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {ev.location}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Add Tracking Event */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Add Tracking Event</h2>
            <form onSubmit={handleAddEvent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="event-code" className="text-xs">Event Code *</Label>
                  <Input
                    id="event-code"
                    placeholder="e.g. PU, OD, DL"
                    value={eventCode}
                    onChange={(e) => setEventCode(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="event-at" className="text-xs">Date & Time *</Label>
                  <Input
                    id="event-at"
                    type="datetime-local"
                    value={eventAt}
                    onChange={(e) => setEventAt(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="event-desc" className="text-xs">Description *</Label>
                <Input
                  id="event-desc"
                  placeholder="e.g. Shipment picked up"
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="event-loc" className="text-xs">Location (optional)</Label>
                <Input
                  id="event-loc"
                  placeholder="e.g. Chennai, IN"
                  value={eventLoc}
                  onChange={(e) => setEventLoc(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={addEvent.isPending} className="w-full">
                {addEvent.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Event"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
