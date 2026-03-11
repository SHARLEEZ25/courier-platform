const partners = [
  { name: "DHL", url: "https://uniex.in/public/uploads/client-24.png" },
  { name: "UPS", url: "https://uniex.in/public/uploads/client-18.png" },
  { name: "Aramex", url: "https://uniex.in/public/uploads/client-22.png" },
  { name: "DPD", url: "https://uniex.in/public/uploads/client-23.png" },
  { name: "DPEX", url: "https://uniex.in/public/uploads/client-17.png" },
];

const PartnersSection = () => (
  <section className="py-12 border-y border-border overflow-hidden">
    <div className="container text-center mb-8">
      <span className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Our Shipping Partners</span>
    </div>
    <div className="relative">
      <div className="flex animate-scroll-left">
        {[...partners, ...partners, ...partners].map((p, i) => (
          <div key={i} className="flex items-center justify-center px-10 shrink-0">
            <img src={p.url} alt={p.name} className="h-10 object-contain opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PartnersSection;
