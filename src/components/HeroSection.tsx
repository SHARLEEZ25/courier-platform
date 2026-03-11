import { motion } from "framer-motion";
import { Search, Globe, CheckCircle, Package, ArrowRight } from "lucide-react";
import { useState } from "react";

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "UAE",
  "Singapore", "Malaysia", "Sri Lanka", "Germany", "France",
  "Netherlands", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain",
  "New Zealand", "South Africa", "Japan", "South Korea", "Italy",
  "Spain", "Switzerland", "Sweden", "Ireland", "Norway",
];

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState<"quote" | "track">("quote");
  const [trackingNumber, setTrackingNumber] = useState("");

  return (
    <section className="bg-light-bg" id="hero">
      <div className="container py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pt-4"
          >
            <div className="inline-flex items-center gap-2 bg-secondary text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Shipping to 220+ Countries
            </div>

            <h1 className="text-4xl lg:text-[56px] font-bold text-dark-text leading-tight mb-6">
              Fast, Reliable International Courier — From India to the World
            </h1>

            <p className="text-base text-body-text max-w-lg mb-8">
              Uniex Courier has been trusted for 18 years to deliver documents, packages, and cargo worldwide. Powered by DHL, FedEx, Aramex & UPS.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href="https://uniex.in/home/get_quote"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg text-[15px] font-medium hover:bg-green-dark transition-colors"
              >
                Get a Quote <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#hero"
                onClick={() => setActiveTab("track")}
                className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-lg text-[15px] font-medium hover:bg-secondary transition-colors"
              >
                Track Shipment
              </a>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-body-text">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                18 Years Experience
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                220+ Countries
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Same Day Pickup
              </div>
            </div>
          </motion.div>

          {/* Right — Tabbed Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="bg-card rounded-xl border border-card-border shadow-card">
              {/* Tabs */}
              <div className="flex border-b border-card-border">
                <button
                  onClick={() => setActiveTab("quote")}
                  className={`flex-1 py-3.5 text-[15px] font-medium transition-colors ${
                    activeTab === "quote"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  📦 Get a Quote
                </button>
                <button
                  onClick={() => setActiveTab("track")}
                  className={`flex-1 py-3.5 text-[15px] font-medium transition-colors ${
                    activeTab === "track"
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🔍 Track Shipment
                </button>
              </div>

              <div className="p-6">
                {activeTab === "quote" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 block">From</label>
                        <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground border border-input outline-none focus:ring-2 focus:ring-ring">
                          <option>India</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 block">To</label>
                        <select className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground border border-input outline-none focus:ring-2 focus:ring-ring">
                          {countries.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Weight (Kg)</label>
                      <input
                        type="number"
                        placeholder="e.g. 2.5"
                        className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground border border-input outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 block">Mobile Number</label>
                        <div className="flex">
                          <span className="bg-muted border border-input border-r-0 rounded-l-lg px-3 py-2.5 text-sm text-muted-foreground">+91</span>
                          <input
                            placeholder="Mobile Number"
                            className="w-full bg-muted rounded-r-lg px-3 py-2.5 text-sm text-foreground border border-input outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-1.5 block">Email (Optional)</label>
                        <input
                          type="email"
                          placeholder="you@email.com"
                          className="w-full bg-muted rounded-lg px-3 py-2.5 text-sm text-foreground border border-input outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-[15px] font-medium hover:bg-green-dark transition-colors">
                      Calculate Shipping Rate
                    </button>
                    <p className="text-xs text-muted-foreground text-center">Free estimate • No signup required</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">Enter your tracking number(s)</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="e.g. UNX2024001, UNX2024002"
                        className="w-full bg-muted rounded-lg px-4 py-3 text-sm text-foreground border border-input outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">Separate multiple numbers with a comma</p>
                    </div>
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-[15px] font-medium hover:bg-green-dark transition-colors flex items-center justify-center gap-2">
                      <Search className="w-4 h-4" />
                      Track Now
                    </button>
                    <p className="text-xs text-muted-foreground text-center">📞 Need help? Call +91 9600879666</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
