import { useState } from "react";
import { register } from "../../api/Endpoints/Auth.jsx";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dob: "",
    phoneNumber: "",
    homePhoneNumber: "",
    cv: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm({
      ...form,
      [name]: name === "cv" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await register(formData);

      alert("Registered successfully");

      setForm({
        firstName: "",
        middleName: "",
        lastName: "",
        gender: "",
        dob: "",
        phoneNumber: "",
        homePhoneNumber: "",
        cv: null,
      });

    } catch (err) {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl">
        <Card className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-8 py-10 text-white">
            <CardTitle className="text-3xl font-semibold text-center">
              Applicant Profile
            </CardTitle>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-100/90">
              Complete your profile to apply for job listings and track your applications.
            </p>
          </div>

          <CardContent className="px-6 py-8 lg:px-10">
            <form onSubmit={handleSubmit} className="grid gap-6 text-slate-900 dark:text-slate-100">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input name="firstName" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input name="middleName" value={form.middleName} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input name="lastName" value={form.lastName} onChange={handleChange} />
                </div>
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" name="dob" value={form.dob} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Home Phone Number</Label>
                  <Input name="homePhoneNumber" value={form.homePhoneNumber} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>CV Upload</Label>
                  <Input type="file" name="cv" onChange={handleChange} className="rounded-lg border border-slate-300 bg-white text-slate-900" />
                </div>
              </div>

              <Button className="w-full bg-sky-600 text-white hover:bg-sky-700" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Register"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}