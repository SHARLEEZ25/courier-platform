import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Contact from "./pages/Contact.tsx";
import About from "./pages/About.tsx";
import Services from "./pages/Services.tsx";
import GetQuote from "./pages/GetQuote.tsx";
import Track from "./pages/Track.tsx";
import RateBreakdown from "./pages/RateBreakdown.tsx";
import BookingConfirmation from "./pages/BookingConfirmation.tsx";
import Membership from "./pages/Membership.tsx";
import Booking from "./pages/Booking.tsx";
import MembershipCheckout from "./pages/MembershipCheckout.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/get-quote" element={<GetQuote />} />
            <Route path="/track" element={<Track />} />
            <Route path="/rate-breakdown" element={<RateBreakdown />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/membership-checkout" element={<MembershipCheckout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
