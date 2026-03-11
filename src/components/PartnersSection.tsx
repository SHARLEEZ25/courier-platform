import { motion } from "framer-motion";

const partners = [
  { name: "DHL", url: "https://uniex.in/public/uploads/client-24.png" },
  { name: "FedEx", url: "https://uniex.in/public/uploads/client-17.png" },
  { name: "Aramex", url: "https://uniex.in/public/uploads/client-22.png" },
  { name: "UPS", url: "https://uniex.in/public/uploads/client-18.png" },
];

const PartnersSection = () => (
  <section className="py-14 bg-light-bg">
    <div className="container">
      <p className="text-center text-xs font-semibold text-muted-foreground tracking-[0.2em] uppercase mb-8">
        Powered by Global Logistics Leaders
      </p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap justify-center gap-6"
      >
        {partners.map((p) => (
          <div key={p.name} className="bg-card border border-card-border rounded-xl px-10 py-5 flex items-center justify-center">
            <img src={p.url} alt={p.name} className="h-8 object-contain" />
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default PartnersSection;
