import { useCallback, useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  BookOpen,
  X,
  Menu,
  LogOut,
  Home,
  Settings,
  FileIcon,
  Award,
  School,
  ChevronRight,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
  Globe,
  Link as LinkIcon,
} from "lucide-react";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400";

// Helper function to determine education level
const getEducationLevel = (highestEducation) => {
  const degree = highestEducation?.toLowerCase();
  if (degree === "bachelor" || degree === "master" || degree === "phd") {
    return "degree";
  }
  if (degree === "associate") {
    return "associate";
  }
  return "other";
};

function SectionTitle({ children, icon: Icon, description }) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 flex-shrink-0" />
        )}
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
          {children}
        </h3>
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 ml-0 sm:ml-7">
          {description}
        </p>
      )}
    </div>
  );
}

function SkillBadge({ skill, onRemove }) {
  return (
    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-950/70 transition-all px-3 py-1 rounded-xl group">
      {skill}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-2 hover:text-red-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white break-words">
          {value}
        </p>
      </div>
    </div>
  );
}

function EducationCard({ education, index, onUpdate, onRemove, isRemovable }) {
  const educationLevel = getEducationLevel(education.highestEducation);
  const isDegreeLevel = educationLevel === "degree";

  return (
    <div className="relative p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:shadow-md transition-all duration-200">
      {isRemovable && (
        <button
          onClick={onRemove}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
          <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
          Education {index + 1}
        </h4>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Highest Education *
          </Label>
          <select
            value={education.highestEducation}
            onChange={(e) =>
              onUpdate(index, "highestEducation", e.target.value)
            }
            className={selectClass}
            required
          >
            <option value="">Select education level</option>
            <option value="High School">High School / Secondary</option>
            <option value="Associate">Associate Degree</option>
            <option value="Bachelor">Bachelor's Degree</option>
            <option value="Master">Master's Degree</option>
            <option value="PhD">PhD / Doctorate</option>
            <option value="Other">Other Certification</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Graduation Year
          </Label>
          <Input
            type="number"
            min="1950"
            max={new Date().getFullYear() + 5}
            value={education.graduationYear}
            onChange={(e) => onUpdate(index, "graduationYear", e.target.value)}
            className="rounded-xl"
            placeholder="e.g., 2024"
          />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            University / Institution
          </Label>
          <Input
            value={education.university}
            onChange={(e) => onUpdate(index, "university", e.target.value)}
            className="rounded-xl"
            placeholder="University name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            College / School
          </Label>
          <Input
            value={education.college}
            onChange={(e) => onUpdate(index, "college", e.target.value)}
            className="rounded-xl"
            placeholder="College name"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Field of Study
          </Label>
          <Input
            value={education.fieldOfStudy}
            onChange={(e) => onUpdate(index, "fieldOfStudy", e.target.value)}
            className="rounded-xl"
            placeholder="e.g., Computer Science"
          />
        </div>
      </div>

      {/* CGPA - Only for University Degree */}
      {isDegreeLevel && (
        <div className="mt-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
            <div className="flex-1">
              <Label className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Academic Performance
              </Label>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mt-2">
                <div>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    name="cgpa"
                    value={education.cgpa || ""}
                    onChange={(e) => onUpdate(index, "cgpa", e.target.value)}
                    className="rounded-xl border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                    placeholder="CGPA (0-4.0)"
                  />
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    On a 4.0 scale
                  </p>
                </div>

                {/* Exit Exam - Only for Bachelor's Degree */}
                {education.highestEducation === "Bachelor" && (
                  <div>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      name="exitExamScore"
                      value={education.exitExamScore || ""}
                      onChange={(e) =>
                        onUpdate(index, "exitExamScore", e.target.value)
                      }
                      className="rounded-xl border-indigo-200 dark:border-indigo-800 focus:border-indigo-500"
                      placeholder="Exit Exam Score (%)"
                    />
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                      Exit examination score (0-100%)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillsInput({ label, value, onChange, placeholder, icon: Icon }) {
  const [inputValue, setInputValue] = useState("");
  const skills = value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s)
    : [];

  const addSkill = () => {
    if (inputValue.trim() && !skills.includes(inputValue.trim())) {
      const newSkills = [...skills, inputValue.trim()];
      onChange({ target: { value: newSkills.join(", ") } });
      setInputValue("");
    }
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = skills.filter((s) => s !== skillToRemove);
    onChange({ target: { value: newSkills.join(", ") } });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-indigo-500" />}
        {label}
      </Label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="rounded-xl flex-1"
          placeholder={placeholder}
        />
        <Button
          type="button"
          onClick={addSkill}
          variant="outline"
          className="rounded-xl px-4 w-full sm:w-auto"
        >
          Add
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, idx) => (
            <SkillBadge
              key={idx}
              skill={skill}
              onRemove={() => removeSkill(skill)}
            />
          ))}
        </div>
      )}
      <input
        type="hidden"
        name={label.toLowerCase()}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default function ApplicantProfile() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(() => {
    const nameParts = user?.name?.split(" ") || [];
    return {
      ...EMPTY_APPLICANT_PROFILE,
      firstName: nameParts[0] || "",
      middleName: nameParts[1] || "",
      lastName: nameParts[2] || nameParts.slice(1).join(" ") || "",
      email: user?.email || "",
    };
  });

  const [accountEmail, setAccountEmail] = useState(user?.email || "");
  const [hasProfile, setHasProfile] = useState(false);
  const [currentResume, setCurrentResume] = useState("");
  const [currentProfilePicture, setCurrentProfilePicture] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [uploadProgress, setUploadProgress] = useState({});

  const loadProfile = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      if (!silent) setError("");
      try {
        const res = await getApplicantProfile();
        const profile = res.data?.data;
        if (!profile) {
          setHasProfile(false);
          setForm((prev) => ({
            ...prev,
            firstName: prev.firstName || user?.name?.split(" ")[0] || "",
            lastName: prev.lastName || user?.name?.split(" ")[1] || "",
          }));
          setCurrentResume("");
          setCurrentProfilePicture("");
          setAccountEmail(user?.email || "");
          return;
        }
        const accountEmail = profile.account?.email || "";
        setAccountEmail(accountEmail);
        setForm(profileToForm(profile));
        setCurrentResume(profile.resume || "");
        setCurrentProfilePicture(profile.profilePicture || "");
        setHasProfile(true);
      } catch (err) {
        setHasProfile(false);
        setError(getApiErrorMessage(err, "Failed to load your profile."));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?.email, user?.name],
  );

  useEffect(() => {
    if (!token) return;
    loadProfile();
  }, [token, loadProfile]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resume" || name === "profilePicture") {
      const file = files[0];
      if (file) {
        setUploadProgress((prev) => ({ ...prev, [name]: 0 }));
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = (prev[name] || 0) + 20;
            if (newProgress >= 100) clearInterval(interval);
            return { ...prev, [name]: Math.min(newProgress, 100) };
          });
        }, 200);
      }
      setForm((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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
          cgpa: "",
          exitExamScore: "",
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = () => {
    const first = form.firstName || user?.name?.split(" ")[0] || "";
    const last = form.lastName || user?.name?.split(" ")[1] || "";
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  const sections = [
    {
      id: "personal",
      label: "Personal Info",
      icon: User,
      description: "Your basic personal details",
    },
    {
      id: "contact",
      label: "Contact",
      icon: Phone,
      description: "How employers can reach you",
    },
    {
      id: "professional",
      label: "Professional",
      icon: Briefcase,
      description: "Your work experience and career details",
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      description: "Your educational background",
    },
    {
      id: "skills",
      label: "Skills",
      icon: Code,
      description: "List your skills and competencies",
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      description: "Upload your resume and other documents",
    },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 transition-colors"
        >
          <Menu className="h-6 w-6 text-slate-700 dark:text-slate-300" />
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`
        fixed left-0 top-0 z-50 h-full w-72 sm:w-80 transform transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-2xl lg:hidden
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
                label="Applications"
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
                {currentProfilePicture ? (
                  <AvatarImage src={currentProfilePicture} alt="Profile" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                )}
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
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {hasProfile ? "My Profile" : "Complete Your Profile"}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                {hasProfile
                  ? "Manage your personal information and professional details"
                  : "Fill in your details to start applying for jobs"}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 shadow-sm self-start">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                Profile Status
              </span>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 text-xs">
                {hasProfile ? "Active" : "Incomplete"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-600 dark:text-emerald-400">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Sidebar Navigation with Avatar at Top */}
          <div className="lg:col-span-3">
            <Card className="lg:sticky lg:top-6 overflow-hidden border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 shadow-xl rounded-2xl">
              <CardContent className="p-4 sm:p-6">
                {/* Avatar at the top of sidebar navigation */}
                <div className="flex flex-col items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white dark:ring-slate-800 shadow-xl">
                      {currentProfilePicture ? (
                        <AvatarImage
                          src={currentProfilePicture}
                          alt="Profile"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-2xl">
                          {getInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <label
                      htmlFor="profile-picture-sidebar"
                      className="absolute bottom-0 right-0 cursor-pointer"
                    >
                      <div className="h-7 w-7 rounded-full bg-white dark:bg-slate-800 border-2 border-indigo-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Camera className="h-3 w-3 text-indigo-500" />
                      </div>
                    </label>
                    <input
                      id="profile-picture-sidebar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      name="profilePicture"
                      onChange={handleChange}
                    />
                  </div>
                  <h3 className="font-semibold text-md text-slate-900 dark:text-white mt-3">
                    {form.firstName} {form.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {form.profession || "Professional"}
                  </p>
                </div>

                {/* Navigation Items */}
                <div className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeTab === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-sm"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-indigo-500"}`}
                        />
                        <span className="font-medium text-sm">
                          {section.label}
                        </span>
                        {isActive && (
                          <ChevronRight className="h-3 w-3 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-9">
            {/* Mobile Tab Navigation */}
            <div className="lg:hidden mb-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 pb-2 min-w-max">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeTab === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Card className="border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 shadow-xl rounded-2xl overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="p-4 sm:p-6">
                  {/* Personal Information Section */}
                  {activeTab === "personal" && (
                    <div className="space-y-6">
                      <SectionTitle
                        icon={User}
                        description="Your basic personal details"
                      >
                        Personal Information
                      </SectionTitle>

                      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            First Name *
                          </Label>
                          <Input
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                            className="rounded-xl"
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Middle Name
                          </Label>
                          <Input
                            name="middleName"
                            value={form.middleName}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Michael"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2 md:col-span-1">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Last Name *
                          </Label>
                          <Input
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                            className="rounded-xl"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
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
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Nationality
                          </Label>
                          <Input
                            name="nationality"
                            value={form.nationality}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Your nationality"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Gender
                          </Label>
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
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
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
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Information Section */}
                  {activeTab === "contact" && (
                    <div className="space-y-6">
                      <SectionTitle
                        icon={Phone}
                        description="How employers can reach you"
                      >
                        Contact Information
                      </SectionTitle>

                      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
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
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Alternative Phone
                          </Label>
                          <Input
                            name="alternativePhone"
                            value={form.alternativePhone}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Alternative contact number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          readOnly
                          disabled
                          value={accountEmail || user?.email || ""}
                          className="rounded-xl bg-slate-50 dark:bg-slate-800"
                        />
                        <p className="text-xs text-slate-500">
                          Email is linked to your account and cannot be changed
                          here
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                          Street Address *
                        </Label>
                        <Input
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          required
                          className="rounded-xl"
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            City
                          </Label>
                          <Input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
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
                        <div className="space-y-2 sm:col-span-2 md:col-span-1">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Region
                          </Label>
                          <Input
                            name="region"
                            value={form.region}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Region"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Professional Information Section */}
                  {activeTab === "professional" && (
                    <div className="space-y-6">
                      <SectionTitle
                        icon={Briefcase}
                        description="Your work experience and career details"
                      >
                        Professional Information
                      </SectionTitle>

                      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Profession / Job Title
                          </Label>
                          <Input
                            name="profession"
                            value={form.profession}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g., Software Engineer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Current Job Title
                          </Label>
                          <Input
                            name="currentJobTitle"
                            value={form.currentJobTitle}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="e.g., Senior Developer"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Years of Experience
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            name="yearsOfExperience"
                            value={form.yearsOfExperience}
                            onChange={handleChange}
                            className="rounded-xl"
                            placeholder="Years of professional experience"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                            Employment Status
                          </Label>
                          <select
                            name="employmentStatus"
                            value={form.employmentStatus}
                            onChange={handleChange}
                            className={selectClass}
                          >
                            <option value="">Select status</option>
                            <option value="Employed">Employed Full-time</option>
                            <option value="Part-time">
                              Employed Part-time
                            </option>
                            <option value="Self-employed">Self-employed</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Student">Student</option>
                            <option value="Unemployed">
                              Currently Unemployed
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                          Professional Links
                        </Label>
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type="url"
                              name="portfolioUrl"
                              value={form.portfolioUrl}
                              onChange={handleChange}
                              className="rounded-xl pl-10"
                              placeholder="Portfolio website"
                            />
                          </div>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type="url"
                              name="linkedinUrl"
                              value={form.linkedinUrl}
                              onChange={handleChange}
                              className="rounded-xl pl-10"
                              placeholder="LinkedIn profile"
                            />
                          </div>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              type="url"
                              name="githubUrl"
                              value={form.githubUrl}
                              onChange={handleChange}
                              className="rounded-xl pl-10"
                              placeholder="GitHub profile"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Education Information Section */}
                  {activeTab === "education" && (
                    <div className="space-y-6">
                      <SectionTitle
                        icon={GraduationCap}
                        description="Your educational background"
                      >
                        Education Information
                      </SectionTitle>

                      <div className="space-y-4">
                        {form.education && form.education.length > 0 ? (
                          form.education.map((edu, index) => (
                            <EducationCard
                              key={index}
                              education={edu}
                              index={index}
                              onUpdate={handleEducationChange}
                              onRemove={() => removeEducation(index)}
                              isRemovable={form.education.length > 1}
                            />
                          ))
                        ) : (
                          <div className="text-center py-8 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <GraduationCap className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                            <p className="text-slate-500 dark:text-slate-400">
                              No education entries added yet
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                              Add your educational background to increase
                              profile completion
                            </p>
                          </div>
                        )}

                        <Button
                          type="button"
                          onClick={addEducation}
                          variant="outline"
                          className="w-full border-2 border-dashed border-indigo-300 dark:border-indigo-700 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all rounded-xl py-6"
                        >
                          <GraduationCap className="h-5 w-5 mr-2" />
                          Add Another Education
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Skills Information Section */}
                  {activeTab === "skills" && (
                    <div className="space-y-6">
                      <SectionTitle
                        icon={Code}
                        description="List your skills and competencies"
                      >
                        Skills & Competencies
                      </SectionTitle>

                      <div className="space-y-6">
                        <SkillsInput
                          label="Technical Skills"
                          value={form.technicalSkills}
                          onChange={handleChange}
                          placeholder="e.g., React, Python, AWS"
                          icon={Code}
                        />

                        <SkillsInput
                          label="Soft Skills"
                          value={form.softSkills}
                          onChange={handleChange}
                          placeholder="e.g., Leadership, Communication"
                          icon={User}
                        />

                        <SkillsInput
                          label="Languages"
                          value={form.languages}
                          onChange={handleChange}
                          placeholder="e.g., English, Spanish, French"
                          icon={Languages}
                        />
                      </div>
                    </div>
                  )}

                  {/* Documents Section */}
                  {activeTab === "documents" && (
                    <div className="space-y-6">
                      <SectionTitle
                        icon={FileText}
                        description="Upload your resume and other documents"
                      >
                        Application Documents
                      </SectionTitle>

                      <div className="space-y-2">
                        <Label className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium">
                          Resume/CV *
                        </Label>
                        {currentResume && (
                          <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 mb-3">
                            <FileIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-400 flex-1 truncate">
                              {currentResume}
                            </span>
                            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          </div>
                        )}
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 sm:p-8 text-center hover:border-indigo-500 transition-all cursor-pointer">
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
                            className="cursor-pointer block"
                          >
                            <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-2 sm:mb-3" />
                            <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                              Click to upload your resume
                            </p>
                            <p className="text-xs text-slate-500 mt-1 sm:mt-2">
                              PDF, DOC, DOCX, TXT (Max 5MB)
                            </p>
                          </label>
                        </div>
                        {uploadProgress.resume > 0 &&
                          uploadProgress.resume < 100 && (
                            <div className="mt-3">
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-500 transition-all duration-300 rounded-full"
                                  style={{ width: `${uploadProgress.resume}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1 text-center">
                                Uploading: {uploadProgress.resume}%
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="border-t border-slate-200 dark:border-slate-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl rounded-xl px-6"
                  >
                    {saving ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        <span>
                          {hasProfile ? "Update Profile" : "Save Profile"}
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
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
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
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
