import { useNavigate } from "react-router-dom";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import { Loader2, AlertTriangle, RefreshCw, ArrowRight, Truck, ScanLine, SendHorizonal, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return n.toLocaleString("en-IN");
}

function fmtInr(n: number) {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function StatCard({
  label, value, sub, accent,
}: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className={cn("rounded-lg border bg-white p-5 shadow-sm", accent ?? "border-gray-200")}>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function QueueCard({
  label, count, sub, icon: Icon, href, accent, badgeClass,
}: {
  label: string;
  count: number;
  sub: string;
  icon: React.ElementType;
  href: string;
  accent: string;
  badgeClass: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border bg-white p-5 shadow-sm text-left w-full transition-all hover:shadow-md",
        accent
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", badgeClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className={cn("text-2xl font-bold", count > 0 ? "text-gray-900" : "text-gray-400")}>
          {count}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
        Open queue <ArrowRight className="h-3 w-3" />
      </div>
    </button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } = useAdminDashboard();

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          {updatedAt && (
            <p className="mt-0.5 text-xs text-gray-400">Refreshed at {updatedAt}</p>
          )}
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          Failed to load dashboard stats. Check your connection and try again.
        </div>
      )}

      {data && (
        <>
          {/* Volume stats */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Bookings</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Today" value={fmt(data.bookings_today)} sub="new bookings" />
              <StatCard label="This week" value={fmt(data.bookings_this_week)} sub="new bookings" />
              <StatCard label="Revenue today" value={fmtInr(data.revenue_today)} sub="excl. cancelled" />
              <StatCard label="Revenue this week" value={fmtInr(data.revenue_this_week)} sub="excl. cancelled" />
            </div>
          </div>

          {/* Operations Queue Cards */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Operations Queue</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <QueueCard
                label="Pickup Queue"
                count={data.pending_count}
                sub="confirmed, awaiting pickup"
                icon={Truck}
                href="/admin/pickups"
                accent={data.pending_count > 0 ? "border-yellow-300 bg-yellow-50/30" : "border-gray-200"}
                badgeClass={data.pending_count > 0 ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400"}
              />
              <QueueCard
                label="Inscan Queue"
                count={data.inscanned_count}
                sub="picked up, pending inscan"
                icon={ScanLine}
                href="/admin/inscan"
                accent={data.inscanned_count > 0 ? "border-purple-300 bg-purple-50/30" : "border-gray-200"}
                badgeClass={data.inscanned_count > 0 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}
              />
              <QueueCard
                label="Outscan Queue"
                count={data.outscan_queue_count}
                sub="in transit, no AWB yet"
                icon={SendHorizonal}
                href="/admin/outscan"
                accent={data.outscan_queue_count > 0 ? "border-indigo-300 bg-indigo-50/30" : "border-gray-200"}
                badgeClass={data.outscan_queue_count > 0 ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-400"}
              />
              <QueueCard
                label="NDR Board"
                count={data.ndr_count}
                sub="delivery failed / NDR events"
                icon={AlertOctagon}
                href="/admin/ndr"
                accent={data.ndr_count > 0 ? "border-red-300 bg-red-50/30" : "border-gray-200"}
                badgeClass={data.ndr_count > 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-400"}
              />
            </div>
          </div>

          {/* Status breakdown */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Status Breakdown</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="In Transit"  value={fmt(data.outscanned_count)} sub="with carrier" accent="border-indigo-200" />
              <StatCard label="Delivered"   value={fmt(data.delivered_count)}  sub="all time"    accent="border-green-200" />
              <StatCard label="Cancelled"   value={fmt(data.cancelled_count)}  accent={data.cancelled_count > 0 ? "border-red-200" : "border-gray-200"} />
              <StatCard label="Pending"     value={fmt(data.pending_count)}    sub="not confirmed yet" />
            </div>
          </div>

          {/* Alerts */}
          {(data.unassigned_pickups > 0 || data.cancelled_count > 0) && (
            <div>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Alerts</h2>
              <div className="space-y-2">
                {data.unassigned_pickups > 0 && (
                  <button
                    onClick={() => navigate("/admin/bookings?status=confirmed")}
                    className="flex w-full items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-left transition-colors hover:bg-orange-100"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">
                        {data.unassigned_pickups} confirmed {data.unassigned_pickups === 1 ? "booking" : "bookings"} with no tracking number assigned
                      </p>
                      <p className="mt-0.5 text-xs text-orange-500">View unassigned pickups →</p>
                    </div>
                  </button>
                )}

                {data.cancelled_count > 0 && (
                  <button
                    onClick={() => navigate("/admin/bookings?status=cancelled")}
                    className="flex w-full items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left transition-colors hover:bg-red-100"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {data.cancelled_count} cancelled {data.cancelled_count === 1 ? "booking" : "bookings"}
                      </p>
                      <p className="mt-0.5 text-xs text-red-500">View cancelled bookings →</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {data.unassigned_pickups === 0 && data.cancelled_count === 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              No alerts — all confirmed bookings have tracking numbers assigned.
            </div>
          )}
        </>
      )}
    </div>
  );
}
