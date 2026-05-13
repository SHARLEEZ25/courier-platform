import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInscanQueue, useInscanBooking } from "@/hooks/admin/useAdminInscan";
import { useAdminBookings } from "@/hooks/admin/useAdminBookings";
import type { AdminBookingListItem } from "@/types/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ScanLine, AlertTriangle, CheckCircle2,
  ArrowRight, Package, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

function WeightIndicator({ bookedKg, actualKg }: { bookedKg: number; actualKg: number }) {
  if (!actualKg) return null;
  const diff = Math.abs(actualKg - bookedKg) / bookedKg * 100;
  if (diff > 20) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Large discrepancy ({diff.toFixed(1)}%) — contact customer before proceeding.
      </div>
    );
  }
  if (diff > 10) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        Weight mismatch ({diff.toFixed(1)}%) — verify before inscanning.
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
      Weight within tolerance (±{diff.toFixed(1)}%). OK to inscan.
    </div>
  );
}

function InscanCard({ booking, onDone }: { booking: AdminBookingListItem; onDone: () => void }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const inscan = useInscanBooking(booking.id);
  const [weight, setWeight] = useState(String(booking.actual_weight_kg));
  const actualKg = parseFloat(weight) || 0;

  async function handleInscan(e: React.FormEvent) {
    e.preventDefault();
    if (!actualKg) return;
    try {
      await inscan.mutateAsync({ actual_weight_kg: actualKg });
      toast({ title: "Inscan confirmed", description: `${booking.booking_ref} → In Transit` });
      onDone();
    } catch (err) {
      toast({ title: "Inscan failed", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-purple-50 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-purple-600" />
          <span className="font-mono text-sm font-semibold text-purple-800">{booking.booking_ref}</span>
          <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">picked_up</Badge>
        </div>
        <button
          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
        >
          Full detail <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Info + form */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Customer</span>
            <span className="font-medium">{booking.sender_company}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Carrier</span>
            <span className="font-mono font-semibold uppercase">{booking.carrier_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Route</span>
            <span>{booking.origin_country} → {booking.destination_country}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Booked weight</span>
            <span className="font-semibold">{booking.actual_weight_kg} kg</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pieces</span>
            <span>{booking.num_pieces}</span>
          </div>
        </div>

        <form onSubmit={handleInscan} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Actual weight (kg) *</label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <WeightIndicator bookedKg={booking.actual_weight_kg} actualKg={actualKg} />
          <Button
            type="submit"
            disabled={!weight || inscan.isPending}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {inscan.isPending
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <><CheckCircle2 className="h-4 w-4 mr-1.5" />Confirm Inscan</>}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminInscan() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [foundBooking, setFoundBooking] = useState<AdminBookingListItem | null>(null);
  const [searching, setSearching] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const { data: queueData, isLoading: queueLoading } = useInscanQueue();
  const { data: searchData } = useAdminBookings(
    searchQuery.length >= 3 ? { q: searchQuery, limit: 5 } : { q: undefined }
  );

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const match = searchData?.bookings.find(
        (b) => b.booking_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
               b.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (match) {
        setFoundBooking(match);
      } else {
        toast({ title: "Not found", description: `No booking matches "${searchQuery}"`, variant: "destructive" });
      }
    } finally {
      setSearching(false);
    }
  }

  const queue = (queueData?.bookings ?? []).filter((b) => !completedIds.has(b.id));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-purple-600" />
          Inscan Station
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">
          Verify actual weight and confirm receipt at office
        </p>
      </div>

      {/* Quick lookup */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Quick Lookup</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Enter booking ref or tracking number…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!searchQuery.trim() || searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Find"}
          </Button>
        </form>
        {foundBooking && (
          <div className="mt-4">
            <InscanCard
              booking={foundBooking}
              onDone={() => {
                setCompletedIds((s) => new Set(s).add(foundBooking.id));
                setFoundBooking(null);
                setSearchQuery("");
              }}
            />
          </div>
        )}
      </div>

      {/* Pending inscan queue */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Inscan Queue
          </h2>
          <span className="rounded-full bg-purple-100 px-3 py-0.5 text-xs font-semibold text-purple-700">
            {queue.length} pending
          </span>
        </div>

        {queueLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        )}

        {!queueLoading && queue.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-12">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">No shipments pending inscan.</p>
          </div>
        )}

        <div className="space-y-3">
          {queue.map((b) => (
            <InscanCard
              key={b.id}
              booking={b}
              onDone={() => setCompletedIds((s) => new Set(s).add(b.id))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
