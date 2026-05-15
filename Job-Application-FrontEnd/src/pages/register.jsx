import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as LoginAPI, register as RegisterAPI } from "../../api/Endpoints/Auth.jsx";
import { getDashboardPath } from "@/lib/constants";
import { createApplicantProfile } from "../../api/Endpoints/Jobs.jsx";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
    dob: "",
    phoneNumber: "",
    address: "",
    cv: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: name === "cv" ? files[0] : value,
    });
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

      const profileData = new FormData();
      profileData.append("phone", form.phoneNumber);
      profileData.append("address", form.address);
      profileData.append("gender", form.gender);
      if (form.cv) profileData.append("resume", form.cv);

      await createApplicantProfile(profileData);
      navigate(getDashboardPath("Applicant"));
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-8 py-10 text-white">
            <CardTitle className="text-3xl font-semibold text-center">Applicant Registration</CardTitle>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-100/90">
              Create your applicant account and upload your resume to begin applying.
            </p>
          </div>

          <CardContent className="px-6 py-8 lg:px-10">
            <form onSubmit={handleSubmit} className="grid gap-6 text-slate-900 dark:text-slate-100">
              {error && <div className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{error}</div>}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input name="firstName" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input name="middleName" value={form.middleName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input name="lastName" value={form.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" name="password" value={form.password} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input name="address" value={form.address} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>CV Upload</Label>
                  <Input type="file" name="cv" onChange={handleChange} />
                </div>
              </div>

              <Button className="w-full bg-sky-600 text-white hover:bg-sky-700" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Register"}
              </Button>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-sky-600 hover:text-sky-500">
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




