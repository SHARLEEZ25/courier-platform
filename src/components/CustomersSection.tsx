import { motion } from "framer-motion";

const customers = [
  "World Tamil Conference USA",
  "UKTA",
  "Venkateshwara Temple, USA",
  "Murugan Idly Shop",
  "Kumaran Silks",
  "Ramaraj Cottons",
  "Apollo Hospitals",
  "GRT Jewellers",
  "Anjappar",
  "Junior Kuppana",
  "Aksya Sweets",
  "Shree Krishna Sweets",
  "Tata Steel Ltd",
  "Ashok Leyland",
];

const CustomersSection = () => (
  <section className="py-16 bg-warm-gray">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <span className="text-accent font-semibold text-sm tracking-wider uppercase">Trusted By</span>
        <h2 className="text-2xl font-extrabold text-foreground mt-2">Our Proud Customers & Partners</h2>
      </motion.div>
      <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
        {customers.map((c) => (
          <span key={c} className="bg-card rounded-full px-4 py-2 text-sm text-foreground shadow-card font-medium">
            {c}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default CustomersSection;
