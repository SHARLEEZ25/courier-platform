import { motion } from "framer-motion";
import { Check } from "lucide-react";

const items = [
  "Sweets, Snacks, Homemade Eatables",
  "Pickles, Sambar & Rasam Powder",
  "Spicy Masala, Pulses, Spices",
  "Crockery & Utensils",
  "Indian Spices, Masalas, Jaggery",
  "Pooja Items & Condiments",
  "Homemade Food Products",
  "Handicrafts & Photo Frames",
  "Furniture & Furnishing Clothes",
  "Books, Study Materials, CDs",
  "Mixers, Grinders, Electronics",
  "Sarees, Dress Materials, Garments",
  "Corporate Gifts",
  "All Household Goods",
];

const AcceptedItemsSection = () => (
  <section className="py-20 bg-navy" id="items">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-accent font-semibold text-sm tracking-wider uppercase">What You Can Send</span>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-foreground mt-2">
          Accepted Items for International Courier
        </h2>
        <p className="text-primary-foreground/60 mt-3 max-w-xl mx-auto">Send safe and secure – for all over the globe</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 max-w-4xl mx-auto">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-3 text-primary-foreground/80"
          >
            <Check className="w-5 h-5 text-accent shrink-0" />
            <span className="text-sm">{item}</span>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-10">
        <p className="text-primary-foreground/40 text-xs">*Subject to Customs Clearance · *GST Applicable</p>
      </div>
    </div>
  </section>
);

export default AcceptedItemsSection;
