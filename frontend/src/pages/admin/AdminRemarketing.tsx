import { useState } from "react";
import { useAdminRemarketing, useSendRemarketingEmails } from "@/hooks/admin/useAdminRemarketing";
import type { AdminRemarketingRecord } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Send, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const EMAIL_STATUS_COLOURS: Record<AdminRemarketingRecord["email_status"], string> = {
  pending: "bg-gray-100 text-gray-600 border-gray-200",
  sent:    "bg-green-100 text-green-700 border-green-200",
  failed:  "bg-red-100 text-red-700 border-red-200",
};

function EmailPreview() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 text-xs text-gray-300 font-mono">
        Email Preview — 10% Off Coupon
      </div>
      <div className="p-5 max-w-sm">
        <div className="mb-4 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-2">
            <Mail className="h-7 w-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Thank You for Shipping with CourierPro!</h3>
          <p className="text-sm text-gray-500 mt-1">Your shipment has been delivered successfully.</p>
        </div>
        <div className="my-4 rounded-lg border-2 border-dashed border-green-400 bg-green-50 p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Your Exclusive Offer</p>
          <p className="text-4xl font-extrabold text-green-600 my-1">10% OFF</p>
          <p className="text-xs text-gray-500">on your next shipment with CourierPro</p>
          <div className="mt-3 rounded bg-green-600 px-4 py-1.5 text-sm font-semibold text-white inline-block">
            UNIEX10
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center">Valid for 30 days. One-time use.</p>
      </div>
    </div>
  );
}

function RemarketingCard({
  record, selected, onToggleSelect, onSendOne, isSending,
}: {
  record: AdminRemarketingRecord;
  selected: boolean;
  onToggleSelect: (bookingId: string) => void;
  onSendOne: (bookingId: string) => void;
  isSending: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {record.email_status === "pending" && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onToggleSelect(record.booking_id)}
              className="rounded"
            />
          )}
          <span className="font-mono text-sm font-semibold text-gray-700">{record.booking_ref}</span>
        </div>
        <span className={cn("inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium", EMAIL_STATUS_COLOURS[record.email_status])}>
          {record.email_status}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className="text-gray-600">{record.customer_email}</p>
        <p className="text-xs text-gray-400">
          Delivered {new Date(record.delivered_at).toLocaleDateString("en-IN")}
        </p>
      </div>

      {record.email_status === "pending" && (
        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full text-xs"
          disabled={isSending}
          onClick={() => onSendOne(record.booking_id)}
        >
          <Send className="h-3 w-3 mr-1" />
          Send
        </Button>
      )}
    </div>
  );
}

export default function AdminRemarketing() {
  const { toast } = useToast();
  const { data: records, isLoading } = useAdminRemarketing();
  const sendEmails = useSendRemarketingEmails();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pending = (records ?? []).filter((r) => r.email_status === "pending");
  const sent    = (records ?? []).filter((r) => r.email_status === "sent").length;

  function toggleSelect(bookingId: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(bookingId) ? s.delete(bookingId) : s.add(bookingId);
      return s;
    });
  }

  function selectAll() {
    setSelected(new Set(pending.map((r) => r.booking_id)));
  }

  async function handleSendSelected() {
    if (selected.size === 0) return;
    try {
      const result = await sendEmails.mutateAsync(Array.from(selected));
      toast({
        title: `${result.queued} email${result.queued > 1 ? "s" : ""} queued`,
        description: "Emails not yet sent — integrate email provider to complete.",
      });
      setSelected(new Set());
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  async function handleSendOne(bookingId: string) {
    try {
      await sendEmails.mutateAsync([bookingId]);
      toast({ title: "Email queued", description: "Will send once email provider is integrated." });
    } catch (e) {
      toast({ title: "Failed", description: (e as Error).message, variant: "destructive" });
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-pink-500" />
          Remarketing
        </h1>
        <p className="mt-0.5 text-sm text-gray-400">Send 10% off coupon emails to customers after delivery</p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        Emails are not being sent yet. Integrate Resend or SendGrid and create the <code className="font-mono text-xs bg-blue-100 px-1 rounded">remarketing_emails</code> table to enable real email delivery.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats + bulk action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              {[
                { label: "Pending", value: pending.length, colour: "bg-gray-50 border-gray-200 text-gray-800" },
                { label: "Sent", value: sent, colour: "bg-green-50 border-green-200 text-green-800" },
              ].map(({ label, value, colour }) => (
                <div key={label} className={cn("flex flex-col rounded-lg border px-4 py-2", colour)}>
                  <span className="text-xl font-bold">{value}</span>
                  <span className="text-xs">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {pending.length > 0 && selected.size < pending.length && (
                <Button variant="outline" size="sm" className="text-xs" onClick={selectAll}>
                  Select all pending ({pending.length})
                </Button>
              )}
              {selected.size > 0 && (
                <Button
                  size="sm"
                  className="text-xs bg-pink-600 hover:bg-pink-700"
                  disabled={sendEmails.isPending}
                  onClick={handleSendSelected}
                >
                  {sendEmails.isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <><Send className="h-3.5 w-3.5 mr-1" />Send to {selected.size} selected</>}
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
            </div>
          ) : (records ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-12">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
              <p className="text-sm text-gray-400">No delivered bookings in the last 30 days.</p>
            </div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="space-y-3 lg:hidden">
                {(records ?? []).map((r) => (
                  <RemarketingCard
                    key={r.booking_id}
                    record={r}
                    selected={selected.has(r.booking_id)}
                    onToggleSelect={toggleSelect}
                    onSendOne={handleSendOne}
                    isSending={sendEmails.isPending}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:block overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-100 bg-gray-50">
                      <tr>
                        <th className="w-10 px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.size === pending.length && pending.length > 0}
                            onChange={() => selected.size === pending.length ? setSelected(new Set()) : selectAll()}
                            className="rounded"
                          />
                        </th>
                        {["Booking Ref", "Customer Email", "Delivered", "Status", "Action"].map((h) => (
                          <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(records ?? []).map((r) => (
                        <tr key={r.booking_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {r.email_status === "pending" && (
                              <input
                                type="checkbox"
                                checked={selected.has(r.booking_id)}
                                onChange={() => toggleSelect(r.booking_id)}
                                className="rounded"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-700">
                            {r.booking_ref}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{r.customer_email}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(r.delivered_at).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium", EMAIL_STATUS_COLOURS[r.email_status])}>
                              {r.email_status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {r.email_status === "pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                                disabled={sendEmails.isPending}
                                onClick={() => handleSendOne(r.booking_id)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            )}
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

        {/* Right: email preview */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Email Preview</h2>
          <EmailPreview />
        </div>
      </div>
    </div>
  );
}
