import React from "react";
import { useNavigate } from "react-router-dom";
import { MoveRight, Zap, AlertCircle } from "lucide-react";
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

// Tier config — assigned by price rank (cheapest=0, mid=1, most expensive=2)
const TIERS = [
  {
    name: "Basic",
    badge: null as string | null,
    highlight: false,
    // Economy: 7–14 working days (Uniex website)
    deliveryDays: "7–14 working days",
    description: "Reliable economy shipping via our trusted carrier network",
  },
  {
    name: "Standard",
    badge: "Most Popular",
    highlight: true,
    // Express: 3–6 working days (Uniex website)
    deliveryDays: "3–6 working days",
    description: "Express delivery with full end-to-end tracking and priority handling",
  },
  {
    name: "Premium",
    badge: null as string | null,
    highlight: false,
    // Fastest express: 2–5 business days (Uniex website)
    deliveryDays: "2–5 business days",
    description: "Priority express — fastest available route for your shipment",
  },
];

// Item-specific notes from Uniex website content (client-provided copy)
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
              <div key={i} className={`rounded-2xl p-8 border ${i === 1 ? "border-2 border-slate-200 md:scale-[1.03]" : "border border-slate-200"} space-y-4`}>
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
  const cheapest = tiers[0];

  // Savings strip: use real discount data from rate engine
  const savingsPct = cheapest.discountPct > 0 ? Math.round(cheapest.discountPct * 100) : null;
  const marketAvg  = cheapest.discountPct > 0 ? Math.round(cheapest.totalInr + cheapest.discountInr) : null;

  return (
    <div id="quote-results" className="py-12 bg-white scroll-mt-24">
      <div className="container max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold text-brand-black mb-2">
            Choose Your Shipping Plan
          </h3>
          <p className="text-sm text-brand-gray font-medium">
            All plans include real-time tracking and professional handling.
          </p>
        </div>

        {/* Cards — always 3 columns on desktop, stacked on mobile */}
        <div className={`grid grid-cols-1 gap-6 mb-10 ${tiers.length === 1 ? "md:grid-cols-1 max-w-sm mx-auto" : tiers.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : "md:grid-cols-3"}`}>
          {tiers.map((result, idx) => {
            const tier = TIERS[idx];
            return (
              <div
                key={result.carrier}
                className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                  tier.highlight
                    ? "border-2 border-green-primary shadow-xl bg-white md:scale-[1.03] z-10"
                    : "border border-slate-200 shadow-sm bg-white"
                }`}
              >
                {/* Most Popular badge */}
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-white border border-slate-200 shadow-sm text-slate-700 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase">
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Tier name */}
                <h4 className="text-xl font-bold text-brand-black mb-3">{tier.name}</h4>

                {/* Price */}
                <div className="mb-5">
                  <span className="text-4xl font-black text-brand-black tracking-tight">
                    ₹{Math.round(result.totalInr).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Delivery — from carrier zone data (PDF-sourced, route-specific) */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-green-primary mb-0.5">Delivery</p>
                  <p className="text-sm text-slate-600">{result.estimatedDeliveryDays} working days</p>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed flex-grow mb-5">
                  {tier.description}
                </p>

                {/* Carrier label */}
                <p className="text-[11px] text-slate-400 font-medium mb-5">
                  via {result.carrierName}
                </p>

                {/* CTA */}
                <Button
                  onClick={() => handleBook(result)}
                  className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-between group ${
                    tier.highlight
                      ? "bg-green-primary hover:bg-green-dark text-white"
                      : "bg-white border border-green-primary text-green-primary hover:bg-green-50"
                  }`}
                >
                  Book Now
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
