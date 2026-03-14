import { motion } from "framer-motion";

const pricingCards = [
  {
    flag: "🇺🇸",
    country: "USA",
    rates: [
      { weight: "5 kg", price: "₹800 – ₹850 / kg" },
      { weight: "10+ kg", price: "₹650 – ₹800 / kg" },
    ]
  },
  {
    flag: "🇬🇧",
    country: "UK",
    rates: [
      { weight: "5 kg+", price: "₹750 – ₹800 / kg" },
      { weight: "10 kg+", price: "₹500 – ₹550 / kg" },
      { weight: "20–25 kg", price: "₹410 – ₹500 / kg" },
    ]
  },
  {
    flag: "🇦🇺",
    country: "Australia",
    rates: [
      { weight: "5 kg", price: "₹900 / kg" },
      { weight: "10–20 kg", price: "₹750 – ₹950 / kg" },
    ]
  },
  {
    flag: "🇨🇦",
    country: "Canada",
    rates: [
      { weight: "5 kg", price: "₹5,000 – ₹5,500" },
      { weight: "10 kg+", price: "₹750 – ₹850 / kg" },
    ]
  },
  {
    flag: "🌏",
    country: "Singapore / UAE / Malaysia",
    rates: [
      { weight: "5 kg", price: "₹500 – ₹600 / kg" },
      { weight: "10 kg", price: "₹350 – ₹450 / kg" },
      { weight: "20–30 kg", price: "₹340 – ₹400 / kg" },
    ]
  }
];

const PricingSection = () => (
  <section className="bg-gray-50 py-24 lg:py-28" id="pricing">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-primary mb-3">
          TRANSPARENT PRICING
        </p>
        <h2 className="text-[32px] lg:text-[40px] font-bold text-brand-black leading-[1.2] tracking-[-0.02em] max-w-[480px]">
          Competitive rates.<br />No hidden charges.
        </h2>
        <p className="text-base text-gray-500 mt-3 max-w-[500px]">
          Sample rates from India. Final price depends on weight, destination, 
          and service type. GST applicable. Subject to customs clearance.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingCards.map((card, i) => (
          <motion.div
            key={card.country}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-primary transition-colors flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <span className="text-2xl leading-none">{card.flag}</span>
              <h3 className="text-lg font-bold text-brand-black">{card.country}</h3>
            </div>
            
            <div className="space-y-3 flex-1 mb-6">
              {card.rates.map((rate, j) => (
                <div key={j} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-500">{rate.weight}</span>
                  <span className="font-bold text-brand-black">{rate.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <div className="text-[11px] text-gray-400 italic">
                Note: Lower rates = longer delivery time
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
