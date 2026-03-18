import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Package, Calendar, MapPin, ArrowRight, Share2, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState("");
  
  const state = location.state || {
    senderName: "Customer",
    destination: "USA",
    carrier: "Aramex",
    totalPrice: 1500,
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (state.trackingId) setTrackingId(state.trackingId);
  }, [state.trackingId]);

  return (
    <div className="min-h-screen bg-white text-brand-black flex flex-col font-sans">
      <TopBar />
      <Navbar />

      <main className="flex-grow bg-slate-50/50 py-16">
        <div className="container max-w-[800px] mx-auto px-4">
          
          <div className="text-center mb-12 animate-in fade-in zoom-in duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-primary rounded-full mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-3">
              {state.isMembership ? "Welcome to the Club!" : "Booking Confirmed!"}
            </h1>
            <p className="text-slate-500 text-lg">
              {state.isMembership 
                ? `Thank you, ${state.name}. Your ${state.membershipType} membership is now active.` 
                : `Thank you, ${state.senderName}. Your shipment has been scheduled.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            
            {/* Tracking Card */}
            <div className="bg-white rounded-2xl border border-green-100 p-8 shadow-sm flex flex-col items-center text-center animate-in slide-in-from-left-8 duration-700">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tracking ID</span>
              <div className="text-2xl font-black text-brand-black mb-4 font-mono tracking-tighter bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                {trackingId}
              </div>
              <p className="text-sm text-slate-500 mb-6">
                {state.isMembership ? "Your membership ID for all future discounts." : "Use this ID to track your shipment live on our website."}
              </p>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1 h-11 rounded-xl border-slate-200 text-slate-600 gap-2 font-bold text-sm">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button className="flex-1 h-11 rounded-xl bg-brand-black text-white gap-2 font-bold text-sm">
                  <Download className="w-4 h-4" /> Receipt
                </Button>
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-in slide-in-from-right-8 duration-700">
              <h3 className="font-bold text-brand-black mb-4 flex items-center gap-2">
                 <ArrowRight className="w-4 h-4 text-green-primary" /> What's next?
              </h3>
              <ul className="space-y-4">
                 {state.isMembership ? (
                   <>
                     <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold shrink-0">1</div>
                        <p className="text-sm text-slate-600">Your discounts will be automatically applied whenever you log in.</p>
                     </li>
                     <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold shrink-0">2</div>
                        <p className="text-sm text-slate-600">Locked rates are now active for the next 12 months.</p>
                     </li>
                     <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold shrink-0">3</div>
                        <p className="text-sm text-slate-600">Priority support is available via your dedicated WhatsApp line.</p>
                     </li>
                   </>
                 ) : (
                   <>
                     <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold shrink-0">1</div>
                        <p className="text-sm text-slate-600">Our executive will call you within 2 hours to confirm the pickup.</p>
                     </li>
                     <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold shrink-0">2</div>
                        <p className="text-sm text-slate-600">Keep your ID proof and shipment items ready for verification.</p>
                     </li>
                     <li className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[12px] font-bold shrink-0">3</div>
                        <p className="text-sm text-slate-600">We will pack your items professionally during the pickup.</p>
                     </li>
                   </>
                 )}
              </ul>
            </div>
          </div>

          {/* Quick Summary Section */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="bg-slate-50 p-4 px-8 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                  {state.isMembership ? "Plan Summary" : "Shipment Summary"}
                </span>
                <span className="text-sm font-bold text-green-primary">Paid: ₹{(state.totalPrice || state.price || 0).toLocaleString()}</span>
             </div>
             <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
                {state.isMembership ? (
                  <>
                    <div className="flex items-start gap-3">
                       <ShieldCheck className="w-5 h-5 text-slate-300 mt-1" />
                       <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Plan</span>
                          <p className="text-[14px] font-semibold text-brand-black">{state.membershipType} Membership</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <Calendar className="w-5 h-5 text-slate-300 mt-1" />
                       <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Valid Until</span>
                          <p className="text-[14px] font-semibold text-brand-black">15 March 2027</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <CheckCircle2 className="w-5 h-5 text-slate-300 mt-1" />
                       <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Status</span>
                          <p className="text-[14px] font-semibold text-green-primary">Active</p>
                       </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                       <Package className="w-5 h-5 text-slate-300 mt-1" />
                       <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Service</span>
                          <p className="text-[14px] font-semibold text-brand-black">{state.carrier} ({state.plan || 'Standard'})</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <MapPin className="w-5 h-5 text-slate-300 mt-1" />
                       <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Route</span>
                          <p className="text-[14px] font-semibold text-brand-black truncate max-w-[180px]">{state.route || state.destination}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <Calendar className="w-5 h-5 text-slate-300 mt-1" />
                       <div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase">Est. Delivery</span>
                          <p className="text-[14px] font-semibold text-green-primary">{state.estimatedDelivery || "12–15 business days"}</p>
                       </div>
                    </div>
                  </>
                )}
             </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
             <Button 
               onClick={() => navigate("/track")}
               className="w-full sm:w-auto px-8 h-12 rounded-xl bg-green-primary hover:bg-green-dark text-white font-bold gap-2"
             >
                Track Shipment Live <ExternalLink className="w-4 h-4" />
             </Button>
             <Button 
               variant="ghost" 
               onClick={() => navigate("/")}
               className="text-slate-500 hover:text-brand-black font-semibold"
             >
                Back to home
             </Button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;
