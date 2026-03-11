import { motion } from "framer-motion";

const leftItems = [
  "Sweets, snacks & homemade eatables",
  "Pickles, sambar powder & rasam powder",
  "Indian spices, masalas & jaggery",
  "Masala pastes, condiments & pooja items",
  "Sarees & all types of garments",
  "Corporate gifts"
];

const rightItems = [
  "Books, study materials & stationery",
  "Electronic goods, mixers & grinders",
  "Home appliances & kitchen utensils",
  "Crockery & children's toys",
  "Photo frames & handicrafts",
  "All types of household goods"
];

const AcceptedItemsSection = () => (
  <section className="bg-gray-50 border-y border-gray-200 py-24 lg:py-28">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-green-primary mb-3">
          WHAT WE SHIP
        </p>
        <h2 className="text-[32px] lg:text-[40px] font-bold text-brand-black leading-[1.2] tracking-[-0.02em] max-w-[500px] mx-auto">
          If it matters to you,<br />we'll get it there.
        </h2>
        <p className="text-base text-gray-500 mt-4 max-w-[500px] mx-auto">
          We accept a wide range of items for international courier
          to destinations across the globe.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16">
          {/* Left Column */}
          <ul className="space-y-4">
            {leftItems.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start text-brand-black"
              >
                <span className="text-green-primary mr-3 text-lg leading-none mt-0.5">•</span>
                <span className="text-[15px] font-medium text-gray-700">{item}</span>
              </motion.li>
            ))}
          </ul>
          
          {/* Right Column */}
          <ul className="space-y-4">
            {rightItems.map((item, i) => (
              <motion.li
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (leftItems.length + i) * 0.05 }}
                className="flex items-start text-brand-black"
              >
                <span className="text-green-primary mr-3 text-lg leading-none mt-0.5">•</span>
                <span className="text-[15px] font-medium text-gray-700">{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        
        {/* Disclaimer */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <p className="text-[13px] text-gray-500 max-w-2xl mx-auto italic">
            *Subject to customs clearance. GST applicable.<br/>
            Medicine courier requires prescription, bill & sender Aadhaar.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default AcceptedItemsSection;
