import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Bookmark, 
  BookmarkCheck,
  ChevronLeft, 
  ChevronRight,
  Filter,
  X,
  Sparkles,
  Clock,
  Building2,
  GraduationCap,
  Globe,
  Building,
  Menu,
  Home,
  User,
  FileText,
  Settings,
  LogOut,
  TrendingUp,
  Award,
  Zap,
  Eye,
  Heart,
  Calendar,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { getJobs, applyForJob, getApplicantProfile } from "../../api/Endpoints/Jobs.jsx";
import { useAuth } from "../context/AuthContext";
import JobDetailDrawer from "../components/JobDetailDrawer";

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  
  // Filters
  const [filters, setFilters] = useState({
    location: '',
    salaryRange: '',
    category: '',
    workMode: '',
    experience: '',
    jobType: ''
  });

  const { token, user } = useAuth();
  const navigate = useNavigate();
  const itemsPerPage = 12;

  // Fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getJobs({ page: currentPage, limit: itemsPerPage, search });
      setJobs(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, pages: 1, total: 0, limit: itemsPerPage });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load jobs at the moment.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile for completion check
  const fetchProfile = async () => {
    if (token) {
      try {
        const profileRes = await getApplicantProfile();
        const profile = profileRes.data.data;
        setProfileData(profile);
        
        let completion = 0;
        if (profile.firstName || profile.lastName) completion += 15;
        if (profile.email) completion += 15;
        if (profile.phone) completion += 15;
        if (profile.skills && profile.skills.length > 0) completion += 25;
        if (profile.yearsOfExperience) completion += 15;
        if (profile.highestEducation) completion += 15;
        
        setProfileCompletion(completion);
      } catch (profileError) {
        console.log("No profile found");
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchProfile();
  }, [currentPage, search]);

  // Apply filters
  useEffect(() => {
    let filtered = [...jobs];

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.category) {
      filtered = filtered.filter(job => 
        job.type?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.workMode) {
      filtered = filtered.filter(job => {
        const jobWorkMode = job.workType?.toLowerCase() || '';
        if (filters.workMode === 'remote') return jobWorkMode.includes('remote');
        if (filters.workMode === 'onsite') return jobWorkMode.includes('on-site');
        if (filters.workMode === 'hybrid') return jobWorkMode.includes('hybrid');
        return true;
      });
    }

    if (filters.experience) {
      filtered = filtered.filter(job => {
        const jobExp = job.experience?.toLowerCase() || '';
        if (filters.experience === 'entry') return jobExp.includes('entry') || jobExp.includes('0-2');
        if (filters.experience === 'mid') return jobExp.includes('mid') || jobExp.includes('3-5');
        if (filters.experience === 'senior') return jobExp.includes('senior') || jobExp.includes('5+');
        return true;
      });
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => {
        const jobType = job.employmentType?.toLowerCase() || '';
        if (filters.jobType === 'full-time') return jobType.includes('full');
        if (filters.jobType === 'part-time') return jobType.includes('part');
        if (filters.jobType === 'contract') return jobType.includes('contract');
        if (filters.jobType === 'internship') return jobType.includes('intern');
        return true;
      });
    }

    setFilteredJobs(filtered);
  }, [jobs, filters]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate match percentage (AI simulation)
  const calculateMatchPercentage = (job) => {
    if (!profileData) return 50;
    
    let match = 50; // Base match
    
    // Check skills match
    if (profileData.skills && job.description) {
      const jobSkills = job.description.toLowerCase();
      const userSkills = Array.isArray(profileData.skills) 
        ? profileData.skills.map(s => s.toLowerCase()).join(' ')
        : profileData.skills?.toLowerCase() || '';
      const skillList = Array.isArray(profileData.skills) ? profileData.skills : profileData.skills?.split(',') || [];
      const skillMatches = skillList.filter(skill => 
        jobSkills.includes(skill.toLowerCase().trim())
      ).length;
      match += (skillMatches / Math.max(skillList.length, 1)) * 30;
    }

    // Check experience match
    if (profileData.yearsOfExperience && job.experience) {
      const userExp = profileData.yearsOfExperience;
      const jobExp = job.experience.toLowerCase();
      if ((userExp >= 5 && jobExp.includes('senior')) ||
          (userExp >= 2 && userExp <= 4 && jobExp.includes('mid')) ||
          (userExp < 2 && jobExp.includes('entry'))) {
        match += 15;
      }
    }

    return Math.min(Math.round(match), 95);
  };

  const handleApply = async (jobId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (profileCompletion < 70) {
      setError("Complete your profile (70%+) to apply for jobs. Go to Profile page.");
      setTimeout(() => setError(""), 5000);
      return;
    }

    setError("");
    setSuccess("");
    try {
      await applyForJob(jobId);
      setSuccess("Application submitted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage = err?.response?.data?.message || "Unable to submit application.";
      if (errorMessage.includes("Applicant profile not found")) {
        setError("Please complete your applicant profile before applying for jobs.");
      } else {
        setError(errorMessage);
      }
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSaveJob = (jobId) => {
    let updatedSavedJobs;
    if (savedJobs.includes(jobId)) {
      updatedSavedJobs = savedJobs.filter(id => id !== jobId);
    } else {
      updatedSavedJobs = [...savedJobs, jobId];
    }
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      salaryRange: '',
      category: '',
      workMode: '',
      experience: '',
      jobType: ''
    });
    setShowFilters(false);
  };

  const displayJobs = filteredJobs.length > 0 ? filteredJobs : jobs;

  const sidebarLinks = [
    { icon: Home, label: "Dashboard", href: "/applicant" },
    { icon: User, label: "My Profile", href: "/applicant/profile" },
    { icon: Briefcase, label: "Find Jobs", href: "/applicant/jobs", active: true },
    { icon: FileText, label: "My Applications", href: "/applicant/applications" },
    { icon: Heart, label: "Saved Jobs", href: "/applicant/saved-jobs" },
    { icon: Settings, label: "Settings", href: "/applicant/settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Navigation Drawer */}
      <div className={`
        fixed left-0 top-0 z-50 h-full w-72 transform transition-transform duration-300 ease-in-out bg-white dark:bg-slate-900 shadow-2xl
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">JobPortal</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Applicant Panel</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 py-6">
            <nav className="space-y-1 px-4">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                    link.active
                      ? "bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 dark:from-indigo-950/50 dark:to-blue-950/50 dark:text-indigo-400"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="p-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || "Guest"}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
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
        {/* Header with Mobile Menu Button */}
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setMobileMenuOpen(true)} 
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">Find Your Dream Job</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 hidden sm:block">
                  {pagination.total} open positions available
                </p>
              </div>
              <Link to="/applicant/saved-jobs">
                <Button variant="outline" className="gap-2">
                  <BookmarkCheck className="h-4 w-4" />
                  <span className="hidden sm:inline">Saved Jobs</span>
                  <Badge variant="secondary" className="ml-1">{savedJobs.length}</Badge>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
          {/* Profile Completion Banner */}
          {token && profileCompletion < 70 && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-400">Complete Your Profile</p>
                    <p className="text-sm text-amber-700 dark:text-amber-500">
                      Your profile is {profileCompletion}% complete. Complete it to start applying for jobs.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={profileCompletion} className="w-32 h-2" />
                  <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700">
                    <Link to="/profile">Complete Profile</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <Card className="mb-6 border-slate-200/60 dark:border-slate-800/60 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by job title, company, or keywords..."
                    className="pl-10 h-12 rounded-xl border-slate-300 dark:border-slate-700"
                  />
                </div>

                {/* Filter Toggle Button */}
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {Object.values(filters).some(f => f) && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </Button>
                  <div className="flex gap-2 border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-3 py-2 text-sm transition-colors ${
                        viewMode === "grid" 
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400" 
                          : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-3 py-2 text-sm transition-colors ${
                        viewMode === "list" 
                          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400" 
                          : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      List
                    </button>
                  </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Locations</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="new york">New York</SelectItem>
                          <SelectItem value="san francisco">San Francisco</SelectItem>
                          <SelectItem value="london">London</SelectItem>
                          <SelectItem value="tokyo">Tokyo</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filters.workMode} onValueChange={(value) => setFilters(prev => ({ ...prev, workMode: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Work Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Modes</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filters.experience} onValueChange={(value) => setFilters(prev => ({ ...prev, experience: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Experience Level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Levels</SelectItem>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filters.jobType} onValueChange={(value) => setFilters(prev => ({ ...prev, jobType: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Job Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {(filters.location || filters.workMode || filters.experience || filters.jobType || filters.category) && (
                      <div className="mt-4 flex justify-end">
                        <Button variant="ghost" onClick={clearFilters} size="sm" className="gap-2">
                          <X className="h-3 w-3" />
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          {/* Job Cards Grid/List View */}
          {loading ? (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-slate-200/60 dark:border-slate-800/60">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayJobs.length === 0 ? (
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No jobs found</h3>
                <p className="text-slate-600 dark:text-slate-400">Try adjusting your search or filters to find more opportunities.</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayJobs.map((job) => {
                const matchPercentage = calculateMatchPercentage(job);
                const isSaved = savedJobs.includes(job.id);
                
                return (
                  <Card key={job.id} className="border-slate-200/60 dark:border-slate-800/60 hover:shadow-xl transition-all duration-300 group overflow-hidden">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Match Percentage & Save Button */}
                        <div className="flex items-center justify-between">
                          <Badge className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white gap-1">
                            <Zap className="h-3 w-3" />
                            {matchPercentage}% Match
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSaveJob(job.id)}
                            className="text-slate-400 hover:text-amber-500"
                          >
                            {isSaved ? <BookmarkCheck className="h-5 w-5 text-amber-500" /> : <Bookmark className="h-5 w-5" />}
                          </Button>
                        </div>

                        {/* Job Title & Company */}
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleViewJob(job)}>
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">{job.company}</p>
                          </div>
                        </div>

                        {/* Job Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location || "Remote"}</span>
                            {job.workType && (
                              <Badge variant="outline" className="text-xs">
                                {job.workType}
                              </Badge>
                            )}
                          </div>
                          {job.salary && (
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <DollarSign className="h-4 w-4" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Briefcase className="h-4 w-4" />
                            <span>{job.employmentType || "Full-time"}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:shadow-lg transition-all"
                            onClick={() => handleApply(job.id)}
                            disabled={profileCompletion < 70}
                          >
                            {profileCompletion >= 70 ? 'Quick Apply' : 'Complete Profile'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleViewJob(job)}
                            className="gap-1"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Posted Time */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                          <Clock className="h-3 w-3" />
                          <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="space-y-4">
              {displayJobs.map((job) => {
                const matchPercentage = calculateMatchPercentage(job);
                const isSaved = savedJobs.includes(job.id);
                
                return (
                  <Card key={job.id} className="border-slate-200/60 dark:border-slate-800/60 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white gap-1">
                              <Zap className="h-3 w-3" />
                              {matchPercentage}% Match
                            </Badge>
                            <Badge variant="outline">{job.employmentType || "Full-time"}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleViewJob(job)}>
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span>{job.company}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location || "Remote"}</span>
                            </div>
                            {job.salary && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{job.salary}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                            {job.description?.substring(0, 150)}...
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleApply(job.id)}
                            disabled={profileCompletion < 70}
                            className="bg-gradient-to-r from-indigo-500 to-blue-600"
                          >
                            {profileCompletion >= 70 ? 'Apply' : 'Complete Profile'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleSaveJob(job.id)}
                          >
                            {isSaved ? <BookmarkCheck className="h-4 w-4 text-amber-500" /> : <Bookmark className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleViewJob(job)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {displayJobs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage((p) => p - 1)}
                className="gap-2 w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {pagination.page} of {pagination.pages} · {pagination.total} jobs
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                disabled={currentPage === pagination.pages} 
                onClick={() => setCurrentPage((p) => p + 1)}
                className="gap-2 w-full sm:w-auto"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Drawer */}
      <JobDetailDrawer 
        job={selectedJob} 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
        onApply={handleApply}
        isSaved={selectedJob ? savedJobs.includes(selectedJob.id) : false}
        onSave={handleSaveJob}
        profileCompletion={profileCompletion}
      />
    </div>
  );
}