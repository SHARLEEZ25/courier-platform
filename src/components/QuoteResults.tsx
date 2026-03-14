import React from "react";
import { Link } from "react-router-dom";
import { MoveRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteResultsProps {
  origin: string;
  destination: string;
  weight: number;
  itemType: string;
}

const specializedNotes = {
  university: "Save more than 50% on university documents worldwide",
  excess: "Save more than 50% vs airline excess baggage fees",
  food: "Special rates for parents sending food & essentials to children studying abroad"
};

const getMultiplier = (dest: string) => {
  const multipliers: Record<string, number> = {
    USA: 480,
    Canada: 480,
    UK: 460,
    Australia: 500,
    "New Zealand": 500,
    UAE: 320,
    "Saudi Arabia": 320,
    Qatar: 320,
    Kuwait: 320,
    Bahrain: 320,
    Oman: 320,
    Singapore: 280,
    Malaysia: 280,
    Thailand: 280,
  };

  const europe = ["Germany", "France", "Italy", "Spain", "Netherlands"];
  if (europe.includes(dest)) return 420;

  return multipliers[dest] || 350;
};

const QuoteResults: React.FC<QuoteResultsProps> = ({ origin, destination, weight, itemType }) => {
  const multiplier = getMultiplier(destination);
  const base = Math.max(499, weight * multiplier);

  const standardPrice = Math.round(base);
  const premiumPrice = Math.round(base * 1.6);
  const expressPrice = Math.round(base * 2.4);
  const marketAverage = Math.round(base * 1.45);

  const plans = [
    {
      id: "standard",
      label: "Standard",
      price: standardPrice,
      delivery: "12–15 business days",
      note: "Reliable economy shipping via our partner network",
      highlight: false,
    },
    {
      id: "premium",
      label: "Premium",
      price: premiumPrice,
      delivery: "5–7 business days",
      note: "Shipped via DHL or FedEx with full end-to-end tracking",
      highlight: true,
      badge: "Most Popular",
    },
    {
      id: "express",
      label: "Express",
      price: expressPrice,
      delivery: "2–3 business days",
      note: "On-board courier — a dedicated person carries your shipment",
      highlight: false,
    },
  ];

  return (
    <div id="quote-results" className="py-8 bg-white scroll-mt-24">
      <div className="container">
        <div className="text-center mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-brand-black mb-1">Choose Your Shipping Plan</h3>
          <p className="text-sm text-brand-gray font-medium">All plans include real-time tracking and professional handling.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-stretch max-w-6xl mx-auto mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col p-8 rounded-2xl bg-white transition-all duration-300 ${
                plan.highlight
                  ? "border-2 border-green-primary shadow-lg scale-[1.03] z-10"
                  : "border border-card-border shadow-sm"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8F5E9] text-[#2E7D32] px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-lg font-bold text-brand-black mb-1">{plan.label}</h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-brand-black">₹{plan.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-green-dark">Delivery</span>
                  <span className="text-sm text-brand-gray">{plan.delivery}</span>
                </div>
                <p className="text-sm text-brand-gray leading-relaxed">{plan.note}</p>
              </div>

              <Link
                to="/rate-breakdown"
                state={{ plan: plan.id, origin, destination, weight, price: plan.price, itemType }}
                className="w-full"
              >
                <Button
                  variant={plan.highlight ? "default" : "outline"}
                  className={`w-full justify-between h-12 rounded-xl text-sm font-semibold transition-all group ${
                    plan.highlight
                      ? "bg-green-primary hover:bg-green-dark text-white"
                      : "border-green-primary text-green-primary hover:bg-green-50"
                  }`}
                >
                  Book Now
                  <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Savings Strip */}
        {itemType !== "docs" && (
          <div className="max-w-4xl mx-auto bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-green-primary fill-green-primary" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#15803D] leading-tight">
                  {specializedNotes[itemType as keyof typeof specializedNotes] || "Ship smarter — pay up to 32% less than standard market rates"}
                </p>
                <p className="text-[12px] text-slate-400 mt-1">Based on standard market rates for {origin} → {destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Avg</p>
                  <p className="text-sm font-bold text-slate-400 line-through">₹{marketAverage.toLocaleString()}</p>
               </div>
               <div className="h-8 w-px bg-slate-200 hidden sm:block" />
               <div className="text-right">
                  <p className="text-[10px] font-bold text-green-primary uppercase tracking-widest">Uniex Price</p>
                  <p className="text-xl font-black text-[#111827]">₹{base.toLocaleString()}</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteResults;
