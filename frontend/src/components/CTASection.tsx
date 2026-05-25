import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

const CTASection = () => (
  <section className="bg-brand-black py-20 lg:py-24">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-[800px] mx-auto text-center"
      >
        {/* Pill */}
        <div className="inline-flex items-center bg-[#1A1A1A] border border-green-deep text-green-primary text-xs font-semibold uppercase tracking-[0.08em] px-4 py-1.5 rounded-full mb-6">
          GET STARTED TODAY
        </div>

        <h2 className="text-[36px] lg:text-[44px] font-extrabold text-white leading-[1.15] tracking-[-0.02em] mb-3">
          Ready to ship? Get your<br />free quote in 60 seconds.
        </h2>

        <p className="text-[15px] text-gray-400 mb-9">
          Get your quote instantly — free account required to book.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="/get-quote"
            className="inline-flex items-center gap-2 bg-green-primary text-white px-7 py-3.5 rounded-lg text-[15px] font-semibold hover:bg-green-dark transition-colors"
          >
            Get a Free Quote <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="tel:+919600879666"
            className="inline-flex items-center gap-2 border border-gray-700 text-white px-7 py-3.5 rounded-lg text-[15px] font-semibold hover:border-gray-500 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call +91 9600879666
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
