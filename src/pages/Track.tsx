import React, { useState } from "react";
import { Search, Loader2, Phone, Mail, MessageCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

const Track = () => {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = () => {
    if (!trackingId) return;
    setLoading(true);
    setError("");
    setResult(null);

    // Mock API delay
    setTimeout(() => {
      setLoading(false);
      const id = trackingId.toUpperCase().trim();
      if (id.includes("UNX")) {
        setResult({
          id: id.split(",")[0].trim(), // Use first ID if multiple
          status: "In Transit",
          statusType: "transit",
          route: "Chennai, India → London, United Kingdom",
          carrier: "DHL Express",
          estDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric"
          }),
          steps: [
            { label: "Picked up", completed: true, time: "3 days ago, 10:30 AM" },
            { label: "In transit", completed: true, time: "2 days ago, 03:15 PM" },
            { label: "Customs cleared", completed: true, time: "1 day ago, 09:45 AM" },
            { label: "Out for delivery", completed: false, current: true },
            { label: "Delivered", completed: false },
          ]
        });
      } else {
        setError("No shipment found for this tracking number. Please check and try again.");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <Header />

      <main className="flex-grow container py-20 pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-brand-black mb-4">Track Your Shipment</h1>
            <p className="text-brand-gray">Enter your Uniex tracking number to get live updates</p>
          </div>

          <div className="bg-white p-2 rounded-2xl shadow-lg border border-card-border mb-12">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-grow">
                <Input
                  placeholder="e.g. UNX2025001, UNX2025002"
                  className="h-14 border-none text-lg px-6 focus-visible:ring-0"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                />
              </div>
              <Button 
                onClick={handleTrack}
                disabled={loading}
                className="h-14 md:w-40 bg-green-primary hover:bg-green-dark text-white text-lg font-bold rounded-xl shrink-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track Now →"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-brand-gray text-center -mt-8 mb-12">
            Separate multiple tracking numbers with a comma
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-red-600 text-center animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-card-border">
                {/* Header Row */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <div className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-1">Tracking ID</div>
                    <div className="text-2xl font-mono font-bold text-brand-black">{result.id}</div>
                  </div>
                  <div className={cn(
                    "px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider",
                    result.statusType === "transit" ? "bg-amber-50 text-amber-700 border border-amber-100" : 
                    result.statusType === "delivered" ? "bg-green-50 text-green-700 border border-green-100" :
                    "bg-gray-50 text-gray-700 border border-gray-100"
                  )}>
                    {result.status}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div>
                    <div className="text-xs font-bold text-brand-gray uppercase mb-1">Route</div>
                    <div className="text-sm font-semibold text-brand-black">{result.route}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-brand-gray uppercase mb-1">Carrier</div>
                    <div className="text-sm font-semibold text-brand-black">{result.carrier}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-brand-gray uppercase mb-1">Est. Delivery</div>
                    <div className="text-sm font-semibold text-green-dark">{result.estDelivery}</div>
                  </div>
                </div>

                {/* Visual Timeline - Desktop Horizontal */}
                <div className="hidden md:block">
                  <div className="relative mb-20 px-4">
                    {/* Line */}
                    <div className="absolute top-5 left-8 right-8 h-1 bg-gray-100 z-0">
                      <div 
                        className="h-full bg-green-primary transition-all duration-1000" 
                        style={{ width: "65%" }} 
                      />
                    </div>
                    
                    {/* Steps */}
                    <div className="relative z-10 flex justify-between">
                      {result.steps.map((step: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center w-1/5 text-center px-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                            step.completed ? "bg-green-primary border-green-primary shadow-lg shadow-green-100" :
                            step.current ? "bg-white border-green-primary ring-4 ring-green-50" :
                            "bg-white border-gray-200"
                          )}>
                            {step.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : step.current ? (
                              <div className="w-3 h-3 bg-green-primary rounded-full animate-pulse" />
                            ) : (
                              <div className="w-2 h-2 bg-gray-200 rounded-full" />
                            )}
                          </div>
                          <div className="mt-4">
                            <div className={cn(
                              "text-sm font-bold",
                              (step.completed || step.current) ? "text-brand-black" : "text-brand-gray"
                            )}>
                              {step.label}
                            </div>
                            {step.time && (
                              <div className="text-[10px] text-brand-gray mt-1 leading-tight">{step.time}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Timeline - Mobile Vertical */}
                <div className="md:hidden space-y-8">
                  {result.steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0",
                          step.completed ? "bg-green-primary border-green-primary" :
                          step.current ? "bg-white border-green-primary ring-4 ring-green-50" :
                          "bg-white border-gray-200"
                        )}>
                          {step.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : step.current ? (
                            <div className="w-2.5 h-2.5 bg-green-primary rounded-full animate-pulse" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-200 rounded-full" />
                          )}
                        </div>
                        {idx !== result.steps.length - 1 && (
                          <div className={cn(
                            "w-0.5 h-12 my-1",
                            step.completed ? "bg-green-primary" : "bg-gray-100"
                          )} />
                        )}
                      </div>
                      <div className="pt-1">
                        <div className={cn(
                          "text-base font-bold",
                          (step.completed || step.current) ? "text-brand-black" : "text-brand-gray"
                        )}>
                          {step.label}
                        </div>
                        {step.time && (
                          <div className="text-xs text-brand-gray mt-0.5">{step.time}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help Section */}
              <div className="text-center pt-8">
                <p className="text-brand-gray font-medium mb-8">Need help with your shipment?</p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                  <a href="tel:+919600879666" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-100 hover:bg-green-50 transition-all group">
                    <Phone className="w-4 h-4 text-green-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-brand-black">+91 9600879666</span>
                  </a>
                  <a href="mailto:uniexanr@gmail.com" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-100 hover:bg-green-50 transition-all group">
                    <Mail className="w-4 h-4 text-green-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-brand-black">uniexanr@gmail.com</span>
                  </a>
                  <a href="https://wa.me/919600879666" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-green-100 hover:bg-green-50 transition-all group">
                    <MessageCircle className="w-4 h-4 text-green-primary group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-brand-black">WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Track;
