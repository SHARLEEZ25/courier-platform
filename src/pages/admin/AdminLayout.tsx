import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Package, Settings, LayoutDashboard,
  Truck, ScanLine, SendHorizonal, AlertOctagon, Mail,
  Users, UserSquare2, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItem = (to: string, label: string, Icon: React.ElementType) => (
    <NavLink
      to={to}
      end
      onClick={() => setSidebarOpen(false)}
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

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center border-b border-gray-200 px-4 gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
          <Package className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-gray-900">CourierPro Admin</span>
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto lg:hidden text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {navItem("/admin/dashboard", "Dashboard", LayoutDashboard)}

        {navGroup("Operations")}
        {navItem("/admin/pickups",  "Pickup Queue", Truck)}
        {navItem("/admin/inscan",   "Inscan",       ScanLine)}
        {navItem("/admin/outscan",  "Outscan",      SendHorizonal)}

        {navGroup("Bookings")}
        {navItem("/admin/bookings", "All Bookings", Package)}

        {navGroup("Post-Delivery")}
        {navItem("/admin/ndr",         "NDR Board",   AlertOctagon)}
        {navItem("/admin/remarketing", "Remarketing", Mail)}

        {navGroup("CRM")}
        {navItem("/admin/leads", "Leads", Users)}

        {navGroup("Settings")}
        {navItem("/admin/staff",  "Staff",  UserSquare2)}
        {navItem("/admin/config", "Config", Settings)}
      </nav>
      <div className="border-t border-gray-200 p-3">
        <p className="px-3 text-xs text-gray-400">CourierPro Ops</p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-900"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <Package className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">CourierPro Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
