import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

/* ── Mockup screens ── */
const QuoteScreen = () => (
    <div className="p-5">
      <p className="text-sm font-bold text-brand-black mb-3">Instant Shipping Quote</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-700 font-medium">🇮🇳 India</div>
        <div className="bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-700 font-medium">🇺🇸 United States</div>
      </div>
      <div className="bg-gray-100 rounded-lg px-3 py-2 text-xs text-gray-500 mb-3">Weight (kg): 2.5</div>
      <div className="bg-green-primary text-white text-xs font-semibold py-2 rounded-lg text-center mb-3">
      Calculate Rate →
    </div>
    <div className="space-y-2">
      {[
        { carrier: "DHL Express", price: "₹2,450", time: "2–3 days", best: true },
        { carrier: "FedEx Intl.", price: "₹1,980", time: "3–5 days", best: false },
        { carrier: "Aramex", price: "₹1,640", time: "5–7 days", best: false },
      ].map((r) => (
        <div key={r.carrier} className="flex items-center justify-between py-1.5 border-t border-gray-200 first:border-0">
          <div>
            <span className="text-xs font-semibold text-brand-black">{r.carrier}</span>
            {r.best && (
              <span className="ml-1.5 text-[10px] bg-green-muted text-green-deep font-semibold px-1.5 py-0.5 rounded">
                Best
              </span>
            )}
            <p className="text-[10px] text-gray-500">{r.time}</p>
          </div>
          <span className="text-xs font-bold text-brand-black">{r.price}</span>
        </div>
      ))}
    </div>
  </div>
);

const BookingScreen = () => (
  <div className="p-5 flex flex-col items-center justify-center h-full">
    <div className="w-10 h-10 rounded-full bg-green-primary flex items-center justify-center mb-3">
      <Check className="w-5 h-5 text-white" />
    </div>
    <p className="text-[15px] font-bold text-brand-black mb-3">Booking Confirmed!</p>
    <div className="w-full bg-gray-100 rounded-lg p-3 space-y-2 text-xs">
      {[
        ["Tracking ID", "UNX-2024-00847"],
        ["Route", "Chennai → New York"],
        ["Carrier", "DHL Express"],
        ["Delivery", "3–4 Business Days"],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between">
          <span className="text-gray-500">{label}</span>
          <span className="font-bold text-brand-black">{value}</span>
        </div>
      ))}
    </div>
    <button className="w-full mt-3 border border-green-primary text-green-primary text-xs font-semibold py-2 rounded-lg">
      View Tracking →
    </button>
  </div>
);

const TrackingScreen = () => {
  const steps = [
    { label: "Picked Up", loc: "Chennai", time: "09:30 AM", done: true },
    { label: "In Transit", loc: "Delhi Air Hub", time: "04:15 PM", done: true },
    { label: "Departed", loc: "IGI Airport", time: "11:50 PM", done: true },
    { label: "Customs", loc: "New York JFK", time: "Pending", done: false },
    { label: "Out for Del.", loc: "New York", time: "Pending", done: false },
  ];

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-bold text-brand-black">UNX-2024-00847</span>
        <span className="text-[10px] bg-green-primary text-white font-semibold px-2 py-0.5 rounded-full">
          DHL Express
        </span>
      </div>
      <div className="space-y-0">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-start gap-3 relative">
            {/* Line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-2 h-2 rounded-full mt-1.5 ${
                  s.done ? "bg-green-primary" : "border-2 border-gray-200 bg-white"
                }`}
              />
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-6 ${
                    s.done && steps[i + 1]?.done ? "bg-green-primary" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 flex justify-between items-start pb-1">
              <div>
                <p className="text-xs font-semibold text-brand-black leading-tight">{s.label}</p>
                <p className="text-[10px] text-gray-500">{s.loc}</p>
              </div>
              <span className="text-[10px] text-gray-500">{s.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const screens = [QuoteScreen, BookingScreen, TrackingScreen];

/* ── Hero ── */
const HeroSection = () => {
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((p) => (p + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const ActiveComponent = screens[activeScreen];

  return (
    <section className="bg-white" id="hero">
      <div className="container py-20 lg:py-24">
        <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Pill */}
            <div className="inline-flex items-center gap-1.5 bg-green-muted text-green-deep border border-[hsl(var(--green-muted))] rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-4">
              ✦ Trusted Since 2006 · 200+ Countries
            </div>

            {/* H1 */}
            <h1
              className="text-[40px] lg:text-[64px] font-extrabold text-brand-black leading-[1.1] tracking-[-0.03em] mb-5"
            >
              Fast. Reliable.<br />
              <span className="underline decoration-green-primary decoration-[3px] underline-offset-[6px]">
                International Courier
              </span>
              <br />
              From India.
            </h1>

            {/* Subtext */}
            <p className="text-[17px] text-gray-500 leading-[1.75] max-w-[480px] mb-8">
              Reliable parcel delivery from India to 200+ countries. 
              We ship via DPD, DHL, Uniex, DPEX, and Aramex.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <a
                href="/get-quote"
                className="inline-flex items-center gap-2 bg-green-primary text-white px-7 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-green-dark transition-colors"
              >
                Get a Free Quote <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 border-[1.5px] border-gray-200 text-gray-700 px-7 py-3.5 rounded-lg text-[15px] font-semibold hover:border-green-primary hover:text-green-primary transition-colors"
              >
                Track a Shipment
              </a>
            </div>

            {/* Trust strip */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.15,
                  },
                },
              }}
              className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-gray-700 mb-4"
            >
              {[
                { name: "DPD", color: "text-[#B00000]" },
                { name: "DHL", color: "text-[#FFCC00]" },
                { name: "Uniex", color: "text-[#2E7D32]" },
                { name: "DPEX", color: "text-[#E31E24]" },
                { name: "Aramex", color: "text-[#E31E24]" }
              ].map((carrier, i) => (
                <motion.span 
                  key={carrier.name}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-2"
                >
                  {i > 0 && <span className="w-px h-4 bg-gray-200 -ml-1 mr-1" />}
                  <span className={`w-1.5 h-1.5 rounded-full bg-green-primary`} />
                  <span className="font-bold">{carrier.name}</span>
                </motion.span>
              ))}
            </motion.div>

          </motion.div>

          {/* RIGHT — Animated mockup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="animate-float">
              {/* Browser chrome */}
              <div className="bg-gray-100 rounded-t-xl px-4 flex items-center gap-2" style={{ height: 32 }}>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white rounded-full px-4 py-0.5 text-[10px] text-gray-500 font-medium">
                    <span className="text-green-primary">Uniex</span> Dashboard
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl min-h-[340px] relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeScreen}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <ActiveComponent />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-5">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveScreen(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeScreen === i
                      ? "w-5 bg-green-primary"
                      : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
