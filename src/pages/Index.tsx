import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";
import ServicesSection from "@/components/ServicesSection";
import MedicineCourierSection from "@/components/MedicineCourierSection";
import AcceptedItemsSection from "@/components/AcceptedItemsSection";
import ShopShipSection from "@/components/ShopShipSection";
import BranchesSection from "@/components/BranchesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CustomersSection from "@/components/CustomersSection";
import BlogSection from "@/components/BlogSection";
import PartnersSection from "@/components/PartnersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <TopBar />
    <Navbar />
    <HeroSection />
    <PricingSection />
    <ServicesSection />
    <MedicineCourierSection />
    <AcceptedItemsSection />
    <ShopShipSection />
    <BranchesSection />
    <TestimonialsSection />
    <CustomersSection />
    <BlogSection />
    <PartnersSection />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
