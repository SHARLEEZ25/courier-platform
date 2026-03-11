import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PartnersSection from "@/components/PartnersSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import AcceptedItemsSection from "@/components/AcceptedItemsSection";
import CoverageSection from "@/components/CoverageSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
 
const Index = () => (
  <div className="min-h-screen bg-background text-gray-900">
    <TopBar />
    <Navbar />
    <HeroSection />
    <PartnersSection />
    <ServicesSection />
    <PricingSection />
    <HowItWorksSection />
    <WhyChooseSection />
    <AcceptedItemsSection />
    <CoverageSection />
    <TestimonialsSection />
    <CTASection />
    <Footer />
    <ChatWidget />
  </div>
);

export default Index;
