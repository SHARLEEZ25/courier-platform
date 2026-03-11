import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "About", href: "https://uniex.in/about" },
  { label: "Services", href: "#services" },
  { label: "Track", href: "#hero" },
  { label: "News", href: "https://uniex.in/news" },
  { label: "Contact", href: "https://uniex.in/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`bg-card sticky top-0 z-50 transition-shadow ${scrolled ? "shadow-card-hover" : ""}`}>
      <div className="container flex items-center justify-between py-4">
        <a href="/" className="flex items-center gap-2">
          <Globe className="w-7 h-7 text-primary" />
          <span className="font-display font-bold text-xl text-primary">Uniex Courier</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="text-[15px] font-medium text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
          <a
            href="https://uniex.in/home/get_quote"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-[15px] font-medium hover:bg-green-dark transition-colors"
          >
            Get Quote
          </a>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-card border-t border-border px-6 pb-4 space-y-3">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="block text-[15px] font-medium text-muted-foreground py-2">
              {l.label}
            </a>
          ))}
          <a
            href="https://uniex.in/home/get_quote"
            className="block bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-[15px] font-medium text-center"
          >
            Get Quote
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
