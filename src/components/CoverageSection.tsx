import { motion } from "framer-motion";

const cities = [
  "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Pondicherry",
  "Trivandrum", "Mumbai", "Delhi", "Hyderabad", "Bangalore", "Kolkata",
  "Goa", "Ahmedabad", "Pune", "Cochin", "Indore", "Jaipur", "Lucknow",
  "Visakhapatnam", "Vijayawada", "Kurnool", "Noida", "Calicut",
  "Kakinada", "Nellore"
];

const CoverageSection = () => (
  <section className="bg-white py-24 lg:py-28">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-primary mb-3">
          OUR NETWORK
        </p>
        <h2 className="text-[32px] lg:text-[40px] font-bold text-brand-black leading-[1.2] tracking-[-0.02em] max-w-[500px] mx-auto">
          Pickup available across<br />all major cities in India.
        </h2>
      </motion.div>

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
          {cities.map((city, i) => (
            <motion.div
              key={city}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 8) * 0.05, duration: 0.3 }}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-[14px] font-semibold text-gray-700 hover:border-green-primary hover:text-green-primary cursor-default transition-colors"
            >
              {city}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-[14px] font-medium text-gray-500"
        >
          Door pickup available in Chennai, Tamil Nadu & all major
          cities listed above.
        </motion.p>
      </div>
    </div>
  </section>
);

export default CoverageSection;
