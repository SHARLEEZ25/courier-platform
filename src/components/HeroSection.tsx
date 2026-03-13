import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Package, Search } from "lucide-react";

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
  "Singapore", "Malaysia", "United Arab Emirates", "Saudi Arabia", "Japan",
  "South Korea", "New Zealand", "Italy", "Spain", "Netherlands", "Sweden",
  "Switzerland", "Ireland", "South Africa", "Kenya", "Nigeria", "Brazil",
  "Mexico", "Thailand", "Philippines", "Indonesia", "Vietnam", "China",
  "Hong Kong", "Taiwan", "Qatar", "Kuwait", "Bahrain", "Oman",
];

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState<"quote" | "track">("quote");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [trackingId, setTrackingId] = useState("");

  return (
    <section className="relative bg-green-tint" id="hero">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(hsl(var(--green-primary)) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="container relative">
        {/* Top text area */}
        <div className="pt-20 pb-8 text-center max-w-[700px] mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 bg-green-muted text-green-deep border border-[hsl(var(--green-muted))] rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-5">
              ✦ Trusted Since 2006 · 220+ Countries
            </div>

            <h1 className="text-[40px] lg:text-[60px] font-extrabold text-brand-black leading-[1.08] tracking-[-0.03em] mb-4">
              Get an Instant{" "}
              <span className="underline decoration-green-primary decoration-[3px] underline-offset-[6px]">
                Shipping Rate
              </span>
            </h1>

            <p className="text-[16px] lg:text-[17px] text-gray-500 leading-[1.7] max-w-[520px] mx-auto">
              Compare prices from DHL, FedEx, Aramex & UPS. Ship documents, parcels, and cargo from India to 220+ countries.
            </p>
          </motion.div>
        </div>

        {/* Main calculator card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-[880px] mx-auto pb-20"
        >
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("quote")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === "quote"
                    ? "text-green-primary"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <Package className="w-4 h-4" />
                Get a Quote
                {activeTab === "quote" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-primary"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("track")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors relative ${
                  activeTab === "track"
                    ? "text-green-primary"
                    : "text-gray-500 hover:text-brand-black"
                }`}
              >
                <Search className="w-4 h-4" />
                Track Shipment
                {activeTab === "track" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-primary"
                  />
                )}
              </button>
            </div>

            {/* Quote form */}
            {activeTab === "quote" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="p-6 lg:p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* From */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">From</label>
                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-3 bg-green-tint">
                      <span className="text-base">🇮🇳</span>
                      <span className="text-sm font-semibold text-brand-black">India</span>
                    </div>
                  </div>

                  {/* To */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">To</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm font-medium text-brand-black bg-white focus:ring-2 focus:ring-green-primary/30 focus:border-green-primary transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Weight (Kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm font-medium text-brand-black placeholder:text-gray-500/50 focus:ring-2 focus:ring-green-primary/30 focus:border-green-primary transition-colors"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mobile</label>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-primary/30 focus-within:border-green-primary transition-colors">
                      <span className="flex items-center px-3 bg-green-tint text-xs font-semibold text-gray-500 border-r border-gray-200">+91</span>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="flex-1 px-3 py-3 text-sm font-medium text-brand-black placeholder:text-gray-500/50 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Second row */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm font-medium text-brand-black placeholder:text-gray-500/50 focus:ring-2 focus:ring-green-primary/30 focus:border-green-primary transition-colors"
                    />
                  </div>
                  <div className="flex items-end">
                    <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-green-primary hover:bg-green-dark text-white px-8 py-3 rounded-lg text-[15px] font-semibold transition-colors">
                      Calculate Shipping Rate <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Free estimate · No signup required · Powered by DHL, FedEx, Aramex & UPS
                </p>
              </motion.div>
            )}

            {/* Track form */}
            {activeTab === "track" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="p-6 lg:p-8"
              >
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Enter your tracking number(s)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="e.g. UNX2024001, UNX2024002"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-4 py-3.5 text-sm font-medium text-brand-black placeholder:text-gray-500/50 focus:ring-2 focus:ring-green-primary/30 focus:border-green-primary transition-colors"
                  />
                  <button className="inline-flex items-center justify-center gap-2 bg-green-primary hover:bg-green-dark text-white px-8 py-3.5 rounded-lg text-[15px] font-semibold transition-colors whitespace-nowrap">
                    Track Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Separate multiple tracking numbers with a comma · 📞 Need help? Call +91 9600879666
                </p>
              </motion.div>
            )}
          </div>

          {/* Trust strip below card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-[13px] font-medium text-gray-500"
          >
            {["18 Yrs Experience", "220+ Countries", "Same Day Pickup"].map((item, i) => (
              <span key={item} className="flex items-center gap-2">
                {i > 0 && <span className="w-px h-3.5 bg-gray-200 -ml-1.5 mr-1.5 hidden sm:block" />}
                <span className="w-1.5 h-1.5 rounded-full bg-green-primary" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
