import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../api/Endpoints/Auth.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    token: searchParams.get("token") || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await resetPassword({
        token: form.token,
        newPassword: form.newPassword,
      });
      setMessage(res.data.message || "Password reset successful.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Reset failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        <Card className="w-full max-w-md border border-white/10 bg-slate-900/95">
          <CardHeader>
            <CardTitle className="text-center text-white">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-rose-400">{error}</p>}
              {message && <p className="text-sm text-emerald-400">{message}</p>}
              <div className="space-y-2">
                <Label className="text-slate-200">Reset Token</Label>
                <Input
                  value={form.token}
                  onChange={(e) => setForm({ ...form, token: e.target.value })}
                  required
                  className="bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">New Password</Label>
                <Input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                  className="bg-slate-950 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-200">Confirm Password</Label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="bg-slate-950 text-white"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
              <p className="text-center text-sm text-slate-400">
                <Link to="/login" className="text-sky-300 hover:text-white">
                  Back to login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}





