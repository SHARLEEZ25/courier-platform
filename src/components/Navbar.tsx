import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "About", href: "https://uniex.in/about" },
  { label: "Service", href: "https://uniex.in/service" },
  { label: "News", href: "https://uniex.in/news" },
  { label: "Contact", href: "https://uniex.in/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-card sticky top-0 z-50 shadow-card">
      <div className="container flex items-center justify-between py-4">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-navy rounded-lg p-2">
            <span className="text-accent font-display font-extrabold text-xl leading-none">U</span>
          </div>
          <div className="leading-tight">
            <span className="font-display font-bold text-lg text-foreground">Uniex</span>
            <span className="block text-[10px] text-muted-foreground tracking-widest uppercase">Courier & Cargo</span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <a
            href="https://uniex.in/home/get_quote"
            className="bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold shadow-button hover:brightness-110 transition"
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
            <a key={l.label} href={l.href} className="block text-sm font-medium text-muted-foreground py-2">
              {l.label}
            </a>
          ))}
          <a
            href="https://uniex.in/home/get_quote"
            className="block bg-accent text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-semibold text-center shadow-button"
          >
            Get Quote
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
