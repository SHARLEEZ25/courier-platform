import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya R.",
    city: "Chennai",
    text: "Sent my university documents to Canada — arrived in 3 days. Uniex is the only courier I trust for time-sensitive submissions.",
  },
  {
    name: "Arjun M.",
    city: "Coimbatore",
    text: "Used the Shop & Ship service to buy from Amazon UK. Smooth process, great pricing, no customs headache.",
  },
  {
    name: "Kavitha S.",
    city: "Chennai",
    text: "18 years in business says it all. My family abroad gets parcels from us reliably every festival season.",
  },
];

const TestimonialsSection = () => (
  <section className="py-20 bg-light-bg" id="testimonials">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl lg:text-4xl font-semibold text-dark-text">What Our Customers Say</h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-card-border rounded-xl p-6"
          >
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-body-text leading-relaxed mb-4">"{t.text}"</p>
            <div>
              <div className="font-display font-bold text-sm text-dark-text">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.city}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
