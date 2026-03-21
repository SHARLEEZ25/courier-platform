import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRates } from "@/hooks/useRates";
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
  "India":        "+91",
  "USA":          "+1",
  "Canada":       "+1",
  "UK":           "+44",
  "Australia":    "+61",
  "New Zealand":  "+64",
  "Germany":      "+49",
  "France":       "+33",
  "Netherlands":  "+31",
  "Italy":        "+39",
  "Spain":        "+34",
  "UAE":          "+971",
  "Saudi Arabia": "+966",
  "Qatar":        "+974",
  "Kuwait":       "+965",
  "Bahrain":      "+973",
  "Oman":         "+968",
  "Singapore":    "+65",
  "Malaysia":     "+60",
  "Hong Kong":    "+852",
  "Japan":        "+81",
  "South Korea":  "+82",
  "China":        "+86",
  "South Africa": "+27",
  "Nigeria":      "+234",
  "Kenya":        "+254",
  "Sweden":       "+46",
  "Norway":       "+47",
  "Denmark":      "+45",
  "Switzerland":  "+41",
  "Belgium":      "+32",
  "Ireland":      "+353",
  "Portugal":     "+351",
  "Austria":      "+43",
  "Thailand":     "+66",
  "Brazil":       "+55",
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
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/rate-breakdown", { replace: true, state: location.state });
    }
  }, [user, authLoading, navigate, location.state]);

  if (authLoading || !user) return null;

  const state = location.state || { preselectedCarrier: null, origin: "Chennai, India", destination: "United Kingdom", weight: 2.5, itemType: "university" };

  const [actualWeight, setActualWeight] = useState<number>(Number(state.weight) || 2.5);
  const [packaging, setPackaging] = useState<"none" | "standard" | "premium">("none");
  const [insurance, setInsurance] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<CarrierSlug | null>(state.preselectedCarrier ?? null);
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutSubStep, setCheckoutSubStep] = useState(1); // 1: Sender, 2: Receiver, 3: Customs, 4: Payment
  const [direction, setDirection] = useState(0); // For sliding animations

  // Booking Form State
  const [formData, setFormData] = useState({
    senderName: "",
    senderMobile: "",
    senderEmail: "",
    pickupPincode: "",
    pickupAddressLine1: "",
    pickupAddressLine2: "",
    pickupCity: "",
    pickupState: "",
    pickupDate: "",
    pickupSlot: "",
    receiverName: "",
    receiverMobile: "",
    receiverEmail: "",
    deliveryAddress: "",
    city: "",
    state: "",
    zipCode: "",
    numPieces: "1",
    contents: ""
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [paymentTab, setPaymentTab] = useState("upi");
  const [upiOption, setUpiOption] = useState("id");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [submitError, setSubmitError] = useState("");

  const chargeableWeight = actualWeight;

  // ── API hooks ────────────────────────────────────────────────────────────────
  const { data: rates, isLoading: ratesLoading } = useRates(
    state.destination ? {
      origin: state.origin,
      destination: state.destination,
      weight: actualWeight,
      itemType: (state.itemType as ItemType) ?? "other",
      shipmentType: "package",
      packaging,
      insurance,
      pickupPincode: /^\d{6}$/.test(formData.pickupPincode) ? formData.pickupPincode : undefined,
    } : null
  );

  const { data: pincodeData, isLoading: pincodeLoading } = usePincode(formData.pickupPincode);
  const { mutate: createBooking, isPending: isProcessing } = useCreateBooking();

  // Auto-select first carrier when rates load or if preselected not in results
  useEffect(() => {
    if (rates?.length) {
      if (!selectedPlanId || !rates.find(r => r.carrier === selectedPlanId)) {
        setSelectedPlanId(rates[0].carrier);
      }
    }
  }, [rates]);

  // Auto-fill city/state from pincode lookup
  useEffect(() => {
    if (pincodeData?.city) {
      setFormData(prev => ({
        ...prev,
        pickupCity: pincodeData.city ?? "",
        pickupState: pincodeData.state ?? "",
      }));
    }
  }, [pincodeData]);

  // Derived values
  const selectedRate = rates?.find(r => r.carrier === selectedPlanId) ?? rates?.[0] ?? null;
  const pickupCity = pincodeData?.city ?? "";
  const receiverDialCode = COUNTRY_DIAL_CODE[state.destination] ?? "+";
  const total = selectedRate?.totalInr ?? 0;
  const packagingInr = selectedRate?.packagingInr ?? 0;
  const insuranceInr = selectedRate?.insuranceInr ?? 0;
  const shippingCharge = total - packagingInr - insuranceInr - (selectedRate?.pickupSurchargeInr ?? 0);

  const validateCheckoutSubStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) { // Sender
      const fields: (keyof typeof formData)[] = ['senderName', 'senderMobile', 'pickupPincode', 'pickupAddressLine1', 'pickupDate', 'pickupSlot'];
      fields.forEach(f => { if (!formData[f]) newErrors[f] = "Required"; });
      if (formData.senderMobile && !/^\d{10}$/.test(formData.senderMobile)) newErrors.senderMobile = "Enter a valid 10-digit mobile number";
      if (formData.senderEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.senderEmail)) newErrors.senderEmail = "Enter a valid email address";
      if (formData.pickupPincode.length === 6 && pincodeData && !pincodeData.serviceable) newErrors.pickupPincode = "Pickup not available at this pincode";
    } else if (step === 2) { // Receiver
      const fields: (keyof typeof formData)[] = ['receiverName', 'receiverMobile', 'deliveryAddress', 'city', 'state', 'zipCode'];
      fields.forEach(f => { if (!formData[f]) newErrors[f] = "Required"; });
      if (formData.receiverMobile && !/^\d{5,15}$/.test(formData.receiverMobile)) newErrors.receiverMobile = "Enter a valid local number";
      if (formData.receiverEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.receiverEmail)) newErrors.receiverEmail = "Enter a valid email address";
    } else if (step === 3) { // Customs
      const fields: (keyof typeof formData)[] = ['numPieces', 'contents'];
      fields.forEach(f => { if (!formData[f]) newErrors[f] = "Required"; });
      if (formData.numPieces && (isNaN(Number(formData.numPieces)) || Number(formData.numPieces) < 1)) newErrors.numPieces = "Must be at least 1";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setDirection(1);
      setCurrentStep(2);
      setCheckoutSubStep(1);
      window.scrollTo(0, 0);
    } else if (currentStep === 2) {
      if (validateCheckoutSubStep(checkoutSubStep)) {
        if (checkoutSubStep < 4) {
          setDirection(1);
          setCheckoutSubStep(prev => prev + 1);
          window.scrollTo(0, 0);
        } else {
          // checkoutSubStep 4 is Payment (final step handled by handleFinalBooking)
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      if (checkoutSubStep > 1) {
        setDirection(-1);
        setCheckoutSubStep(prev => prev - 1);
      } else {
        setDirection(-1);
        setCurrentStep(1);
      }
      window.scrollTo(0, 0);
    }
  };

  const handleFinalBooking = () => {
    if (!selectedRate) return;
    setSubmitError("");
    createBooking({
      carrierId: selectedRate.carrier,
      originCountry: state.origin,
      destinationCountry: state.destination,
      actualWeightKg: actualWeight,
      shipmentType: "package",
      itemTypeId: selectedRate.itemType,
      packaging,
      insurance,
      senderName: formData.senderName,
      senderMobile: formData.senderMobile,
      senderEmail: formData.senderEmail || null,
      pickupPincode: formData.pickupPincode,
      pickupAddress: [formData.pickupAddressLine1, formData.pickupAddressLine2].filter(Boolean).join(", "),
      pickupCity: formData.pickupCity,
      pickupState: formData.pickupState,
      pickupDate: formData.pickupDate,
      pickupSlot: formData.pickupSlot,
      receiverName: formData.receiverName,
      receiverMobile: `${receiverDialCode}${formData.receiverMobile}`,
      receiverEmail: formData.receiverEmail,
      deliveryAddress: formData.deliveryAddress,
      deliveryCity: formData.city,
      deliveryState: formData.state,
      deliveryZip: formData.zipCode,
      numPieces: parseInt(formData.numPieces, 10) || 1,
      contentsDesc: formData.contents,
    }, {
      onSuccess: (booking) => {
        navigate("/booking-confirmation", {
          state: {
            senderName: formData.senderName,
            carrier: booking.carrier_id,
            carrierName: selectedRate.carrierName,
            destination: state.destination,
            route: `${pickupCity || state.origin} → ${state.destination}`,
            totalPrice: booking.total_inr,
            estimatedDelivery: selectedRate.estimatedDeliveryDays,
            trackingId: booking.booking_ref,
          },
        });
      },
      onError: (err) => setSubmitError(err.message),
    });
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

                  {/* Weight Section */}
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <h3 className="text-base font-bold text-brand-black">Weight</h3>
                      <div className="text-xl font-bold text-green-primary">{actualWeight}<span className="text-sm font-normal text-slate-400 ml-1">kg</span></div>
                    </div>
                    
                    <div className="relative mb-6">
                      <input 
                        type="range" 
                        min="0.5" 
                        max="30" 
                        step="0.5" 
                        value={actualWeight} 
                        onChange={(e) => setActualWeight(Number(e.target.value))}
                        className="w-full accent-green-primary h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-medium">
                          <span>0.5 kg</span>
                          <span>30 kg</span>
                      </div>
                    </div>

                      <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center border border-slate-100 mt-2">
                        <div className="text-[13px] font-medium text-slate-500">Chargeable weight</div>
                        <div className="text-[13px] font-medium text-green-primary">{chargeableWeight} kg</div>
                      </div>
                  </div>

                  {/* Packaging Section */}
                  <div>
                    <h3 className="text-sm font-bold text-brand-black mb-3">Packaging</h3>
                    <div className="flex flex-wrap gap-3 mb-2">
                      {[
                        { id: "none", label: "No packaging" },
                        { id: "standard", label: "Standard box +₹150" },
                        { id: "premium", label: "Premium box +₹350" },
                      ].map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPackaging(p.id as "none" | "standard" | "premium")}
                          className={cn(
                            "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                            packaging === p.id 
                              ? "bg-green-primary/10 border-green-primary text-green-primary" 
                              : "bg-transparent border-slate-200 text-slate-500 hover:border-slate-400"
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                    {state.itemType === "food" && packaging === "premium" && (
                        <div className="text-[12px] text-green-primary mt-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Vacuum sealing included — recommended for food items.</div>
                    )}
                  </div>

                  {/* Insurance Section */}
                  <div>
                    <h3 className="text-sm font-bold text-brand-black mb-3">Insurance</h3>
                    <div className="flex flex-wrap gap-3 mb-2">
                        <button
                          onClick={() => setInsurance(false)}
                          className={cn(
                            "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                            !insurance 
                              ? "bg-green-primary/10 border-green-primary text-green-primary" 
                              : "bg-transparent border-slate-200 text-slate-500 hover:border-slate-400"
                          )}
                        >
                          Not required
                        </button>
                        <button
                          onClick={() => setInsurance(true)}
                          className={cn(
                            "px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                            insurance 
                              ? "bg-green-primary/10 border-green-primary text-green-primary" 
                              : "bg-transparent border-slate-200 text-slate-500 hover:border-slate-400"
                          )}
                        >
                          Add insurance +₹199
                        </button>
                    </div>
                    {insurance && (
                        <div className="text-[12px] text-slate-500 mt-2">Covers up to ₹10,000 declared value · Claim support included</div>
                    )}
                  </div>

                  {/* Pickup Pincode */}
                  <div>
                      <h3 className="text-sm font-bold text-brand-black mb-3">Your pickup pincode</h3>
                      <div className="flex gap-3 max-w-[300px] mb-2">
                        <Input 
                          type="text" 
                          placeholder="Enter 6-digit pincode" 
                          value={formData.pickupPincode}
                          maxLength={6}
                          onChange={(e) => setFormData({...formData, pickupPincode: e.target.value.replace(/\D/g, "")})}
                          className="bg-white border-slate-200 text-brand-black placeholder:text-slate-400 focus-visible:ring-green-primary rounded"
                        />
                      </div>
                      {formData.pickupPincode.length === 6 && pincodeLoading && (
                          <div className="text-[13px] text-slate-400">Checking pincode…</div>
                      )}
                      {formData.pickupPincode.length === 6 && !pincodeLoading && pincodeData?.serviceable && (
                          <div className={cn("text-[13px] font-medium flex items-center gap-1.5", (pincodeData.surchargeInr ?? 0) === 0 ? "text-green-primary" : "text-amber-600")}>
                              {(pincodeData.surchargeInr ?? 0) === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                              {pickupCity} • {(pincodeData.surchargeInr ?? 0) === 0 ? "Free pickup" : `Pickup surcharge +₹${pincodeData.surchargeInr}`}
                          </div>
                      )}
                      {formData.pickupPincode.length === 6 && !pincodeLoading && pincodeData && !pincodeData.serviceable && (
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
                  </div>

                  {/* All Options Selection List */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <h3 className="text-[13px] font-bold text-slate-600 px-2 pt-2 mb-4">
                      All options — {COUNTRY_LABELS[state.destination] ?? state.destination} · {chargeableWeight} kg
                    </h3>

                    {ratesLoading && (
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
                            onChange={e => setFormData({...formData, senderName: e.target.value})}
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
                              onChange={e => setFormData({...formData, senderMobile: e.target.value.replace(/\D/g, "")})}
                              className={cn("flex-1", formErrors.senderMobile && "border-red-500")}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">Email (Optional)</label>
                          <Input 
                            placeholder="sender@email.com" 
                            value={formData.senderEmail} 
                            onChange={e => setFormData({...formData, senderEmail: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">Pickup Pincode *</label>
                          <Input
                            placeholder="6-digit pincode"
                            maxLength={6}
                            value={formData.pickupPincode}
                            onChange={e => setFormData({...formData, pickupPincode: e.target.value.replace(/\D/g, ""), pickupCity: "", pickupState: ""})}
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
                            onChange={e => setFormData({...formData, pickupAddressLine1: e.target.value})}
                            className={cn(formErrors.pickupAddressLine1 && "border-red-500")}
                          />
                          {formErrors.pickupAddressLine1 && <p className="text-[12px] text-red-500">{formErrors.pickupAddressLine1}</p>}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">Address Line 2 <span className="font-normal text-slate-400 normal-case">(optional)</span></label>
                          <Input
                            placeholder="Street, Area, Locality"
                            value={formData.pickupAddressLine2}
                            onChange={e => setFormData({...formData, pickupAddressLine2: e.target.value})}
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
                            onChange={e => setFormData({...formData, pickupDate: e.target.value})}
                            className={cn(formErrors.pickupDate && "border-red-500")}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Preferred Time Slot *</label>
                          <div className="flex flex-wrap gap-2">
                            {["9 AM–12 PM", "12 PM–3 PM", "3 PM–6 PM"].map(slot => (
                              <button
                                key={slot}
                                onClick={() => setFormData({...formData, pickupSlot: slot})}
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
                            onChange={e => setFormData({...formData, receiverName: e.target.value})}
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
                              onChange={e => setFormData({...formData, receiverMobile: e.target.value.replace(/\D/g, "")})}
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
                            onChange={e => setFormData({...formData, receiverEmail: e.target.value})}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">Delivery Address *</label>
                          <Textarea 
                            placeholder="Full delivery address with landmark" 
                            value={formData.deliveryAddress} 
                            onChange={e => setFormData({...formData, deliveryAddress: e.target.value})}
                            className={cn("min-h-[80px]", formErrors.deliveryAddress && "border-red-500")}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">City *</label>
                          <Input
                            placeholder="City"
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            className={cn(formErrors.city && "border-red-500")}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">State / Province *</label>
                          <Input
                            placeholder="State or Province"
                            value={formData.state}
                            onChange={e => setFormData({...formData, state: e.target.value})}
                            className={cn(formErrors.state && "border-red-500")}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">Postal / ZIP Code *</label>
                          <Input
                            placeholder="ZIP Code"
                            value={formData.zipCode}
                            onChange={e => setFormData({...formData, zipCode: e.target.value})}
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
                            onChange={e => setFormData({...formData, numPieces: e.target.value})}
                            className={cn(formErrors.numPieces && "border-red-500")}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">Contents Description *</label>
                          <Textarea 
                            placeholder="e.g. University application documents — transcripts, certificates. No commercial value." 
                            value={formData.contents} 
                            onChange={e => setFormData({...formData, contents: e.target.value})}
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
                                      <div className="grid grid-cols-3 gap-2 mb-4">
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

              {/* Navigation Actions */}
              <div className="mt-8 flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
                <button 
                  onClick={handleBack} 
                  className="text-slate-500 hover:text-brand-black font-semibold flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> 
                  {checkoutSubStep === 1 ? "Back to customization" : "Previous step"}
                </button>
                {checkoutSubStep < 4 && (
                  <Button 
                    onClick={handleNext}
                    className="bg-green-primary hover:bg-green-dark text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-green-primary/20 flex items-center gap-2 group"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
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
