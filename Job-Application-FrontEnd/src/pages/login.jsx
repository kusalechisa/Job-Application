import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as LoginAPI } from "../../api/Endpoints/Auth.jsx";
import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "@/lib/constants";
import { showPopup } from "@/components/FloatingPopup";
import logoImage from "../assets/Logo.png";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await LoginAPI(form);
      login(res.data);
      navigate(getDashboardPath(res.data.user.role));
    } catch (err) {
      showPopup(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(circle_at_top_left,_rgba(56,0,255,0.18),_transparent_94%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_24%)]">
      <div className="relative z-10 flex items-center justify-center w-full max-w-lg">
        <Card className="w-full rounded-[2rem] border border-white/10 bg-slate-900/95 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <div className="relative mb-8 flex justify-center pt-8">
            <img
              src={logoImage}
              className="w-24 h-24 md:w-28 md:h-28 object-contain"
            />
          </div>

          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-white">
              Sign In
              <p className="mt-2 text-sm font-normal text-slate-300">
                Access your dashboard as an applicant or admin.
              </p>
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5 px-6 pb-8">
              <div className="space-y-2">
                <Label className="text-slate-200">Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="bg-slate-950/80 text-white placeholder:text-slate-400 border-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="bg-slate-950/80 text-white placeholder:text-slate-400 border-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:from-sky-400 hover:to-cyan-400"
              >
                Sign In
              </Button>

              <p className="text-center text-sm text-slate-400">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-sky-300 hover:text-white"
                >
                  Forgot password?
                </Link>
              </p>
              <p className="text-center text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-sky-300 hover:text-white"
                >
                  Register
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
