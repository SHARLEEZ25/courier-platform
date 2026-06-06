import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
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
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminBookings from "./pages/admin/AdminBookings.tsx";
import AdminBookingDetail from "./pages/admin/AdminBookingDetail.tsx";
import AdminConfig from "./pages/admin/AdminConfig.tsx";
import AdminPickupQueue from "./pages/admin/AdminPickupQueue.tsx";
import AdminInscan from "./pages/admin/AdminInscan.tsx";
import AdminOutscan from "./pages/admin/AdminOutscan.tsx";
import AdminNDR from "./pages/admin/AdminNDR.tsx";
import AdminLeads from "./pages/admin/AdminLeads.tsx";
import AdminStaff from "./pages/admin/AdminStaff.tsx";
import AdminRemarketing from "./pages/admin/AdminRemarketing.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/get-quote" element={<GetQuote />} />
              <Route path="/track" element={<Track />} />
              <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Customer pages that require a signed-in user */}
              <Route element={<ProtectedRoute />}>
                <Route path="/rate-breakdown" element={<RateBreakdown />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/membership-checkout" element={<MembershipCheckout />} />
              </Route>

              {/* Admin panel — login is outside the guarded layout (no sidebar) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminRoute />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard"   element={<AdminDashboard />} />
                <Route path="bookings"   element={<AdminBookings />} />
                <Route path="bookings/:id" element={<AdminBookingDetail />} />
                <Route path="pickups"    element={<AdminPickupQueue />} />
                <Route path="inscan"     element={<AdminInscan />} />
                <Route path="outscan"    element={<AdminOutscan />} />
                <Route path="ndr"        element={<AdminNDR />} />
                <Route path="leads"      element={<AdminLeads />} />
                <Route path="staff"      element={<AdminStaff />} />
                <Route path="remarketing" element={<AdminRemarketing />} />
                <Route path="config"     element={<AdminConfig />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
