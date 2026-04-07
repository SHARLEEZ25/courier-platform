import { useState } from "react";
import { Loader2, Phone, Mail, MessageCircle, CheckCircle2, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { useTracking } from "@/hooks/useTracking";
import type { TrackingEvent } from "@/types/api";

// Maps booking status to badge colour
const STATUS_STYLE: Record<string, string> = {
  pending:    "bg-gray-50 text-gray-700 border border-gray-100",
  confirmed:  "bg-blue-50 text-blue-700 border border-blue-100",
  picked_up:  "bg-amber-50 text-amber-700 border border-amber-100",
  in_transit: "bg-amber-50 text-amber-700 border border-amber-100",
  delivered:  "bg-green-50 text-green-700 border border-green-100",
  cancelled:  "bg-red-50 text-red-600 border border-red-100",
};

const Track = () => {
  const [inputValue, setInputValue] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, isLoading, error } = useTracking(activeId);

  const handleTrack = () => {
    const id = inputValue.toUpperCase().trim().split(",")[0].trim();
    if (!id) return;
    setActiveId(id);
  };

  // Derive a simple ordered step list from tracking events
  const steps = data
    ? buildSteps(data.events, data.status)
    : [];

  const statusKey = data?.status ?? (data?.events?.[data.events.length - 1]?.event_code?.toLowerCase() ?? "");
  const statusLabel = data?.status
    ? data.status.replace("_", " ")
    : (data?.events?.[data.events.length - 1]?.description ?? "");

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <TopBar />
      <Navbar />

      <main className="flex-grow container py-20 pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-brand-black mb-4">Track Your Shipment</h1>
            <p className="text-brand-gray">Enter your Uniex tracking number to get live updates</p>
          </div>

          {/* Search bar */}
          <div className="bg-white p-2 rounded-2xl shadow-lg border border-card-border mb-12">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-grow">
                <Input
                  placeholder="e.g. UNX-2026-123456"
                  className="h-14 border-none text-lg px-6 focus-visible:ring-0"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                />
              </div>
              <Button
                onClick={handleTrack}
                disabled={isLoading}
                className="h-14 md:w-40 bg-green-primary hover:bg-green-dark text-white text-lg font-bold rounded-xl shrink-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track Now →"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-brand-gray text-center -mt-8 mb-12">
            Separate multiple tracking numbers with a comma
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-600 text-center animate-in fade-in duration-300">
              {error.message}
            </div>
          )}

          {/* Result card */}
          {data && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-card-border">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <div className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-1">Tracking ID</div>
                    <div className="text-2xl font-mono font-bold text-brand-black">
                      {data.bookingRef ?? data.trackingId}
                    </div>
                    {data.carrier && (
                      <div className="text-sm text-brand-gray mt-1 capitalize">{data.carrier}</div>
                    )}
                  </div>
                  {statusKey && (
                    <div className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider",
                      STATUS_STYLE[statusKey] ?? "bg-gray-50 text-gray-700 border border-gray-100"
                    )}>
                      {statusLabel}
                    </div>
                  )}
                </div>

                {/* Desktop horizontal timeline */}
                <div className="hidden md:block">
                  <div className="relative mb-20 px-4">
                    <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 z-0">
                      <div
                        className="h-full bg-green-primary transition-all duration-1000"
                        style={{ width: `${progressPercent(steps)}%` }}
                      />
                    </div>
                    <div className="relative z-10 flex justify-between">
                      {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center w-1/5 text-center px-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                            step.completed
                              ? "bg-green-primary border-green-primary shadow-lg shadow-green-100"
                              : step.current
                              ? "bg-white border-green-primary ring-4 ring-green-50"
                              : "bg-white border-gray-200"
                          )}>
                            {step.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : step.current ? (
                              <div className="w-3 h-3 bg-green-primary rounded-full animate-pulse" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-200 rounded-full" />
                            )}
                          </div>
                          <div className="mt-4">
                            <div className={cn(
                              "text-sm font-bold",
                              (step.completed || step.current) ? "text-brand-black" : "text-brand-gray"
                            )}>
                              {step.label}
                            </div>
                            {step.time && (
                              <div className="text-[10px] text-brand-gray mt-1 leading-tight">{step.time}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile vertical timeline */}
                <div className="md:hidden space-y-8">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0",
                          step.completed
                            ? "bg-green-primary border-green-primary"
                            : step.current
                            ? "bg-white border-green-primary ring-4 ring-green-50"
                            : "bg-white border-gray-200"
                        )}>
                          {step.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : step.current ? (
                            <div className="w-2.5 h-2.5 bg-green-primary rounded-full animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-200 rounded-full" />
                          )}
                        </div>
                        {idx !== steps.length - 1 && (
                          <div className={cn(
                            "w-0.5 h-12 my-1",
                            step.completed ? "bg-green-primary" : "bg-gray-100"
                          )} />
                        )}
                      </div>
                      <div className="pt-1">
                        <div className={cn(
                          "text-base font-bold",
                          (step.completed || step.current) ? "text-brand-black" : "text-brand-gray"
                        )}>
                          {step.label}
                        </div>
                        {step.time && (
                          <div className="text-xs text-brand-gray mt-0.5">{step.time}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed event history */}
              {data.events && data.events.length > 0 && (
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-card-border">
                  <h2 className="text-lg font-bold text-brand-black mb-6">Tracking History</h2>
                  <div className="space-y-0">
                    {[...data.events].reverse().map((ev, idx) => (
                      <div key={idx} className="flex gap-4 group">
                        {/* Timeline spine */}
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-3 h-3 rounded-full shrink-0 mt-1.5 border-2",
                            idx === 0
                              ? "bg-green-primary border-green-primary"
                              : "bg-white border-gray-300"
                          )} />
                          {idx !== data.events.length - 1 && (
                            <div className="w-px flex-grow bg-gray-100 my-1" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="pb-6">
                          <p className={cn(
                            "text-sm font-semibold leading-snug",
                            idx === 0 ? "text-brand-black" : "text-brand-gray"
                          )}>
                            {ev.description}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                            {ev.location && (
                              <span className="flex items-center gap-1 text-xs text-brand-gray">
                                <MapPin className="w-3 h-3" />
                                {ev.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-brand-gray">
                              <Clock className="w-3 h-3" />
                              {formatEventTime(ev.event_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help section */}
              <div className="text-center pt-8">
                <p className="text-brand-gray font-medium mb-8">Need help with your shipment?</p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                  <a href="tel:+919600879666" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-100 hover:bg-green-50 transition-all group">
                    <Phone className="w-4 h-4 text-green-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-brand-black">+91 9600879666</span>
                  </a>
                  <a href="mailto:uniexanr@gmail.com" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-100 hover:bg-green-50 transition-all group">
                    <Mail className="w-4 h-4 text-green-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-brand-black">uniexanr@gmail.com</span>
                  </a>
                  <a href="https://wa.me/919600879666" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-100 hover:bg-green-50 transition-all group">
                    <MessageCircle className="w-4 h-4 text-green-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-brand-black">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const ORDERED_STATUSES = ["pending", "confirmed", "picked_up", "in_transit", "delivered"];

interface Step {
  label: string;
  completed: boolean;
  current: boolean;
  time?: string;
}

function buildSteps(events: TrackingEvent[], currentStatus?: string): Step[] {
  const statusLabels: Record<string, string> = {
    pending:    "Booking confirmed",
    confirmed:  "Pickup scheduled",
    picked_up:  "Picked up",
    in_transit: "In transit",
    delivered:  "Delivered",
  };

  // Build a map of status → event for timestamps
  const eventMap: Record<string, TrackingEvent> = {};
  for (const ev of events) {
    const key = ev.event_code.toLowerCase();
    eventMap[key] = ev;
  }

  const currentIdx = ORDERED_STATUSES.indexOf(currentStatus ?? "");

  return ORDERED_STATUSES.map((status, idx) => {
    const ev = eventMap[status];
    return {
      label: statusLabels[status],
      completed: idx < currentIdx,
      current: idx === currentIdx,
      time: ev ? formatEventTime(ev.event_at) : undefined,
    };
  });
}

function progressPercent(steps: Step[]): number {
  const completedCount = steps.filter((s) => s.completed).length;
  return Math.round((completedCount / (steps.length - 1)) * 100);
}

function formatEventTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default Track;
