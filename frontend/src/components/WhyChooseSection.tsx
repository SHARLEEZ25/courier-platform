import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const StatCounter = ({ value, suffix, isPrice = false }: { value: string; suffix: string; isPrice?: boolean }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const formatted = Math.round(latest);
    return formatted.toLocaleString();
  });
  const [showSuffix, setShowSuffix] = useState(false);

  useEffect(() => {
    if (isInView) {
      const numericValue = parseInt(value.replace(/,/g, ""));
      const controls = animate(count, numericValue, {
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1], // easeOutExpo
        onComplete: () => {
          setTimeout(() => setShowSuffix(true), 200);
        },
      });
      return controls.stop;
    }
  }, [isInView, value, count]);

  return (
    <div ref={ref} className="text-[36px] sm:text-[52px] font-extrabold text-brand-black leading-none tracking-[-0.03em] flex items-baseline">
      <motion.span>{rounded}</motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: showSuffix ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-green-primary"
      >
        {suffix}
      </motion.span>
    </div>
  );
};

const stats = [
  { value: "18", suffix: "+", label: "YEARS IN BUSINESS" },
  { value: "220", suffix: "+", label: "COUNTRIES SERVED" },
  { value: "50000", suffix: "+", label: "SHIPMENTS DELIVERED" },
  { value: "4", suffix: "", label: "GLOBAL CARRIER PARTNERS" },
];

const features = [
  "Pickup from anywhere in India",
  "Free packing and document support",
  "Secure and on-time delivery, every time",
  "Transparent pricing with no hidden charges",
  "Real-time tracking from pickup to delivery",
  "Dedicated WhatsApp and phone support",
];

const WhyChooseSection = () => (
  <section className="py-24 lg:py-28">
    <div className="container">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div className="grid grid-cols-2">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`py-5 px-3 sm:py-8 sm:px-6 ${
                i % 2 === 0 ? "border-r border-gray-200" : ""
              } ${i < 2 ? "border-b border-gray-200" : ""}`}
            >
              <StatCounter value={s.value} suffix={s.suffix} />
              <p className="text-[13px] font-medium text-gray-500 uppercase tracking-[0.06em] mt-2">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-primary mb-3">
            WHY CHOOSE UNIEX
          </p>
          <h3 className="text-[24px] lg:text-[28px] font-bold text-brand-black leading-[1.3] tracking-[-0.02em] mb-7">
            Built for people who can't afford delays.
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
