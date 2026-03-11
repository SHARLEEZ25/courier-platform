import { motion } from "framer-motion";
import { Check } from "lucide-react";

const stats = [
  { value: "18", suffix: "+", label: "YEARS IN BUSINESS" },
  { value: "220", suffix: "+", label: "COUNTRIES SERVED" },
  { value: "50", suffix: "K+", label: "SHIPMENTS DELIVERED" },
  { value: "4", suffix: "", label: "GLOBAL CARRIER PARTNERS" },
];

const features = [
  "Door-to-door pickup and delivery",
  "Real-time shipment tracking portal",
  "Competitive rates — cheaper than airline excess baggage",
  "Full customs documentation support",
  "Dedicated WhatsApp and phone support",
  "18 years of zero-compromise reliability",
];

const WhyChooseSection = () => (
  <section className="py-24 lg:py-28">
    <div className="container">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2"
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`py-8 px-6 ${
                i % 2 === 0 ? "border-r border-gray-200" : ""
              } ${i < 2 ? "border-b border-gray-200" : ""}`}
            >
              <div className="text-[52px] font-extrabold text-brand-black leading-none tracking-[-0.03em]">
                {s.value}
                <span className="text-green-primary">{s.suffix}</span>
              </div>
              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-[0.06em] mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-primary mb-3">
            WHY CHOOSE US
          </p>
          <h3 className="text-[24px] lg:text-[28px] font-bold text-brand-black leading-[1.3] tracking-[-0.02em] mb-7">
            Built for businesses and individuals who can't afford delays.
          </h3>
          <div className="space-y-3.5">
            {features.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="w-4 h-4 rounded-full bg-green-primary flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-[15px] font-medium text-gray-700">{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default WhyChooseSection;
