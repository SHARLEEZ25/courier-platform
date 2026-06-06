import { useState } from "react";
import { useAdminLeads, useUpdateLeadStatus } from "@/hooks/admin/useAdminLeads";
import type { AdminLead } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Phone, Mail, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLOURS: Record<AdminLead["status"], string> = {
  new:       "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  converted: "bg-green-100 text-green-700 border-green-200",
  lost:      "bg-gray-100 text-gray-500 border-gray-200",
};

const SOURCE_LABELS: Record<AdminLead["source"], string> = {
  chat:         "Chat",
  contact_form: "Contact Form",
  quote:        "Quote Tool",
};

function useLeadStatusActions(lead: AdminLead) {
  const { toast } = useToast();
  const update = useUpdateLeadStatus(lead.id);

  async function handleStatus(status: AdminLead["status"]) {
    try {
      await update.mutateAsync(status);
      toast({ title: "Lead updated", description: `Status → ${status}` });
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  return { update, handleStatus };
}

function LeadStatusActions({ lead, isPending, onStatus }: { lead: AdminLead; isPending: boolean; onStatus: (s: AdminLead["status"]) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {lead.status === "new" && (
        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onStatus("contacted")}>
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Contacted"}
        </Button>
      )}
      {(lead.status === "new" || lead.status === "contacted") && (
        <Button size="sm" className="text-xs h-7 bg-green-600 hover:bg-green-700" onClick={() => onStatus("converted")}>
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Converted"}
        </Button>
      )}
      {lead.status !== "lost" && lead.status !== "converted" && (
        <Button size="sm" variant="ghost" className="text-xs h-7 text-gray-400" onClick={() => onStatus("lost")}>
          Lost
        </Button>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: AdminLead }) {
  const { update, handleStatus } = useLeadStatusActions(lead);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{lead.name}</p>
          <p className="text-xs text-gray-400">
            {new Date(lead.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <span className={cn("inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_COLOURS[lead.status])}>
          {lead.status}
        </span>
      </div>

      <div className="mt-2 space-y-0.5">
        {lead.email && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            {lead.email}
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            {lead.phone}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Badge variant="outline" className="text-xs">{SOURCE_LABELS[lead.source]}</Badge>
      </div>

      {lead.message && (
        <p className="mt-2 text-xs text-gray-600 line-clamp-2">{lead.message}</p>
      )}

      <div className="mt-3">
        <LeadStatusActions lead={lead} isPending={update.isPending} onStatus={handleStatus} />
      </div>
    </div>
  );
}

function LeadRow({ lead }: { lead: AdminLead }) {
  const { update, handleStatus } = useLeadStatusActions(lead);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-800">{lead.name}</p>
        <p className="text-xs text-gray-400">
          {new Date(lead.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
        </p>
      </td>
      <td className="px-4 py-3">
        {lead.email && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Mail className="h-3.5 w-3.5 text-gray-400" />
            {lead.email}
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            {lead.phone}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline" className="text-xs">{SOURCE_LABELS[lead.source]}</Badge>
      </td>
      <td className="px-4 py-3 max-w-[220px]">
        <p className="text-xs text-gray-600 line-clamp-2">{lead.message ?? "—"}</p>
      </td>
      <td className="px-4 py-3">
        <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", STATUS_COLOURS[lead.status])}>
          {lead.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <LeadStatusActions lead={lead} isPending={update.isPending} onStatus={handleStatus} />
      </td>
    </tr>
  );
}

export default function AdminLeads() {
  const { data: leads, isLoading } = useAdminLeads();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [search, setSearch] = useState("");

  const filtered = (leads ?? []).filter((l) => {
    if (filterStatus && l.status !== filterStatus) return false;
    if (filterSource && l.source !== filterSource) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) &&
        !l.email?.toLowerCase().includes(search.toLowerCase()) &&
        !l.phone?.includes(search)) return false;
    return true;
  });

  const total       = leads?.length ?? 0;
  const converted   = leads?.filter((l) => l.status === "converted").length ?? 0;
  const thisWeekMs  = Date.now() - 7 * 24 * 3600 * 1000;
  const thisWeek    = leads?.filter((l) => new Date(l.created_at).getTime() > thisWeekMs).length ?? 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Leads
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">Captured contacts from chat, quote tool, and contact form</p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        Showing demo leads. Real leads will populate once the <code className="font-mono text-xs bg-blue-100 px-1 rounded">leads</code> table is created and the ChatWidget is wired to <code className="font-mono text-xs bg-blue-100 px-1 rounded">POST /api/leads</code>.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:max-w-sm">
        {[
          { label: "Total", value: total, colour: "bg-white border-gray-200 text-gray-800" },
          { label: "Converted", value: converted, colour: "bg-green-50 border-green-200 text-green-800" },
          { label: "This week", value: thisWeek, colour: "bg-blue-50 border-blue-200 text-blue-800" },
        ].map(({ label, value, colour }) => (
          <div key={label} className={cn("rounded-lg border px-4 py-3", colour)}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-56"
        />
        <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterSource || "all"} onValueChange={(v) => setFilterSource(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="chat">Chat</SelectItem>
            <SelectItem value="contact_form">Contact Form</SelectItem>
            <SelectItem value="quote">Quote Tool</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center text-sm text-gray-400 shadow-sm">
          No leads match the current filters.
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((l) => <LeadCard key={l.id} lead={l} />)}
          </div>

          {/* Desktop table */}
          <div className="hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {["Name / Date", "Contact", "Source", "Message", "Status", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((l) => <LeadRow key={l.id} lead={l} />)}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
