import { Outlet, NavLink } from "react-router-dom";
import {
  Package, Settings, LayoutDashboard,
  Truck, ScanLine, SendHorizonal, AlertOctagon, Mail,
  Users, UserSquare2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout() {

  const navItem = (to: string, label: string, Icon: React.ElementType) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </NavLink>
  );

  const navGroup = (label: string) => (
    <p className="mt-4 mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
      {label}
    </p>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-gray-200 px-4 gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">Uniex Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          {navItem("/admin/dashboard", "Dashboard", LayoutDashboard)}

          {navGroup("Operations")}
          {navItem("/admin/pickups",  "Pickup Queue", Truck)}
          {navItem("/admin/inscan",   "Inscan",       ScanLine)}
          {navItem("/admin/outscan",  "Outscan",      SendHorizonal)}

          {navGroup("Bookings")}
          {navItem("/admin/bookings", "All Bookings", Package)}

          {navGroup("Post-Delivery")}
          {navItem("/admin/ndr",        "NDR Board",   AlertOctagon)}
          {navItem("/admin/remarketing","Remarketing", Mail)}

          {navGroup("CRM")}
          {navItem("/admin/leads", "Leads", Users)}

          {navGroup("Settings")}
          {navItem("/admin/staff",  "Staff",  UserSquare2)}
          {navItem("/admin/config", "Config", Settings)}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3">
          <p className="px-3 text-xs text-gray-400">Uniex Courier Ops</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
