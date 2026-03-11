import { motion } from "framer-motion";

const carriers = ["DHL", "FedEx", "Aramex", "UPS"];

const PartnersSection = () => (
  <section className="bg-gray-100 border-y border-gray-200 py-7">
    <div className="container">
      <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
        <span className="text-sm font-medium text-gray-500">
          Trusted by customers shipping via:
        </span>
        {carriers.map((name, i) => (
          <motion.span
            key={name}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-base font-bold text-gray-500/60 hover:text-green-primary transition-colors cursor-default"
          >
            {i > 0 && <span className="mr-6 text-gray-200">·</span>}
            {name}
          </motion.span>
        ))}
      </div>
    </div>
  </section>
);

export default PartnersSection;
