import React, { useState, useEffect } from "react";
import { X, Shield, Gift, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type BannerVariant = "default" | "promotional" | "post-delivery";

// This would typically come from a CMS or context
const CURRENT_BANNER_VARIANT = "promotional" as BannerVariant;

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("uniex-banner-dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("uniex-banner-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const renderContent = () => {
    switch (CURRENT_BANNER_VARIANT) {
      case "promotional":
        return (
          <div className="flex items-center justify-center gap-3 w-full">
            <Shield className="w-[14px] h-[14px] stroke-[#86EFAC]" />
            <p className="text-[13px] text-[#D1FAE5] whitespace-nowrap overflow-hidden text-ellipsis">
              <span className="text-white font-bold">Limited time</span>: Join Uniex Silver for ₹299 (was ₹499) — free packaging on every shipment, locked rates for 12 months.
            </p>
            <Link 
              to="/membership"
              className="bg-[#4CAF50] text-white text-[12px] font-medium px-[14px] py-[5px] rounded-[6px] hover:bg-[#43a047] transition-colors flex items-center gap-1 shrink-0"
            >
              Get deal <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        );
      case "post-delivery":
        return (
          <div className="flex items-center justify-center gap-3 w-full">
            <Gift className="w-[14px] h-[14px] text-[#86EFAC]" />
            <p className="text-[13px] text-[#D1FAE5]">
              Your parcel was delivered. Here's 10% off your next shipment — auto-applied at checkout.
            </p>
            <Link 
              to="/"
              className="bg-[#4CAF50] text-white text-[12px] font-medium px-[14px] py-[5px] rounded-[6px] hover:bg-[#43a047] transition-colors flex items-center gap-1 shrink-0"
            >
              Book again <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center gap-3 w-full">
            <Shield className="w-[14px] h-[14px] stroke-[#86EFAC]" />
            <p className="text-[13px] text-[#D1FAE5]">
              Member benefits: 5% off every shipment, free — just create an account.
            </p>
            <Link 
              to="/membership"
              className="bg-[#4CAF50] text-white text-[12px] font-medium px-[14px] py-[5px] rounded-[6px] hover:bg-[#43a047] transition-colors flex items-center gap-1 shrink-0"
            >
              Join free <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="h-[40px] bg-[#166534] flex items-center px-4 sticky top-0 z-[60] w-full border-b border-[#166534]/50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 flex justify-center overflow-hidden">
          {renderContent()}
        </div>
        <button 
          onClick={handleDismiss}
          className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0 ml-2"
          aria-label="Close announcement"
        >
          <X className="w-4 h-4 text-[#86EFAC]" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
