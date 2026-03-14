import React, { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  ArrowLeft,
  MessageCircle,
  MoveRight,
  Lock,
  Info,
  AlertTriangle,
  CheckCircle2,
  User,
  MapPin,
  Calendar,
  Clock,
  Package,
  ShieldCheck,
  CreditCard,
  Building,
  Eye,
  EyeOff,
  ChevronUp,
  CreditCard as CardIcon,
  Smartphone,
  ChevronRight,
  RotateCcw,
  FileText,
  Landmark,
  Shield,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

const CARRIER_OPTIONS = [
  { id: "economy", name: "Uniex Economy", carrier: "Aramex", days: "12–15 days", type: "Best value", modifier: 1 },
  { id: "aramex", name: "", carrier: "Aramex", days: "10–12 days", type: "Economy", modifier: 1.2 },
  { id: "ups", name: "", carrier: "UPS", days: "7–10 days", type: "Standard", modifier: 1.35 },
  { id: "fedex", name: "", carrier: "FedEx", days: "5–7 days", type: "Express", modifier: 1.6 },
  { id: "dhl", name: "", carrier: "DHL", days: "4–6 days", type: "Express", modifier: 1.8 },
  { id: "obc", name: "", carrier: "On-Board Courier", days: "2–3 days", type: "Fastest", modifier: "obc" },
];

const PINCODES: Record<string, { city: string, surcharge: number, tier: string }> = {
  '600001':{city:'Chennai, Tamil Nadu',   surcharge:0,   tier:'tn'},
  '600002':{city:'Chennai, Tamil Nadu',   surcharge:0,   tier:'tn'},
  '600003':{city:'T. Nagar, Chennai',     surcharge:0,   tier:'tn'},
  '600004':{city:'Adyar, Chennai',        surcharge:0,   tier:'tn'},
  '600010':{city:'Anna Nagar, Chennai',   surcharge:0,   tier:'tn'},
  '600020':{city:'Velachery, Chennai',    surcharge:0,   tier:'tn'},
  '641001':{city:'Coimbatore, Tamil Nadu',surcharge:0,   tier:'tn'},
  '625001':{city:'Madurai, Tamil Nadu',   surcharge:0,   tier:'tn'},
  '627001':{city:'Tirunelveli, Tamil Nadu',surcharge:0,  tier:'tn'},
  '605001':{city:'Pondicherry',           surcharge:0,   tier:'tn'},
  '606001':{city:'Cuddalore, Tamil Nadu', surcharge:0,   tier:'tn'},
  '500001':{city:'Hyderabad, Telangana',  surcharge:120, tier:'metro'},
  '500002':{city:'Hyderabad, Telangana',  surcharge:120, tier:'metro'},
  '560001':{city:'Bangalore, Karnataka',  surcharge:120, tier:'metro'},
  '560002':{city:'Bangalore, Karnataka',  surcharge:120, tier:'metro'},
  '682001':{city:'Kochi, Kerala',         surcharge:120, tier:'metro'},
  '520001':{city:'Vijayawada, Andhra Pradesh',surcharge:120,tier:'metro'},
  '110001':{city:'New Delhi',             surcharge:200, tier:'north'},
  '110002':{city:'New Delhi',             surcharge:200, tier:'north'},
  '400001':{city:'Mumbai, Maharashtra',   surcharge:200, tier:'north'},
  '400002':{city:'Mumbai, Maharashtra',   surcharge:200, tier:'north'},
  '700001':{city:'Kolkata, West Bengal',  surcharge:200, tier:'north'},
  '700002':{city:'Kolkata, West Bengal',  surcharge:200, tier:'north'},
  '380001':{city:'Ahmedabad, Gujarat',    surcharge:200, tier:'north'},
  '411001':{city:'Pune, Maharashtra',     surcharge:200, tier:'north'},
};

const RateBreakdown = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || { plan: "economy", origin: "Chennai, India", destination: "United Kingdom", weight: 2.5, itemType: "University Express" };

  const [actualWeight, setActualWeight] = useState<number>(Number(state.weight) || 2.5);
  const [showVolumetric, setShowVolumetric] = useState(false);
  const [dim, setDim] = useState({ l: 10, w: 10, h: 10 });
  const [packaging, setPackaging] = useState("none");
  const [insurance, setInsurance] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(state.plan || "economy");
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutSubStep, setCheckoutSubStep] = useState(1); // 1: Sender, 2: Receiver, 3: Customs, 4: Payment
  const [direction, setDirection] = useState(0); // For sliding animations

  // Booking Form State
  const [formData, setFormData] = useState({
    senderName: "",
    senderMobile: "",
    senderEmail: "",
    pickupPincode: "",
    pickupAddress: "",
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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentTab, setPaymentTab] = useState("upi");
  const [upiOption, setUpiOption] = useState("id");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrTimer, setQrTimer] = useState(600);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const [pickupSurcharge, setPickupSurcharge] = useState<number | null>(null);
  const [pickupCity, setPickupCity] = useState("");

  const volumetricWeight = Math.ceil(((dim.l * dim.w * dim.h) / 5000) * 2) / 2;
  const chargeableWeight = showVolumetric ? Math.max(actualWeight, volumetricWeight) : actualWeight;
  const isVolumetricActive = showVolumetric && volumetricWeight > actualWeight;

  const getRatePerKg = (weight: number) => {
    if (weight <= 10) return 580;
    if (weight <= 20) return 530;
    return 480;
  };
  
  const ratePerKg = getRatePerKg(chargeableWeight);
  const baseUnit = Math.max(499, chargeableWeight * ratePerKg);
  
  let discountPercent = 0;
  if (state.itemType === "University Express") discountPercent = 0.5;
  else if (state.itemType === "Excess Baggage Express") discountPercent = 0.1;
  else if (state.itemType === "Document & Parcels") discountPercent = 0.15;
  
  const obcRate = (weight: number) => {
    if (weight <= 0.5) return 3000;
    if (weight <= 1) return 3500;
    return 3500 + Math.ceil(weight - 1) * 1200;
  };

  const calculateCarrierBase = (carrierId: string) => {
    const carrier = CARRIER_OPTIONS.find(c => c.id === carrierId) || CARRIER_OPTIONS[0];
    let price = 0;
    if (carrier.modifier === "obc") {
      price = obcRate(chargeableWeight);
    } else {
      price = baseUnit * (carrier.modifier as number);
    }
    const discounted = price * (1 - discountPercent);
    return Math.max(499, discounted);
  };
  
  const packagingPrice = packaging === "standard" ? 150 : packaging === "premium" ? 350 : 0;
  const insurancePrice = insurance ? 199 : 0;
  const surchargeTotal = (pickupSurcharge || 0) + packagingPrice + insurancePrice;
  
  const calculateTotal = (carrierId: string) => {
    return Math.round(calculateCarrierBase(carrierId) + surchargeTotal);
  };
  
  const total = calculateTotal(selectedPlanId);
  const marketAvg = Math.round(calculateCarrierBase(selectedPlanId) * 1.45 + surchargeTotal); // compare like for like
  const savings = Math.max(0, marketAvg - total);

  useEffect(() => {
    const p = formData.pickupPincode;
    if (p.length === 6) {
      if (PINCODES[p]) {
        const data = PINCODES[p];
        setPickupSurcharge(data.surcharge);
        setPickupCity(data.city);
      } else if (/^[1-9][0-9]{5}$/.test(p)) {
        setPickupSurcharge(0);
        setPickupCity("Pickup available across India");
      } else {
        setPickupSurcharge(null);
        setPickupCity("");
      }
    } else {
      setPickupSurcharge(null);
      setPickupCity("");
    }
  }, [formData.pickupPincode]);

  const selectedCarrier = CARRIER_OPTIONS.find(c => c.id === selectedPlanId) || CARRIER_OPTIONS[0];

  const validateCheckoutSubStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) { // Sender
      const fields: (keyof typeof formData)[] = ['senderName', 'senderMobile', 'pickupPincode', 'pickupAddress', 'pickupDate', 'pickupSlot'];
      fields.forEach(f => { if (!formData[f]) newErrors[f] = "Required"; });
      if (formData.senderMobile && formData.senderMobile.length < 10) newErrors.senderMobile = "10 digits required";
    } else if (step === 2) { // Receiver
      const fields: (keyof typeof formData)[] = ['receiverName', 'receiverMobile', 'deliveryAddress', 'city', 'zipCode'];
      fields.forEach(f => { if (!formData[f]) newErrors[f] = "Required"; });
      if (formData.receiverMobile && formData.receiverMobile.length < 10) newErrors.receiverMobile = "10 digits required";
    } else if (step === 3) { // Customs
      const fields: (keyof typeof formData)[] = ['numPieces', 'contents'];
      fields.forEach(f => { if (!formData[f]) newErrors[f] = "Required"; });
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
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/booking-confirmation", {
        state: {
          ...state,
          ...formData,
          weight: chargeableWeight,
          carrier: selectedCarrier.carrier,
          plan: selectedCarrier.name || selectedCarrier.carrier,
          totalPrice: total,
          trackingId: "UNX" + Math.floor(Math.random() * 8999999 + 1000000),
          estimatedDelivery: selectedCarrier.days,
          route: `${pickupCity || 'Chennai'} → ${state.destination}`
        }
      });
    }, 2000);
  };

  const whatsappLink = useMemo(() => {
    const message = `Hi, I'd like to book a ${selectedCarrier.name || selectedCarrier.carrier} (${selectedCarrier.carrier}) shipment from ${state.origin} to ${state.destination}.\nItem: ${state.itemType}\nWeight: ${chargeableWeight}kg\nTotal: ₹${total.toLocaleString()}`;
    return `https://wa.me/919600879666?text=${encodeURIComponent(message)}`;
  }, [selectedCarrier, state.origin, state.destination, state.itemType, chargeableWeight, total]);

  let slabBadgeText = "";
  if (chargeableWeight <= 10) slabBadgeText = "0.5–10kg slab";
  else if (chargeableWeight <= 20) slabBadgeText = "10–20kg slab";
  else slabBadgeText = "21–30kg slab";

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
                To <strong className="text-brand-black ml-1 uppercase">{state.destination}</strong>
              </span>
              <span className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-[13px] shadow-sm">
                Item: <strong className="text-brand-black ml-1">{state.itemType}</strong>
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
              
              {state.itemType === "Medicine Courier" ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-green-primary mb-4">Medicine Courier — we handle everything for you.</h2>
                  <ol className="list-decimal list-inside space-y-3 text-slate-600 text-[15px] mb-8 leading-relaxed">
                    <li>WhatsApp medicine name, quantity & prescription</li>
                    <li>We purchase from pharmacy on your behalf</li>
                    <li>We pack, document & ship with customs paperwork</li>
                    <li>We send photos + bill before dispatch.</li>
                  </ol>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleNext}
                      className="flex-1 bg-green-primary hover:bg-green-dark text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-green-primary/20 flex items-center justify-center gap-2"
                    >
                      Next <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-none border-green-primary text-green-primary hover:bg-green-50 font-bold h-12 px-6 rounded-xl"
                      onClick={() => window.open('https://wa.me/919600879666?text=Hi%20Uniex,%20I%20need%20a%20Medicine%20Courier', '_blank')}
                    >
                       <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-8 shadow-sm">
                  
                  {/* Item Specific Banners */}
                  {state.itemType === "University Express" && (
                    <div className="flex gap-3 bg-[#e8f5e9]/10 border border-[#4ade80]/30 rounded-lg p-4 text-[#4ade80] text-sm leading-relaxed shadow-sm">
                      <Info className="w-5 h-5 shrink-0" />
                      <div><span className="font-bold">University Express</span> — Save up to 50% vs standard rates. Tracked end to end.</div>
                    </div>
                  )}
                  {state.itemType === "Food Products Express" && (
                     <div className="flex gap-3 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-amber-500 text-sm leading-relaxed shadow-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <div><span className="font-bold">Dry & packaged items only.</span> No perishables. Vacuum sealing available — select Premium box below.</div>
                    </div>
                  )}
                  {state.itemType === "Excess Baggage Express" && (
                     <div className="flex gap-3 bg-[#e8f5e9]/10 border border-[#4ade80]/30 rounded-lg p-4 text-[#4ade80] text-sm leading-relaxed shadow-sm">
                      <Info className="w-5 h-5 shrink-0" />
                      <div><span className="font-bold">Excess Baggage</span> — Up to 60% cheaper than airline excess fees.</div>
                    </div>
                  )}
                  {state.itemType === "Export Express" && (
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

                    {/* Volumetric Toggle */}
                    <div className="mt-8 flex items-start justify-between bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div>
                          <div className="text-sm font-bold text-brand-black mb-1">I know my box dimensions</div>
                          <div className="text-[11px] text-slate-500 mb-4">Auto-calculates volumetric weight · L×W×H ÷ 5000</div>
                          
                          {showVolumetric && (
                              <div className="grid grid-cols-3 gap-3 mb-4 max-w-[240px]">
                                <Input type="number" min="0" step="0.1" value={dim.l || ''} onChange={e => setDim({...dim, l: parseFloat(e.target.value) || 0})} placeholder="L (cm)" className="bg-white border-slate-200 text-center" />
                                <Input type="number" min="0" step="0.1" value={dim.w || ''} onChange={e => setDim({...dim, w: parseFloat(e.target.value) || 0})} placeholder="W (cm)" className="bg-white border-slate-200 text-center" />
                                <Input type="number" min="0" step="0.1" value={dim.h || ''} onChange={e => setDim({...dim, h: parseFloat(e.target.value) || 0})} placeholder="H (cm)" className="bg-white border-slate-200 text-center" />
                              </div>
                          )}
                      </div>
                      <Switch 
                          checked={showVolumetric} 
                          onCheckedChange={setShowVolumetric} 
                          className="data-[state=checked]:bg-green-primary data-[state=unchecked]:bg-slate-200 mt-1"
                      />
                    </div>

                      <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center border border-slate-100 mt-2">
                        <div className="text-[13px] font-medium text-slate-500 max-w-[120px] leading-tight">Chargeable weight & rate</div>
                        <div className="text-[13px] font-medium text-green-primary text-right">
                          {showVolumetric ? (
                              <span className="block text-[11px] text-slate-400 mb-1">
                                <span className={isVolumetricActive ? "text-amber-600 font-bold" : ""}>Vol: {volumetricWeight}</span> · <span className={!isVolumetricActive ? "text-amber-600 font-bold" : ""}>Act: {actualWeight}</span>
                              </span>
                          ) : null}
                          {chargeableWeight}kg @ ₹{ratePerKg}/kg — {slabBadgeText}
                        </div>
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
                          onClick={() => setPackaging(p.id)}
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
                    {state.itemType === "Food Products Express" && packaging === "premium" && (
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
                      {formData.pickupPincode.length === 6 && pickupSurcharge !== null && (
                          <div className={cn("text-[13px] font-medium flex items-center gap-1.5", pickupSurcharge === 0 ? "text-green-primary" : "text-amber-600")}>
                              {pickupSurcharge === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                              {pickupCity} • {pickupSurcharge === 0 ? "Free pickup" : `Pickup surcharge +₹${pickupSurcharge}`}
                          </div>
                      )}
                      {formData.pickupPincode.length === 6 && pickupSurcharge === null && (
                          <div className="text-[13px] text-red-500">Invalid pincode</div>
                      )}
                  </div>

                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Options & Total */}
            {state.itemType !== "Medicine Courier" && (
              <div className="lg:col-span-5 xl:col-span-5 space-y-6">
                  
                  {/* Total Summary */}
                  <div>
                     <h2 className="text-[13px] text-slate-500 mb-1">Your total</h2>
                     <div className="flex items-end gap-3 mb-2">
                        <div className="text-[40px] font-bold text-green-primary leading-none">
                          ₹{total.toLocaleString()}
                        </div>
                     </div>
                     <div className="text-[11px] text-slate-500 mb-4">
                       {selectedCarrier.name || selectedCarrier.carrier} · {selectedCarrier.carrier} · {selectedCarrier.days}
                     </div>

                     {savings > 0 && (
                       <div className="bg-green-50 border border-green-100 rounded-md px-4 py-3 flex items-center justify-between">
                           <span className="text-[13px] font-semibold text-green-deep">You save ₹{savings.toLocaleString()} vs market average</span>
                           <span className="text-[11px] text-slate-400 line-through">Market avg: ₹{marketAvg.toLocaleString()}</span>
                       </div>
                     )}
                  </div>

                  {/* All Options Selection List */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <h3 className="text-[13px] font-bold text-slate-600 px-2 pt-2 mb-4">
                      All options — {state.destination} · {chargeableWeight} kg
                    </h3>
                    
                    <div className="space-y-1 mb-4">
                      {CARRIER_OPTIONS.map((option) => {
                         const isSelected = selectedPlanId === option.id;
                         const optionTotal = calculateTotal(option.id);

                         return (
                           <div 
                             key={option.id}
                             onClick={() => setSelectedPlanId(option.id)}
                             className={cn(
                               "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                               isSelected 
                                 ? "bg-green-50 border-green-primary/30 text-brand-black" 
                                 : "bg-transparent border-transparent text-slate-600 hover:bg-slate-50"
                             )}
                           >
                             <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 w-[45%]">
                                {option.type ? (
                                  <div className={cn(
                                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-max",
                                      option.type === "Best value" ? "bg-green-primary text-white" :
                                      option.type === "Express" ? "bg-blue-500 text-white" :
                                      "bg-slate-200 text-slate-600"
                                  )}>
                                    {option.type}
                                  </div>
                                ) : (
                                  <div className={cn(
                                      "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-max opacity-0",
                                  )}>
                                    spacer
                                  </div>
                                )}
                                <div className="font-bold text-[13px]">
                                  {option.name || option.carrier}
                                </div>
                             </div>
                             
                             <div className="flex items-center justify-between w-[55%] pl-2">
                               <div className="flex flex-col">
                                 <div className={cn("font-bold text-[12px]", isSelected ? "text-green-primary" : "text-slate-600")}>
                                    {option.carrier}
                                 </div>
                                 <div className="text-[10px] text-slate-400">
                                    {option.days}
                                 </div>
                               </div>
                               <div className="font-bold text-[15px] text-right min-w-[60px]">
                                 {isSelected ? (
                                    <span className="text-green-primary">₹{optionTotal.toLocaleString()}</span>
                                 ) : (
                                    <span>₹{optionTotal.toLocaleString()}</span>
                                 )}
                               </div>
                             </div>
                           </div>
                         );
                      })}
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
            )}
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
                            onChange={e => setFormData({...formData, pickupPincode: e.target.value.replace(/\D/g, "")})}
                            className={cn(formErrors.pickupPincode && "border-red-500")}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-[13px] font-bold text-slate-600 uppercase">Pickup Address *</label>
                          <Input 
                            placeholder="House no, Street name, Locality" 
                            value={formData.pickupAddress} 
                            onChange={e => setFormData({...formData, pickupAddress: e.target.value})}
                            className={cn(formErrors.pickupAddress && "border-red-500")}
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
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                )}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
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
                          <Input 
                            placeholder="Mobile number" 
                            value={formData.receiverMobile} 
                            onChange={e => setFormData({...formData, receiverMobile: e.target.value.replace(/\D/g, "")})}
                            className={cn("flex-1", formErrors.receiverMobile && "border-red-500")}
                          />
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
                                          <Button onClick={handleFinalBooking} disabled={!upiId || isProcessing} className="w-full h-12 bg-green-primary hover:bg-green-dark text-white rounded-xl font-bold">
                                              {isProcessing ? <RotateCcw className="w-5 h-5 animate-spin" /> : "Verify & Pay"}
                                          </Button>
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
                                  <Button onClick={handleFinalBooking} disabled={isProcessing} className="w-full h-12 bg-green-primary hover:bg-green-dark text-white rounded-xl font-bold">
                                      {isProcessing ? <RotateCcw className="w-5 h-5 animate-spin" /> : `Pay ₹${total.toLocaleString()} →`}
                                  </Button>
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
                            <span>{pickupCity || 'Origin'}</span>
                            <ChevronRight className="w-4 h-4 text-slate-300" />
                            <span>{state.destination}</span>
                        </div>
                        <p className="text-[12px] text-slate-500 mt-1 font-medium">{state.itemType} • {selectedCarrier.carrier}</p>
                    </div>
                    
                    <div className="space-y-3 border-t border-slate-100 pt-6">
                        <div className="flex justify-between text-[14px]">
                            <span className="text-slate-500">Shipping charge</span>
                            <span className="font-semibold text-brand-black">₹{(total - packagingPrice - insurancePrice).toLocaleString()}</span>
                        </div>
                        {packagingPrice > 0 && (
                          <div className="flex justify-between text-[14px]">
                              <span className="text-slate-500">Packaging</span>
                              <span className="font-semibold text-brand-black">+₹{packagingPrice}</span>
                          </div>
                        )}
                        {insurancePrice > 0 && (
                          <div className="flex justify-between text-[14px]">
                              <span className="text-slate-500">Insurance</span>
                              <span className="font-semibold text-brand-black">+₹{insurancePrice}</span>
                          </div>
                        )}
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex justify-between items-center">
                        <span className="text-[14px] font-bold text-slate-600">Total payable</span>
                        <span className="text-[20px] font-bold text-green-primary">₹{total.toLocaleString()}</span>
                    </div>

                     {savings > 0 && (
                      <div className="text-[12px] text-green-dark bg-green-50 font-bold p-3 rounded-lg text-center border border-green-100">
                        You're saving ₹{savings.toLocaleString()} vs market average
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
