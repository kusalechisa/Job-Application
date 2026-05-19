import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getApplicantProfile,
  createApplicantProfile,
  updateApplicantProfile,
} from "../../api/Endpoints/Jobs.jsx";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  FileText,
  Upload,
  Camera,
  Save,
  CheckCircle,
  AlertCircle,
  Building,
  Calendar,
  Link as LinkIcon,
  Globe,
  Award,
  Users,
  BookOpen,
  X,
  Menu,
  LogOut,
  Home,
  Settings,
  TrendingUp,
  FileText as FileIcon,
} from "lucide-react";

const selectClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all";

function SectionTitle({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
      {Icon && <Icon className="h-5 w-5 text-indigo-500" />}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {children}
      </h3>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <Icon className="h-5 w-5 text-indigo-500" />
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function SkillBadge({ skill }) {
  return (
    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-950/70 transition-all px-3 py-1">
      {skill}
    </Badge>
  );
}

function applyProfileToState(profile, setters) {
  const accountEmail = profile.account?.email || "";
  setters.setAccountEmail(accountEmail);
  setters.setForm(profileToForm(profile));
  setters.setCurrentResume(profile.resume || "");
  setters.setCurrentProfilePicture(profile.profilePicture || "");
  setters.setHasProfile(true);
}

export default function ApplicantProfile() {
  const { token, user } = useAuth();
  const [form, setForm] = useState(EMPTY_APPLICANT_PROFILE);
  const [accountEmail, setAccountEmail] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [currentResume, setCurrentResume] = useState("");
  const [currentProfilePicture, setCurrentProfilePicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");
  const [profileCompletion, setProfileCompletion] = useState(0);

  const loadProfile = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      if (!silent) setError("");
      try {
        const res = await getApplicantProfile();
        const profile = res.data?.data;
        if (!profile) {
          setHasProfile(false);
          setForm({
            ...EMPTY_APPLICANT_PROFILE,
          });
          setCurrentResume("");
          setCurrentProfilePicture("");
          setAccountEmail(user?.email || "");
          return;
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
        setForm({ ...EMPTY_APPLICANT_PROFILE });
        setError(getApiErrorMessage(err, "Failed to load your profile."));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?.email],
  );

  useEffect(() => {
    if (!token) return;
    loadProfile();
  }, [token, loadProfile]);

  // Calculate profile completion
  useEffect(() => {
    const requiredFields = [
      form.firstName,
      form.lastName,
      accountEmail || user?.email,
      form.phone,
      form.address,
      form.profession,
      form.yearsOfExperience,
      form.skills,
      form.education && form.education.length > 0,
    ];
    const filledCount = requiredFields.filter(
      (field) => field && (typeof field !== "object" || field.length > 0),
    ).length;
    const completion = Math.round((filledCount / requiredFields.length) * 100);
    setProfileCompletion(completion);
  }, [form, accountEmail, user?.email]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "resume" || name === "profilePicture" ? files[0] : value,
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setForm((prev) => {
      const newEducation = [...prev.education];
      newEducation[index] = {
        ...newEducation[index],
        [field]: value,
      };
      return { ...prev, education: newEducation };
    });
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          highestEducation: "",
          university: "",
          college: "",
          fieldOfStudy: "",
          graduationYear: "",
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setForm((prev) => {
      const newEducation = prev.education.filter((_, i) => i !== index);
      return { ...prev, education: newEducation };
    });
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
        setSuccess("Profile updated successfully!");
        await loadProfile({ silent: true });
      } else {
        await createApplicantProfile(data);
        setSuccess("Profile created successfully!");
        await loadProfile({ silent: true });
      }
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save profile."));
      setTimeout(() => setError(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = form.firstName || user?.name?.split(" ")[0] || "";
    const last = form.lastName || user?.name?.split(" ")[1] || "";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const sidebarLinks = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "skills", label: "Skills", icon: Code },
    { id: "documents", label: "Documents", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`
        fixed left-0 top-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-2xl
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    JobPortal
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Applicant Panel
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 py-6">
            <nav className="space-y-1 px-4">
              <NavItem icon={Home} label="Dashboard" to="/applicant" />
              <NavItem
                icon={User}
                label="Profile"
                to="/applicant/profile"
                active
              />
              <NavItem
                icon={Briefcase}
                label="My Applications"
                to="/applicant/applications"
              />
              <NavItem icon={BookOpen} label="Saved Jobs" to="/saved-jobs" />
              <NavItem
                icon={Settings}
                label="Settings"
                to="/applicant/settings"
              />
            </nav>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {form.firstName} {form.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  {accountEmail || user?.email}
                </p>
              </div>
            </div>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {hasProfile ? "My Profile" : "Complete Your Profile"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {hasProfile
                    ? "Manage your personal information and professional details"
                    : "Create your profile to start applying for jobs"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Profile Completion
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {profileCompletion}%
                  </p>
                </div>
                <Progress value={profileCompletion} className="w-32 h-2" />
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-emerald-600 dark:text-emerald-400">
                {success}
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-800">
                        {currentProfilePicture ? (
                          <AvatarImage
                            src={currentProfilePicture}
                            alt="Profile"
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-3xl">
                            {getInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <label
                        htmlFor="profile-picture"
                        className="absolute bottom-0 right-0 cursor-pointer"
                      >
                        <div className="h-8 w-8 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-500 flex items-center justify-center shadow-lg">
                          <Camera className="h-4 w-4 text-indigo-500" />
                        </div>
                      </label>
                      <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        name="profilePicture"
                        onChange={handleChange}
                      />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {form.firstName} {form.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {form.profession || "Professional"}
                    </p>
                  </div>

                  <nav className="space-y-1">
                    {sidebarLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <button
                          key={link.id}
                          onClick={() => setActiveSection(link.id)}
                          className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                            activeSection === link.id
                              ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 dark:from-indigo-950/50 dark:to-blue-950/50 dark:text-indigo-400"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{link.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit}>
                {/* Personal Information Section */}
                {activeSection === "personal" && (
                  <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl mb-6">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                      <SectionTitle icon={User}>
                        Personal Information
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            First Name
                          </Label>
                          <Input
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Enter first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Middle Name
                          </Label>
                          <Input
                            name="middleName"
                            value={form.middleName}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Enter middle name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Last Name
                          </Label>
                          <Input
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Date of Birth
                          </Label>
                          <Input
                            type="date"
                            name="dateOfBirth"
                            value={form.dateOfBirth}
                            onChange={handleChange}
                            className="rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Nationality
                          </Label>
                          <Input
                            name="nationality"
                            value={form.nationality}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Enter nationality"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Gender</Label>
                          <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">
                              Prefer not to say
                            </option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Marital Status
                          </Label>
                          <select
                            name="maritalStatus"
                            value={form.maritalStatus}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="">Select status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Information Section */}
                {activeSection === "contact" && (
                  <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl mb-6">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                      <SectionTitle icon={Phone}>
                        Contact Information
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Phone Number *
                          </Label>
                          <Input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="rounded-xl"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Alternative Phone
                          </Label>
                          <Input
                            name="alternativePhone"
                            value={form.alternativePhone}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          readOnly
                          disabled
                          value={accountEmail || user?.email || ""}
                          placeholder={accountEmail || user?.email || "you@example.com"}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800"
                        />
                        <p className="text-xs text-slate-500">
                          Email is linked to your account and cannot be changed
                          here
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Address *</Label>
                        <Input
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          required
                          className="rounded-xl"
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">City</Label>
                          <Input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Sub City
                          </Label>
                          <Input
                            name="subCity"
                            value={form.subCity}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Sub city"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Region</Label>
                          <Input
                            name="region"
                            value={form.region}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Region"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Professional Information Section */}
                {activeSection === "professional" && (
                  <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl mb-6">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                      <SectionTitle icon={Briefcase}>
                        Professional Information
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Profession
                          </Label>
                          <Input
                            name="profession"
                            value={form.profession}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g. Software Engineer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Current Job Title
                          </Label>
                          <Input
                            name="currentJobTitle"
                            value={form.currentJobTitle}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g. Senior Developer"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Years of Experience
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            name="yearsOfExperience"
                            value={form.yearsOfExperience}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Employment Status
                          </Label>
                          <select
                            name="employmentStatus"
                            value={form.employmentStatus}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="">Select status</option>
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
                          <Label className="text-sm font-medium">
                            Portfolio URL
                          </Label>
                          <Input
                            type="url"
                            name="portfolioUrl"
                            value={form.portfolioUrl}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="https://yourportfolio.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            LinkedIn URL
                          </Label>
                          <Input
                            type="url"
                            name="linkedinUrl"
                            value={form.linkedinUrl}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            GitHub URL
                          </Label>
                          <Input
                            type="url"
                            name="githubUrl"
                            value={form.githubUrl}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="https://github.com/username"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Education Information Section */}
                {activeSection === "education" && (
                  <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl mb-6">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                      <SectionTitle icon={GraduationCap}>
                        Education Information
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid gap-4 md:grid-cols-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 p-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            CGPA
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            name="cgpa"
                            value={form.cgpa}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g. 3.75"
                          />
                          <p className="text-xs text-slate-500">
                            Scale 0–10 (adjust to your institution&apos;s scale)
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Exit exam (100%)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            name="exitExamScore"
                            value={form.exitExamScore}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g. 82.5"
                          />
                          <p className="text-xs text-slate-500">
                            Score out of 100
                          </p>
                        </div>
                      </div>

                      {form.education && form.education.length > 0 ? (
                        form.education.map((edu, index) => (
                          <div
                            key={index}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-slate-900 dark:text-white">
                                Education {index + 1}
                              </h4>
                              {form.education.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => removeEducation(index)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Highest Education
                                </Label>
                                <select
                                  value={edu.highestEducation}
                                  onChange={(e) =>
                                    handleEducationChange(
                                      index,
                                      "highestEducation",
                                      e.target.value,
                                    )
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Select level</option>
                                  <option value="High School">
                                    High School
                                  </option>
                                  <option value="Associate">Associate</option>
                                  <option value="Bachelor">Bachelor</option>
                                  <option value="Master">Master</option>
                                  <option value="PhD">PhD</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Graduation Year
                                </Label>
                                <Input
                                  type="number"
                                  value={edu.graduationYear}
                                  onChange={(e) =>
                                    handleEducationChange(
                                      index,
                                      "graduationYear",
                                      e.target.value,
                                    )
                                  }
                                  className="rounded-xl"
                                  placeholder="2024"
                                />
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  University
                                </Label>
                                <Input
                                  value={edu.university}
                                  onChange={(e) =>
                                    handleEducationChange(
                                      index,
                                      "university",
                                      e.target.value,
                                    )
                                  }
                                  className="rounded-xl"
                                  placeholder="University name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  College
                                </Label>
                                <Input
                                  value={edu.college}
                                  onChange={(e) =>
                                    handleEducationChange(
                                      index,
                                      "college",
                                      e.target.value,
                                    )
                                  }
                                  className="rounded-xl"
                                  placeholder="College name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Field of Study
                                </Label>
                                <Input
                                  value={edu.fieldOfStudy}
                                  onChange={(e) =>
                                    handleEducationChange(
                                      index,
                                      "fieldOfStudy",
                                      e.target.value,
                                    )
                                  }
                                  className="rounded-xl"
                                  placeholder="Computer Science"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                          No education entries added yet
                        </p>
                      )}

                      <Button
                        type="button"
                        onClick={addEducation}
                        variant="outline"
                        className="w-full border-dashed border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Add Education
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Skills Information Section */}
                {activeSection === "skills" && (
                  <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl mb-6">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                      <SectionTitle icon={Code}>
                        Skills Information
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Enter comma-separated values for each list
                      </p>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Skills</Label>
                          <Input
                            name="skills"
                            value={form.skills}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g. Project Management, Agile, Scrum"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Languages
                          </Label>
                          <Input
                            name="languages"
                            value={form.languages}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g. English, Spanish, French"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Technical Skills
                          </Label>
                          <Input
                            name="technicalSkills"
                            value={form.technicalSkills}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g. React, Node.js, PostgreSQL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Soft Skills
                          </Label>
                          <Input
                            name="softSkills"
                            value={form.softSkills}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g. Communication, Leadership"
                          />
                        </div>
                      </div>

                      {/* Preview Skills */}
                      {(form.skills ||
                        form.technicalSkills ||
                        form.softSkills ||
                        form.languages) && (
                        <div className="space-y-4 pt-4">
                          {form.skills && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Skills Preview
                              </Label>
                              <div className="flex flex-wrap gap-2">
                                {form.skills.split(",").map((skill, idx) => (
                                  <SkillBadge key={idx} skill={skill.trim()} />
                                ))}
                              </div>
                            </div>
                          )}
                          {form.technicalSkills && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Technical Skills Preview
                              </Label>
                              <div className="flex flex-wrap gap-2">
                                {form.technicalSkills
                                  .split(",")
                                  .map((skill, idx) => (
                                    <SkillBadge
                                      key={idx}
                                      skill={skill.trim()}
                                    />
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Documents Section */}
                {activeSection === "documents" && (
                  <Card className="overflow-hidden border-0 bg-white/70 backdrop-blur-sm dark:bg-slate-900/70 shadow-xl mb-6">
                    <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30">
                      <SectionTitle icon={FileText}>
                        Application Documents
                      </SectionTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Resume/CV *
                        </Label>
                        {currentResume && (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 mb-2">
                            <FileIcon className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-emerald-700 dark:text-emerald-400">
                              Current: {currentResume}
                            </span>
                          </div>
                        )}
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-indigo-500 transition-all">
                          <input
                            type="file"
                            name="resume"
                            onChange={handleChange}
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            id="resume-upload"
                          />
                          <label
                            htmlFor="resume-upload"
                            className="cursor-pointer"
                          >
                            <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              PDF, DOC, DOCX, TXT (Max 5MB)
                            </p>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white hover:shadow-lg transition-all rounded-xl px-8 py-2 text-lg"
                  >
                    {saving ? (
                      <>
                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        {hasProfile ? "Update Profile" : "Create Profile"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation Item Component
function NavItem({ icon: Icon, label, to, active = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
        active
          ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 dark:from-indigo-950/50 dark:to-blue-950/50 dark:text-indigo-400"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}
