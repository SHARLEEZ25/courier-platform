import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

const products = [
  "Kallakadai Mittai from Kovilpatti",
  "Palkova from Srivilliputhur",
  "Murukku & Snacks from Madurai",
  "Iruttukadai Halwa from Tirunelveli",
  "T-shirts & Knitwear from Tiruppur",
  "Wet Grinders & Mixies from Coimbatore",
  "Silk Sarees from Kanchipuram",
  "Organic Mangoes from Dharmapuri",
  "Leather Products from Vellore & Ambur",
  "Spices & Masalas from Dindigul",
  "Organic Products from Thanjavur",
  "Handicrafts from Puducherry",
];

const ShopShipSection = () => (
  <section className="py-20" id="shop-ship">
    <div className="container">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-accent/10 text-accent rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
            <ShoppingBag className="w-4 h-4" />
            Shop & Ship
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mb-4">
            We Buy for You & Ship for You
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Looking to shop authentic Tamil Nadu products and ship them directly to your doorstep abroad?
            Uniex offers doorstep pickup, professional packaging, and fast international delivery.
          </p>
          <a
            href="http://uniex.in/"
            className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold shadow-button hover:brightness-110 transition"
          >
            Book Now
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h3 className="font-display font-bold text-foreground mb-4">✅ Popular Products We Ship</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {products.map((p) => (
                <div key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal mt-1.5 shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ShopShipSection;
