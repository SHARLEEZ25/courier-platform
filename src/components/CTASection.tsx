import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const CTASection = () => (
  <section className="py-16 bg-primary">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-3xl lg:text-4xl font-semibold text-primary-foreground mb-3">
          Ready to Ship? Get a Free Quote in 60 Seconds.
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
          No sign-up needed. Just enter your destination and package weight.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://uniex.in/home/get_quote"
            className="inline-flex items-center gap-2 bg-card text-primary px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Get a Free Quote
          </a>
          <a
            href="tel:+919380839266"
            className="inline-flex items-center gap-2 border border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary-foreground/10 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call Us Now
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
