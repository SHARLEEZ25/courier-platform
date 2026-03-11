import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const stats = [
  { value: "18+", label: "Years in Business" },
  { value: "220+", label: "Countries Served" },
  { value: "50,000+", label: "Shipments Delivered" },
  { value: "4", label: "Global Carrier Partners" },
];

const features = [
  "Door-to-door pickup and delivery",
  "Real-time shipment tracking",
  "Competitive rates vs airline excess baggage",
  "Customs documentation support",
  "Dedicated support via WhatsApp & phone",
  "Same-day pickup in Chennai",
];

const WhyChooseSection = () => (
  <section className="py-20">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl lg:text-4xl font-semibold text-dark-text">Why Choose Uniex</h2>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-card-border rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-1">{s.value}</div>
              <div className="text-sm text-body-text">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-4"
        >
          {features.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="text-body-text">{f}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default WhyChooseSection;
