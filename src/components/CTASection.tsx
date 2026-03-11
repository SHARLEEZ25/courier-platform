import { motion } from "framer-motion";
import { Phone, MessageCircle } from "lucide-react";

const CTASection = () => (
  <section className="py-16 bg-navy">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-foreground mb-4">
          Ready to Ship Your Parcel?
        </h2>
        <p className="text-primary-foreground/60 mb-8 max-w-md mx-auto">
          Contact us today for the best international courier rates from India.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="tel:+919380839266"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold shadow-button hover:brightness-110 transition"
          >
            <Phone className="w-5 h-5" />
            Call Now
          </a>
          <a
            href="https://wa.me/917550020068?text=hi"
            className="inline-flex items-center gap-2 bg-teal text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:brightness-110 transition"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
