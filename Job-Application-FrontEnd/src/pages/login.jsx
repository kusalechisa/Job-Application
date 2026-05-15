import { useState } from "react";
import { login as LoginAPI } from "../../api/Endpoints/Auth.jsx";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import fingerImage from "../assets/finger.png";
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
    const res = await LoginAPI(form);
    console.log(res.data,"response")
    login(res.data);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.18),_transparent_24%)]">
      <div className="relative z-10 flex items-center justify-center w-full max-w-lg">
        <Card className="w-full rounded-[2rem] border border-white/10 bg-slate-900/95 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.9)] backdrop-blur-xl">
          <div className="relative mb-8 flex justify-center pt-8">
            <img src={logoImage} className="w-24 h-24 md:w-28 md:h-28 object-contain" />
          </div>

          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-white">
              Applicant Login
              <p className="mt-2 text-sm font-normal text-slate-300">
                Access your job dashboard and applied positions.
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
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="bg-slate-950/80 text-white placeholder:text-slate-400 border-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:from-sky-400 hover:to-cyan-400">
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}