import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import ShippingRateCalculator from "@/components/ShippingRateCalculator";
import QuoteResults from "@/components/QuoteResults";
import Footer from "@/components/Footer";

const GetQuote = () => {
  const [quoteData, setQuoteData] = useState<{ origin: string; destination: string; weight: number; itemType: string } | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <TopBar />
      <Navbar />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {!quoteData ? (
            <motion.div
              key="hero-quote"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-[#F9FAFB] py-16 md:py-24 border-b border-gray-100 relative overflow-hidden"
            >
              {/* Background patterns mirror HeroSection */}
              <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-quote" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-quote)" />
                </svg>
              </div>

              <div className="container relative z-10 flex flex-col items-center text-center">
                <div className="max-w-[850px] mb-10">
                  <h1 className="text-[38px] lg:text-[56px] font-black text-brand-black leading-[1.05] tracking-[-0.04em] mb-4">
                    Get an <span className="text-green-primary">Instant Quote.</span>
                  </h1>
                  <p className="text-base md:text-[17px] text-brand-gray leading-relaxed max-w-[650px] mx-auto opacity-80">
                    Compare real-time rates from DHL, FedEx, Aramex & UPS. <br className="hidden md:block" />
                    Enter your shipment details below to see prices immediately.
                  </p>
                </div>

                <div className="w-full max-w-[1020px]">
                  <ShippingRateCalculator 
                    variant="horizontal" 
                    onCalculate={(data) => setQuoteData(data)} 
                  />
                </div>

                {/* Trust mini-bar */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-40">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-black">
                    <div className="w-1 h-1 rounded-full bg-green-primary" /> Transparent Pricing
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-black">
                    <div className="w-1 h-1 rounded-full bg-green-primary" /> No Calls Needed
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-black">
                    <div className="w-1 h-1 rounded-full bg-green-primary" /> Door-to-Door
                  </div>
                </div>
              </div>

              {/* Decorative Blobs */}
              <div className="absolute top-1/4 -left-20 w-80 h-80 bg-green-100/30 rounded-full blur-[100px] -z-10" />
              <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-green-100/30 rounded-full blur-[100px] -z-10" />
            </motion.div>
          ) : (
            <motion.div
              key="compact-header-quote"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-[85px] z-50 bg-white"
            >
              <ShippingRateCalculator 
                variant="compact" 
                initialData={quoteData}
                onCalculate={(data) => setQuoteData(data)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {quoteData && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-700 bg-white min-h-[600px]">
            <QuoteResults 
              origin={quoteData.origin} 
              destination={quoteData.destination} 
              weight={quoteData.weight} 
              itemType={quoteData.itemType}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default GetQuote;
