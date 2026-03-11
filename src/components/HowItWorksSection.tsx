import { motion } from "framer-motion";
import { Calculator, ClipboardList, Car, Radio } from "lucide-react";

const steps = [
  { icon: Calculator, title: "Get a Quote", desc: "Enter your destination and package details for an instant estimate" },
  { icon: ClipboardList, title: "Book Your Shipment", desc: "Fill in sender & receiver details and confirm your booking" },
  { icon: Car, title: "Schedule Pickup", desc: "We come to you. Same-day and next-day pickup available in Chennai" },
  { icon: Radio, title: "Track in Real Time", desc: "Get live updates from pickup to final delivery" },
];

const HowItWorksSection = () => (
  <section className="py-20 bg-light-bg">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl lg:text-4xl font-semibold text-dark-text">Ship Anywhere in 4 Simple Steps</h2>
      </motion.div>

      <div className="relative">
        {/* Connecting line */}
        <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-card-border" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center relative"
            >
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold relative z-10">
                {i + 1}
              </div>
              <h3 className="font-display font-bold text-dark-text mb-2">{s.title}</h3>
              <p className="text-sm text-body-text">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
