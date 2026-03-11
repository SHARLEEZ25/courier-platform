import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    title: "Medicine Courier from India",
    date: "Jan 21, 2026",
    desc: "Everything you need to know about sending life-saving medicines internationally.",
    href: "https://uniex.in/news/view/37",
  },
  {
    title: "USA Tariff Regulations",
    date: "Dec 20, 2025",
    desc: "Understanding U.S. tariff regulations and how they affect your shipments.",
    href: "https://uniex.in/news/view/36",
  },
  {
    title: "USA Courier from India – Full Guide",
    date: "May 18, 2025",
    desc: "Cheapest way to send courier from Chennai to USA, UK, Australia, Canada & worldwide.",
    href: "https://uniex.in/news/view/35",
  },
];

const BlogSection = () => (
  <section className="py-20 bg-warm-gray" id="blog">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-accent font-semibold text-sm tracking-wider uppercase">Blog</span>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-foreground mt-2">Latest News</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((p, i) => (
          <motion.a
            key={i}
            href={p.href}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-shadow group"
          >
            <span className="text-xs text-muted-foreground">{p.date}</span>
            <h3 className="font-display font-bold text-foreground mt-2 mb-3 group-hover:text-accent transition-colors">{p.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{p.desc}</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
              Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default BlogSection;
