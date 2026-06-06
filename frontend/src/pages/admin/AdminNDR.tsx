import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminNDR } from "@/hooks/admin/useAdminNDR";
import type { AdminNDRRecord } from "@/types/api";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertOctagon, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const NDR_STATUS_COLOURS: Record<AdminNDRRecord["status"], string> = {
  unresolved:           "bg-red-100 text-red-700 border-red-200",
  reattempt_scheduled:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  resolved:             "bg-green-100 text-green-700 border-green-200",
};

const NDR_REASONS = [
  "Customer unavailable",
  "Incorrect address",
  "Refused delivery",
  "Access issue",
  "Customs hold",
  "Other",
];

function StatBadge({ label, value, colour }: { label: string; value: number; colour: string }) {
  return (
    <div className={cn("flex flex-col gap-0.5 rounded-lg border px-5 py-3", colour)}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function NDRNoteDialog({ record }: { record: AdminNDRRecord }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [text, setText] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs">
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add NDR Note — {record.booking_ref}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="text-xs">NDR Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select reason…" />
              </SelectTrigger>
              <SelectContent>
                {NDR_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Notes</Label>
            <Input
              className="mt-1"
              placeholder="Additional notes…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => {
              toast({ title: "Note saved (dummy)", description: "NDR note not persisted yet." });
              setOpen(false);
              setReason(""); setText("");
            }}
          >
            Save Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NDRCard({ record, onNavigate }: { record: AdminNDRRecord; onNavigate: (bookingId: string) => void }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button
          onClick={() => onNavigate(record.booking_id)}
          className="font-mono text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          {record.booking_ref} <ExternalLink className="h-3 w-3 opacity-60" />
        </button>
        <span className={cn("inline-flex shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium", NDR_STATUS_COLOURS[record.status])}>
          {record.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <p className="text-gray-700">{record.customer_name}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs uppercase">{record.carrier_id}</Badge>
          <span className="font-mono text-xs text-gray-500">{record.awb ?? "—"}</span>
        </div>
        <p className="text-xs text-gray-500">Destination: {record.destination_country}</p>
        <p className="text-xs text-gray-500">
          Last attempt: {new Date(record.last_attempt_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
        </p>
        <p className="text-xs text-gray-500">Reason: {record.ndr_reason ?? "—"}</p>
      </div>

      <div className="mt-3">
        <NDRNoteDialog record={record} />
      </div>
    </div>
  );
}

export default function AdminNDR() {
  const navigate = useNavigate();
  const { data: records, isLoading } = useAdminNDR();

  const [filterStatus, setFilterStatus] = useState("");
  const [filterCarrier, setFilterCarrier] = useState("");

  const filtered = (records ?? []).filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterCarrier && r.carrier_id !== filterCarrier) return false;
    return true;
  });

  const total = records?.length ?? 0;
  const reattempt = records?.filter((r) => r.status === "reattempt_scheduled").length ?? 0;
  const unresolved = records?.filter((r) => r.status === "unresolved").length ?? 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <AlertOctagon className="h-5 w-5 text-red-500" />
          NDR Board
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">Non-delivery reports and reattempt management</p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          NDR events will populate automatically once AfterShip webhooks are integrated.
          For now, add NDR tracking events manually from the booking detail page using event code <code className="font-mono text-xs bg-blue-100 px-1 rounded">NDR</code>.
        </span>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <StatBadge label="Total NDR" value={total} colour="border-gray-200 bg-white text-gray-800" />
        <StatBadge label="Reattempt Scheduled" value={reattempt} colour="border-yellow-200 bg-yellow-50 text-yellow-800" />
        <StatBadge label="Unresolved" value={unresolved} colour="border-red-200 bg-red-50 text-red-800" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unresolved">Unresolved</SelectItem>
            <SelectItem value="reattempt_scheduled">Reattempt Scheduled</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCarrier || "all"} onValueChange={(v) => setFilterCarrier(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All carriers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All carriers</SelectItem>
            <SelectItem value="dhl">DHL</SelectItem>
            <SelectItem value="fedex">FedEx</SelectItem>
            <SelectItem value="ups">UPS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <AlertOctagon className="h-7 w-7 text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-600">No NDR records</p>
          <p className="text-xs text-gray-400">NDR events will appear here once AfterShip is integrated.</p>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((r) => (
              <NDRCard key={r.id} record={r} onNavigate={(bookingId) => navigate(`/admin/bookings/${bookingId}`)} />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {["Booking Ref", "Customer", "AWB", "Carrier", "Destination", "Last Attempt", "NDR Reason", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/bookings/${r.booking_id}`)}
                          className="font-mono text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {r.booking_ref} <ExternalLink className="h-3 w-3 opacity-60" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{r.customer_name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.awb ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs uppercase">{r.carrier_id}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{r.destination_country}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(r.last_attempt_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.ndr_reason ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-medium", NDR_STATUS_COLOURS[r.status])}>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <NDRNoteDialog record={r} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
