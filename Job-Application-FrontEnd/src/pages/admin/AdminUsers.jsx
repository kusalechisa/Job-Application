import { useEffect, useState } from "react";
import { getUsers, createUser, updateUserById, importUsers } from "../../../api/Endpoints/Users.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Pencil, 
  Plus, 
  Filter, 
  X, 
  Search, 
  Shield, 
  User, 
  Clock, 
  FileText, 
  Briefcase, 
  Key, 
  Ban, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Award,
  Home,
  Settings,
  LogOut,
  Menu,
  Eye,
  Star,
  FileSpreadsheet,
  Trash2
} from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const itemsPerPage = 10;
  
  // Import related states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [importMapping, setImportMapping] = useState({
    name: "",
    email: "",
    role: "",
    status: ""
  });

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
    setShowFilters(false);
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

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectOne = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkExport = () => {
    const selectedData = users
      .filter(user => selectedUsers.includes(user.id))
      .map(user => ({
        Name: user.name,
        Email: user.email,
        Role: user.role,
        Status: user.status,
        CreatedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
        LastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never",
        Applications: user._count?.applications || 0,
        JobsPosted: user._count?.jobs || 0
      }));
    
    const csv = convertToCSV(selectedData);
    downloadCSV(csv, `users_export_${new Date().toISOString()}.csv`);
    setSelectedUsers([]);
  };

  const convertToCSV = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    return csvRows.join('\n');
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Functions
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setImportFile(file);
      parseFilePreview(file);
    } else {
      setError("Please upload a valid CSV file");
    }
  };

  const parseFilePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(0, 6); // Preview first 5 rows
      const preview = rows.map(row => row.split(','));
      setImportPreview(preview);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1); // Skip header row
        const importedData = rows.map(row => {
          const columns = row.split(',');
          return {
            name: columns[parseInt(importMapping.name)] || "",
            email: columns[parseInt(importMapping.email)] || "",
            role: columns[parseInt(importMapping.role)] || "Applicant",
            status: columns[parseInt(importMapping.status)] || "active"
          };
        }).filter(item => item.name && item.email);
        
        // Call API to import users
        await importUsers(importedData);
        alert(`Successfully imported ${importedData.length} users!`);
        setImportModalOpen(false);
        setImportFile(null);
        setImportPreview([]);
        loadUsers(); // Refresh the list
      };
      reader.readAsText(importFile);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['Name', 'Email', 'Role', 'Status'],
      ['John Doe', 'john@example.com', 'Applicant', 'active'],
      ['Jane Smith', 'jane@example.com', 'Admin', 'active']
    ];
    const csv = template.map(row => row.join(',')).join('\n');
    downloadCSV(csv, 'users_import_template.csv');
  };

  const getRoleColor = (role) => {
    return role === "Admin" 
      ? "bg-gradient-to-r from-purple-500 to-pink-500" 
      : "bg-gradient-to-r from-blue-500 to-cyan-500";
  };

  const getStatusColor = (status) => {
    return status === "active" 
      ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
      : "bg-gradient-to-r from-amber-500 to-orange-500";
  };

  // Pagination
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedUsers = users.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    applicants: users.filter(u => u.role === 'Applicant').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    totalApplications: users.reduce((sum, u) => sum + (u._count?.applications || 0), 0),
    totalJobs: users.reduce((sum, u) => sum + (u._count?.jobs || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Navigation Drawer */}
      <div className={`
        fixed left-0 top-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-2xl
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">JobPortal</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 py-6">
            <nav className="space-y-1 px-4">
              <NavItem icon={Home} label="Dashboard" to="/admin" />
              <NavItem icon={Briefcase} label="Jobs" to="/admin/jobs" />
              <NavItem icon={Users} label="Users" to="/admin/users" active />
              <NavItem icon={FileText} label="Applications" to="/admin/applications" />
              <NavItem icon={TrendingUp} label="Analytics" to="/admin/analytics" />
              <NavItem icon={Settings} label="Settings" to="/admin/settings" />
            </nav>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <AdminNavbar onMenuClick={() => setMobileMenuOpen(true)} />
        
        <main className="p-4 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  User Management
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage system users, their roles, and permissions
                </p>
              </div>
              {selectedUsers.length > 0 && (
                <div className="flex gap-2">
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30">
                    {selectedUsers.length} selected
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Total Users" value={stats.total} icon={Users} color="indigo" />
            <StatCard label="Admins" value={stats.admins} icon={Shield} color="purple" />
            <StatCard label="Applicants" value={stats.applicants} icon={User} color="blue" />
            <StatCard label="Active" value={stats.active} icon={CheckCircle} color="emerald" />
            <StatCard label="Suspended" value={stats.suspended} icon={Ban} color="amber" />
            <StatCard label="Applications" value={stats.totalApplications} icon={FileText} color="teal" />
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {Object.values(filters).some(f => f) && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setImportModalOpen(true)}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import
                  </Button>
                  <Button onClick={openCreate} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white gap-2">
                    <Plus className="h-4 w-4" />
                    Add User
                  </Button>
                  {selectedUsers.length > 0 && (
                    <Button variant="outline" onClick={handleBulkExport} className="gap-2">
                      <Download className="h-4 w-4" /> Export
                    </Button>
                  )}
                  <div className="flex border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`px-3 py-2 text-sm transition-colors ${
                        viewMode === "table" 
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400" 
                          : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 text-sm transition-colors ${
                        viewMode === "grid" 
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400" 
                          : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      Grid
                    </button>
                  </div>
                </div>
              </div>

              {showFilters && (
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Role</Label>
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
                      <Label className="text-sm font-medium mb-2 block">Status</Label>
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
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={clearFilters} size="sm">
                      <X className="mr-2 h-3 w-3" /> Clear All Filters
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Users Content */}
          <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
                  </div>
                </div>
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="font-semibold">User</TableHead>
                        <TableHead className="font-semibold hidden md:table-cell">Role</TableHead>
                        <TableHead className="font-semibold hidden lg:table-cell">Status</TableHead>
                        <TableHead className="font-semibold hidden sm:table-cell">Joined</TableHead>
                        <TableHead className="font-semibold hidden xl:table-cell">Activity</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="text-center">
                              <Users className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                              <p className="text-slate-600 dark:text-slate-400">No users found</p>
                              <Button onClick={openCreate} variant="link" className="mt-2">
                                Create your first user
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                            <TableCell>
                              <Checkbox
                                checked={selectedUsers.includes(user.id)}
                                onCheckedChange={(checked) => handleSelectOne(user.id, checked)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-2 ring-slate-200 dark:ring-slate-700">
                                  <AvatarImage src={user.avatar} alt={user.name} />
                                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                                  <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <Badge className={`${getRoleColor(user.role)} text-white gap-1`}>
                                {user.role === "Admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <Badge className={`${getStatusColor(user.status)} text-white gap-1`}>
                                {user.status === "active" ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-slate-500">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell">
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center gap-1 text-slate-500">
                                  <FileText className="h-3 w-3" />
                                  <span>Apps: {user._count?.applications || 0}</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-500">
                                  <Briefcase className="h-3 w-3" />
                                  <span>Jobs: {user._count?.jobs || 0}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                <Button size="sm" variant="ghost" onClick={() => openEdit(user)} title="Edit" className="h-8 w-8 p-0">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => {
                                    setSelectedUserForReset(user);
                                    setResetPasswordModalOpen(true);
                                  }}
                                  title="Reset Password"
                                  className="h-8 w-8 p-0"
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleToggleStatus(user)}
                                  title={user.status === "active" ? "Suspend" : "Activate"}
                                  className="h-8 w-8 p-0"
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
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {paginatedUsers.map((user) => (
                    <div key={user.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12 ring-2 ring-slate-200 dark:ring-slate-700">
                          <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{user.name}</h3>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Role:</span>
                          <Badge className={`${getRoleColor(user.role)} text-white text-xs`}>
                            {user.role}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                          <Badge className={`${getStatusColor(user.status)} text-white text-xs`}>
                            {user.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Joined:</span>
                          <span className="text-sm text-slate-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <Button size="sm" variant="outline" onClick={() => openEdit(user)} className="flex-1">
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleStatus(user)} className="flex-1">
                          {user.status === "active" ? <Ban className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {users.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700">
                  <Button 
                    variant="outline" 
                    disabled={page <= 1} 
                    onClick={() => setPage((p) => p - 1)}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    disabled={page >= totalPages} 
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-2"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Form Modal */}
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
              <Card className="w-full max-w-md">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <CardTitle className="text-white">{editingId ? "Edit User" : "Create New User"}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input 
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })} 
                        placeholder="Enter full name"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address *</Label>
                      <Input 
                        type="email" 
                        value={form.email} 
                        onChange={(e) => setForm({ ...form, email: e.target.value })} 
                        placeholder="Enter email address"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password {editingId && "(leave blank to keep current)"}</Label>
                      <Input 
                        type="password" 
                        value={form.password} 
                        onChange={(e) => setForm({ ...form, password: e.target.value })} 
                        placeholder={editingId ? "••••••••" : "Enter password"}
                        required={!editingId} 
                      />
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
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        {saving ? "Saving..." : editingId ? "Update User" : "Create User"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Reset Password Modal */}
          {resetPasswordModalOpen && selectedUserForReset && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <CardTitle className="text-white">Reset Password</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Reset password for
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-1">
                        {selectedUserForReset.name}
                      </p>
                      <p className="text-sm text-slate-500">{selectedUserForReset.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>New Password *</Label>
                      <Input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        placeholder="Enter new password"
                        required 
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => {
                        setResetPasswordModalOpen(false);
                        setNewPassword("");
                        setSelectedUserForReset(null);
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleResetPassword} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Import Modal */}
          {importModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
              <Card className="w-full max-w-2xl">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Template Download */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Download Template</h3>
                        <p className="text-sm text-slate-500">Get a sample CSV file to understand the format</p>
                      </div>
                      <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                        <FileSpreadsheet className="h-4 w-4" />
                        Download Template
                      </Button>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Upload CSV File</Label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-all">
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label htmlFor="csv-upload" className="cursor-pointer">
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500 mt-1">CSV files only</p>
                      </label>
                    </div>
                  </div>

                  {/* Column Mapping */}
                  {importFile && importPreview.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Column Mapping</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name Column</Label>
                          <Select onValueChange={(value) => setImportMapping({ ...importMapping, name: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              {importPreview[0]?.map((col, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                  Column {idx + 1}: {col}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Email Column</Label>
                          <Select onValueChange={(value) => setImportMapping({ ...importMapping, email: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              {importPreview[0]?.map((col, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                  Column {idx + 1}: {col}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Role Column</Label>
                          <Select onValueChange={(value) => setImportMapping({ ...importMapping, role: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Default: Applicant</SelectItem>
                              {importPreview[0]?.map((col, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                  Column {idx + 1}: {col}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status Column</Label>
                          <Select onValueChange={(value) => setImportMapping({ ...importMapping, status: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select column" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Default: active</SelectItem>
                              {importPreview[0]?.map((col, idx) => (
                                <SelectItem key={idx} value={idx.toString()}>
                                  Column {idx + 1}: {col}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  {importPreview.length > 1 && (
                    <div className="space-y-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Preview</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {importPreview[0]?.map((col, idx) => (
                                <TableHead key={idx}>{col}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importPreview.slice(1, 4).map((row, idx) => (
                              <TableRow key={idx}>
                                {row.map((cell, cellIdx) => (
                                  <TableCell key={cellIdx}>{cell}</TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => {
                      setImportModalOpen(false);
                      setImportFile(null);
                      setImportPreview([]);
                    }}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleImport} 
                      disabled={!importFile || importing}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                    >
                      {importing ? "Importing..." : "Import Users"}
                    </Button>
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

// Navigation Item Component
function NavItem({ icon: Icon, label, to, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
        active
          ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-950/50 dark:to-purple-950/50 dark:text-indigo-400"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

// Stat Card Component
function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    teal: "from-teal-500 to-teal-600"
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-lg border border-slate-200 dark:border-slate-700">
      <div className={`rounded-xl bg-gradient-to-r ${colors[color]} p-2 w-8 h-8 flex items-center justify-center mb-3`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

// Missing import
import { Link } from "react-router-dom";