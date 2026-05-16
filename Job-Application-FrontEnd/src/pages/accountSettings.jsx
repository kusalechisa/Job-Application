import { useState, useEffect } from "react";
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
  MapPin
} from "lucide-react";
import { useTheme } from "next-themes";

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
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

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ error: "", success: "" });
    setSavingProfile(true);
    try {
      const res = await updateMe(profile);
      updateUser(res.data.data);
      setProfileMsg({ error: "", success: "Profile updated." });
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
      setPasswordMsg({ error: "", success: "Password changed." });
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutAllSessions = () => {
    if (confirm("Are you sure you want to logout from all devices? You will need to sign in again on each device.")) {
      // Implement logout all sessions API call
      setSessions(sessions.filter(s => s.current));
      alert("Logged out from all other devices successfully.");
    }
  };

  const handleLogoutSession = (sessionId) => {
    if (confirm("Are you sure you want to logout this session?")) {
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
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "sessions", label: "Sessions", icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Account Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Profile Settings Tab */}
          {activeTab === "profile" && (
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-500" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                      {profilePicture ? (
                        <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
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
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Profile Picture</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">JPG, PNG or GIF. Max size 2MB.</p>
                    <Button variant="outline" size="sm" onClick={() => setProfilePicture("")}>
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
                  {profileMsg.error && <p className="text-sm text-rose-600 md:col-span-2">{profileMsg.error}</p>}
                  {profileMsg.success && <p className="text-sm text-emerald-600 md:col-span-2">{profileMsg.success}</p>}
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
                  </div>
                  <Button type="submit" disabled={savingProfile} className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700">
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-indigo-500" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={savePassword} className="grid gap-4 md:grid-cols-2">
                    {passwordMsg.error && <p className="text-sm text-rose-600 md:col-span-2">{passwordMsg.error}</p>}
                    {passwordMsg.success && <p className="text-sm text-emerald-600 md:col-span-2">{passwordMsg.success}</p>}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Current Password</Label>
                      <Input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
                    </div>
                    <Button type="submit" disabled={savingPassword} className="md:col-span-2 bg-indigo-600 hover:bg-indigo-700">
                      {savingPassword ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-500" />
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">2FA Authentication</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security to your account</p>
                    </div>
                    <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
                  </div>
                  {twoFactorEnabled && (
                    <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
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
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-500" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Email Notifications</h3>
                  
                  <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Receive email updates about your account</p>
                    </div>
                    <Switch checked={notifications.emailNotifications} onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })} />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Job Updates</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Get notified about new job opportunities</p>
                    </div>
                    <Switch checked={notifications.jobUpdates} onCheckedChange={(checked) => setNotifications({ ...notifications, jobUpdates: checked })} />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">Application Status</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Receive updates on your application status</p>
                    </div>
                    <Switch checked={notifications.applicationStatus} onCheckedChange={(checked) => setNotifications({ ...notifications, applicationStatus: checked })} />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">System Alerts</h3>
                  
                  <div className="flex items-center justify-between py-3">
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
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-indigo-500" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Theme</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme("light")}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        theme === "light"
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <Sun className="h-5 w-5 text-amber-500" />
                      <div className="text-left">
                        <p className="font-medium text-slate-900 dark:text-white">Light</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Clean and bright</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setTheme("dark")}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <Moon className="h-5 w-5 text-indigo-500" />
                      <div className="text-left">
                        <p className="font-medium text-slate-900 dark:text-white">Dark</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Easy on the eyes</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Language</h3>
                  
                  <div className="space-y-2">
                    <Label>Preferred Language</Label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="en">English</option>
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
            <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-indigo-500" />
                    Login Sessions
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={handleLogoutAllSessions} className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout All Devices
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      session.current
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-2 ${session.current ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                          <Smartphone className={`h-5 w-5 ${session.current ? "text-white" : "text-slate-600 dark:text-slate-400"}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white">{session.device}</h4>
                            {session.current && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500 text-white rounded-full">Current</span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{session.browser}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(session.lastLogin)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!session.current && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLogoutSession(session.id)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
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
  );
}



