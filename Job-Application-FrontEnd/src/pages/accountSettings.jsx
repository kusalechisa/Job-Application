import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { updateMe, changePassword } from "../../api/Endpoints/Users.jsx";
import { refreshToken } from "../../api/Endpoints/Auth.jsx";
import { setAuthToken } from "../../api/axiosInstance.jsx";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  Monitor,
  Camera,
  Shield,
  Smartphone,
  LogOut,
  Globe,
  Moon,
  Sun,
  Check,
  X,
  AlertTriangle,
  Clock,
  MapPin,
  Home,
  Settings,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Menu,
  ChevronRight,
  Mail,
  Key,
  Eye,
  EyeOff,
  CreditCard,
  Gift,
  HelpCircle,
  BookOpen
} from "lucide-react";
import { useTheme } from "next-themes";

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileMsg, setProfileMsg] = useState({ error: "", success: "" });
  const [passwordMsg, setPasswordMsg] = useState({ error: "", success: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    systemAlerts: true,
    jobUpdates: true,
    applicationStatus: true,
  });
  const [language, setLanguage] = useState("en");
  const [sessions, setSessions] = useState([
    {
      id: "current",
      device: "Current Device",
      browser: "Chrome on Windows",
      ip: "192.168.1.1",
      location: "New York, USA",
      lastLogin: new Date().toISOString(),
      current: true,
    },
    {
      id: "2",
      device: "iPhone 14 Pro",
      browser: "Safari on iOS",
      ip: "192.168.1.2",
      location: "New York, USA",
      lastLogin: new Date(Date.now() - 86400000).toISOString(),
      current: false,
    },
    {
      id: "3",
      device: "MacBook Pro",
      browser: "Chrome on macOS",
      ip: "192.168.1.3",
      location: "San Francisco, USA",
      lastLogin: new Date(Date.now() - 172800000).toISOString(),
      current: false,
    },
  ]);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ error: "", success: "" });
    setSavingProfile(true);
    try {
      const res = await updateMe(profile);
      updateUser(res.data.data);
      setProfileMsg({ error: "", success: "Profile updated successfully!" });
    } catch (err) {
      setProfileMsg({ error: getApiErrorMessage(err), success: "" });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ error: "Passwords do not match.", success: "" });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ error: "Password must be at least 6 characters.", success: "" });
      return;
    }
    setPasswordMsg({ error: "", success: "" });
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      const res = await refreshToken();
      const { token: newToken, user: refreshedUser } = res.data.data;
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(refreshedUser));
      setAuthToken(newToken);
      updateUser(refreshedUser);
      setPasswordMsg({ error: "", success: "Password changed successfully!" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMsg({ error: getApiErrorMessage(err), success: "" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutAllSessions = () => {
    if (window.confirm("Are you sure you want to logout from all devices? You will need to sign in again on each device.")) {
      setSessions(sessions.filter(s => s.current));
      alert("Logged out from all other devices successfully.");
    }
  };

  const handleLogoutSession = (sessionId) => {
    if (window.confirm("Are you sure you want to logout this session?")) {
      setSessions(sessions.filter(s => s.id !== sessionId));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User, description: "Manage your personal information" },
    { id: "security", label: "Security", icon: Lock, description: "Password and 2FA settings" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Configure your alerts" },
    { id: "appearance", label: "Appearance", icon: Palette, description: "Theme and language" },
    { id: "sessions", label: "Sessions", icon: Monitor, description: "Active login sessions" },
  ];

  const sidebarLinks = [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: Briefcase, label: "Jobs", href: "/admin/jobs" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: FileText, label: "Applications", href: "/admin/applications" },
    { icon: TrendingUp, label: "Analytics", href: "/admin/stats" },
    { icon: Settings, label: "Settings", href: "/admin/settings", active: true },
  ];

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
              {sidebarLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    link.active
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 dark:from-indigo-950/50 dark:to-purple-950/50 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  {getInitials(user?.name || "Admin")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Account Settings
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage your account settings and preferences
                </p>
              </div>
               
            </div>
          </div>

          {/* Tabs - Responsive */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:shadow-md border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Profile Settings Tab */}
            {activeTab === "profile" && (
              <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" />
                    Profile Settings
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Update your personal information and profile picture
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="relative">
                      <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-800">
                        {profilePicture ? (
                          <AvatarImage src={profilePicture} alt="Profile" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl">
                            {getInitials(user?.name || "U")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <label htmlFor="profile-picture" className="absolute bottom-0 right-0 cursor-pointer">
                        <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-500 flex items-center justify-center shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                          <Camera className="h-4 w-4 text-indigo-500" />
                        </div>
                        <input
                          id="profile-picture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePictureUpload}
                        />
                      </label>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Profile Picture</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">JPG, PNG or GIF. Max size 2MB.</p>
                      {profilePicture && (
                        <Button variant="outline" size="sm" onClick={() => setProfilePicture("")} className="text-red-600">
                          Remove Photo
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Profile Form */}
                  <form onSubmit={saveProfile} className="space-y-4">
                    {profileMsg.error && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                        <X className="h-4 w-4" />
                        {profileMsg.error}
                      </div>
                    )}
                    {profileMsg.success && (
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {profileMsg.success}
                      </div>
                    )}
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Full Name</Label>
                        <Input 
                          value={profile.name} 
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                          placeholder="Enter your full name"
                          required 
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email Address</Label>
                        <Input 
                          type="email" 
                          value={profile.email} 
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
                          placeholder="Enter your email"
                          required 
                          className="rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={savingProfile} 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-all rounded-xl px-6"
                      >
                        {savingProfile ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
                  <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-indigo-500" />
                      Change Password
                    </CardTitle>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Update your password to keep your account secure
                    </p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={savePassword} className="space-y-4">
                      {passwordMsg.error && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {passwordMsg.error}
                        </div>
                      )}
                      {passwordMsg.success && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          {passwordMsg.success}
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Current Password</Label>
                        <div className="relative">
                          <Input 
                            type={showCurrentPassword ? "text" : "password"} 
                            value={passwords.currentPassword} 
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} 
                            required 
                            className="rounded-xl pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">New Password</Label>
                          <div className="relative">
                            <Input 
                              type={showNewPassword ? "text" : "password"} 
                              value={passwords.newPassword} 
                              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} 
                              required 
                              className="rounded-xl pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Confirm Password</Label>
                          <Input 
                            type="password" 
                            value={passwords.confirmPassword} 
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
                            required 
                            className="rounded-xl"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={savingPassword} 
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-all rounded-xl px-6"
                        >
                          {savingPassword ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Updating...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
                  <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-indigo-500" />
                      Two-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">2FA Authentication</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security to your account</p>
                      </div>
                      <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                    </div>
                    {twoFactorEnabled && (
                      <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                          <Check className="h-5 w-5" />
                          <span className="font-medium">2FA is enabled</span>
                        </div>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">Your account is protected with two-factor authentication.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-500" />
                    Notification Preferences
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Choose what notifications you want to receive
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-500" />
                      Email Notifications
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Receive email updates about your account</p>
                        </div>
                        <Switch checked={notifications.emailNotifications} onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })} />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Job Updates</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Get notified about new job opportunities</p>
                        </div>
                        <Switch checked={notifications.jobUpdates} onCheckedChange={(checked) => setNotifications({ ...notifications, jobUpdates: checked })} />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">Application Status</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Receive updates on your application status</p>
                        </div>
                        <Switch checked={notifications.applicationStatus} onCheckedChange={(checked) => setNotifications({ ...notifications, applicationStatus: checked })} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      System Alerts
                    </h3>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">System Alerts</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Receive important system notifications</p>
                      </div>
                      <Switch checked={notifications.systemAlerts} onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-indigo-500" />
                    Appearance
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Customize the look and feel of your dashboard
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-indigo-500" />
                      Theme
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          theme === "light"
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                          <Sun className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-slate-900 dark:text-white">Light Mode</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Clean and bright interface</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                          theme === "dark"
                            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                          <Moon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Easy on the eyes</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Globe className="h-4 w-4 text-indigo-500" />
                      Language
                    </h3>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Preferred Language</Label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sessions Tab */}
            {activeTab === "sessions" && (
              <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
                <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5 text-indigo-500" />
                        Login Sessions
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Manage your active sessions across devices
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogoutAllSessions} className="gap-2 rounded-xl">
                      <LogOut className="h-4 w-4" />
                      Logout All Devices
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        session.current
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex gap-4">
                          <div className={`rounded-lg p-2 ${session.current ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                            <Smartphone className={`h-5 w-5 ${session.current ? "text-white" : "text-slate-600 dark:text-slate-400"}`} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white">{session.device}</h4>
                              {session.current && (
                                <Badge className="bg-indigo-500 text-white">Current Session</Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{session.browser}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last active: {formatDate(session.lastLogin)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {!session.current && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLogoutSession(session.id)}
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Logout
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-400">Security Tip</h4>
                        <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                          Regularly review your active sessions and logout from devices you don't recognize or no longer use.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}