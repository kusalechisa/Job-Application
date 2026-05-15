import { useEffect, useState } from "react";
import { getApplicantProfile, createApplicantProfile, updateApplicantProfile } from "../../api/Endpoints/Jobs.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ApplicantProfile() {
  const [form, setForm] = useState({ phone: "", address: "", gender: "", resume: null });
  const [hasProfile, setHasProfile] = useState(false);
  const [currentResume, setCurrentResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getApplicantProfile();
        const profile = res.data.data;
        setForm({
          phone: profile.phone || "",
          address: profile.address || "",
          gender: profile.gender || "",
          resume: null,
        });
        setCurrentResume(profile.resume || "");
        setHasProfile(true);
      } catch {
        setHasProfile(false);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "resume" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const data = new FormData();
      data.append("phone", form.phone);
      data.append("address", form.address);
      data.append("gender", form.gender);
      if (form.resume) data.append("resume", form.resume);

      if (hasProfile) {
        await updateApplicantProfile(data);
        setSuccess("Profile updated successfully.");
      } else {
        await createApplicantProfile(data);
        setHasProfile(true);
        setSuccess("Profile created successfully.");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-slate-500">Loading profile...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">
            {hasProfile ? "Edit Applicant Profile" : "Create Applicant Profile"}
          </CardTitle>
          <p className="text-sm text-slate-500">Phone, address, gender, and resume are required to apply for jobs.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            {currentResume && (
              <p className="text-sm text-slate-500">Current resume: {currentResume}</p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
                  required
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input name="address" value={form.address} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label>Resume (PDF, DOC, DOCX, TXT)</Label>
              <Input type="file" name="resume" onChange={handleChange} accept=".pdf,.doc,.docx,.txt" />
            </div>
            <Button type="submit" disabled={saving} className="w-full bg-sky-600 text-white hover:bg-sky-700">
              {saving ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




