import { motion, useInView } from "framer-motion";
import { Calculator, ClipboardList, Truck, MapPin } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const steps = [
  { icon: Calculator, num: "01", title: "Get a Quote", desc: "Enter your destination, weight, and package details for an instant price estimate." },
  { icon: ClipboardList, num: "02", title: "Book Your Shipment", desc: "Fill in sender and receiver details and confirm your booking in under 2 minutes." },
  { icon: Truck, num: "03", title: "We Pick Up From You", desc: "Available across Chennai, Tamil Nadu, and all major cities in India. Same-day and next-day pickup available." },
  { icon: MapPin, num: "04", title: "Track in Real Time", desc: "Receive live status updates from pickup through customs and all the way to final delivery." },
];

const StepNumber = ({ num, delay }: { num: string; delay: number }) => {
  const isInView = useInView(useRef(null), { once: true, margin: "-50px" });
  const [displayNum, setDisplayNum] = useState("00");

  useEffect(() => {
    if (isInView) {
      const target = parseInt(num);
      let current = 0;
      const duration = 600;
      const interval = duration / (target + 1);

      const timer = setTimeout(() => {
        const counter = setInterval(() => {
          current++;
          setDisplayNum(current.toString().padStart(2, "0"));
          if (current >= target) clearInterval(counter);
        }, interval);
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, num, delay]);

  return (
    <div className="overflow-hidden h-[48px]">
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-[48px] font-extrabold text-green-muted leading-none select-none block"
      >
        {displayNum}
      </motion.span>
    </div>
  );
};

const HowItWorksSection = () => (
  <section className="bg-green-tint py-24 lg:py-28">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-primary mb-3">
          THE PROCESS
        </p>
        <h2 className="text-[32px] lg:text-[40px] font-bold text-brand-black leading-[1.2] tracking-[-0.02em] max-w-[500px] mx-auto">
          From quote to delivery<br />in four steps.
        </h2>
      </motion.div>
 
      <div className="relative">
        <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] border-t border-dashed border-green-muted" />
 
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="text-center relative"
            >
              <StepNumber num={s.num} delay={i * 0.2} />
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto -mt-8 relative z-10 mb-4">
                <s.icon className="w-5 h-5 text-green-primary" />
              </div>
              <h3 className="text-[15px] font-semibold text-brand-black mb-2">{s.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
