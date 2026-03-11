import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    text: "Sent my university documents to Canada and they arrived in 3 days. Uniex is the only courier I trust for time-sensitive admissions submissions.",
    name: "Priya R.",
    detail: "Chennai — University Documents",
    initials: "PR",
  },
  {
    text: "Used Shop & Ship to buy from Amazon UK. The entire process was seamless — great pricing and zero customs headache on my end.",
    name: "Arjun M.",
    detail: "Coimbatore — Shop & Ship",
    initials: "AM",
  },
  {
    text: "Every Diwali we send parcels to family in the USA. For 6 years straight, not a single issue. That kind of consistency is rare.",
    name: "Kavitha S.",
    detail: "Chennai — Personal Parcels",
    initials: "KS",
  },
];

const TestimonialsSection = () => (
  <section className="bg-green-tint py-24 lg:py-28" id="testimonials">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-primary mb-3">
          CUSTOMER STORIES
        </p>
        <h2 className="text-[32px] lg:text-[40px] font-bold text-brand-black leading-[1.2] tracking-[-0.02em]">
          Trusted by thousands<br />of senders across India.
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="bg-white border border-gray-200 rounded-xl p-7 hover:border-green-primary transition-colors duration-200"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-4">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-3.5 h-3.5 fill-green-primary text-green-primary" />
              ))}
            </div>

            {/* Quote */}
            <div className="relative">
              <span className="absolute -top-3 -left-1 text-[36px] text-green-muted font-serif leading-none select-none">
                "
              </span>
              <p className="text-[15px] text-gray-700 leading-[1.7] italic pl-3">
                {t.text}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-5" />

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-muted flex items-center justify-center">
                <span className="text-[13px] font-bold text-green-deep">{t.initials}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-black">{t.name}</p>
                <p className="text-xs text-gray-500">{t.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
