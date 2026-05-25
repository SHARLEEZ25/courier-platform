import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { firebaseAuth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length;
  const label = ["Too short", "Weak", "Fair", "Strong"][score];
  const color = ["bg-red-400", "bg-red-400", "bg-amber-400", "bg-green-primary"][score];
  const textColor = ["text-red-500", "text-red-500", "text-amber-500", "text-green-primary"][score];
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : "bg-gray-100"}`} />
        ))}
      </div>
      <p className={`text-xs font-medium ${textColor}`}>{label} password</p>
    </div>
  );
}

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(null);
    setLoading(true);
    try {
      await signUp(email, password, name);
      setSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign up failed.";
      setError(
        msg.includes("already registered")
          ? "An account with this email already exists. Try signing in instead."
          : msg
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      navigate("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-light-bg flex flex-col">
        <TopBar /><Navbar />
        <main className="flex-grow flex items-center justify-center py-20 px-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-card-border p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <Check className="w-7 h-7 text-green-primary" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-brand-black mb-2">Check your inbox</h2>
            <p className="text-brand-gray mb-1">We sent a confirmation link to</p>
            <p className="font-semibold text-brand-black mb-4">{email}</p>
            <p className="text-sm text-brand-gray mb-8">
              Click the link to activate your account. It expires in 24 hours.
              <br />Don't see it? Check your spam folder.
            </p>
            <Button onClick={() => navigate("/login")} className="bg-green-primary hover:bg-green-dark text-white font-bold rounded-xl h-11 px-8">
              Go to Sign In
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              Wrong email?{" "}
              <button onClick={() => setSuccess(false)} className="text-green-primary hover:underline">Go back</button>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      <TopBar /><Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-black">Create your free account</h1>
            <p className="text-brand-gray mt-2">
              Start shipping smarter — no credit card required.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-card-border p-8">

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full h-11 flex items-center justify-center gap-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50"
            >
              {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full name</Label>
                <Input id="name" type="text" placeholder="Rahul Kumar" value={name} onChange={(e) => setName(e.target.value)} required autoFocus className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                <p className="text-xs text-gray-400">We'll send your booking confirmations and tracking updates here.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                  <span className="shrink-0 mt-0.5">⚠</span> {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 bg-green-primary hover:bg-green-dark text-white font-bold rounded-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account →"}
              </Button>

              {/* Trust line */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Your data is encrypted and never shared.
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-green-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
