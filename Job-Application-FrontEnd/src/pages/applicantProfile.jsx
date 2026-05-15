import { useCallback, useEffect, useState } from "react";
import { getApplicantProfile, createApplicantProfile, updateApplicantProfile } from "../../api/Endpoints/Jobs.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  EMPTY_APPLICANT_PROFILE,
  profileToForm,
  formToFormData,
} from "@/lib/applicantProfileForm";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const selectClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-950";

function SectionTitle({ children }) {
  return (
    <h3 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-800 dark:border-slate-700 dark:text-slate-100">
      {children}
    </h3>
  );
}

function applyProfileToState(profile, setters) {
  const accountEmail = profile.account?.email || "";
  setters.setAccountEmail(accountEmail);
  setters.setForm(profileToForm(profile, accountEmail));
  setters.setCurrentResume(profile.resume || "");
  setters.setCurrentProfilePicture(profile.profilePicture || "");
  setters.setHasProfile(true);
}

export default function ApplicantProfile() {
  const { token } = useAuth();
  const [form, setForm] = useState(EMPTY_APPLICANT_PROFILE);
  const [accountEmail, setAccountEmail] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [currentResume, setCurrentResume] = useState("");
  const [currentProfilePicture, setCurrentProfilePicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    if (!silent) setError("");
    try {
      const res = await getApplicantProfile();
      const profile = res.data?.data;
      if (!profile) {
        throw new Error("Profile data was not returned from the server.");
      }
      applyProfileToState(profile, {
        setAccountEmail,
        setForm,
        setCurrentResume,
        setCurrentProfilePicture,
        setHasProfile,
      });
    } catch (err) {
      setHasProfile(false);
      setForm(EMPTY_APPLICANT_PROFILE);
      const status = err?.response?.status;
      if (status !== 404) {
        setError(getApiErrorMessage(err, "Failed to load your profile."));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadProfile();
  }, [token, loadProfile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "resume" || name === "profilePicture" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const data = formToFormData(form);
      if (hasProfile) {
        await updateApplicantProfile(data);
        setSuccess("Profile updated successfully.");
        await loadProfile({ silent: true });
      } else {
        await createApplicantProfile(data);
        setSuccess("Profile created successfully.");
        await loadProfile({ silent: true });
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
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">
            {hasProfile ? "Edit Applicant Profile" : "Create Applicant Profile"}
          </CardTitle>
          <p className="text-sm text-slate-500">
            Complete your profile to apply for jobs. A resume is required when applying.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && <p className="text-sm text-rose-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <section className="space-y-4">
              <SectionTitle>Personal Information</SectionTitle>
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input name="nationality" value={form.nationality} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select name="gender" value={form.gender} onChange={handleChange} className={selectClass}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className={selectClass}>
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                {currentProfilePicture && (
                  <p className="text-sm text-slate-500">Current: {currentProfilePicture}</p>
                )}
                <Input type="file" name="profilePicture" onChange={handleChange} accept="image/*" />
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Contact Information</SectionTitle>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label>Alternative Phone</Label>
                  <Input name="alternativePhone" value={form.alternativePhone} onChange={handleChange} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={accountEmail || "you@example.com"}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input name="city" value={form.city} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Sub City</Label>
                  <Input name="subCity" value={form.subCity} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input name="region" value={form.region} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Professional Information</SectionTitle>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Profession</Label>
                  <Input name="profession" value={form.profession} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Current Job Title</Label>
                  <Input name="currentJobTitle" value={form.currentJobTitle} onChange={handleChange} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    name="yearsOfExperience"
                    value={form.yearsOfExperience}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employment Status</Label>
                  <select
                    name="employmentStatus"
                    value={form.employmentStatus}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    <option value="Employed">Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Student">Student</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Portfolio URL</Label>
                  <Input type="url" name="portfolioUrl" value={form.portfolioUrl} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>LinkedIn URL</Label>
                  <Input type="url" name="linkedinUrl" value={form.linkedinUrl} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>GitHub URL</Label>
                  <Input type="url" name="githubUrl" value={form.githubUrl} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Education Information</SectionTitle>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Highest Education</Label>
                  <select
                    name="highestEducation"
                    value={form.highestEducation}
                    onChange={handleChange}
                    className={selectClass}
                  >
                    <option value="">Select</option>
                    <option value="High School">High School</option>
                    <option value="Associate">Associate</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Master">Master</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Graduation Year</Label>
                  <Input type="number" name="graduationYear" value={form.graduationYear} onChange={handleChange} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>University</Label>
                  <Input name="university" value={form.university} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>College</Label>
                  <Input name="college" value={form.college} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input name="fieldOfStudy" value={form.fieldOfStudy} onChange={handleChange} />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Skills Information</SectionTitle>
              <p className="text-xs text-slate-500">Enter comma-separated values for each list.</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Skills</Label>
                  <Input name="skills" value={form.skills} onChange={handleChange} placeholder="e.g. Project management, Agile" />
                </div>
                <div className="space-y-2">
                  <Label>Languages</Label>
                  <Input name="languages" value={form.languages} onChange={handleChange} placeholder="e.g. English, Amharic" />
                </div>
                <div className="space-y-2">
                  <Label>Technical Skills</Label>
                  <Input
                    name="technicalSkills"
                    value={form.technicalSkills}
                    onChange={handleChange}
                    placeholder="e.g. React, Node.js, PostgreSQL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Soft Skills</Label>
                  <Input
                    name="softSkills"
                    value={form.softSkills}
                    onChange={handleChange}
                    placeholder="e.g. Communication, Leadership"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <SectionTitle>Application Documents</SectionTitle>
              {currentResume && <p className="text-sm text-slate-500">Current resume: {currentResume}</p>}
              <div className="space-y-2">
                <Label>Resume (PDF, DOC, DOCX, TXT)</Label>
                <Input type="file" name="resume" onChange={handleChange} accept=".pdf,.doc,.docx,.txt" />
              </div>
            </section>

            <Button type="submit" disabled={saving} className="w-full bg-sky-600 text-white hover:bg-sky-700">
              {saving ? "Saving..." : hasProfile ? "Update Profile" : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
