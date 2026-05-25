import { useState } from "react";
import { useAdminStaff, useCreateStaff, useUpdateStaff } from "@/hooks/admin/useAdminStaff";
import type { AdminStaff } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserSquare2, Plus, Phone, Mail, Info, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<AdminStaff["role"], string> = {
  pickup_agent: "Pickup Agent",
  ops_staff:    "Ops Staff",
  admin:        "Admin",
};

const ROLE_COLOURS: Record<AdminStaff["role"], string> = {
  pickup_agent: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ops_staff:    "bg-blue-100 text-blue-700 border-blue-200",
  admin:        "bg-purple-100 text-purple-700 border-purple-200",
};

function StaffCard({ staff }: { staff: AdminStaff }) {
  const { toast } = useToast();
  const update = useUpdateStaff(staff.id);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(staff.name);
  const [phone, setPhone] = useState(staff.phone);
  const [email, setEmail] = useState(staff.email);
  const [role, setRole] = useState<AdminStaff["role"]>(staff.role);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({ name, phone, email, role });
      toast({ title: "Staff updated" });
      setEditOpen(false);
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  }

  async function handleToggle() {
    try {
      await update.mutateAsync({ is_active: !staff.is_active });
      toast({ title: staff.is_active ? "Staff deactivated" : "Staff activated" });
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  return (
    <div className={cn(
      "rounded-lg border bg-white p-4 shadow-sm transition-opacity",
      !staff.is_active && "opacity-60"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 font-semibold text-sm">
            {staff.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{staff.name}</p>
            <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium", ROLE_COLOURS[staff.role])}>
              {ROLE_LABELS[staff.role]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {staff.is_active
            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
            : <XCircle className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Phone className="h-3.5 w-3.5 text-gray-400" />
          {staff.phone}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Mail className="h-3.5 w-3.5 text-gray-400" />
          {staff.email}
        </div>
      </div>

      {staff.active_bookings_count > 0 && (
        <p className="mb-3 text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
          {staff.active_bookings_count} active bookings
        </p>
      )}

      <div className="flex gap-2">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 text-xs">Edit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Staff — {staff.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Phone *</Label>
                <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Email *</Label>
                <Input className="mt-1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as AdminStaff["role"])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup_agent">Pickup Agent</SelectItem>
                    <SelectItem value="ops_staff">Ops Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={update.isPending} className="w-full">
                {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={handleToggle}
          disabled={update.isPending}
        >
          {staff.is_active ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminStaffPage() {
  const { toast } = useToast();
  const { data: staff, isLoading } = useAdminStaff();
  const create = useCreateStaff();

  const [filterRole, setFilterRole] = useState("");
  const [filterActive, setFilterActive] = useState("active");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<AdminStaff["role"]>("pickup_agent");

  const filtered = (staff ?? []).filter((s) => {
    if (filterRole && s.role !== filterRole) return false;
    if (filterActive === "active" && !s.is_active) return false;
    if (filterActive === "inactive" && s.is_active) return false;
    return true;
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({ name: newName, phone: newPhone, email: newEmail, role: newRole });
      toast({ title: "Staff added", description: `${newName} added (not persisted yet).` });
      setAddOpen(false);
      setNewName(""); setNewPhone(""); setNewEmail(""); setNewRole("pickup_agent");
    } catch {
      toast({ title: "Failed to add staff", variant: "destructive" });
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <UserSquare2 className="h-5 w-5 text-purple-600" />
            Staff Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">Manage pickup agents and operations staff</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-1.5 text-sm">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input className="mt-1" placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Phone *</Label>
                <Input className="mt-1" placeholder="+91 98400 00000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Email *</Label>
                <Input className="mt-1" type="email" placeholder="name@courierpro.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AdminStaff["role"])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pickup_agent">Pickup Agent</SelectItem>
                    <SelectItem value="ops_staff">Ops Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={create.isPending} className="w-full">
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Staff Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        Staff data is not persisted yet. Create the <code className="font-mono text-xs bg-blue-100 px-1 rounded">staff</code> table and add <code className="font-mono text-xs bg-blue-100 px-1 rounded">assigned_staff_id</code> FK to bookings to enable real staff assignment.
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterRole || "all"} onValueChange={(v) => setFilterRole(v === "all" ? "" : v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="pickup_agent">Pickup Agent</SelectItem>
            <SelectItem value="ops_staff">Ops Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white py-12">
          <UserSquare2 className="h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-400">No staff match the current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => <StaffCard key={s.id} staff={s} />)}
        </div>
      )}
    </div>
  );
}
