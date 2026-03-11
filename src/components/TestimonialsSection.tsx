import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Lakshmi",
    text: "I received my mother's medication in 3 days from Chennai. They buy the medications for you and send it across.",
  },
  {
    name: "Daya",
    route: "Tamil Nadu → USA",
    text: "Uniex helped me collect products from different stores across Tamil Nadu and consolidated them into one shipment. Delivered to the USA within just 4 days!",
  },
  {
    name: "Raja",
    route: "Madurai → London",
    text: "Uniex arranged a smooth pickup from my home in Madurai and delivered the parcel to London within a week. No customs issues. Super efficient!",
  },
  {
    name: "Thuyavan",
    route: "Delhi → UK",
    text: "I shipped a package from a sports shop in Delhi to the UK. Uniex handled the packing very well and took care of everything. Great service!",
  },
  {
    name: "Roshan",
    text: "Received in 3 days and they collected prescription from doctor office. Reliable service.",
  },
  {
    name: "Ranjana",
    text: "We got the medicines today. Thank you so much, I will definitely refer your service to all my friends here.",
  },
];

const TestimonialsSection = () => (
  <section className="py-20" id="testimonials">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-accent font-semibold text-sm tracking-wider uppercase">Testimonials</span>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mt-2">What Our Customers Say</h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl p-6 shadow-card relative"
          >
            <Quote className="w-8 h-8 text-accent/20 absolute top-4 right-4" />
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
            <div>
              <div className="font-display font-bold text-sm text-foreground">{t.name}</div>
              {t.route && <div className="text-xs text-muted-foreground">{t.route}</div>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
