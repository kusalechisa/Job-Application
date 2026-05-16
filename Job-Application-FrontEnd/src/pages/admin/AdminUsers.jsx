import { useEffect, useState } from "react";
import { getUsers, createUser, updateUserById } from "../../../api/Endpoints/Users.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Plus, Filter, X, Search, Shield, User, Clock, FileText, Briefcase, Key, Ban, CheckCircle, AlertCircle } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";

const emptyUser = { name: "", email: "", password: "", role: "Applicant", status: "active" };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      let list = (res.data.data || []).map(({ password, ...safe }) => safe);
      
      // Client-side filtering for search
      if (search) {
        const searchLower = search.toLowerCase();
        list = list.filter(user => 
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }
      
      // Client-side filtering for role
      if (filters.role) {
        list = list.filter(user => user.role === filters.role);
      }
      
      // Client-side filtering for status
      if (filters.status) {
        list = list.filter(user => user.status === filters.status);
      }
      
      setUsers(list);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, filters]);

  const clearFilters = () => {
    setFilters({ role: "", status: "" });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Password is required");
      return;
    }
    try {
      await updateUserById(selectedUserForReset.id, { password: newPassword });
      setResetPasswordModalOpen(false);
      setNewPassword("");
      setSelectedUserForReset(null);
      setError("");
      alert("Password reset successfully");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === "active" ? "suspended" : "active";
      await updateUserById(user.id, { status: newStatus });
      loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyUser);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingId(user.id);
    setForm({ 
      name: user.name, 
      email: user.email, 
      password: "", 
      role: user.role,
      status: user.status || "active"
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const payload = { name: form.name, email: form.email, role: form.role, status: form.status };
        if (form.password) {
          payload.password = form.password;
        }
        await updateUserById(editingId, payload);
      } else {
        await createUser(form);
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <main className="ml-64 mt-16 p-6">
          <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
              <CardTitle>Users Management</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 max-w-xs"
                  />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="mr-2 h-4 w-4" /> Filters
                  {showFilters && <X className="ml-2 h-4 w-4" />}
                </Button>
                <Button onClick={openCreate} className="bg-sky-600 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add User
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <div className="px-6 pb-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Role</Label>
                    <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All roles</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Applicant">Applicant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" onClick={clearFilters} className="mt-2">
                  <X className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
              </div>
            )}
            <CardContent>
              {error && <p className="mb-3 text-rose-600">{error}</p>}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profile</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
                  ) : users.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center">No users found.</TableCell></TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-sky-100 text-sky-600">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "Admin" ? "default" : "secondary"} className={user.role === "Admin" ? "bg-purple-600" : ""}>
                            {user.role === "Admin" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === "active" ? "default" : "secondary"}
                            className={user.status === "active" ? "bg-emerald-600" : "bg-amber-600"}
                          >
                            {user.status === "active" ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
                            {user.status || "active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>Applications: {user._count?.applications || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              <span>Jobs posted: {user._count?.jobs || 0}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(user)} title="Edit">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => {
                                setSelectedUserForReset(user);
                                setResetPasswordModalOpen(true);
                              }}
                              title="Reset Password"
                            >
                              <Key className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === "active" ? "Suspend" : "Activate"}
                            >
                              {user.status === "active" ? <Ban className="h-4 w-4 text-amber-600" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>{editingId ? "Edit User" : "Create User"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Password {editingId && "(leave blank to keep current)"}</Label>
                      <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? "••••••••" : ""} required={!editingId} />
                    </div>
                    <div className="space-y-2">
                      <Label>Role *</Label>
                      <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Applicant">Applicant</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={saving} className="bg-sky-600 text-white">{saving ? "Saving..." : "Save"}</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
          
          {resetPasswordModalOpen && selectedUserForReset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Reset password for <span className="font-semibold">{selectedUserForReset.name}</span> ({selectedUserForReset.email})
                    </p>
                    <div className="space-y-2">
                      <Label>New Password *</Label>
                      <Input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => {
                        setResetPasswordModalOpen(false);
                        setNewPassword("");
                        setSelectedUserForReset(null);
                      }}>Cancel</Button>
                      <Button onClick={handleResetPassword} className="bg-sky-600 text-white">Reset Password</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}



