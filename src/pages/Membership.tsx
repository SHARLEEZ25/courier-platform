import React, { useState, useMemo } from "react";
import { useMembershipPlans } from "@/hooks/useMembership";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Shield, Check, ChevronDown, ChevronRight, Clock, Globe, Users, CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import { cn } from "@/lib/utils";

const Membership = () => {
  const navigate = useNavigate();
  const [numShipments, setNumShipments] = useState(12);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: plans } = useMembershipPlans();
  const silverPlan = plans?.find((p) => p.id === "silver");
  const goldPlan   = plans?.find((p) => p.id === "gold");

  // Fallback to known values while plans are loading
  const silverPrice    = silverPlan?.price_inr    ?? 299;
  const goldPrice      = goldPlan?.price_inr      ?? 1499;
  const silverDiscount = silverPlan?.discount_pct ?? 0.10;
  const goldDiscount   = goldPlan?.discount_pct   ?? 0.15;

  const handleJoin = (planName: string, price: number, savingsAmt: number) => {
    navigate("/membership-checkout", { state: { planName, price, savings: savingsAmt } });
  };

  const savings = useMemo(() => {
    const avgValue = 1500;
    const silver = (numShipments * avgValue * silverDiscount) + (numShipments * 150) - silverPrice;
    const gold   = (numShipments * avgValue * goldDiscount)   + (numShipments * 350) + (numShipments * 199) - goldPrice;
    return {
      silver: Math.max(0, Math.round(silver)),
      gold:   Math.max(0, Math.round(gold))
    };
  }, [numShipments, silverPrice, goldPrice, silverDiscount, goldDiscount]);

  const faqs = [
    {
      q: "Can I cancel my membership anytime?",
      a: "Yes, full refund within 30 days. After 30 days runs until year end."
    },
    {
      q: "Does the discount apply to Express OBC shipments?",
      a: "Yes, all plans including OBC to all 220+ countries."
    },
    {
      q: "Can I upgrade from Silver to Gold mid-year?",
      a: "Yes, pay the difference ₹1,200. End date stays the same."
    },
    {
      q: "What is the locked rates benefit?",
      a: "Your rate stays frozen at joining date even if Uniex revises prices. Protected for 12 months."
    },
    {
      q: "Does free packaging apply to every shipment?",
      a: "Yes. Silver: free standard (₹150) every shipment. Gold: free premium (₹350) every shipment."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-grow pt-12 pb-24">
        <div className="container max-w-[900px] mx-auto px-6">
          
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] border border-[#BBF7D0] rounded-full text-[12px] font-medium text-[#166634] mb-6">
              <Shield className="w-3.5 h-3.5" />
              Uniex membership
            </div>
            <h1 className="text-[30px] font-medium leading-[1.2] text-[#111827] mb-4">
              Ship more. Pay less.<br />Every time.
            </h1>
            <p className="text-[15px] text-[#6B7280] max-w-[520px] mx-auto leading-relaxed">
              Join 3,200+ members saving on every international shipment from India.
            </p>
          </div>

          {/* Savings Calculator */}
          <div className="bg-[#F3F4F6] rounded-[12px] p-6 mb-16">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[13px] text-[#6B7280]">How many shipments do you send per year?</label>
              <span className="text-[15px] font-medium text-[#111827]">{numShipments} shipments</span>
            </div>
            <input 
              type="range"
              min="1"
              max="100"
              value={numShipments}
              onChange={(e) => setNumShipments(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white rounded-full appearance-none cursor-pointer accent-[#4CAF50] mb-8"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
              <div className="bg-transparent p-4 rounded-lg">
                <p className="text-[11px] font-medium uppercase text-[#9CA3AF] mb-1">No membership</p>
                <p className="text-[20px] font-medium text-[#9CA3AF]">₹0 saved</p>
                <p className="text-[11px] text-[#6B7280]">Guest price every time</p>
              </div>
              <div className="bg-white p-4 rounded-[12px] shadow-sm">
                <p className="text-[11px] font-medium uppercase text-[#166634] mb-1">Silver — ₹{silverPrice.toLocaleString("en-IN")}/yr</p>
                <p className="text-[20px] font-medium text-[#15803D]">₹{savings.silver.toLocaleString()} saved</p>
                <p className="text-[11px] text-[#6B7280]">After ₹{silverPrice.toLocaleString("en-IN")} membership fee</p>
              </div>
              <div className="bg-white p-4 rounded-[12px] shadow-sm border border-transparent">
                <p className="text-[11px] font-medium uppercase text-[#92400E] mb-1">Gold — ₹{goldPrice.toLocaleString("en-IN")}/yr</p>
                <p className="text-[20px] font-medium text-[#92400E]">₹{savings.gold.toLocaleString()} saved</p>
                <p className="text-[11px] text-[#6B7280]">After ₹{goldPrice.toLocaleString("en-IN")} membership fee</p>
              </div>
            </div>
          </div>

          {/* Tier Cards - Desktop Grid */}
          <div className="hidden md:grid grid-cols-3 items-stretch mb-16">
            {/* Member Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-l-[16px] border-r-0 p-[26px_22px_22px] flex flex-col">
              <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-[#9CA3AF] mb-1">MEMBER</p>
              <h2 className="text-[28px] font-medium text-[#111827] mb-2">Free</h2>
              <p className="text-[13px] text-[#6B7280] min-h-[40px] mb-6 leading-relaxed">
                Create an account and start saving instantly on every shipment.
              </p>
              <div className="h-px bg-[#F3F4F6] mb-6" />
              <ul className="space-y-[9px] mb-8 flex-grow">
                {[
                  "5% off every shipment",
                  "Shipment history saved — reorder in one click",
                  "WhatsApp tracking on every shipment",
                  "10% off coupon after every delivery",
                  "Birthday month bonus — extra 5% off one shipment"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[13px] text-[#4B5563]">
                    <div className="w-4 h-4 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#16A34A]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleJoin("Free", 0, 0)}
                className="w-full h-[48px] bg-[#F3F4F6] border border-[#E5E7EB] rounded-[10px] text-[13px] font-medium hover:bg-[#E5E7EB] transition-colors flex items-center justify-center gap-2"
              >
                Join free <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Silver Card (Featured) */}
            <div className="bg-white border-2 border-[#16A34A] rounded-[16px] -mx-[1px] p-[28px_22px_24px] relative z-10 flex flex-col shadow-xl">
              <div className="absolute -top-[13px] left-1/2 -translate-x-1/2 bg-[#16A34A] text-white text-[11px] font-medium px-4 py-0.5 rounded-full">
                Most popular
              </div>
              <p className="text-[11px] font-medium uppercase text-[#15803D] mb-1">SILVER</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[16px] font-medium text-[#15803D]">₹</span>
                <span className="text-[32px] font-medium text-[#15803D]">{silverPrice.toLocaleString("en-IN")}</span>
                <span className="text-[12px] text-[#9CA3AF]">/year</span>
              </div>
              <p className="text-[12px] text-[#9CA3AF] line-through mb-4">was ₹499</p>
              <p className="text-[13px] text-[#6B7280] min-h-[40px] mb-6 leading-relaxed">
                For parents and regular shippers. Pays for itself in your first shipment.
              </p>
              <div className="h-px bg-[#F3F4F6] mb-6" />
              <ul className="space-y-[9px] mb-8 flex-grow">
                {[
                  { text: <span>Everything in Member</span>, bold: false },
                  { text: <span><span className="font-bold">{Math.round(silverDiscount * 100)}%</span> off every shipment</span>, bold: true },
                  { text: <span>Free standard packaging — saves ₹150 per shipment</span>, bold: false },
                  { text: <span>Priority pickup — guaranteed next-day slot</span>, bold: false },
                  { text: <span>Rates locked for 12 months</span>, bold: false },
                  { text: <span>Dedicated WhatsApp support line</span>, bold: false }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[13px] text-[#4B5563]">
                    <div className="w-4 h-4 rounded-full bg-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleJoin("Silver", silverPrice, savings.silver)}
                className="w-full h-[48px] bg-[#16A34A] text-white rounded-[10px] text-[13px] font-medium hover:bg-[#15803D] transition-colors flex items-center justify-center gap-2"
              >
                Get Silver — ₹{silverPrice.toLocaleString("en-IN")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Gold Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-r-[16px] border-l-0 p-[26px_22px_22px] flex flex-col">
              <p className="text-[11px] font-medium uppercase tracking-[0.07em] text-[#92400E] mb-1">GOLD</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[16px] font-medium text-[#92400E]">₹</span>
                <span className="text-[32px] font-medium text-[#92400E]">{goldPrice.toLocaleString("en-IN")}</span>
                <span className="text-[12px] text-[#9CA3AF]">/year</span>
              </div>
              <p className="text-[13px] text-[#6B7280] min-h-[40px] mb-6 leading-relaxed">
                For exporters and high-frequency shippers. Pays back in one shipment.
              </p>
              <div className="h-px bg-[#F3F4F6] mb-6" />
              <ul className="space-y-[9px] mb-8 flex-grow">
                {[
                  { text: <span>Everything in Silver</span>, bold: false },
                  { text: <span><span className="font-bold">{Math.round(goldDiscount * 100)}%</span> off every shipment</span>, bold: true },
                  { text: <span>Free premium packaging — saves ₹350 per shipment</span>, bold: false },
                  { text: <span>Free insurance on every shipment — saves ₹199</span>, bold: false },
                  { text: <span>Dedicated account manager</span>, bold: false },
                  { text: <span>Monthly billing — ship now, pay on the 1st</span>, bold: false }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-[13px] text-[#4B5563]">
                    <div className="w-4 h-4 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#16A34A]" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleJoin("Gold", goldPrice, savings.gold)}
                className="w-full h-[48px] bg-white border-[1.5px] border-[#16A34A] text-[#15803D] rounded-[10px] text-[13px] font-medium hover:bg-[#F0FDF4] transition-colors flex items-center justify-center gap-2"
              >
                Get Gold — ₹1,499 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Tier Cards */}
          <div className="md:hidden space-y-6 mb-16">
            {/* Silver (Featured first on mobile) */}
            <div className="bg-white border-2 border-[#16A34A] rounded-[16px] p-6 shadow-lg">
              <div className="inline-block bg-[#16A34A] text-white text-[10px] font-medium px-3 py-0.5 rounded-full mb-4">
                Most popular
              </div>
              <p className="text-[11px] font-medium uppercase text-[#15803D] mb-1">SILVER</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[16px] font-medium text-[#15803D]">₹</span>
                <span className="text-[28px] font-medium text-[#15803D]">299</span>
                <span className="text-[12px] text-[#9CA3AF]">/year</span>
              </div>
              <ul className="space-y-3 mb-6">
                {[ "10% off every shipment", "Free standard packaging", "Priority pickup" ].map((item, idx) => (
                   <li key={idx} className="flex items-center gap-2 text-[13px] text-[#4B5563]">
                     <Check className="w-4 h-4 text-[#16A34A]" /> {item}
                   </li>
                ))}
              </ul>
              <button 
                onClick={() => handleJoin("Silver", 299, savings.silver)}
                className="w-full h-[48px] bg-[#16A34A] text-white rounded-[10px] font-medium"
              >
                Get Silver
              </button>
            </div>

            {/* Member */}
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6">
              <p className="text-[11px] font-medium uppercase text-[#9CA3AF] mb-1">MEMBER</p>
              <h2 className="text-[24px] font-medium mb-4">Free</h2>
              <button 
                onClick={() => handleJoin("Free", 0, 0)}
                className="w-full h-[48px] bg-[#F3F4F6] text-[#111827] rounded-[10px] font-medium"
              >
                Join free
              </button>
            </div>

            {/* Gold */}
            <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-6">
              <p className="text-[11px] font-medium uppercase text-[#92400E] mb-1">GOLD</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-[16px] font-medium text-[#92400E]">₹</span>
                <span className="text-[28px] font-medium text-[#92400E]">1,499</span>
                <span className="text-[12px] text-[#9CA3AF]">/year</span>
              </div>
              <button 
                onClick={() => handleJoin("Gold", goldPrice, savings.gold)}
                className="w-full h-[48px] bg-white border border-[#16A34A] text-[#16A34A] rounded-[10px] font-medium"
              >
                Get Gold
              </button>
            </div>
          </div>

          {/* Full Comparison Table */}
          <div className="mb-24">
            <h2 className="text-[16px] font-medium text-center mb-8">Full comparison</h2>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <th className="text-left py-4 px-4 font-medium uppercase tracking-wider text-[11px] text-[#6B7280]">Feature</th>
                    <th className="text-center py-4 px-4 font-medium uppercase tracking-wider text-[11px] text-[#6B7280]">Member</th>
                    <th className="text-center py-4 px-4 font-medium uppercase tracking-wider text-[11px] text-[#166634]">Silver</th>
                    <th className="text-center py-4 px-4 font-medium uppercase tracking-wider text-[11px] text-[#92400E]">Gold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {[
                    { f: "Shipment discount", m: "5%", s: "10%", g: "15%", sc: "#15803D", gc: "#92400E" },
                    { f: "Packaging", m: "—", s: "Free standard", g: "Free premium", sc: "#15803D", gc: "#92400E" },
                    { f: "Insurance", m: "—", s: "—", g: "Free every shipment", sc: "#D1D5DB", gc: "#92400E" },
                    { f: "Priority pickup", m: "—", s: true, g: true },
                    { f: "Locked rates (12 months)", m: "—", s: true, g: true },
                    { f: "WhatsApp tracking", m: true, s: true, g: true },
                    { f: "Dedicated support line", m: "—", s: true, g: true },
                    { f: "Account manager", m: "—", s: "—", g: true },
                    { f: "Monthly billing", m: "—", s: "—", g: true },
                    { f: "Post-delivery 10% coupon", m: true, s: true, g: true },
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-transparent"}>
                      <td className="py-4 px-4 text-[#4B5563]">{row.f}</td>
                      <td className="py-4 px-4 text-center">
                        {row.m === true ? <Check className="w-4 h-4 mx-auto text-[#16A34A]" /> : <span className="text-[#D1D5DB]">{row.m}</span>}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.s === true ? <Check className="w-4 h-4 mx-auto text-[#16A34A]" /> : <span className={cn(row.sc ? `text-[${row.sc}] font-medium` : "text-[#D1D5DB]")} style={{ color: row.sc }}>{row.s}</span>}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.g === true ? <Check className="w-4 h-4 mx-auto text-[#16A34A]" /> : <span className={cn(row.gc ? `text-[${row.gc}] font-medium` : "text-[#D1D5DB]")} style={{ color: row.gc }}>{row.g}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-24">
            <h2 className="text-[16px] font-medium text-center mb-8">Frequently asked questions</h2>
            <div className="border-t border-[#E5E7EB]">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-[#E5E7EB]">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between py-4 text-left group"
                  >
                    <span className="text-[14px] text-[#111827] group-hover:text-[#16A34A] transition-colors">{faq.q}</span>
                    <ChevronDown className={cn("w-4 h-4 text-[#9CA3AF] transition-transform duration-300", openFaq === idx && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-4 text-[13px] text-[#6B7280] leading-relaxed">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Bar */}
          <div className="pt-12 border-t border-[#E5E7EB] flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {[
              { icon: Clock, text: "18+ years in business" },
              { icon: Globe, text: "220+ countries" },
              { icon: Users, text: "3,200+ members" },
              { icon: CheckCircle2, text: "Cancel anytime" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[12px] text-[#9CA3AF]">
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Membership;
