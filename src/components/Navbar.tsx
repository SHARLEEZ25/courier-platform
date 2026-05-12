import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Track Shipment", href: "/track" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    await signOut();
    setDropdownOpen(false);
    navigate("/");
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200"
          : "bg-white/50 backdrop-blur-sm"
      }`}
      style={{ height: 85 }}
    >
      <div className="container h-full flex items-center justify-between">
        <Link to="/" className="flex items-center py-2 gap-0">
          <div className="flex flex-col leading-tight">
            <span className="text-[22px] md:text-[26px] font-black tracking-tight text-green-primary">
              Courier Aggregator
            </span>
            <span className="text-[10px] md:text-[11px] font-semibold text-gray-400 tracking-[0.12em] uppercase">
              International Shipping
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="text-[14.5px] font-semibold text-[#374151] hover:text-green-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-brand-black hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-primary flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.user_metadata?.full_name || user.email}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-lg py-1 z-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-5 py-2.5 bg-green-primary hover:bg-green-dark text-white text-sm font-bold rounded-xl transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-brand-black">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 pb-5 pt-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.href}
              className="block text-sm font-medium text-gray-700 py-2.5"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 py-2.5 text-sm text-brand-gray">
                  <User className="w-4 h-4" />
                  <span className="truncate">{user.user_metadata?.full_name || user.email}</span>
                </div>
                <button
                  onClick={() => { handleSignOut(); setOpen(false); }}
                  className="flex items-center gap-2 py-2.5 text-sm font-medium text-red-600 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 py-2.5 text-sm font-semibold text-green-primary"
                onClick={() => setOpen(false)}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
