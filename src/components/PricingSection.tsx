import { motion } from "framer-motion";
import { Phone } from "lucide-react";

const pricingData = [
  {
    country: "USA",
    flag: "🇺🇸",
    rates: [
      "5 kgs – ₹800/850 per kg",
      "10+ kgs – ₹650/700/750/800 per kg",
    ],
    note: "Lesser rates = more delivery time",
    phone: "+919380839266",
    featured: true,
  },
  {
    country: "UK",
    flag: "🇬🇧",
    rates: [
      "5 kgs – ₹750/800 per kg",
      "10 kgs – ₹500/550 per kg",
      "20-25 kgs – ₹410/450/500 per kg",
    ],
    note: "Lesser rates = longer delivery time",
    phone: "+919380839266",
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    rates: [
      "5 kgs – ₹900 per kg",
      "10-20 kgs – ₹750/850/950 per kg",
    ],
    note: "Lesser rate = more delivery time",
    phone: "+918124666786",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    rates: [
      "5 kgs – ₹5000/5500",
      "10 kgs – ₹750/800/850 per kg",
    ],
    note: "Lesser rates = more delivery time",
    phone: "+918124666786",
  },
  {
    country: "Singapore / Sri Lanka / Malaysia / UAE",
    flag: "🌏",
    rates: [
      "5 kgs – ₹500/600 per kg",
      "10 kgs – ₹350/450 per kg",
      "20-30 kgs – ₹340/400 per kg",
    ],
    note: "Lesser rates = more delivery time",
    phone: "+918124666786",
  },
];

const PricingSection = () => (
  <section className="py-20 bg-warm-gray" id="pricing">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-accent font-semibold text-sm tracking-wider uppercase">Competitive Pricing</span>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mt-2">
          International Courier Rates from India
        </h2>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Express & Economy options available. All rates subject to customs clearance. GST applicable.</p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingData.map((item, i) => (
          <motion.div
            key={item.country}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow ${
              item.featured ? "ring-2 ring-accent" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{item.flag}</span>
              <h3 className="font-display font-bold text-lg text-foreground">{item.country}</h3>
            </div>
            <div className="space-y-2 mb-4">
              {item.rates.map((r, j) => (
                <div key={j} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  {r}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic mb-5">{item.note}</p>
            <a
              href={`tel:${item.phone}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
