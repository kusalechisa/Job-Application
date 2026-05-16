import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as LoginAPI, register as RegisterAPI } from "../../api/Endpoints/Auth.jsx";
import { getDashboardPath } from "@/lib/constants";
import { createApplicantProfile } from "../../api/Endpoints/Jobs.jsx";
import { formToFormData } from "@/lib/applicantProfileForm";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Calendar, 
  Upload, 
  FileText,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowRight
} from "lucide-react";

const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    maritalStatus: "",
    phone: "",
    alternativePhone: "",
    address: "",
    city: "",
    subCity: "",
    region: "",
    profilePicture: null,
    resume: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [uploadProgress, setUploadProgress] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "resume" || name === "profilePicture") {
      const file = files[0];
      if (file) {
        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [name]: 0 }));
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = (prev[name] || 0) + 20;
            if (newProgress >= 100) clearInterval(interval);
            return { ...prev, [name]: Math.min(newProgress, 100) };
          });
        }, 200);
      }
      setForm({ ...form, [name]: file });
    } else {
      setForm({ ...form, [name]: value });
    }

    // Password strength checker
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (value.match(/[a-z]/) && value.match(/[A-Z]/)) strength++;
      if (value.match(/[0-9]/)) strength++;
      if (value.match(/[^a-zA-Z0-9]/)) strength++;
      setPasswordStrength(strength);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");
      await RegisterAPI({
        name: fullName,
        email: form.email,
        password: form.password,
        role: "Applicant",
      });

      const loginRes = await LoginAPI({
        email: form.email,
        password: form.password,
      });

      login(loginRes.data);
      const profileData = formToFormData({ ...form, email: form.email });
      await createApplicantProfile(profileData);
      navigate(getDashboardPath("Applicant"));
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>

        <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/80 backdrop-blur-sm shadow-2xl dark:bg-slate-900/80 transition-all duration-500 hover:shadow-3xl">
          {/* Modern gradient header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 px-8 py-12 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm">
                  <User className="w-8 h-8" />
                </div>
                <CardTitle className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Join Our Community
                </CardTitle>
                <p className="text-white/90 text-lg max-w-md mx-auto">
                  Create your account and start your journey with us today
                </p>
              </div>
            </div>
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          <CardContent className="px-8 py-10 lg:px-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  Personal Information
                </h3>
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">First Name *</Label>
                    <Input 
                      name="firstName" 
                      value={form.firstName} 
                      onChange={handleChange} 
                      required
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Middle Name</Label>
                    <Input 
                      name="middleName" 
                      value={form.middleName} 
                      onChange={handleChange}
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                      placeholder="Michael"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Last Name *</Label>
                    <Input 
                      name="lastName" 
                      value={form.lastName} 
                      onChange={handleChange} 
                      required
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-500" />
                  Account Information
                </h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        required
                        className="rounded-xl border-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        name="password" 
                        value={form.password} 
                        onChange={handleChange} 
                        required
                        className="rounded-xl border-slate-200 pl-10 pr-10 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength indicator */}
                    {form.password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                level <= passwordStrength
                                  ? passwordStrength === 1
                                    ? "bg-red-500"
                                    : passwordStrength === 2
                                    ? "bg-yellow-500"
                                    : passwordStrength === 3
                                    ? "bg-green-500"
                                    : "bg-emerald-500"
                                  : "bg-slate-200 dark:bg-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          {passwordStrength === 0 && "Enter a password"}
                          {passwordStrength === 1 && "Weak password"}
                          {passwordStrength === 2 && "Fair password"}
                          {passwordStrength === 3 && "Good password"}
                          {passwordStrength === 4 && "Strong password!"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-indigo-500" />
                  Contact Information
                </h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleChange} 
                        required
                        className="rounded-xl border-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Alternative Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        name="alternativePhone" 
                        value={form.alternativePhone} 
                        onChange={handleChange}
                        className="rounded-xl border-slate-200 pl-10 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  Address Information
                </h3>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Street Address *</Label>
                    <Input 
                      name="address" 
                      value={form.address} 
                      onChange={handleChange} 
                      required
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 font-medium">City</Label>
                      <Input 
                        name="city" 
                        value={form.city} 
                        onChange={handleChange}
                        className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 font-medium">Sub City</Label>
                      <Input 
                        name="subCity" 
                        value={form.subCity} 
                        onChange={handleChange}
                        className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="Manhattan"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300 font-medium">Region</Label>
                      <Input 
                        name="region" 
                        value={form.region} 
                        onChange={handleChange}
                        className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                        placeholder="New York"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  Additional Information
                </h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Date of Birth</Label>
                    <Input 
                      type="date" 
                      name="dateOfBirth" 
                      value={form.dateOfBirth} 
                      onChange={handleChange}
                      className="rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Marital Status</Label>
                    <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className={selectClass}>
                      <option value="">Select status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-500" />
                  Documents
                </h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Profile Picture</Label>
                    <div className="relative">
                      <Input 
                        type="file" 
                        name="profilePicture" 
                        onChange={handleChange} 
                        accept="image/*"
                        className="rounded-xl border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200 cursor-pointer"
                      />
                      {uploadProgress.profilePicture > 0 && uploadProgress.profilePicture < 100 && (
                        <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress.profilePicture}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Recommended: Square image, max 5MB</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">Resume/CV</Label>
                    <div className="relative">
                      <Input 
                        type="file" 
                        name="resume" 
                        onChange={handleChange} 
                        accept=".pdf,.doc,.docx,.txt"
                        className="rounded-xl border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200 cursor-pointer"
                      />
                      {uploadProgress.resume > 0 && uploadProgress.resume < 100 && (
                        <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                            style={{ width: `${uploadProgress.resume}%` }}
                          />
                        </div>
                      )}
                      {form.resume && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          <span>{form.resume.name}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Accepted formats: PDF, DOC, DOCX, TXT (Max 10MB)</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200 inline-flex items-center gap-1 group"
                  >
                    Sign in
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}