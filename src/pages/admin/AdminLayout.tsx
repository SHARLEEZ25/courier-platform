import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAdminMe } from "@/hooks/admin/useAdminMe";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Package, Settings, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isLoading, isAdmin, isForbidden, error } = useAdminMe();

  // Redirect to admin login if unauthenticated
  if (!authLoading && !user) {
    navigate("/admin/login", { replace: true });
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isForbidden || (!isLoading && !isAdmin)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50">
        <div className="rounded-lg border border-red-200 bg-red-50 px-8 py-6 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-700">Access Denied</p>
          <p className="mt-1 text-sm text-red-500">
            Your account ({user?.email}) is not authorised to access the admin panel.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => { signOut(); navigate("/admin/login"); }}
          >
            Sign out
          </Button>
        </div>
        {error && <p className="text-xs text-gray-400">{error.message}</p>}
      </div>
    );
  }

  const navItem = (to: string, label: string, Icon: React.ElementType) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      <ChevronRight className="ml-auto h-3 w-3 opacity-30" />
    </NavLink>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <span className="text-base font-bold text-gray-900">Uniex</span>
          <span className="ml-1.5 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItem("/admin/bookings", "Bookings", Package)}
          {navItem("/admin/config",   "Config",   Settings)}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          <div className="mb-2 truncate px-3 text-xs text-gray-400">{user?.email}</div>
          <button
            onClick={() => { signOut(); navigate("/admin/login"); }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
