import { useState } from "react";
import { updateMe, changePassword } from "../../api/Endpoints/Users.jsx";
import { refreshToken } from "../../api/Endpoints/Auth.jsx";
import { setAuthToken } from "../../api/axiosInstance.jsx";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [profileMsg, setProfileMsg] = useState({ error: "", success: "" });
  const [passwordMsg, setPasswordMsg] = useState({ error: "", success: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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

  return (
    <div className="mx-auto grid max-w-4xl gap-6 p-4 sm:p-6">
      <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
            {profileMsg.error && <p className="text-sm text-rose-600 md:col-span-2">{profileMsg.error}</p>}
            {profileMsg.success && <p className="text-sm text-emerald-600 md:col-span-2">{profileMsg.success}</p>}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
            </div>
            <Button type="submit" disabled={savingProfile} className="md:col-span-2 bg-sky-600 text-white">
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
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
            <Button type="submit" disabled={savingPassword} className="md:col-span-2 bg-sky-600 text-white">
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



