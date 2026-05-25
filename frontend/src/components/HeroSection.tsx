import { motion } from "framer-motion";
import { Plane, Box, ShoppingBag, GraduationCap, Briefcase, Star, ShieldCheck, MessageSquare, Globe, Zap, Check } from "lucide-react";
import ShippingRateCalculator from "./ShippingRateCalculator";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  onCalculate: (data: any) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onCalculate }) => {
  return (
    <section className="relative bg-[#F9FAFB] overflow-hidden border-b border-gray-100" id="hero">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative pt-8 pb-16 lg:pt-12 lg:pb-24 flex flex-col items-center text-center">
        
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#f0f9f1] border border-[#e2f2e5] text-[12px] sm:text-[13px] font-medium text-[#2d6a3e] shadow-sm">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#166534]" />
              <span>18 years</span>
            </div>
            <div className="w-px h-4 bg-[#d4e9d7] hidden sm:block" />
            <div>
              <span>50,000 + shipments delivered</span>
            </div>
            <div className="w-px h-4 bg-[#d4e9d7] hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span>No calls needed</span>
            </div>
          </div>
        </motion.div>

        {/* Heading Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-[850px] mb-6"
        >
          <h1 className="text-[28px] sm:text-[38px] lg:text-[56px] font-black text-brand-black leading-[1.05] tracking-[-0.04em] mb-4">
            Global Shipping.<br />
            <span className="text-green-primary">Instant Prices.</span>
          </h1>
          <p className="text-base md:text-[17px] text-brand-gray leading-relaxed max-w-[650px] mx-auto opacity-80">
            Compare rates from DHL, FedEx, Aramex & UPS in 30 seconds. <br className="hidden md:block" />
            Door-to-door from India to 220+ countries.
          </p>
        </motion.div>
        
        {/* Service Tabs (Skyscanner Style) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full sm:w-auto mb-4 overflow-x-auto scrollbar-hide"
        >
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 w-max mx-auto">
            {[
              { id: 'intl', label: 'International', icon: Plane },
              { id: 'cargo', label: 'Heavy Cargo', icon: Box },
              { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
              { id: 'student', label: 'Student Docs', icon: GraduationCap },
              { id: 'business', label: 'Business', icon: Briefcase },
            ].map((tab) => (
              <button
                key={tab.id}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                  tab.id === 'intl'
                    ? "bg-green-50 text-green-primary"
                    : "text-gray-500 hover:text-green-primary hover:bg-green-50/50"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Mobile Calculator (sidebar card form) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:hidden w-full relative z-20 mb-4"
        >
          <ShippingRateCalculator variant="sidebar" onCalculate={onCalculate} />
        </motion.div>

        {/* Desktop Calculator (horizontal pill bar) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block w-full relative z-20 mb-6"
        >
          <ShippingRateCalculator variant="horizontal" onCalculate={onCalculate} />
        </motion.div>


        {/* Feature Grid Container */}
        <div className="w-full max-w-6xl mx-auto mb-10">
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
              {[
                { label: "Rates shown instantly — no calls needed", icon: ShieldCheck },
                { label: "Track on WhatsApp — no app needed", icon: MessageSquare },
                { label: "220+ countries · door-to-door pickup", icon: Globe },
                { label: "University Express — save 50%+", icon: Zap }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-green-50/50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-all">
                    <item.icon className="w-6 h-6 text-green-primary opacity-70" />
                  </div>
                  <span className="text-[14px] lg:text-[15px] font-bold text-slate-600 leading-tight text-left">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shipped Via */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Shipped Via</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: "DHL", style: "bg-[#FFCC00]/5 text-[#D40511] border-[#FFCC00]/20" },
              { name: "FedEx", style: "bg-[#4D148C]/5 text-[#4D148C] border-[#4D148C]/10" },
              { name: "Aramex", style: "bg-[#DA291C]/5 text-[#DA291C] border-[#DA291C]/10" },
              { name: "UPS", style: "bg-[#351C15]/5 text-[#351C15] border-[#351C15]/10" }
            ].map((carrier) => (
              <div 
                key={carrier.name} 
                className={cn(
                  "px-6 py-1.5 rounded-lg font-bold text-[12px] border transition-all cursor-default hover:bg-white hover:shadow-sm", 
                  carrier.style
                )}
              >
                {carrier.name}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-green-100/30 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-green-100/30 rounded-full blur-[100px] -z-10" />
    </section>
  );
};

export default HeroSection;
