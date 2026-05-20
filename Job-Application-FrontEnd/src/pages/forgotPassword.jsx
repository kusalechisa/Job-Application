import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/Endpoints/Auth.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { showPopup } from "@/components/FloatingPopup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPassword({ email });
      showPopup(res.data.message || "If an account exists, reset instructions were sent.", "success");
    } catch (err) {
      showPopup(getApiErrorMessage(err, "Request failed."), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Card className="w-full max-w-md border border-white/10 bg-slate-900/95">
        <CardHeader>
          <CardTitle className="text-center text-white">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {message && <p className="text-sm text-emerald-400">{message}</p>}
            <div className="space-y-2">
              <Label className="text-slate-200">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950 text-white"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
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
  );
}
