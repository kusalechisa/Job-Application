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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom right, #0f766e, #1e3a8a)",
        backgroundSize: "cover",
      }}
    >
      {/* <div
        className="absolute inset-0 animate-moving-background pointer-events-none"
        style={{
          backgroundImage: `url(${fingerImage})`,
          backgroundSize: "300px",          
          mixBlendMode: "overlay",
          backgroundRepeat: "repeat",
          
        }}
      /> */}
    
     <div className="relative z-10 flex items-center justify-center w-full h-full ">
      <Card className=" w-full max-w-md shadow-xl rounded-2xl bg-[#1854C4]">
        <div  className="relative mb-6 md:mb-8 flex justify-center">
          <img
            src={logoImage}
            className="w-24 h-24 md:w-32 md:h-32 object-contain relative z-10 drop-shadow-2xl"
          />
        </div>
        <CardHeader>
          <CardTitle className=" text-2xl text-center text-white">
            Login
            <p className="text-sm text-center text-white/70 mt-1">
              Login to Job Application System
            </p>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-white px-6 md:px-8">
            <div className="space-y-2 ">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="bg-white/10 text-white placeholder:text-white/60 border-white/20 focus:bg-[#1854C4] focus:ring-0 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                  className="bg-white/10 text-white placeholder:text-white/60 border-white/20 focus:bg-[#1854C4] focus:ring-0 focus:outline-none"
              />
            </div>

            <Button type="submit" className="w-full bg-[#170C79] text-white hover:bg-[#2563eb]">
              Sign In
              
            </Button>
          </form>
        </CardContent>
      </Card>
      </div> 
    </div>
  );
}