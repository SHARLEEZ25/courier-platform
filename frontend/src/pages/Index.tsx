import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import ShippingRateCalculator from "@/components/ShippingRateCalculator";
import HeroSection from "@/components/HeroSection";
import QuoteResults from "@/components/QuoteResults";
import PartnersSection from "@/components/PartnersSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import CoverageSection from "@/components/CoverageSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  const [quoteData, setQuoteData] = useState<{ origin: string; destination: string; weight: number; itemType: string } | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <TopBar />
      <Navbar />
      
      <AnimatePresence mode="wait">
        {!quoteData ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <HeroSection onCalculate={(data) => setQuoteData(data)} />
          </motion.div>
        ) : (
          <motion.div
            key="compact-header"
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
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <QuoteResults 
            origin={quoteData.origin} 
            destination={quoteData.destination} 
            weight={quoteData.weight} 
            itemType={quoteData.itemType}
          />
        </div>
      )}

      <PartnersSection />
      <ServicesSection />
      <PricingSection />
      <HowItWorksSection />
      <WhyChooseSection />
      <CoverageSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
