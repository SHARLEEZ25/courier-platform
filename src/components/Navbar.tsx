import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Quote", href: "/get-quote" },
  { label: "Contact", href: "/contact" },
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
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200"
          : "bg-transparent"
      }`}
      style={{ height: 85 }}
    >
      <div className="container h-full flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img 
            src="/logos/logoforbrand.png" 
            alt="Uniex Courier" 
            className="h-12 md:h-16 w-auto object-contain"
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-gray-700 hover:text-green-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/get-quote"
          className="hidden md:inline-flex bg-green-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-dark transition-colors"
        >
          Get a Quote
        </a>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-brand-black">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 pb-5 pt-3 space-y-1">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="block text-sm font-medium text-gray-700 py-2.5"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/get-quote"
            className="block bg-green-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold text-center mt-3"
          >
            Get a Quote
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
