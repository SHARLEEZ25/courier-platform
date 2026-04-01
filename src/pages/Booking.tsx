import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePincode } from "@/hooks/usePincode";
import { useCreateBooking } from "@/hooks/useBooking";
import { useAuth } from "@/context/AuthContext";
import type { BookingCreate, CarrierSlug, ItemType } from "@/types/api";
import { CARRIERS, ITEM_TYPES } from "../../shared/schemas/rate-request.schema";

// Reverse-lookup: display label → slug (for carrier and item type)
function toCarrierSlug(val: string): CarrierSlug {
  if ((CARRIERS as readonly string[]).includes(val)) return val as CarrierSlug;
  const lower = val.toLowerCase();
  for (const slug of CARRIERS) {
    if (lower.includes(slug)) return slug;
  }
  return val as CarrierSlug;
}

const ITEM_LABEL_TO_SLUG: Record<string, ItemType> = {
  "University Express": "university",
  "Excess Baggage Express": "excess",
  "Document & Parcels": "docs",
  "Food Products Express": "food",
  "Medicine Courier": "medicine",
  "Clothing & Fashion": "clothing",
  "Electronics": "electronics",
  "Jewellery": "jewellery",
  "Cosmetics": "cosmetics",
  "Gifts": "gifts",
  "Sports Equipment": "sports",
  "Pooja Items": "pooja",
  "Export Express": "commercial",
  "Other": "other",
  "Documents": "docs",
};
function toItemTypeSlug(val: string): ItemType {
  if ((ITEM_TYPES as readonly string[]).includes(val)) return val as ItemType;
  return ITEM_LABEL_TO_SLUG[val] ?? ("other" as ItemType);
}
import { 
  Check, 
  ChevronRight, 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  ShieldCheck, 
  CreditCard,
  Building,
  Info,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CreditCard as CardIcon,
  Smartphone,
  Landmark,
  Shield,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Steps definition
const STEPS = [
  { id: 1, label: "Shipment details" },
  { id: 2, label: "Review & confirm" },
  { id: 3, label: "Payment" }
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

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const routeState = location.state || null;

  // All hooks must be declared before any conditional returns
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    senderName: "",
    senderMobile: "",
    senderEmail: "",
    pickupPincode: routeState?.pickupPincode || "",
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentTab, setPaymentTab] = useState("upi"); // upi, card, netbanking
  const [upiOption, setUpiOption] = useState("id"); // id, qr
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [qrTimer, setQrTimer] = useState(600); // 10 minutes in seconds
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  // Pincode lookup via hook — auto-fires when formData.pickupPincode is 6 digits
  const { data: pincodeData, isLoading: pincodeLoading, error: pincodeError } =
    usePincode(formData.pickupPincode);

  const { mutate: createBooking, isPending: isCreatingBooking } = useCreateBooking();

  // Redirect to login if not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/booking", { replace: true, state: location.state });
    }
  }, [user, authLoading, navigate, location.state]);

  if (authLoading || !user) return null;

  // Safe to use routeState after auth guard — fallback uses a valid carrier
  const state = routeState || {
    origin: "India",
    destination: "USA",
    weight: 1,
    itemType: "docs",
    carrier: "dhl",
    plan: "Standard",
    totalPrice: 1500,
    packaging: "none",
    insurance: false,
    pickupSurcharge: 0,
    pickupCity: "",
    pickupPincode: ""
  };

  const pincodeStatus:
    | { status: "idle" }
    | { status: "loading" }
    | { status: "found"; city: string; surchargeInr: number }
    | { status: "not_found" } = (() => {
    if (formData.pickupPincode.length !== 6) return { status: "idle" };
    if (pincodeLoading) return { status: "loading" };
    if (pincodeData?.serviceable) return { status: "found", city: pincodeData.city!, surchargeInr: pincodeData.surchargeInr ?? 0 };
    if (pincodeData || pincodeError) return { status: "not_found" };
    return { status: "idle" };
  })();

  // Destination mobile prefix lookup
  const getMobilePrefix = (dest: string) => {
    const prefixes: Record<string, string> = {
      'USA': '+1', 'Canada': '+1', 'UK': '+44', 'Australia': '+61', 
      'UAE': '+971', 'Singapore': '+65', 'Malaysia': '+60', 'Germany': '+49'
    };
    return prefixes[dest] || '+';
  };

  // QR Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 3 && paymentTab === 'upi' && upiOption === 'qr' && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, paymentTab, upiOption, qrTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Card number formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted.substring(0, 19));
  };

  const getCardType = (number: string) => {
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('6')) return 'RuPay';
    return null;
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    const required = [
      'senderName', 'senderMobile', 'pickupPincode', 'pickupAddress',
      'pickupDate', 'pickupSlot', 'receiverName', 'receiverMobile',
      'deliveryAddress', 'city', 'state', 'zipCode', 'numPieces', 'contents'
    ];

    required.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = "Field is required";
      }
    });

    if (formData.senderMobile && !/^\d{10}$/.test(formData.senderMobile)) {
      newErrors.senderMobile = "Enter a valid 10-digit mobile number";
    }

    if (formData.receiverMobile && !/^\+?\d{7,15}$/.test(formData.receiverMobile)) {
      newErrors.receiverMobile = "Enter a valid international number (e.g. +14155550100)";
    }

    if (formData.deliveryAddress && formData.deliveryAddress.length < 5) {
      newErrors.deliveryAddress = "Address must be at least 5 characters";
    }

    if (formData.pickupAddress && formData.pickupAddress.length < 5) {
      newErrors.pickupAddress = "Address must be at least 5 characters";
    }

    if (formData.pickupDate) {
      const date = new Date(formData.pickupDate);
      if (date.getDay() === 0) {
        newErrors.pickupDate = "No Sunday pickups";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        window.scrollTo(0, 0);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handleFinalPayment = () => {
    setSubmitError("");

    const payload: BookingCreate = {
      carrierId: toCarrierSlug(state.carrier ?? ""),
      originCountry: state.origin ?? "India",
      destinationCountry: state.destination,
      actualWeightKg: Number(state.weight),
      shipmentType: "package",
      itemTypeId: toItemTypeSlug(state.itemType ?? "other"),
      packaging: state.packaging ?? "none",
      insurance: state.insurance ?? false,
      senderName: formData.senderName,
      senderMobile: formData.senderMobile,
      senderEmail: formData.senderEmail,
      pickupPincode: formData.pickupPincode,
      pickupAddress: formData.pickupAddress,
      pickupCity: pincodeStatus.status === "found" ? pincodeStatus.city : (pincodeData?.city ?? ""),
      pickupState: pincodeData?.state ?? "",
      pickupDate: formData.pickupDate,
      pickupSlot: formData.pickupSlot,
      receiverName: formData.receiverName,
      receiverMobile: formData.receiverMobile,
      receiverEmail: formData.receiverEmail,
      deliveryAddress: formData.deliveryAddress,
      deliveryCity: formData.city,
      deliveryState: formData.state,
      deliveryZip: formData.zipCode,
      numPieces: parseInt(formData.numPieces, 10) || 1,
      contentsDesc: formData.contents || undefined,
    };

    createBooking(payload, {
      onSuccess: (booking) => {
        navigate("/booking-confirmation", {
          state: {
            ...state,
            ...formData,
            bookingRef: booking.booking_ref,
            trackingId: booking.booking_ref,
            totalPrice: booking.total_inr,
            estimatedDelivery: state.estimatedDelivery ?? "5–7 business days",
            route: `${pincodeStatus.status === "found" ? pincodeStatus.city : "India"} → ${state.destination}`,
          },
        });
      },
      onError: (err) => {
        setSubmitError(err.message);
      },
    });
  };

  return (
    <div className="min-h-screen bg-white text-brand-black flex flex-col font-sans overflow-x-hidden">
      {currentStep === 3 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-[100]">
          <div className="h-full bg-[#16A34A] transition-all duration-1000 w-full" />
        </div>
      )}
      <TopBar />
      <Navbar />

      <main className={cn("flex-grow pt-6 pb-24", currentStep === 3 ? "bg-white" : "bg-slate-50/50")}>
        <div className="container max-w-[1100px] mx-auto px-4">
          
          {/* Step Indicator (Steps 1 & 2) */}
          {currentStep < 3 && (
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
          )}

          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[800px] mx-auto">
              {/* Card 1 — Sender details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-50 p-2 rounded-lg text-green-primary"><User className="w-5 h-5" /></div>
                  <h2 className="text-xl font-bold">1. Sender details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase">Full Name *</label>
                    <Input 
                      placeholder="Enter sender's name" 
                      value={formData.senderName} 
                      onChange={e => setFormData({...formData, senderName: e.target.value})}
                      className={cn(errors.senderName && "border-red-500")}
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
                        className={cn("flex-1", errors.senderMobile && "border-red-500")}
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
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({...formData, pickupPincode: val});
                      }}
                      className={cn(
                        errors.pickupPincode && "border-red-500",
                        pincodeStatus.status === "found" && "border-green-500",
                        pincodeStatus.status === "not_found" && "border-red-500",
                      )}
                    />
                    {pincodeStatus.status === "loading" && (
                      <p className="text-[11px] text-slate-400">Checking pincode...</p>
                    )}
                    {pincodeStatus.status === "found" && (
                      <p className="text-[11px] text-green-600 font-semibold">
                        {pincodeStatus.city}
                        {pincodeStatus.surchargeInr > 0
                          ? ` — Pickup surcharge: ₹${pincodeStatus.surchargeInr}`
                          : " — Free pickup"}
                      </p>
                    )}
                    {pincodeStatus.status === "not_found" && (
                      <p className="text-[11px] text-red-500 font-semibold">Pickup not available at this pincode</p>
                    )}
                    {errors.pickupPincode && pincodeStatus.status === "idle" && (
                      <p className="text-[11px] text-red-500">{errors.pickupPincode}</p>
                    )}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase">Pickup Address *</label>
                    <Input 
                      placeholder="House no, Street name, Locality" 
                      value={formData.pickupAddress} 
                      onChange={e => setFormData({...formData, pickupAddress: e.target.value})}
                      className={cn(errors.pickupAddress && "border-red-500")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Pickup Date *</label>
                    <Input 
                      type="date"
                      min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Min tomorrow
                      value={formData.pickupDate} 
                      onChange={e => setFormData({...formData, pickupDate: e.target.value})}
                      className={cn(errors.pickupDate && "border-red-500")}
                    />
                    {errors.pickupDate && <p className="text-[11px] text-red-500 font-medium">{errors.pickupDate}</p>}
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

              {/* Card 2 — Receiver details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-50 p-2 rounded-lg text-green-primary"><Package className="w-5 h-5" /></div>
                  <h2 className="text-xl font-bold">2. Receiver details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase">Full Name *</label>
                    <Input 
                      placeholder="Receiver's full name" 
                      value={formData.receiverName} 
                      onChange={e => setFormData({...formData, receiverName: e.target.value})}
                      className={cn(errors.receiverName && "border-red-500")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase">Mobile Number *</label>
                    <div className="flex gap-2">
                      <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 flex items-center text-slate-500 font-medium">
                        {getMobilePrefix(state.destination)}
                      </div>
                      <Input
                        placeholder="Mobile number"
                        value={formData.receiverMobile}
                        onChange={e => setFormData({...formData, receiverMobile: e.target.value.replace(/\D/g, "")})}
                        className={cn("flex-1", errors.receiverMobile && "border-red-500")}
                      />
                    </div>
                    {errors.receiverMobile && <p className="text-xs text-red-500">{errors.receiverMobile}</p>}
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
                      className={cn("min-h-[80px]", errors.deliveryAddress && "border-red-500")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase">City *</label>
                    <Input 
                      placeholder="City" 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className={cn(errors.city && "border-red-500")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase">State/Province</label>
                    <Input
                      placeholder="State / Province"
                      value={formData.state}
                      onChange={e => setFormData({...formData, state: e.target.value})}
                      className={cn(errors.state && "border-red-500")}
                    />
                    {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase">Country</label>
                    <Input 
                      value={state.destination} 
                      readOnly 
                      className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-600 uppercase">Postal / ZIP Code *</label>
                    <Input 
                      placeholder="ZIP Code" 
                      value={formData.zipCode} 
                      onChange={e => setFormData({...formData, zipCode: e.target.value})}
                      className={cn(errors.zipCode && "border-red-500")}
                    />
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-6">Customs declaration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-600 uppercase">Number of Pieces *</label>
                      <Input 
                        type="number" 
                        value={formData.numPieces} 
                        onChange={e => setFormData({...formData, numPieces: e.target.value})}
                        className={cn(errors.numPieces && "border-red-500")}
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-[13px] font-bold text-slate-600 uppercase">Contents Description *</label>
                      <Textarea 
                        placeholder="e.g. University application documents — transcripts, certificates. No commercial value." 
                        value={formData.contents} 
                        onChange={e => setFormData({...formData, contents: e.target.value})}
                        className={cn("min-h-[100px]", errors.contents && "border-red-500")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleNext}
                  className="bg-green-primary hover:bg-green-dark text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-green-primary/20 flex items-center gap-2 group"
                >
                  Continue to review
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-[800px] mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-8 space-y-10">
                  {/* Sender Review */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-green-primary">
                       <User className="w-4 h-4" />
                       <h3 className="font-bold text-sm uppercase tracking-wider">Sender details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
                       <div><span className="text-slate-400">Name:</span> <p className="font-semibold text-brand-black">{formData.senderName}</p></div>
                       <div><span className="text-slate-400">Mobile:</span> <p className="font-semibold text-brand-black">+91 {formData.senderMobile}</p></div>
                       <div><span className="text-slate-400">Email:</span> <p className="font-semibold text-brand-black">{formData.senderEmail || 'N/A'}</p></div>
                       <div><span className="text-slate-400">Pickup Date:</span> <p className="font-semibold text-brand-black">{formData.pickupDate} ({formData.pickupSlot})</p></div>
                       <div className="md:col-span-2"><span className="text-slate-400">Address:</span> <p className="font-semibold text-brand-black leading-relaxed">{formData.pickupAddress}, {formData.pickupPincode}</p></div>
                    </div>
                  </section>

                  {/* Receiver Review */}
                  <section className="pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-green-primary">
                       <MapPin className="w-4 h-4" />
                       <h3 className="font-bold text-sm uppercase tracking-wider">Receiver details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
                       <div><span className="text-slate-400">Name:</span> <p className="font-semibold text-brand-black">{formData.receiverName}</p></div>
                       <div><span className="text-slate-400">Mobile:</span> <p className="font-semibold text-brand-black">{getMobilePrefix(state.destination)} {formData.receiverMobile}</p></div>
                       <div><span className="text-slate-400">Country:</span> <p className="font-semibold text-brand-black">{state.destination}</p></div>
                       <div><span className="text-slate-400">City/ZIP:</span> <p className="font-semibold text-brand-black">{formData.city}, {formData.zipCode}</p></div>
                       <div className="md:col-span-2"><span className="text-slate-400">Address:</span> <p className="font-semibold text-brand-black leading-relaxed">{formData.deliveryAddress}</p></div>
                    </div>
                  </section>

                  {/* Shipment Review */}
                  <section className="pt-8 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-green-primary">
                       <Package className="w-4 h-4" />
                       <h3 className="font-bold text-sm uppercase tracking-wider">Shipment details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
                       <div><span className="text-slate-400">Item Type:</span> <p className="font-semibold text-brand-black">{state.itemType}</p></div>
                       <div><span className="text-slate-400">Weight:</span> <p className="font-semibold text-brand-black">{state.weight} kg</p></div>
                       <div><span className="text-slate-400">Carrier / Plan:</span> <p className="font-semibold text-brand-black">{state.carrier} ({state.plan})</p></div>
                       <div><span className="text-slate-400">Number of Pieces:</span> <p className="font-semibold text-brand-black">{formData.numPieces} pcs</p></div>
                       <div className="md:col-span-2"><span className="text-slate-400">Contents:</span> <p className="font-semibold text-brand-black leading-relaxed">{formData.contents}</p></div>
                    </div>
                  </section>
                </div>

                {/* Price Breakdown Card */}
                <div className="bg-slate-50 p-8 border-t border-slate-100">
                   <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Price Breakdown</h3>
                   <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-500">Shipping charge ({state.weight}kg)</span>
                         <span className="font-medium text-brand-black">₹{Math.round(state.totalPrice - (state.pickupSurcharge || 0) - (state.packaging === 'standard' ? 150 : state.packaging === 'premium' ? 350 : 0) - (state.insurance ? 199 : 0)).toLocaleString()}</span>
                      </div>
                      {state.packaging !== 'none' && (
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Packaging ({state.packaging} box)</span>
                            <span className="font-medium text-brand-black">+₹{state.packaging === 'standard' ? '150' : '350'}</span>
                         </div>
                      )}
                      {state.insurance && (
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Transit Insurance</span>
                            <span className="font-medium text-brand-black">+₹199</span>
                         </div>
                      )}
                      {state.pickupSurcharge > 0 && (
                         <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Pickup surcharge ({state.pickupCity})</span>
                            <span className="font-medium text-brand-black">+₹{state.pickupSurcharge}</span>
                         </div>
                      )}
                      <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                         <span className="font-bold text-brand-black">Total Payable</span>
                         <span className="text-3xl font-bold text-green-primary leading-none">₹{state.totalPrice.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* Compliance Checkbox */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                 <Checkbox 
                    id="terms" 
                    checked={agreedToTerms} 
                    onCheckedChange={(c) => setAgreedToTerms(c as boolean)} 
                    className="mt-1"
                 />
                 <label htmlFor="terms" className="text-[13px] text-slate-600 leading-relaxed cursor-pointer select-none">
                    I confirm that all shipment details are accurate, contents comply with international customs regulations, and no prohibited items are included. I understand false declarations may result in delays or seizure.
                 </label>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <button 
                  onClick={() => {setCurrentStep(1); window.scrollTo(0, 0);}} 
                  className="text-slate-500 hover:text-brand-black font-semibold flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit details
                </button>
                <Button 
                  onClick={handleNext}
                  disabled={!agreedToTerms}
                  className="w-full md:w-auto bg-green-primary hover:bg-green-dark text-white px-10 h-12 rounded-xl font-bold shadow-lg shadow-green-primary/20 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to payment
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in fade-in duration-700">
               
               {/* Mobile Order Summary Strip */}
               <div className="lg:hidden sticky top-0 bg-white border-b border-slate-100 z-50 -mx-4 px-4 py-3 flex items-center justify-between shadow-sm cursor-pointer" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-brand-black">
                     <span>{state.pickupCity || 'Chennai'}</span>
                     <ArrowLeft className="w-3 h-3 rotate-180 text-slate-400" />
                     <span className="truncate max-w-[100px]">{state.destination}</span>
                     <span className="mx-1 text-slate-300">·</span>
                     <span className="text-green-dark">₹{state.totalPrice.toLocaleString()}</span>
                  </div>
                  {isSummaryExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
               </div>

               {/* Mobile Expanded Summary (Simplified Bottom Sheet feel) */}
               {isSummaryExpanded && (
                 <div className="lg:hidden bg-white border-b border-slate-200 p-4 animate-in slide-in-from-top duration-300 space-y-4">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[12px] text-slate-400 uppercase font-black">Shipment</p>
                          <p className="text-[14px] font-bold">{state.itemType} · {state.carrier}</p>
                       </div>
                       <p className="text-[12px] font-mono text-slate-400">REF-2025-AX92</p>
                    </div>
                    <div className="space-y-1">
                       <div className="flex justify-between text-[13px] text-slate-500">
                          <span>Shipping charge</span>
                          <span>₹{state.totalPrice.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
               )}

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
                  
                  {/* LEFT COLUMN: Payment Form */}
                  <div className="lg:col-span-7 space-y-8">
                     
                     {/* Header */}
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <button onClick={() => setCurrentStep(2)} className="hover:bg-slate-50 p-1 rounded-full transition-colors">
                              <ArrowLeft className="w-5 h-5 text-brand-black" />
                           </button>
                           <h1 className="text-[22px] font-medium text-brand-black">Payment</h1>
                        </div>
                        <p className="text-slate-400 text-[13px] ml-9">Complete your booking — you won't be charged until you confirm</p>
                     </div>

                     {/* Payment Method Tabs */}
                     <div className="border border-slate-200 rounded-[10px] overflow-hidden flex p-0.5 bg-slate-50/50">
                        {['upi', 'card', 'netbanking'].map(tab => (
                           <button
                             key={tab}
                             onClick={() => setPaymentTab(tab)}
                             className={cn(
                               "flex-1 py-3 text-[14px] font-semibold transition-all relative border-b-[1.5px] border-transparent uppercase tracking-wider",
                               paymentTab === tab 
                                 ? "bg-white text-[#15803D] border-[#15803D]" 
                                 : "bg-transparent text-[#6B7280] hover:text-brand-black"
                             )}
                           >
                             {tab === 'upi' ? 'UPI' : tab === 'card' ? 'Card' : 'Net banking'}
                           </button>
                        ))}
                     </div>

                     {/* Tab Content */}
                     <div className="min-h-[300px]">
                        {paymentTab === 'upi' && (
                           <div className="space-y-6 animate-in fade-in duration-300">
                              
                              {/* Option 1: UPI ID */}
                              <div 
                                onClick={() => setUpiOption('id')}
                                className={cn(
                                  "p-5 rounded-xl border transition-all cursor-pointer",
                                  upiOption === 'id' ? "border-[#16A34A] bg-white ring-1 ring-[#16A34A]/20" : "border-slate-100 bg-white"
                                )}
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", upiOption === 'id' ? "border-[#16A34A]" : "border-slate-300")}>
                                       {upiOption === 'id' && <div className="w-2.5 h-2.5 bg-[#16A34A] rounded-full" />}
                                    </div>
                                    <span className="font-medium text-brand-black">Pay via UPI ID</span>
                                 </div>
                                 
                                 {upiOption === 'id' && (
                                   <div className="mt-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                      <Input 
                                        placeholder="yourname@okicici" 
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="h-[44px] rounded-[10px] border-slate-200 focus-visible:ring-1 focus-visible:ring-[#16A34A]" 
                                      />
                                      <div className="flex flex-wrap items-center gap-4 text-slate-400">
                                         {[
                                            { n: 'GPay', i: <Smartphone className="w-4 h-4" /> },
                                            { n: 'PhonePe', i: <Smartphone className="w-4 h-4" /> },
                                            { n: 'Paytm', i: <Smartphone className="w-4 h-4" /> },
                                            { n: 'BHIM', i: <Smartphone className="w-4 h-4" /> }
                                         ].map(app => (
                                           <div key={app.n} className="flex items-center gap-1.5 opacity-60">
                                              <span className="text-[10px] font-bold uppercase">{app.n}</span>
                                           </div>
                                         ))}
                                      </div>
                                      <Button 
                                        onClick={handleFinalPayment}
                                        disabled={!upiId || isCreatingBooking}
                                        className="w-full h-[48px] bg-[#16A34A] hover:bg-[#15803D] text-white rounded-[10px] font-medium text-[15px]"
                                      >
                                         {isCreatingBooking ? <RotateCcw className="w-5 h-5 animate-spin" /> : "Verify & Pay"}
                                      </Button>
                                   </div>
                                 )}
                              </div>

                              {/* Option 2: QR Code */}
                              <div 
                                onClick={() => setUpiOption('qr')}
                                className={cn(
                                  "p-5 rounded-xl border transition-all cursor-pointer",
                                  upiOption === 'qr' ? "border-[#16A34A] bg-white ring-1 ring-[#16A34A]/20" : "border-slate-100 bg-white"
                                )}
                              >
                                 <div className="flex items-center gap-3">
                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", upiOption === 'qr' ? "border-[#16A34A]" : "border-slate-300")}>
                                       {upiOption === 'qr' && <div className="w-2.5 h-2.5 bg-[#16A34A] rounded-full" />}
                                    </div>
                                    <span className="font-medium text-brand-black">Scan QR code</span>
                                 </div>

                                 {upiOption === 'qr' && (
                                   <div className="mt-8 flex flex-col items-center animate-in slide-in-from-top-2 duration-300">
                                      <div className="w-[160px] h-[160px] border-2 border-slate-100 rounded-2xl flex items-center justify-center bg-slate-50 relative overflow-hidden">
                                         <div className="grid grid-cols-4 gap-1 opacity-10">
                                            {[...Array(16)].map((_, i) => <div key={i} className="w-6 h-6 bg-brand-black rounded-sm" />)}
                                         </div>
                                         <div className="absolute inset-0 flex items-center justify-center p-6">
                                            <div className="w-full h-full border-4 border-brand-black/5 rounded group-hover:scale-105 transition-transform" />
                                         </div>
                                      </div>
                                      <p className="mt-4 text-[12px] text-slate-400 font-medium tracking-tight">Open any UPI app and scan</p>
                                      <p className={cn(
                                        "mt-2 text-[12px] font-bold",
                                        qrTimer < 120 ? "text-red-500 animate-pulse" : "text-slate-500"
                                      )}>
                                        QR code expires in {formatTime(qrTimer)}
                                      </p>
                                   </div>
                                 )}
                              </div>
                           </div>
                        )}

                        {paymentTab === 'card' && (
                           <div className="space-y-6 animate-in fade-in duration-300 pt-2">
                              {/* Card Number */}
                              <div className="space-y-2 relative">
                                 <label className="text-[12px] font-bold text-slate-400 uppercase">Card Number</label>
                                 <div className="relative">
                                    <Input 
                                      placeholder="Card number" 
                                      value={cardNumber}
                                      onChange={handleCardNumberChange}
                                      className="h-[44px] rounded-[10px] border-slate-200 font-mono text-[16px] tracking-widest pl-10"
                                    />
                                    <CardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black italic text-slate-400">
                                       {getCardType(cardNumber) || "Network"}
                                    </div>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-slate-400 uppercase">Expiry</label>
                                    <Input 
                                      placeholder="MM / YY" 
                                      maxLength={5}
                                      value={cardExpiry}
                                      onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        if (val.length > 2) val = val.substring(0,2) + ' / ' + val.substring(2,4);
                                        setCardExpiry(val);
                                      }}
                                      className="h-[44px] rounded-[10px] border-slate-200"
                                    />
                                 </div>
                                 <div className="space-y-2 relative">
                                    <label className="text-[12px] font-bold text-slate-400 uppercase">CVV</label>
                                    <div className="relative">
                                       <Input 
                                         type={showCvv ? "text" : "password"}
                                         placeholder="CVV" 
                                         maxLength={3}
                                         value={cardCvv}
                                         onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                         className="h-[44px] rounded-[10px] border-slate-200 pr-10"
                                       />
                                       <button 
                                         onClick={() => setShowCvv(!showCvv)}
                                         className="absolute right-3 top-1/2 -translate-y-1/2"
                                       >
                                          {showCvv ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                                       </button>
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-[12px] font-bold text-slate-400 uppercase">Cardholder Name</label>
                                 <Input 
                                   placeholder="Name as on card" 
                                   value={cardHolder}
                                   onChange={(e) => setCardHolder(e.target.value)}
                                   className="h-[44px] rounded-[10px] border-slate-200"
                                 />
                              </div>

                              <div className="flex items-center gap-3">
                                 <Checkbox id="savecard" className="border-slate-200 rounded" />
                                 <label htmlFor="savecard" className="text-[13px] text-slate-500 font-medium">Save this card for future bookings</label>
                              </div>

                              {/* Card Security Badges */}
                              <div className="flex items-center justify-center gap-6 py-2 border-y border-slate-50">
                                 <div className="flex items-center gap-1.5 opacity-40">
                                    <Lock className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase">256-bit SSL</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 opacity-40">
                                    <Shield className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase">PCI DSS Compliant</span>
                                 </div>
                                 <div className="text-[10px] font-black italic text-slate-300">Razorpay</div>
                              </div>

                              <Button 
                                onClick={handleFinalPayment}
                                disabled={isCreatingBooking || !cardNumber || !cardExpiry || !cardCvv}
                                className="w-full h-[48px] bg-[#16A34A] hover:bg-[#15803D] text-white rounded-[10px] font-medium text-[15px]"
                              >
                                 {isCreatingBooking ? <RotateCcw className="w-5 h-5 animate-spin" /> : `Pay ₹${state.totalPrice.toLocaleString()} →`}
                              </Button>
                           </div>
                        )}

                        {paymentTab === 'netbanking' && (
                           <div className="space-y-8 animate-in fade-in duration-300 pt-2">
                              {/* Bank Grid */}
                              <div className="grid grid-cols-3 gap-3">
                                 {POPULAR_BANKS.map(bank => (
                                   <div 
                                     key={bank.id}
                                     className="bg-white border border-slate-100 rounded-[8px] p-3 flex flex-col items-center justify-center gap-2 hover:border-[#16A34A] hover:bg-green-50/10 cursor-pointer transition-all h-[72px]"
                                   >
                                      <div className="w-7 h-7 bg-slate-50 rounded-full overflow-hidden flex items-center justify-center">
                                         <img src={bank.icon} alt={bank.name} className="w-5 h-5 object-contain" />
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-500">{bank.name}</span>
                                   </div>
                                 ))}
                              </div>

                              <div className="space-y-4">
                                 <div className="relative">
                                    <select className="w-full h-[44px] rounded-[10px] border border-slate-200 bg-white px-4 text-[14px] appearance-none text-slate-600 font-medium">
                                       <option>Search for other banks</option>
                                       <option>Bank of India</option>
                                       <option>Canara Bank</option>
                                       <option>Federal Bank</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                 </div>

                                 <Button 
                                   onClick={handleFinalPayment}
                                   disabled={isCreatingBooking}
                                   className="w-full h-[48px] bg-[#16A34A] hover:bg-[#15803D] text-white rounded-[10px] font-medium text-[15px]"
                                 >
                                    {isCreatingBooking ? <RotateCcw className="w-5 h-5 animate-spin" /> : "Proceed to bank →"}
                                 </Button>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Trust Bar */}
                     <div className="flex items-center justify-center gap-8 text-[11px] text-[#9CA3AF] py-6 grayscale opacity-80">
                        <div className="flex items-center gap-1.5">
                           <Lock className="w-3 h-3" />
                           <span>Bank-grade encryption</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <ShieldCheck className="w-3.5 h-3.5" />
                           <span>No hidden charges</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <RotateCcw className="w-3 h-3" />
                           <span>Free cancellation (2h)</span>
                        </div>
                     </div>
                  </div>

                  {/* RIGHT COLUMN: Order Summary Card */}
                  <div className="lg:col-span-5 hidden lg:block sticky top-24">
                     <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 space-y-6">
                        <div className="flex justify-between items-center">
                           <h2 className="text-[14px] font-medium text-brand-black">Order summary</h2>
                           <span className="text-[11px] font-mono text-slate-400">REF-2025-AX92</span>
                        </div>

                        <div className="space-y-4">
                           <div>
                              <div className="flex items-center gap-2 text-[14px] font-medium text-brand-black">
                                 <span>{state.pickupCity || 'Chennai'}</span>
                                 <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                                 <span>{state.destination}</span>
                              </div>
                              <p className="text-[12px] text-slate-400 mt-1">{state.itemType} · {state.carrier}</p>
                              <p className="text-[11px] text-slate-400">{state.planDays || '12–15 business days'}</p>
                           </div>

                           <div className="border-t border-slate-100 pt-4 space-y-2">
                              {/* Price Rows */}
                              <div className="flex justify-between items-center h-8 text-[13px]">
                                 <span className="text-slate-500">Shipping charge ({state.weight}kg · 50% off)</span>
                                 <span className="text-brand-black">₹{(state.totalPrice - (state.packaging === 'premium' ? 350 : state.packaging === 'standard' ? 150 : 0) - (state.insurance ? 199 : 0)).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center h-8 text-[13px]">
                                 <span className="text-slate-500">Packaging</span>
                                 <span className="text-brand-black">₹{state.packaging === 'premium' ? 350 : state.packaging === 'standard' ? 150 : 0}</span>
                              </div>
                              <div className="flex justify-between items-center h-8 text-[13px]">
                                 <span className="text-slate-500">Insurance</span>
                                 <span className="text-brand-black">₹{state.insurance ? 199 : 0}</span>
                              </div>
                              <div className="flex justify-between items-center h-8 text-[13px]">
                                 <span className="text-slate-500">Pickup surcharge</span>
                                 <span className="text-green-primary">Free</span>
                              </div>
                           </div>

                           <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                              <span className="text-[15px] font-semibold text-brand-black">Total payable</span>
                              <span className="text-[22px] font-bold text-[#15803D]">₹{state.totalPrice.toLocaleString()}</span>
                           </div>

                           <div className="space-y-3">
                              <div className="bg-green-50 px-3 py-1.5 rounded-md inline-block">
                                 <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wider">Inclusive of all taxes</span>
                              </div>
                              <div className="flex items-start gap-2 pt-1">
                                 <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0 mt-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                 </div>
                                 <p className="text-[11px] text-slate-500 leading-tight">
                                    Booking confirmation will be sent to <strong>+91 {formData.senderMobile.substring(0,2)}XXXXXX{formData.senderMobile.slice(-2)}</strong> via WhatsApp
                                 </p>
                              </div>
                           </div>

                           {/* Cancellation Policy */}
                           <div className="border-t border-slate-100 pt-3">
                              <button className="flex items-center justify-between w-full group">
                                 <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors">Free cancellation policy</span>
                                 <ChevronDown className="w-3 h-3 text-slate-300" />
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Fixed CTA */}
      {currentStep === 3 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-4 animate-in slide-in-from-bottom duration-500 z-[100]">
           <Button 
            onClick={handleFinalPayment}
            disabled={isCreatingBooking}
            className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white h-14 rounded-xl font-bold text-lg shadow-xl shadow-green-primary/20"
           >
             {isCreatingBooking ? <RotateCcw className="w-5 h-5 animate-spin" /> : `Pay ₹${state.totalPrice.toLocaleString()}`}
           </Button>
           {submitError && (
             <p className="text-sm text-red-500 text-center mt-3">{submitError}</p>
           )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Booking;
