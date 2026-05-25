import React from "react";
import { useNavigate } from "react-router-dom";
import { MoveRight, Zap, AlertCircle, Weight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRates } from "@/hooks/useRates";
import type { RateResult, ItemType } from "@/types/api";

interface QuoteResultsProps {
  origin: string;
  destination: string;
  weight: number;
  itemType: string;
  dims?: {l: number, w: number, h: number};
}

// Per-carrier config sourced from DHL / FedEx / UPS 2026 PDFs
const CARRIER_CONFIG: Record<string, {
  service: string;
  description: string;
  weightLimit: string;
  docNote: string;
}> = {
  dhl: {
    service: "Express Worldwide",
    description: "Time-definite express with optional guaranteed delivery windows — by 9am or 12pm",
    weightLimit: "Up to 300 kg · Max length 300 cm",
    docNote: "Document rate applies up to 2 kg",
  },
  fedex: {
    service: "International Priority",
    description: "Priority express cleared through FedEx's global network with full customs handling",
    weightLimit: "Up to 70 kg per package",
    docNote: "Pak (document) rate applies up to 2.5 kg",
  },
  ups: {
    service: "Worldwide Express",
    description: "Reliable express with optional customs services — formal clearance, DDP, signature",
    weightLimit: "Max 70 kg per package",
    docNote: "Document rate applies up to 5 kg",
  },
};

// Item-specific notes from website content
const ITEM_NOTE: Partial<Record<string, string>> = {
  university: "University document specialists — trusted by students shipping to 50+ countries",
  excess:     "Skip the airline excess baggage counter — ship smarter, arrive lighter",
  food:       "Special rates for parents sending home food & essentials to children studying abroad",
  medicine:   "Dedicated medicine courier with full customs support — typically delivered in ~3 days",
};

const QuoteResults: React.FC<QuoteResultsProps> = ({ origin, destination, weight, itemType, dims }) => {
  const navigate = useNavigate();

  const { data: rates, isLoading, error } = useRates({
    origin,
    destination,
    weight,
    dims,
    itemType: itemType as ItemType,
    shipmentType: "package",
  });

  const handleBook = (result: RateResult) => {
    navigate("/rate-breakdown", {
      state: { preselectedCarrier: result.carrier, origin, destination, weight, itemType, dims },
    });
  };

  if (isLoading) {
    return (
      <div id="quote-results" className="py-12 bg-white scroll-mt-24">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="h-8 w-56 bg-slate-100 rounded-lg animate-pulse mx-auto mb-3" />
            <div className="h-4 w-72 bg-slate-100 rounded animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className={`rounded-2xl p-5 md:p-8 border ${i === 0 ? "border-2 border-slate-200 md:scale-[1.03]" : "border border-slate-200"} space-y-4`}>
                <div className="h-5 w-20 bg-slate-100 rounded animate-pulse" />
                <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
                <div className="space-y-2 flex-grow">
                  <div className="h-3 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-4/5 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse mt-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !rates?.length) {
    return (
      <div className="py-16 bg-white">
        <div className="container max-w-xl mx-auto text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-brand-black mb-2">Could not fetch rates</h3>
          <p className="text-sm text-brand-gray">
            {error?.message ?? "No rates available for this route."}
          </p>
          <p className="text-xs text-brand-gray mt-2">
            Please check that the backend server is running, or{" "}
            <a href="/contact" className="text-green-primary underline">contact support</a>.
          </p>
        </div>
      </div>
    );
  }

  // API already sorts ascending by totalInr — take up to 3
  const tiers = rates.slice(0, 3);

  return (
    <div id="quote-results" className="py-12 bg-white scroll-mt-24">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold text-brand-black mb-2">
            Choose Your Carrier
          </h3>
          <p className="text-sm text-brand-gray font-medium">
            All options include real-time tracking and door-to-door handling.
          </p>
        </div>

        {/* Cards — always 3 columns on desktop, stacked on mobile */}
        <div className={`grid grid-cols-1 gap-6 mb-10 ${tiers.length === 1 ? "md:grid-cols-1 max-w-sm mx-auto" : tiers.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : "md:grid-cols-3"}`}>
          {tiers.map((result, idx) => {
            // idx === 0 is cheapest → Best Value (highlighted)
            const isBestValue = idx === 0;
            const config = CARRIER_CONFIG[result.carrier] ?? {
              service: result.carrierName,
              description: "Express international delivery with full tracking",
              weightLimit: "",
              docNote: "",
            };

            return (
              <div
                key={result.carrier}
                className={`relative flex flex-col rounded-2xl p-5 md:p-8 transition-all duration-300 ${
                  isBestValue
                    ? "border-2 border-green-primary shadow-xl bg-white md:scale-[1.03] z-10"
                    : "border border-slate-200 shadow-sm bg-white"
                }`}
              >
                {/* Best Value badge */}
                {isBestValue && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-white border border-slate-200 shadow-sm text-slate-700 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase">
                      Best Value
                    </span>
                  </div>
                )}

                {/* Carrier name (primary header) */}
                <h4 className="text-xl font-bold text-brand-black">{result.carrierName}</h4>
                {/* Service name */}
                <p className="text-[12px] text-slate-400 font-medium mb-3">{config.service}</p>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-4xl font-black text-brand-black tracking-tight">
                    ₹{result.totalInr.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Delivery — from carrier zone data (PDF-sourced, route-specific) */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-green-primary mb-0.5">Delivery</p>
                  <p className="text-sm text-slate-600">{result.estimatedDeliveryDays} working days</p>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-4">
                  {config.description}
                </p>

                {/* Weight limit + doc note */}
                <div className="space-y-1 mb-5">
                  {config.weightLimit && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Weight className="w-3 h-3 shrink-0" />
                      {config.weightLimit}
                    </div>
                  )}
                  {config.docNote && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <FileText className="w-3 h-3 shrink-0" />
                      {config.docNote}
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleBook(result)}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-between group ${
                    isBestValue
                      ? "bg-green-primary hover:bg-green-dark text-white"
                      : "bg-white border border-green-primary text-green-primary hover:bg-green-50"
                  }`}
                >
                  Select &amp; Customise
                  <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Bottom strip — show item note if applicable */}
        {ITEM_NOTE[itemType] ? (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-primary/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-green-primary fill-green-primary" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#15803D] leading-tight">
                {ITEM_NOTE[itemType]}
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Based on live rates for {origin} → {destination}
              </p>
            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
};

export default QuoteResults;
