import { motion } from "framer-motion";
import { Search, Package, Globe, Truck } from "lucide-react";
import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-navy/85" />
      </div>

      <div className="relative container py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-accent/20 text-orange-light rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              India to 200+ Countries
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
              Shop & Ship{" "}
              <span className="text-gradient">Worldwide</span>
              <br />
              from India
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-lg mb-8">
              Your trusted partner for reliable and cost-effective parcel delivery from India to USA, UK, Canada, Europe, Australia, UAE, Singapore, and more.
            </p>

            <div className="flex flex-wrap gap-6 text-primary-foreground/80 text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                Door-to-Door Service
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                Real-time Tracking
              </div>
            </div>
          </motion.div>

          {/* Right - Tracking & Rate Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Tracking */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Track your Shipment</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="flex-1 bg-muted rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent transition"
                />
                <button className="bg-accent text-accent-foreground px-5 py-3 rounded-lg font-semibold text-sm shadow-button hover:brightness-110 transition flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Track
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Separate multiple tracking numbers with a space or comma.</p>
            </div>

            {/* Shipping Rate */}
            <div className="bg-card rounded-2xl p-6 shadow-card">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Shipping Rates</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">From</label>
                  <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground outline-none">
                    <option>India</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                  <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground outline-none">
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Canada</option>
                    <option>UAE</option>
                    <option>Singapore</option>
                    <option>Malaysia</option>
                    <option>Sri Lanka</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Weight (Kg)</label>
                  <input placeholder="e.g., 2.5" className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Mobile Number</label>
                  <input placeholder="Mobile Number" className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                </div>
              </div>
              <button className="w-full mt-4 bg-accent text-accent-foreground py-3 rounded-lg font-semibold text-sm shadow-button hover:brightness-110 transition">
                Calculate
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
