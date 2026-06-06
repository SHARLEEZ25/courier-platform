import React, { useState, useEffect } from "react";
import { useSubscribe } from "@/hooks/useMembership";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Check, 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  CreditCard as CardIcon,
  Smartphone,
  RotateCcw,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MembershipCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {
    planName: "Silver", 
    price: 299,
    savings: 5000
  };

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentTab, setPaymentTab] = useState("upi"); // upi, card, netbanking
  const [upiOption, setUpiOption] = useState("id"); // id, qr
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { mutate: subscribe, isPending: isProcessing } = useSubscribe();
  const [qrTimer, setQrTimer] = useState(600);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // QR Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentTab === 'upi' && upiOption === 'qr' && qrTimer > 0) {
      interval = setInterval(() => {
        setQrTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [paymentTab, upiOption, qrTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

  const handleFinalPayment = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Required";
    if (!formData.mobile) newErrors.mobile = "Required";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSubmitError("");

    // Map plan name to plan ID
    const planId = state.planName?.toLowerCase() as "silver" | "gold";

    subscribe(
      { planId },
      {
        onSuccess: (membership) => {
          navigate("/booking-confirmation", {
            state: {
              membershipType: state.planName,
              price: state.price,
              name: formData.name,
              mobile: formData.mobile,
              trackingId: membership.id,
              expiresAt: membership.expires_at,
              isMembership: true,
            },
          });
        },
        onError: (err) => {
          // 401 = not signed in; show a helpful message instead of a generic error
          if (err.message.toLowerCase().includes("unauthori") || err.message.includes("401")) {
            setSubmitError("Please sign in to activate your membership.");
          } else {
            setSubmitError(err.message);
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#111827] flex flex-col font-sans">
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-[100]">
        <div className="h-full bg-[#16A34A] transition-all duration-1000 w-full" />
      </div>
      <TopBar />
      <Navbar />

      <main className="flex-grow pt-6 pb-24 bg-white">
        <div className="container max-w-[1100px] mx-auto px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-4">
            
            {/* LEFT COLUMN: Details & Payment */}
            <div className="lg:col-span-7 space-y-8">
               
               {/* Header */}
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <button onClick={() => navigate(-1)} className="hover:bg-slate-50 p-1 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-[#111827]" />
                     </button>
                     <h1 className="text-[24px] font-medium text-[#111827]">Membership Checkout</h1>
                  </div>
                  <p className="text-[#6B7280] text-[14px] ml-9">Secure 1-step checkout for CourierPro {state.planName}</p>
               </div>

               {/* Personal Info */}
               <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="bg-green-50 p-2 rounded-lg text-[#16A34A]"><User className="w-5 h-5" /></div>
                   <h2 className="text-base font-bold">Personal details</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[12px] font-bold text-[#6B7280] uppercase">Full Name *</label>
                     <Input 
                       placeholder="Enter your name" 
                       value={formData.name} 
                       onChange={e => setFormData({...formData, name: e.target.value})}
                       className={cn(errors.name && "border-red-500")}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[12px] font-bold text-[#6B7280] uppercase">Mobile Number *</label>
                     <div className="flex gap-2">
                       <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 flex items-center text-[#6B7280] font-medium">+91</div>
                       <Input 
                         placeholder="10-digit mobile" 
                         maxLength={10}
                         value={formData.mobile} 
                         onChange={e => setFormData({...formData, mobile: e.target.value.replace(/\D/g, "")})}
                         className={cn("flex-1", errors.mobile && "border-red-500")}
                       />
                     </div>
                   </div>
                   <div className="md:col-span-2 space-y-2">
                     <label className="text-[12px] font-bold text-[#6B7280] uppercase">Email Address</label>
                     <Input 
                       placeholder="you@email.com" 
                       value={formData.email} 
                       onChange={e => setFormData({...formData, email: e.target.value})}
                     />
                   </div>
                 </div>
               </div>

               {/* Payment Method Tabs */}
               <div className="space-y-6">
                 <div className="flex items-center gap-3 mb-2">
                   <div className="bg-green-50 p-2 rounded-lg text-[#16A34A]"><CreditCard className="w-5 h-5" /></div>
                   <h2 className="text-base font-bold">Payment method</h2>
                 </div>

                 <div className="border border-slate-200 rounded-[12px] overflow-hidden flex p-1 bg-slate-50/50">
                    {['upi', 'card', 'netbanking'].map(tab => (
                       <button
                         key={tab}
                         onClick={() => setPaymentTab(tab)}
                         className={cn(
                           "flex-1 py-3 text-[13px] font-bold rounded-[8px] transition-all uppercase tracking-wider",
                           paymentTab === tab 
                             ? "bg-white text-[#15803D] shadow-sm" 
                             : "text-[#6B7280] hover:text-[#111827]"
                         )}
                       >
                         {tab === 'upi' ? 'UPI' : tab === 'card' ? 'Card' : 'Net banking'}
                       </button>
                    ))}
                 </div>

                 {/* Tab Content */}
                 <div className="min-h-[200px]">
                    {paymentTab === 'upi' && (
                       <div className="space-y-4 animate-in fade-in duration-300">
                          <div 
                            onClick={() => setUpiOption('id')}
                            className={cn(
                              "p-5 rounded-xl border transition-all cursor-pointer",
                              upiOption === 'id' ? "border-[#16A34A] bg-[#F0FDF4]/50" : "border-slate-100 bg-white"
                            )}
                          >
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", upiOption === 'id' ? "border-[#16A34A]" : "border-slate-300")}>
                                      {upiOption === 'id' && <div className="w-2.5 h-2.5 bg-[#16A34A] rounded-full" />}
                                   </div>
                                   <span className="font-bold text-[#111827]">Pay via UPI ID</span>
                                </div>
                             </div>
                             
                             {upiOption === 'id' && (
                               <div className="mt-5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                  <Input 
                                    placeholder="yourname@okicici" 
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="h-[48px] rounded-xl border-slate-200 focus-visible:ring-[#16A34A]" 
                                  />
                               </div>
                             )}
                          </div>

                          <div 
                            onClick={() => setUpiOption('qr')}
                            className={cn(
                              "p-5 rounded-xl border transition-all cursor-pointer",
                              upiOption === 'qr' ? "border-[#16A34A] bg-[#F0FDF4]/50" : "border-slate-100 bg-white"
                            )}
                          >
                             <div className="flex items-center gap-3">
                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", upiOption === 'qr' ? "border-[#16A34A]" : "border-slate-300")}>
                                   {upiOption === 'qr' && <div className="w-2.5 h-2.5 bg-[#16A34A] rounded-full" />}
                                </div>
                                <span className="font-bold text-[#111827]">Scan QR code</span>
                             </div>

                             {upiOption === 'qr' && (
                               <div className="mt-8 flex flex-col items-center animate-in slide-in-from-top-2 duration-300">
                                  <div className="w-[180px] h-[180px] border-2 border-slate-100 rounded-3xl flex items-center justify-center bg-white relative overflow-hidden shadow-sm">
                                     <div className="grid grid-cols-4 gap-1 opacity-5">
                                        {[...Array(16)].map((_, i) => <div key={i} className="w-8 h-8 bg-black rounded-sm" />)}
                                     </div>
                                     <div className="absolute inset-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
                                       <Smartphone className="w-8 h-8 text-slate-300" />
                                     </div>
                                  </div>
                                  <p className="mt-4 text-[12px] text-[#6B7280] font-medium uppercase tracking-wider">Expires: {formatTime(qrTimer)}</p>
                               </div>
                             )}
                          </div>
                       </div>
                    )}

                    {paymentTab === 'card' && (
                       <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
                            <div className="space-y-2">
                               <label className="text-[12px] font-bold text-[#6B7280] uppercase">Card Number</label>
                               <div className="relative">
                                  <Input 
                                    placeholder="0000 0000 0000 0000" 
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    className="h-[48px] rounded-xl pl-12 font-mono"
                                  />
                                  <CardIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                                    {getCardType(cardNumber)}
                                  </span>
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[12px] font-bold text-[#6B7280] uppercase">Expiry</label>
                                  <Input placeholder="MM / YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="h-[48px] rounded-xl" />
                               </div>
                               <div className="space-y-2 relative">
                                  <label className="text-[12px] font-bold text-[#6B7280] uppercase">CVV</label>
                                  <div className="relative">
                                     <Input type={showCvv ? "text" : "password"} placeholder="***" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="h-[48px] rounded-xl pr-12" />
                                     <button onClick={() => setShowCvv(!showCvv)} className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {showCvv ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                                     </button>
                                  </div>
                               </div>
                            </div>
                          </div>
                       </div>
                    )}
                 </div>
               </div>

               {/* Terms */}
               <div className="flex items-start gap-4 p-5 bg-[#F9FAFB] rounded-2xl border border-slate-100">
                  <Checkbox 
                     id="terms" 
                     checked={agreedToTerms} 
                     onCheckedChange={(c) => setAgreedToTerms(c as boolean)} 
                     className="mt-1 border-slate-300"
                  />
                  <label htmlFor="terms" className="text-[13px] text-[#4B5563] leading-relaxed cursor-pointer select-none">
                     I agree to the membership terms and conditions. I understand that memberships are billed annually and provide fixed discounts on international shipments.
                  </label>
               </div>

               <Button 
                onClick={handleFinalPayment}
                disabled={!agreedToTerms || isProcessing}
                className="w-full h-[60px] bg-[#16A34A] hover:bg-[#15803D] text-white rounded-[16px] font-bold text-[18px] shadow-xl shadow-green-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {isProcessing ? (
                   <div className="flex items-center gap-3">
                     <RotateCcw className="w-5 h-5 animate-spin" />
                     <span>Processing...</span>
                   </div>
                 ) : (
                   `Pay ₹${state.price.toLocaleString()} Securely`
                 )}
              </Button>
              {submitError && (
                <p className="text-sm text-red-500 text-center mt-3">{submitError}</p>
              )}
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-[#F8FAFC] rounded-3xl p-8 border border-slate-100 sticky top-24">
                <h3 className="text-sm font-bold text-[#6B7280] uppercase tracking-widest mb-6">Order Summary</h3>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[18px] text-[#111827]">{state.planName} Membership</p>
                      <p className="text-[13px] text-[#6B7280]">Fixed savings for 12 months</p>
                    </div>
                    <p className="font-bold text-[18px] text-[#111827]">₹{state.price.toLocaleString()}</p>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="space-y-4">
                    <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Benefits included:</p>
                    <ul className="space-y-3">
                      {[
                        `Save ₹${state.savings.toLocaleString()} annually (estimated)`,
                        "Locked shipping rates",
                        "Priority pickup & packaging",
                        "Dedicated WhatsApp support"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#4B5563]">
                          <div className="w-4 h-4 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-[#16A34A]" />
                          </div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px bg-slate-200" />

                  <div className="flex justify-between items-center">
                    <p className="font-bold text-[16px] text-[#111827]">Total Due</p>
                    <p className="text-[28px] font-bold text-[#16A34A]">₹{state.price.toLocaleString()}</p>
                  </div>

                  <div className="pt-4 space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
                      <Lock className="w-3.5 h-3.5" />
                      <span>256-bit AES Encryption</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Shield className="w-10 h-6 text-slate-200 opacity-50" />
                      <CreditCard className="w-10 h-6 text-slate-200 opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MembershipCheckout;
