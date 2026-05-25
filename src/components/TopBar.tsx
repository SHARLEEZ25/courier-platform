import { Mail, Phone, X, Shield, Gift, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type BannerVariant = "default" | "promotional" | "post-delivery";

// Simulating CMS control (explicitly typed to fix inference lint)
const CURRENT_BANNER_VARIANT = "promotional" as BannerVariant;

const TopBar = () => {
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("courierpro-promo-dismissed");
    if (!isDismissed) {
      setShowPromo(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("courierpro-promo-dismissed", "true");
    setShowPromo(false);
  };

  const renderPromoContent = () => {
    switch (CURRENT_BANNER_VARIANT) {
      case "promotional":
        return (
          <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap">
            <Shield className="w-[14px] h-[14px] stroke-[#86EFAC] shrink-0" />
            <p className="text-[12px] md:text-[13px] text-[#D1FAE5]">
              <span className="text-white font-bold">Limited time</span>: Join Silver for ₹299 — free packaging & locked rates.
            </p>
            <Link 
              to="/membership"
              className="bg-[#4CAF50] text-white text-[11px] md:text-[12px] font-medium px-2.5 py-0.5 md:py-1 rounded-[6px] hover:bg-[#43a047] transition-colors flex items-center gap-1 shrink-0"
            >
              Get deal <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        );
      case "post-delivery":
        return (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Gift className="w-[14px] h-[14px] text-[#86EFAC] shrink-0" />
            <p className="text-[12px] md:text-[13px] text-[#D1FAE5]">
              10% off your next shipment — auto-applied at checkout.
            </p>
            <Link 
              to="/"
              className="bg-[#4CAF50] text-white text-[11px] md:text-[12px] font-medium px-3 py-1 rounded-[6px] hover:bg-[#43a047] transition-colors flex items-center gap-1 shrink-0"
            >
              Book again <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <Shield className="w-[14px] h-[14px] stroke-[#86EFAC] shrink-0" />
            <p className="text-[12px] md:text-[13px] text-[#D1FAE5]">
              Member benefits: 5% off every shipment, free.
            </p>
            <Link 
              to="/membership"
              className="bg-[#4CAF50] text-white text-[11px] md:text-[12px] font-medium px-3 py-1 rounded-[6px] hover:bg-[#43a047] transition-colors flex items-center gap-1 shrink-0"
            >
              Join free <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#2E6B1B] text-white transition-all duration-300" style={{ height: 44 }}>
      <div className="container h-full flex items-center justify-between text-[11px] md:text-[12.5px] font-medium">
        
        {/* Left: Contact Info */}
        <div className="flex items-center gap-4 shrink-0">
          <a href="mailto:support@courierpro.com" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">support@courierpro.com</span>
          </a>
          <span className="opacity-30">·</span>
          <a href="tel:+919600879666" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+91 9600879666</span>
          </a>
        </div>

        {/* Center: Promo (Visible on md screens and up) */}
        {showPromo && (
          <div className="hidden md:flex flex-1 justify-center items-center gap-3 px-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#86EFAC] shrink-0" />
              <span className="truncate max-w-[300px] lg:max-w-none">
                <span className="font-bold">Limited time</span>: Join Silver for ₹299 — free packaging & locked rates.
              </span>
            </div>
            <Link 
              to="/membership"
              className="bg-[#66BB6A] hover:bg-[#4CAF50] text-white px-3 py-1 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0"
            >
              Get deal <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Right: Secondary Links & Dismiss */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/get-quote" className="hover:opacity-80 transition-opacity">Get a Quote</Link>
            <span className="opacity-30">|</span>
            <Link to="/contact" className="hover:opacity-80 transition-opacity">Contact Us</Link>
          </div>
          
          {showPromo && (
            <button 
              onClick={handleDismiss} 
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
