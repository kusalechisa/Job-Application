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
    <div className="min-h-screen px-6 sm:px-8 md:px-12 lg:px-16 py-6">
      <Card className="w-full shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Applicant Profile
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4  ml-12 max-w-2xl">

            {/* First Name */}
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input name="firstName" value={form.firstName} onChange={handleChange} />
            </div>

            {/* Middle Name */}
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input name="middleName" value={form.middleName} onChange={handleChange} />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input name="lastName" value={form.lastName} onChange={handleChange} />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label>Gender</Label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* DOB */}
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" name="dob" value={form.dob} onChange={handleChange} />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
            </div>

            {/* Home Phone */}
            <div className="space-y-2">
              <Label>Home Phone Number</Label>
              <Input name="homePhoneNumber" value={form.homePhoneNumber} onChange={handleChange} />
            </div>

            {/* CV Upload */}
            <div className="space-y-2">
              <Label>CV Upload</Label>
              <Input type="file" name="cv" onChange={handleChange} />
            </div>

            {/* Submit */}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Register"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}