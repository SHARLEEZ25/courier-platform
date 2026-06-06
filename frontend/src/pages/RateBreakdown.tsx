import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useRates } from "@/hooks/useRates";
import { useDebounce } from "@/hooks/useDebounce";
import { usePincode } from "@/hooks/usePincode";
import { useCreateBooking } from "@/hooks/useBooking";
import type { ItemType, CarrierSlug } from "@/types/api";
import {
  ArrowLeft,
  Lock,
  Info,
  AlertTriangle,
  CheckCircle2,
  User,
  Calendar,
  Clock,
  Package,
  CreditCard,
  ChevronRight,
  RotateCcw,
  FileText,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";

// Multi-step definitions
const STEPS = [
  { id: 1, label: "Customize" },
  { id: 2, label: "Checkout" }
];

const POPULAR_BANKS = [
  { id: 'sbi', name: 'SBI', icon: 'https://www.sbi.co.in/o/sbi-base-theme/images/favicon.ico' },
  { id: 'hdfc', name: 'HDFC', icon: 'https://www.hdfcbank.com/content/api/contentstream-id/723fb80a-2dde-42a3-9793-7ae1be57c87f/27181fbd-38c2-484d-a56e-827d091b65b6?' },
  { id: 'icici', name: 'ICICI', icon: 'https://www.icicibank.com/assets/images/favicon.ico' },
  { id: 'axis', name: 'Axis', icon: 'https://www.axisbank.com/assets/images/favicon.ico' },
  { id: 'kotak', name: 'Kotak', icon: 'https://www.kotak.com/etc/designs/common-design/favicon.ico' },
  { id: 'pnb', name: 'PNB', icon: 'https://www.pnbindia.in/favicon.ico' },
  { id: 'bob', name: 'BOB', icon: 'https://www.bankofbaroda.in/favicon.ico' },
  { id: 'yes', name: 'Yes Bank', icon: 'https://www.yesbank.in/favicon.ico' },
  { id: 'idfc', name: 'IDFC', icon: 'https://www.idfcfirstbank.com/favicon.ico' },
];

const COUNTRY_DIAL_CODE: Record<string, string> = {
  "India": "+91",
  "USA": "+1",
  "Canada": "+1",
  "UK": "+44",
  "Australia": "+61",
  "New Zealand": "+64",
  "Germany": "+49",
  "France": "+33",
  "Netherlands": "+31",
  "Italy": "+39",
  "Spain": "+34",
  "UAE": "+971",
  "Saudi Arabia": "+966",
  "Qatar": "+974",
  "Kuwait": "+965",
  "Bahrain": "+973",
  "Oman": "+968",
  "Singapore": "+65",
  "Malaysia": "+60",
  "Hong Kong": "+852",
  "Japan": "+81",
  "South Korea": "+82",
  "China": "+86",
  "South Africa": "+27",
  "Nigeria": "+234",
  "Kenya": "+254",
  "Sweden": "+46",
  "Norway": "+47",
  "Denmark": "+45",
  "Switzerland": "+41",
  "Belgium": "+32",
  "Ireland": "+353",
  "Portugal": "+351",
  "Austria": "+43",
  "Thailand": "+66",
  "Brazil": "+55",
};

const COUNTRY_LABELS: Record<string, string> = {
  USA: "United States",
  UK: "United Kingdom",
  UAE: "United Arab Emirates",
};

const ITEM_LABELS: Record<string, string> = {
  university: "University Express",
  excess: "Excess Baggage Express",
  docs: "Document & Parcels",
  food: "Food Products Express",
  medicine: "Medicine Courier",
  clothing: "Clothing & Fashion",
  electronics: "Electronics",
  jewellery: "Jewellery",
  cosmetics: "Cosmetics",
  gifts: "Gifts",
  sports: "Sports Equipment",
  pooja: "Pooja Items",
  commercial: "Export Express",
  other: "Other",
};

const RateBreakdown = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || { preselectedCarrier: null, origin: "Chennai, India", destination: "United Kingdom", weight: 2.5, itemType: "university", dims: undefined };

  const [actualWeight, setActualWeight] = useState<number>(Number(state.weight) || 2.5);
  const [dims, setDims] = useState<{ l: string, w: string, h: string }>(
    state.dims ? { l: String(state.dims.l), w: String(state.dims.w), h: String(state.dims.h) } : { l: "", w: "", h: "" }
  );
  const [shipmentType, setShipmentType] = useState<"document" | "package">("package");
  const [dhlService, setDhlService] = useState<"standard" | "premium_900" | "premium_1200">("standard");
  const [upsOptions, setUpsOptions] = useState({ formalClearance: false, ddp: false, signature: false });
  const [selectedPlanId, setSelectedPlanId] = useState<CarrierSlug | null>(state.preselectedCarrier ?? null);
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutSubStep, setCheckoutSubStep] = useState(1); // 1: Sender, 2: Receiver, 3: Customs, 4: Payment
  const [direction, setDirection] = useState(0); // For sliding animations

  const [pickupPincode, setPickupPincode] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [submitError, setSubmitError] = useState("");

  // ── Live Calculation Engine (Matches Backend PDF Rules) ─────────────────────
  const parsedDims = dims.l && dims.w && dims.h
    ? { l: parseFloat(dims.l), w: parseFloat(dims.w), h: parseFloat(dims.h) }
    : undefined;

  const volumetricWeight = parsedDims ? (parsedDims.l * parsedDims.w * parsedDims.h) / 5000 : 0;
  
  // Base chargeable: Max of actual or volumetric, rounded to nearest 0.5kg
  const baseChargeable = Math.ceil(Math.max(actualWeight, volumetricWeight) * 2) / 2;

  // UPS Girth Rule: L + 2W + 2H
  const girthCm = parsedDims ? parsedDims.l + 2 * (parsedDims.w + parsedDims.h) : 0;

  // Carrier-specific local chargeable weight
  // This updates INSTANTLY as user types, before API responds.
  const localChargeableWeight = selectedPlanId === 'ups' && girthCm > 300 
    ? Math.max(baseChargeable, 40) 
    : baseChargeable;

  // Status flags for UI
  const isUpsOversize = selectedPlanId === 'ups' && girthCm > 400;
  const isUpsGirthMinApplied = selectedPlanId === 'ups' && girthCm > 300 && baseChargeable < 40;

  // ── Debounced Rate Request ──────────────────────────────────────────────────
  const rateRequest = {
    origin: state.origin,
    destination: state.destination,
    weight: actualWeight,
    dims: parsedDims,
    shipmentType,
    dhlService,
    upsOptions,
    carrier: selectedPlanId,
    itemType: state.itemType
  };

  const debouncedRequest = useDebounce(rateRequest, 500);

  const { data: rates, isLoading: ratesLoading } = useRates(
    state.destination ? debouncedRequest : null
  );

  // Carrier-adaptive weight slider max (per 2026 PDFs)
  const CARRIER_WEIGHT_MAX: Record<string, number> = {
    dhl: 300,  // DHL rate cards cover heavy freight up to 300 kg practically
    fedex: 70,  // FedEx step table ends at 70.5 kg
    ups: 70,  // UPS hard cap per UPS 2026 PDF
  };
  const sliderMax = selectedPlanId ? (CARRIER_WEIGHT_MAX[selectedPlanId] ?? 70) : 70;

  // Shipment type labels and document rate cutoffs per carrier (2026 PDFs)
  const SHIPMENT_TYPE_LABELS: Record<string, { doc: string; pkg: string; cutoffKg: number }> = {
    dhl: { doc: "Documents", pkg: "Parcel", cutoffKg: 2.0 },
    fedex: { doc: "Pak (Documents)", pkg: "Package", cutoffKg: 2.5 },
    ups: { doc: "Documents", pkg: "Package", cutoffKg: 5.0 },
  };
  const carrierTypeLabels = selectedPlanId ? (SHIPMENT_TYPE_LABELS[selectedPlanId] ?? { doc: "Documents", pkg: "Package", cutoffKg: 2.0 }) : { doc: "Documents", pkg: "Package", cutoffKg: 2.0 };
  
  // Use localChargeableWeight for immediate UI response
  const docCutoffExceeded = shipmentType === "document" && localChargeableWeight > carrierTypeLabels.cutoffKg;

  // Carrier service label for identity banner
  const CARRIER_SERVICE: Record<string, string> = {
    dhl: "Express Worldwide",
    fedex: "International Priority",
    ups: "Worldwide Express",
  };

  // What each carrier includes by default (shown in service highlights section)
  const CARRIER_INCLUDES: Record<string, string[]> = {
    dhl: [
      "Door-to-door customs clearance by DHL",
      "Real-time shipment tracking",
      "Digital Proof of Delivery",
      "220+ countries · 24/7 support",
    ],
    fedex: [
      "Customs clearance handled by FedEx",
      "Door-to-door delivery to 220+ countries",
      "Real-time tracking with delivery notifications",
      "Priority handling in FedEx's global network",
    ],
    ups: [
      "Door-to-door delivery with full tracking",
      "Informal customs clearance included",
      "Real-time tracking · Delivery notifications",
    ],
  };

  const { data: pincodeData, isLoading: pincodeLoading } = usePincode(pickupPincode);
  const { mutate: createBooking, isPending: isProcessing } = useCreateBooking();


  // Auto-select first carrier when rates load or if preselected not in results
  useEffect(() => {
    if (rates?.length) {
      if (!selectedPlanId || !rates.find(r => r.carrier === selectedPlanId)) {
        setSelectedPlanId(rates[0].carrier);
      }
    }
  }, [rates]);

  // Derived values
  const selectedRate = rates?.find(r => r.carrier === selectedPlanId) ?? rates?.[0] ?? null;
  const pickupCity = pincodeData?.city ?? "";
  const receiverDialCode = COUNTRY_DIAL_CODE[state.destination] ?? "+";
  const total = selectedRate?.totalInr ?? 0;
  const packagingInr = selectedRate?.packagingInr ?? 0;
  const insuranceInr = selectedRate?.insuranceInr ?? 0;
  const shippingCharge = total - packagingInr - insuranceInr - (selectedRate?.pickupSurchargeInr ?? 0);

  const validateCheckoutSubStep = (step: number) => {
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedPlanId && selectedRate) {
        navigate("/booking", {
          state: {
            origin: state.origin,
            destination: state.destination,
            weight: actualWeight,
            itemType: state.itemType,
            carrier: selectedPlanId,
            plan: CARRIER_SERVICE[selectedPlanId] || "Standard",
            totalPrice: total,
            packaging: "none",
            insurance: false,
            pickupSurcharge: selectedRate.pickupSurchargeInr || 0,
            pickupCity: pickupCity,
            pickupPincode: pickupPincode,
            estimatedDelivery: selectedRate.estimatedDeliveryDays + " days",
            dhlService,
            upsOptions,
            rateDetails: selectedRate,
          }
        });
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white text-brand-black flex flex-col font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-grow bg-slate-50/50 pt-6 pb-12">
        <div className="container max-w-[1200px] mx-auto px-4 md:px-8">

          {/* Shipment Context Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="bg-white p-2 rounded-lg border border-slate-200 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[13px] shadow-sm">
                To <strong className="text-brand-black ml-1 uppercase">{COUNTRY_LABELS[state.destination] ?? state.destination}</strong>
              </span>
              <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[13px] shadow-sm">
                Item: <strong className="text-brand-black ml-1">{ITEM_LABELS[state.itemType] || state.itemType}</strong>
              </span>
              <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[13px] shadow-sm hidden md:inline-block">
                From: <strong className="text-brand-black ml-1">{state.origin}</strong>
              </span>
            </div>

            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 text-slate-400 hover:text-green-primary transition-all font-medium text-[13px] bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm self-start md:self-auto"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Edit details
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-12 relative px-4 max-w-[800px] mx-auto pt-6">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-200 -translate-y-1/2 z-0" />
            {STEPS.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-slate-50 px-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  currentStep > step.id ? "bg-green-primary border-green-primary text-white" :
                    currentStep === step.id ? "bg-white border-green-primary text-brand-black" :
                      "bg-white border-slate-200 text-slate-400"
                )}>
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className={cn(
                  "text-[12px] font-semibold whitespace-nowrap",
                  currentStep >= step.id ? "text-brand-black" : "text-slate-400"
                )}>{step.label}</span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl md:text-[32px] font-bold text-brand-black mb-2 tracking-tight">Customise your shipment</h1>
                  <p className="text-slate-500">Fine-tune the details — your rate updates as you go</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* LEFT COLUMN: Controls */}
                  <div className="lg:col-span-7 xl:col-span-7 space-y-6">

                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-8 shadow-sm">

                      {/* Item Specific Banners */}
                      {state.itemType === "university" && (
                        <div className="flex gap-3 bg-[#e8f5e9]/10 border border-[#4ade80]/30 rounded-lg p-4 text-[#4ade80] text-sm leading-relaxed shadow-sm">
                          <Info className="w-5 h-5 shrink-0" />
                          <div><span className="font-bold">University Express</span> — Save up to 50% vs standard rates. Tracked end to end.</div>
                        </div>
                      )}
                      {state.itemType === "food" && (
                        <div className="flex gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-500 text-sm leading-relaxed shadow-sm">
                          <AlertTriangle className="w-5 h-5 shrink-0" />
                          <div><span className="font-bold">Dry & packaged items only.</span> No perishables. Vacuum sealing available — select Premium box below.</div>
                        </div>
                      )}
                      {state.itemType === "excess" && (
                        <div className="flex gap-3 bg-[#e8f5e9]/10 border border-[#4ade80]/30 rounded-lg p-4 text-[#4ade80] text-sm leading-relaxed shadow-sm">
                          <Info className="w-5 h-5 shrink-0" />
                          <div><span className="font-bold">Excess Baggage</span> — Up to 60% cheaper than airline excess fees.</div>
                        </div>
                      )}
                      {state.itemType === "commercial" && (
                        <div className="flex gap-3 bg-[#e8f5e9]/10 border border-[#4ade80]/30 rounded-lg p-4 text-[#4ade80] text-sm leading-relaxed shadow-sm">
                          <CheckCircle2 className="w-5 h-5 shrink-0" />
                          <div><span className="font-bold">Export Express</span> — Full customs documentation support included.</div>
                        </div>
                      )}

                      {/* Carrier identity banner */}
                      {selectedPlanId && (
                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-green-primary inline-block" />
                          {selectedRate?.carrierName ?? selectedPlanId.toUpperCase()} · {CARRIER_SERVICE[selectedPlanId] ?? "Express"}
                        </div>
                      )}

                      {/* Shipment Type Toggle */}
                      <div>
                        <h3 className="text-sm font-bold text-brand-black mb-3">What are you sending?</h3>
                        <div className="flex flex-wrap gap-3 mb-2">
                          {[
                            { id: "document" as const, label: carrierTypeLabels.doc },
                            { id: "package" as const, label: carrierTypeLabels.pkg },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setShipmentType(t.id)}
                              className={cn(
                                "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                                shipmentType === t.id
                                  ? "bg-green-primary/10 border-green-primary text-green-primary"
                                  : "bg-transparent border-slate-200 text-slate-500 hover:border-slate-400"
                              )}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                        {shipmentType === "document" && (
                          <p className={cn(
                            "text-[11px] mt-1 flex items-center gap-1.5",
                            docCutoffExceeded ? "text-amber-600 font-medium" : "text-slate-400"
                          )}>
                            {docCutoffExceeded && <AlertTriangle className="w-3.5 h-3.5" />}
                            {selectedPlanId === "dhl" && `Document rate: Up to 2.0 kg. (Current: ${localChargeableWeight} kg)`}
                            {selectedPlanId === "fedex" && `Pak rate: Up to 2.5 kg. (Current: ${localChargeableWeight} kg)`}
                            {selectedPlanId === "ups" && `Document rate: Up to 5.0 kg. (Current: ${localChargeableWeight} kg)`}
                            {docCutoffExceeded && " — Package rates applied."}
                          </p>
                        )}
                      </div>

                      {/* Weight Section */}
                      <div>
                        <div className="flex justify-between items-end mb-4">
                          <h3 className="text-base font-bold text-brand-black">Weight & Dimensions</h3>
                          <div className="flex flex-col items-end">
                            <div className="text-xl font-bold text-green-primary">
                              {actualWeight}<span className="text-sm font-normal text-slate-400 ml-1">kg</span>
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Actual Weight</div>
                          </div>
                        </div>

                        <div className="relative mb-6">
                          <input
                            type="range"
                            min="0.5"
                            max={sliderMax}
                            step="0.5"
                            value={actualWeight}
                            onChange={(e) => setActualWeight(Number(e.target.value))}
                            className="w-full accent-green-primary h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
                            <span>0.5 kg</span>
                            <span>{sliderMax} kg</span>
                          </div>
                        </div>
                        {selectedPlanId === 'dhl' && actualWeight > 70 && (
                          <p className="text-[11px] text-slate-400 -mt-4 mb-4">Heavier shipments use per-kg band pricing — your rate reflects the correct band.</p>
                        )}

                        {/* Dimensions Input */}
                        <div className="mb-4">
                          <label className="text-[12px] font-bold text-slate-500 uppercase mb-2 block">Package Dimensions (cm) — Optional</label>
                          <div className="flex gap-3">
                            <Input type="number" placeholder="Length" value={dims.l} onChange={(e) => setDims({ ...dims, l: e.target.value })} className="h-10 text-center" />
                            <Input type="number" placeholder="Width" value={dims.w} onChange={(e) => setDims({ ...dims, w: e.target.value })} className="h-10 text-center" />
                            <Input type="number" placeholder="Height" value={dims.h} onChange={(e) => setDims({ ...dims, h: e.target.value })} className="h-10 text-center" />
                          </div>
                          {/* Carrier-specific dimension validation & Live Math */}
                          <div className="space-y-2 mt-3">
                            {parsedDims && (
                              <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between items-center text-[11px]">
                                  <span className="text-slate-500 font-medium">Volumetric Math</span>
                                  <span className="text-slate-400">({parsedDims.l} × {parsedDims.w} × {parsedDims.h}) / 5000</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Volumetric Weight</span>
                                  <span className="text-[13px] font-bold text-brand-black">{volumetricWeight.toFixed(2)} kg</span>
                                </div>
                                
                                {selectedPlanId === 'ups' && (
                                  <div className="pt-2 border-t border-slate-200">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">UPS Girth</span>
                                      <span className={cn(
                                        "text-[13px] font-bold",
                                        girthCm > 400 ? "text-red-500" : girthCm > 300 ? "text-amber-600" : "text-brand-black"
                                      )}>
                                        {Math.round(girthCm)} cm
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight">Formula: L + 2W + 2H</p>
                                    
                                    {isUpsGirthMinApplied && (
                                      <p className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Min 40 kg applied (Girth &gt; 300)
                                      </p>
                                    )}
                                    {isUpsOversize && (
                                      <p className="text-[10px] text-red-500 font-semibold mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Oversize fee applies (Girth &gt; 400)
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {selectedPlanId === 'dhl' && parsedDims && parsedDims.l > 300 && (
                              <div className="flex gap-2 p-2 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[11px]">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Length exceeds DHL's 300 cm limit. Please adjust or contact support.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-green-primary/5 rounded-lg p-4 flex justify-between items-center border border-green-primary/20 mt-2 shadow-sm">
                          <div className="text-[13px] font-bold text-green-primary uppercase tracking-wider">Chargeable Weight</div>
                          <div className="text-lg font-bold text-green-primary">{localChargeableWeight} kg</div>
                        </div>
                      </div>

                      {/* DHL Time-Definite Delivery — only when DHL is selected */}
                      {selectedPlanId === 'dhl' && (
                        <div>
                          <h3 className="text-sm font-bold text-brand-black mb-3">DHL Time-Definite Delivery</h3>
                          <div className="flex flex-wrap gap-3 mb-2">
                            {[
                              { id: "standard", label: "Standard" },
                              { id: "premium_1200", label: "By 12:00 +₹1,000" },
                              { id: "premium_900", label: "By 9:00 +₹3,000" },
                            ].map((s) => (
                              <button
                                key={s.id}
                                onClick={() => setDhlService(s.id as typeof dhlService)}
                                className={cn(
                                  "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                                  dhlService === s.id
                                    ? "bg-green-primary/10 border-green-primary text-green-primary"
                                    : "bg-transparent border-slate-200 text-slate-500 hover:border-slate-400"
                                )}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                          <p className="text-[12px] text-slate-400">Guaranteed delivery to your consignee's door by the selected time, as per DHL Express service agreement.</p>
                          {/* DHL included services strip */}
                          {CARRIER_INCLUDES.dhl && (
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 mt-3">
                              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Included with DHL Express</p>
                              <ul className="space-y-1">
                                {CARRIER_INCLUDES.dhl.map((item) => (
                                  <li key={item} className="flex items-center gap-2 text-[12px] text-slate-600">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-primary shrink-0" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* FedEx — what's included info panel (no configurable add-ons) */}
                      {selectedPlanId === 'fedex' && (
                        <div>
                          <h3 className="text-sm font-bold text-brand-black mb-3">What FedEx IP includes</h3>
                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                            <ul className="space-y-1.5">
                              {(CARRIER_INCLUDES.fedex ?? []).map((item) => (
                                <li key={item} className="flex items-center gap-2 text-[12px] text-slate-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-primary shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                            <p className="text-[11px] text-slate-400 mt-3">No additional options to configure — FedEx International Priority is a complete door-to-door service.</p>
                          </div>
                        </div>
                      )}

                      {/* UPS Service Options — only when UPS is selected */}
                      {selectedPlanId === 'ups' && (
                        <div>
                          <h3 className="text-sm font-bold text-brand-black mb-3">UPS Service Options</h3>
                          {actualWeight > 70 && (
                            <div className="text-[12px] text-red-500 mb-3 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              UPS does not accept single packages over 70 kg (per UPS terms). Please reduce weight or select DHL / FedEx.
                            </div>
                          )}
                          <p className="text-[11px] text-slate-400 mb-3">Optional services charged at booking — all rates per UPS 2026 agreement.</p>
                          <div className="space-y-3">
                            {[
                              { key: "formalClearance", label: "Formal clearance by UPS", sub: "+₹3,150" },
                              { key: "ddp", label: "DDP delivery (duties prepaid)", sub: "+₹1,050 · duty & VAT charged at destination" },
                              { key: "signature", label: "Signature on delivery", sub: "+₹368" },
                            ].map(({ key, label, sub }) => (
                              <label key={key} className="flex items-start gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={upsOptions[key as keyof typeof upsOptions]}
                                  onChange={(e) => setUpsOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                                  className="mt-0.5 accent-green-600"
                                />
                                <span>
                                  <span className="text-[13px] font-medium text-brand-black">{label}</span>
                                  <span className="text-[11px] text-slate-400 ml-2">{sub}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                          {state.destination === 'USA' && (
                            <p className="text-[11px] text-slate-500 mt-3">
                              US Inbound Surcharge: +₹230 per shipment — applied automatically for USA destinations.
                            </p>
                          )}
                          {/* UPS included by default */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Included by default</p>
                            <ul className="space-y-1">
                              {(CARRIER_INCLUDES.ups ?? []).map((item) => (
                                <li key={item} className="flex items-center gap-2 text-[12px] text-slate-600">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-primary shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Pickup Pincode */}
                      <div>
                        <h3 className="text-sm font-bold text-brand-black mb-3">Your pickup pincode</h3>
                        <div className="flex gap-3 max-w-[300px] mb-2">
                          <Input
                            type="text"
                            placeholder="Enter 6-digit pincode"
                            value={pickupPincode}
                            maxLength={6}
                            onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, ""))}
                            className="bg-white border-slate-200 text-brand-black placeholder:text-slate-400 focus-visible:ring-green-primary rounded"
                          />
                        </div>
                        {pickupPincode.length === 6 && pincodeLoading && (
                          <div className="text-[13px] text-slate-400">Checking pincode…</div>
                        )}
                        {pickupPincode.length === 6 && !pincodeLoading && pincodeData?.serviceable && (
                          <div className={cn("text-[13px] font-medium flex items-center gap-1.5", (pincodeData.surchargeInr ?? 0) === 0 ? "text-green-primary" : "text-amber-600")}>
                            {(pincodeData.surchargeInr ?? 0) === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                            {pickupCity} • {(pincodeData.surchargeInr ?? 0) === 0 ? "Free pickup" : `Pickup surcharge +₹${pincodeData.surchargeInr}`}
                          </div>
                        )}
                        {pickupPincode.length === 6 && !pincodeLoading && pincodeData && !pincodeData.serviceable && (
                          <div className="text-[13px] text-red-500">Pickup not available at this pincode</div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* RIGHT COLUMN: Options & Total */}
                  <div className="lg:col-span-5 xl:col-span-5 space-y-6">

                    {/* Total Summary */}
                    <div>
                      <h2 className="text-[13px] text-slate-500 mb-1">Your total</h2>
                      <div className="flex items-end gap-3 mb-2">
                        <div className="text-[40px] font-bold text-green-primary leading-none">
                          {ratesLoading
                            ? <div className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
                            : `₹${total.toLocaleString()}`}
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-500 mb-4">
                        {selectedRate ? `${selectedRate.carrierName} · ${selectedRate.estimatedDeliveryDays} days` : "Select a carrier below"}
                      </div>

                      {selectedRate && selectedRate.discountInr > 0 && (
                        <div className="bg-green-50 border border-green-100 rounded-md px-4 py-3 flex items-center justify-between">
                          <span className="text-[13px] font-semibold text-green-deep">You save ₹{selectedRate.discountInr.toLocaleString()} vs standard rate</span>
                          <span className="text-[11px] text-slate-400">{Math.round(selectedRate.discountPct * 100)}% off applied</span>
                        </div>
                      )}

                      {/* Itemized Breakdown Card */}
                      {selectedRate && (
                        <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                          <div className="flex justify-between text-[12px]">
                            <span className="text-slate-500">Base Shipping ({selectedRate.chargeableWeightKg}kg)</span>
                            <span className="font-medium">₹{Math.round(selectedRate.baseRateInr).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[12px]">
                            <span className="text-slate-500">Fuel Surcharge (FSC) ({selectedRate.fscPct}%)</span>
                            <span className="font-medium">+₹{Math.round(selectedRate.fscInr).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-[12px]">
                            <span className="text-slate-500">Platform Fee ({selectedRate.marginPct}%)</span>
                            <span className="font-medium">+₹{Math.round(selectedRate.marginInr).toLocaleString()}</span>
                          </div>
                          
                          {/* Itemized Carrier Extras */}
                          {selectedRate.formalClearanceInr > 0 && (
                            <div className="flex justify-between text-[12px]">
                              <span className="text-slate-500">Formal clearance by UPS</span>
                              <span className="font-medium">+₹{selectedRate.formalClearanceInr.toLocaleString()}</span>
                            </div>
                          )}
                          {selectedRate.ddpInr > 0 && (
                            <div className="flex justify-between text-[12px]">
                              <span className="text-slate-500">DDP delivery (duties prepaid)</span>
                              <span className="font-medium">+₹{selectedRate.ddpInr.toLocaleString()}</span>
                            </div>
                          )}
                          {selectedRate.signatureInr > 0 && (
                            <div className="flex justify-between text-[12px]">
                              <span className="text-slate-500">Signature on delivery</span>
                              <span className="font-medium">+₹{selectedRate.signatureInr.toLocaleString()}</span>
                            </div>
                          )}
                          {selectedRate.premiumServiceInr > 0 && (
                            <div className="flex justify-between text-[12px]">
                              <span className="text-slate-500">DHL Premium Service</span>
                              <span className="font-medium">+₹{selectedRate.premiumServiceInr.toLocaleString()}</span>
                            </div>
                          )}
                          {selectedRate.usInboundInr > 0 && (
                             <div className="flex justify-between text-[12px]">
                               <span className="text-slate-500">US Inbound Surcharge</span>
                               <span className="font-medium">+₹{selectedRate.usInboundInr.toLocaleString()}</span>
                             </div>
                          )}
                          {selectedRate.oversizeFeeInr > 0 && (
                             <div className="flex justify-between text-[12px]">
                               <span className="text-slate-500 text-red-500 font-medium italic">Oversize / Girth Fee</span>
                               <span className="font-medium text-red-500">+₹{selectedRate.oversizeFeeInr.toLocaleString()}</span>
                             </div>
                          )}
                          
                          <div className="flex justify-between text-[12px]">
                            <span className="text-slate-500">GST (18%)</span>
                            <span className="font-medium">+₹{Math.round(selectedRate.gstInr).toLocaleString()}</span>
                          </div>

                          {pincodeData?.surchargeInr && pincodeData.surchargeInr > 0 ? (
                            <div className="flex justify-between text-[12px]">
                              <span className="text-slate-500">Pickup surcharge</span>
                              <span className="font-medium">+₹{pincodeData.surchargeInr.toLocaleString()}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-[12px]">
                              <span className="text-slate-500">Pickup surcharge</span>
                              <span className="text-green-primary font-bold">FREE</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* All Options Selection List */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                      <h3 className="text-[13px] font-bold text-slate-600 px-2 pt-2 mb-4 flex items-center justify-between">
                        <span>All options — {COUNTRY_LABELS[state.destination] ?? state.destination} · {localChargeableWeight} kg</span>
                        {ratesLoading && (
                          <span className="flex items-center gap-1.5 text-[10px] text-green-primary animate-pulse">
                            <RotateCcw className="w-3 h-3 animate-spin" />
                            Syncing...
                          </span>
                        )}
                      </h3>

                      {ratesLoading && !rates && (
                        <div className="space-y-2 px-2 pb-2">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
                          ))}
                        </div>
                      )}


                      <div className="space-y-1 mb-4">
                        {(rates ?? []).map((result, idx) => {
                          const isSelected = selectedPlanId === result.carrier;
                          const isCheapest = idx === 0;

                          return (
                            <div
                              key={result.carrier}
                              onClick={() => setSelectedPlanId(result.carrier)}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                                isSelected
                                  ? "bg-green-50 border-green-primary/30 text-brand-black"
                                  : "bg-transparent border-transparent text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 w-[45%]">
                                <div className={cn(
                                  "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-max",
                                  isCheapest ? "bg-green-primary text-white" : "bg-slate-200 text-slate-600"
                                )}>
                                  {isCheapest ? "Best value" : `${result.estimatedDeliveryDays} days`}
                                </div>
                                <div className="font-bold text-[13px]">
                                  {result.carrierName}
                                </div>
                              </div>

                              <div className="flex items-center justify-between w-[55%] pl-2">
                                <div className="flex flex-col">
                                  <div className={cn("font-bold text-[12px]", isSelected ? "text-green-primary" : "text-slate-600")}>
                                    {result.carrier.toUpperCase()}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {result.estimatedDeliveryDays} days
                                  </div>
                                </div>
                                <div className="font-bold text-[15px] text-right min-w-[60px]">
                                  <span className={isSelected ? "text-green-primary" : ""}>
                                    ₹{result.totalInr.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* OBC — contact only */}
                        <a
                          href="https://wa.me/919600879666?text=Hi%2C%20I%20need%20an%20On-Board%20Courier%20service"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg border border-transparent text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 w-[45%]">
                            <div className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-max bg-slate-200 text-slate-600">
                              Fastest
                            </div>
                            <div className="font-bold text-[13px]">On-Board Courier</div>
                          </div>
                          <div className="flex items-center justify-between w-[55%] pl-2">
                            <div className="flex flex-col">
                              <div className="font-bold text-[12px] text-slate-600">OBC</div>
                              <div className="text-[10px] text-slate-400">2–3 days</div>
                            </div>
                            <div className="text-[12px] text-green-primary font-semibold">Contact →</div>
                          </div>
                        </a>
                      </div>
                    </div>

                    {/* Per-carrier disclaimer */}
                    {selectedPlanId && (
                      <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
                        {selectedPlanId === 'ups'
                          ? "UPS final chargeable weight is confirmed 5–6 days after pickup and may differ from declared weight. Customs duties and taxes at destination are the customer's responsibility. In DDU shipments, if the consignee refuses to pay duties, charges will be billed back to the sender."
                          : "Final price is indicative. Confirmed after weight verification at our office. Customs duties and taxes at destination are the customer's responsibility."}
                      </div>
                    )}

                    {/* Action Area */}
                    <div className="pt-4">
                      <Button
                        onClick={handleNext}
                        className="w-full bg-green-primary hover:bg-green-dark text-white h-14 rounded-xl font-bold shadow-lg shadow-green-primary/20 flex items-center justify-center gap-2 group"
                      >
                        Next <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <p className="text-center text-[12px] text-slate-400 mt-4">
                        Step 1 of 2: Customize your shipment details
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {Number(currentStep) === 2 && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: direction * 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 50 }}
                transition={{ duration: 0.3 }}
                className="max-w-[1000px] mx-auto"
              >
                <div className="mb-8 px-4 sm:px-0">
                  <h1 className="text-3xl font-bold text-brand-black mb-2">Checkout</h1>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((s) => (
                      <div
                        key={s}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300",
                          checkoutSubStep === s ? "w-8 bg-green-primary" : "w-3 bg-slate-200"
                        )}
                      />
                    ))}
                    <span className="text-[12px] font-bold text-slate-400 ml-2 uppercase tracking-wider">
                      {checkoutSubStep === 1 ? "Sender info" : checkoutSubStep === 2 ? "Receiver info" : checkoutSubStep === 3 ? "Customs" : "Payment"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start px-4 sm:px-0">
                  {/* Left Column: Sub-steps */}
                  <div className="lg:col-span-12 xl:col-span-8 overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={checkoutSubStep}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -direction * 100 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                      >
                        {checkoutSubStep === 1 && (
                          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                              <div className="bg-green-50 p-2.5 rounded-xl text-green-primary"><User className="w-6 h-6" /></div>
                              <div>
                                <h2 className="text-xl font-bold">Sender details</h2>
                                <p className="text-sm text-slate-500">Where should we pick up your package?</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Full Name *</label>
                                <Input
                                  placeholder="Enter sender's name"
                                  value={formData.senderName}
                                  onChange={e => setFormData({ ...formData, senderName: e.target.value })}
                                  className={cn(formErrors.senderName && "border-red-500")}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Mobile Number *</label>
                                <div className="flex gap-2">
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center text-slate-500 font-medium">+91</div>
                                  <Input
                                    placeholder="10-digit mobile"
                                    maxLength={10}
                                    value={formData.senderMobile}
                                    onChange={e => setFormData({ ...formData, senderMobile: e.target.value.replace(/\D/g, "") })}
                                    className={cn("flex-1", formErrors.senderMobile && "border-red-500")}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Email (Optional)</label>
                                <Input
                                  placeholder="sender@email.com"
                                  value={formData.senderEmail}
                                  onChange={e => setFormData({ ...formData, senderEmail: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Pickup Pincode *</label>
                                <Input
                                  placeholder="6-digit pincode"
                                  maxLength={6}
                                  value={formData.pickupPincode}
                                  onChange={e => setFormData({ ...formData, pickupPincode: e.target.value.replace(/\D/g, ""), pickupCity: "", pickupState: "" })}
                                  className={cn(formErrors.pickupPincode && "border-red-500")}
                                />
                                {formData.pickupPincode.length === 6 && pincodeLoading && (
                                  <p className="text-[12px] text-slate-400">Checking pincode…</p>
                                )}
                                {formData.pickupPincode.length === 6 && !pincodeLoading && pincodeData?.serviceable && (
                                  <p className={cn("text-[12px] font-medium flex items-center gap-1", (pincodeData.surchargeInr ?? 0) > 0 ? "text-amber-600" : "text-green-primary")}>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {pincodeData.city} · {(pincodeData.surchargeInr ?? 0) > 0 ? `Pickup surcharge +₹${pincodeData.surchargeInr}` : "Free pickup"}
                                  </p>
                                )}
                                {formErrors.pickupPincode && (
                                  <p className="text-[12px] text-red-500">{formErrors.pickupPincode}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Address Line 1 *</label>
                                <Input
                                  placeholder="House no, Building name, Flat"
                                  value={formData.pickupAddressLine1}
                                  onChange={e => setFormData({ ...formData, pickupAddressLine1: e.target.value })}
                                  className={cn(formErrors.pickupAddressLine1 && "border-red-500")}
                                />
                                {formErrors.pickupAddressLine1 && <p className="text-[12px] text-red-500">{formErrors.pickupAddressLine1}</p>}
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Address Line 2 <span className="font-normal text-slate-400 normal-case">(optional)</span></label>
                                <Input
                                  placeholder="Street, Area, Locality"
                                  value={formData.pickupAddressLine2}
                                  onChange={e => setFormData({ ...formData, pickupAddressLine2: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">City</label>
                                <Input
                                  value={formData.pickupCity}
                                  readOnly
                                  placeholder="Auto-filled from pincode"
                                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">State</label>
                                <Input
                                  value={formData.pickupState}
                                  readOnly
                                  placeholder="Auto-filled from pincode"
                                  className="bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Pickup Date *</label>
                                <Input
                                  type="date"
                                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Min tomorrow
                                  value={formData.pickupDate}
                                  onChange={e => setFormData({ ...formData, pickupDate: e.target.value })}
                                  className={cn(formErrors.pickupDate && "border-red-500")}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Preferred Time Slot *</label>
                                <div className="flex flex-wrap gap-2">
                                  {["9 AM–12 PM", "12 PM–3 PM", "3 PM–6 PM"].map(slot => (
                                    <button
                                      key={slot}
                                      onClick={() => setFormData({ ...formData, pickupSlot: slot })}
                                      className={cn(
                                        "px-3 py-1.5 rounded-full border text-[12px] font-semibold transition-all",
                                        formData.pickupSlot === slot
                                          ? "bg-green-primary border-green-primary text-white"
                                          : formErrors.pickupSlot
                                            ? "bg-white border-red-300 text-slate-500"
                                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                      )}
                                    >
                                      {slot}
                                    </button>
                                  ))}
                                </div>
                                {formErrors.pickupSlot && <p className="text-[12px] text-red-500 mt-1">{formErrors.pickupSlot}</p>}
                              </div>
                            </div>
                          </div>
                        )}

                        {checkoutSubStep === 2 && (
                          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                              <div className="bg-green-50 p-2.5 rounded-xl text-green-primary"><Package className="w-6 h-6" /></div>
                              <div>
                                <h2 className="text-xl font-bold">Receiver details</h2>
                                <p className="text-sm text-slate-500">Where should we deliver your package?</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="md:col-span-2 space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Full Name *</label>
                                <Input
                                  placeholder="Receiver's full name"
                                  value={formData.receiverName}
                                  onChange={e => setFormData({ ...formData, receiverName: e.target.value })}
                                  className={cn(formErrors.receiverName && "border-red-500")}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Mobile Number *</label>
                                <div className="flex gap-2">
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center text-slate-500 font-medium shrink-0">
                                    {receiverDialCode}
                                  </div>
                                  <Input
                                    placeholder="Local number"
                                    value={formData.receiverMobile}
                                    onChange={e => setFormData({ ...formData, receiverMobile: e.target.value.replace(/\D/g, "") })}
                                    className={cn("flex-1", formErrors.receiverMobile && "border-red-500")}
                                  />
                                </div>
                                {formErrors.receiverMobile && <p className="text-[12px] text-red-500">{formErrors.receiverMobile}</p>}
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Email (Optional)</label>
                                <Input
                                  placeholder="receiver@email.com"
                                  value={formData.receiverEmail}
                                  onChange={e => setFormData({ ...formData, receiverEmail: e.target.value })}
                                />
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Delivery Address *</label>
                                <Textarea
                                  placeholder="Full delivery address with landmark"
                                  value={formData.deliveryAddress}
                                  onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                  className={cn("min-h-[80px]", formErrors.deliveryAddress && "border-red-500")}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">City *</label>
                                <Input
                                  placeholder="City"
                                  value={formData.city}
                                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                                  className={cn(formErrors.city && "border-red-500")}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">State / Province *</label>
                                <Input
                                  placeholder="State or Province"
                                  value={formData.state}
                                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                                  className={cn(formErrors.state && "border-red-500")}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Postal / ZIP Code *</label>
                                <Input
                                  placeholder="ZIP Code"
                                  value={formData.zipCode}
                                  onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                  className={cn(formErrors.zipCode && "border-red-500")}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {checkoutSubStep === 3 && (
                          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                              <div className="bg-green-50 p-2.5 rounded-xl text-green-primary"><FileText className="w-6 h-6" /></div>
                              <div>
                                <h2 className="text-xl font-bold">Customs declaration</h2>
                                <p className="text-sm text-slate-500">Provide details for international shipping documentation</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Number of Pieces *</label>
                                <Input
                                  type="number"
                                  value={formData.numPieces}
                                  onChange={e => setFormData({ ...formData, numPieces: e.target.value })}
                                  className={cn(formErrors.numPieces && "border-red-500")}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Total Declared Value *</label>
                                <div className="flex gap-2">
                                  <select
                                    value={formData.declaredCurrency}
                                    onChange={e => setFormData({ ...formData, declaredCurrency: e.target.value })}
                                    className="w-24 border border-slate-200 rounded-lg px-2 text-sm bg-slate-50 text-slate-600 font-medium focus:outline-none focus:ring-2 focus:ring-green-primary"
                                  >
                                    <option value="INR">INR</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                  </select>
                                  <Input
                                    type="number"
                                    placeholder="e.g. 5000"
                                    value={formData.declaredValue}
                                    onChange={e => setFormData({ ...formData, declaredValue: e.target.value })}
                                    className={cn("flex-1", formErrors.declaredValue && "border-red-500")}
                                  />
                                </div>
                                {formErrors.declaredValue && <p className="text-[11px] text-red-500">{formErrors.declaredValue}</p>}
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <label className="text-[13px] font-bold text-slate-600 uppercase">Contents Description *</label>
                                <Textarea
                                  placeholder="e.g. University application documents — transcripts, certificates. No commercial value."
                                  value={formData.contents}
                                  onChange={e => setFormData({ ...formData, contents: e.target.value })}
                                  className={cn("min-h-[100px]", formErrors.contents && "border-red-500")}
                                />
                                <p className="text-[11px] text-slate-400 mt-2">
                                  Detailed description helps avoid customs delays. Be specific about what's inside.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {checkoutSubStep === 4 && (
                          <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                              <div className="flex items-center gap-3 mb-8">
                                <div className="bg-green-50 p-2.5 rounded-xl text-green-primary"><CreditCard className="w-6 h-6" /></div>
                                <div>
                                  <h2 className="text-xl font-bold">Payment method</h2>
                                  <p className="text-sm text-slate-500">Your card won't be charged until dispatch</p>
                                </div>
                              </div>

                              <div className="border border-slate-200 rounded-[12px] overflow-hidden flex p-1 bg-slate-50/50 mb-8">
                                {['upi', 'card', 'netbanking'].map(tab => (
                                  <button
                                    key={tab}
                                    onClick={() => setPaymentTab(tab)}
                                    className={cn(
                                      "flex-1 py-3 text-[14px] font-bold transition-all uppercase tracking-wider",
                                      paymentTab === tab ? "bg-white text-green-primary shadow-sm rounded-[10px]" : "text-slate-400"
                                    )}
                                  >
                                    {tab === 'upi' ? 'UPI' : tab === 'card' ? 'Card' : 'Net'}
                                  </button>
                                ))}
                              </div>

                              <div className="min-h-[200px]">
                                {paymentTab === 'upi' && (
                                  <div className="space-y-6">
                                    <div onClick={() => setUpiOption('id')} className={cn("p-5 rounded-xl border transition-all cursor-pointer", upiOption === 'id' ? "border-green-primary bg-green-50/10 ring-1 ring-green-primary/20" : "border-slate-100 bg-white")}>
                                      <div className="flex items-center gap-3">
                                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", upiOption === 'id' ? "border-green-primary" : "border-slate-300")}>
                                          {upiOption === 'id' && <div className="w-2.5 h-2.5 bg-green-primary rounded-full" />}
                                        </div>
                                        <span className="font-bold text-brand-black">Pay via UPI ID</span>
                                      </div>
                                      {upiOption === 'id' && (
                                        <div className="mt-5 space-y-4">
                                          <Input placeholder="yourname@okicici" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="h-12 text-lg" />
                                          <Button onClick={handleFinalBooking} disabled={!upiId || isProcessing || !selectedRate} className="w-full h-12 bg-green-primary hover:bg-green-dark text-white rounded-xl font-bold">
                                            {isProcessing ? <RotateCcw className="w-5 h-5 animate-spin" /> : "Verify & Pay"}
                                          </Button>
                                          {submitError && <p className="text-sm text-red-500 text-center">{submitError}</p>}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {paymentTab === 'card' && (
                                  <div className="space-y-6">
                                    <div className="space-y-2">
                                      <label className="text-[12px] font-bold text-slate-400 uppercase">Card Number</label>
                                      <Input placeholder="Card number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="font-mono tracking-widest h-12" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-slate-400 uppercase">Expiry</label>
                                        <Input placeholder="MM / YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="h-12" />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[12px] font-bold text-slate-400 uppercase">CVV</label>
                                        <Input type="password" placeholder="CVV" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="h-12" />
                                      </div>
                                    </div>
                                    <Button onClick={handleFinalBooking} disabled={isProcessing || !selectedRate} className="w-full h-12 bg-green-primary hover:bg-green-dark text-white rounded-xl font-bold">
                                      {isProcessing ? <RotateCcw className="w-5 h-5 animate-spin" /> : `Pay ₹${total.toLocaleString()} →`}
                                    </Button>
                                    {submitError && <p className="text-sm text-red-500 text-center">{submitError}</p>}
                                  </div>
                                )}
                                {paymentTab === 'netbanking' && (
                                  <div className="space-y-6">
                                    <div>
                                      <label className="text-[12px] font-bold text-slate-400 uppercase mb-3 block">Select your bank</label>
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                        {POPULAR_BANKS.map(bank => (
                                          <button
                                            key={bank.id}
                                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-100 bg-white hover:border-green-primary hover:bg-green-50/30 transition-all text-[12px] font-semibold text-slate-600"
                                          >
                                            <img src={bank.icon} alt={bank.name} className="w-6 h-6 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                                            {bank.name}
                                          </button>
                                        ))}
                                      </div>
                                      <p className="text-[11px] text-slate-400 text-center">You'll be redirected to your bank's secure payment page</p>
                                    </div>
                                    <Button onClick={handleFinalBooking} disabled={isProcessing || !selectedRate} className="w-full h-12 bg-green-primary hover:bg-green-dark text-white rounded-xl font-bold">
                                      {isProcessing ? <RotateCcw className="w-5 h-5 animate-spin" /> : `Proceed to Bank →`}
                                    </Button>
                                    {submitError && <p className="text-sm text-red-500 text-center">{submitError}</p>}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-8 flex justify-end items-center bg-white p-6 rounded-2xl border border-slate-200">
                      <Button
                        onClick={handleNext}
                        disabled={ratesLoading || !selectedRate}
                        className="bg-green-primary hover:bg-green-dark text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-green-primary/20 flex items-center gap-2 group"
                      >
                        Continue to checkout
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>

                  {/* Right Column: Order Summary (Sticky) */}
                  <div className="hidden lg:block lg:col-span-12 xl:col-span-4 sticky top-24">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                      <h2 className="text-[15px] font-bold text-brand-black border-b border-slate-100 pb-4 uppercase tracking-wider">Order summary</h2>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 text-[15px] font-bold text-brand-black">
                            <span>{pickupCity || state.origin}</span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <span>{COUNTRY_LABELS[state.destination] ?? state.destination}</span>
                          </div>
                          <p className="text-[12px] text-slate-500 mt-1 font-medium">{ITEM_LABELS[state.itemType] || state.itemType} • {selectedRate?.carrierName ?? "—"}</p>
                        </div>

                        <div className="space-y-3 border-t border-slate-100 pt-6">
                          <div className="flex justify-between text-[14px]">
                            <span className="text-slate-500">Shipping charge</span>
                            <span className="font-semibold text-brand-black">₹{shippingCharge.toLocaleString()}</span>
                          </div>
                          {packagingInr > 0 && (
                            <div className="flex justify-between text-[14px]">
                              <span className="text-slate-500">Packaging</span>
                              <span className="font-semibold text-brand-black">+₹{packagingInr}</span>
                            </div>
                          )}
                          {insuranceInr > 0 && (
                            <div className="flex justify-between text-[14px]">
                              <span className="text-slate-500">Insurance</span>
                              <span className="font-semibold text-brand-black">+₹{insuranceInr}</span>
                            </div>
                          )}
                          {(selectedRate?.pickupSurchargeInr ?? 0) > 0 && (
                            <div className="flex justify-between text-[14px]">
                              <span className="text-slate-500">Pickup surcharge</span>
                              <span className="font-semibold text-brand-black">+₹{selectedRate!.pickupSurchargeInr}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                          <span className="text-[14px] font-bold text-slate-600">Total payable</span>
                          <span className="text-[20px] font-bold text-green-primary">₹{total.toLocaleString()}</span>
                        </div>

                        {selectedRate && selectedRate.discountInr > 0 && (
                          <div className="text-[12px] text-green-dark bg-green-50 font-bold p-3 rounded-lg text-center border border-green-100">
                            You're saving ₹{selectedRate.discountInr.toLocaleString()} vs standard rate
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RateBreakdown;
