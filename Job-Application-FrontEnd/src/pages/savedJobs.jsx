import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bookmark, 
  BookmarkCheck, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  ArrowRight,
  Building2,
  Clock,
  Sparkles
} from "lucide-react";
import { getJobs, applyForJob, getApplicantProfile } from "../../api/Endpoints/Jobs.jsx";
import { useAuth } from "../context/AuthContext";
import JobDetailDrawer from "../components/JobDetailDrawer";
import {
  isJobClosedForApplications,
  JOB_DEADLINE_PASSED_MESSAGE,
} from "@/lib/jobDeadline";

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState(() => {
    const saved = localStorage.getItem('savedJobs');
    return saved ? JSON.parse(saved) : [];
  });
  const [allJobs, setAllJobs] = useState([]);
  const [savedJobDetails, setSavedJobDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [profileData, setProfileData] = useState(null);
  
  const { token } = useAuth();

  // Fetch all jobs to get details of saved jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getJobs({ page: 1, limit: 100 });
      setAllJobs(res.data.data || []);
    } catch (err) {
      setError("Unable to load jobs.");
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
        if (!profile) {
          setProfileData(null);
          setProfileCompletion(0);
          return;
        }
        setProfileData(profile);
        
        let completion = 0;
        if (profile.fullName) completion += 20;
        if (profile.account?.email) completion += 15;
        if (profile.phone) completion += 15;
        if (profile.skills && profile.skills.length > 0) completion += 20;
        if (profile.experience) completion += 15;
        if (profile.education) completion += 15;
        
        setProfileCompletion(completion);
      } catch (profileError) {
        console.log("No profile found");
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchProfile();
  }, []);

  // Filter saved jobs from all jobs
  useEffect(() => {
    if (allJobs.length > 0) {
      const saved = allJobs.filter(job => savedJobs.includes(job.id));
      setSavedJobDetails(saved);
    }
  }, [allJobs, savedJobs]);

  const handleRemoveSave = (jobId) => {
    const updatedSavedJobs = savedJobs.filter(id => id !== jobId);
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };

  const handleApply = async (jobId) => {
    if (!token) {
      setError("Please login to apply for jobs.");
      return;
    }

    const job =
      savedJobDetails.find((j) => j.id === jobId) ||
      (selectedJob?.id === jobId ? selectedJob : null);
    if (job && isJobClosedForApplications(job)) {
      setError(JOB_DEADLINE_PASSED_MESSAGE);
      return;
    }

    if (profileCompletion < 70) {
      setError("Complete your profile (70%+) to apply. Go to Profile page.");
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
      setError(errorMessage);
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setDrawerOpen(true);
  };

  const calculateMatchPercentage = (job) => {
    if (!profileData) return 50;
    
    let match = 50;
    
    if (profileData.skills && job.description) {
      const jobSkills = job.description.toLowerCase();
      const skillMatches = profileData.skills.filter(skill => 
        jobSkills.includes(skill.toLowerCase())
      ).length;
      match += (skillMatches / Math.max(profileData.skills.length, 1)) * 30;
    }

    if (profileData.experience && job.experience) {
      const userExp = profileData.experience.toLowerCase();
      const jobExp = job.experience.toLowerCase();
      if ((userExp.includes('senior') && jobExp.includes('senior')) ||
          (userExp.includes('mid') && jobExp.includes('mid')) ||
          (userExp.includes('entry') && jobExp.includes('entry'))) {
        match += 15;
      }
    }

    return Math.min(Math.round(match), 95);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/80 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookmarkCheck className="h-6 w-6 text-amber-500" />
                Saved Jobs
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {savedJobDetails.length} jobs bookmarked for later
              </p>
            </div>
            <Link to="/joblist">
              <Button variant="outline" className="gap-2">
                Browse Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
            {success}
          </div>
        )}

        {/* Saved Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-slate-200/60 dark:border-slate-800/60">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : savedJobDetails.length === 0 ? (
          <Card className="border-slate-200/60 dark:border-slate-800/60">
            <CardContent className="p-12 text-center">
              <Bookmark className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No saved jobs yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start bookmarking jobs you're interested in from the job list.
              </p>
              <Link to="/joblist">
                <Button className="bg-sky-600 hover:bg-sky-700">
                  Browse Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobDetails.map((job) => {
              const matchPercentage = calculateMatchPercentage(job);
              const deadlinePassed = isJobClosedForApplications(job);

              return (
                <Card key={job.id} className="border-slate-200/60 dark:border-slate-800/60 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Match Percentage */}
                      <div className="flex items-center justify-between">
                        <Badge className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white gap-1">
                          <Sparkles className="h-3 w-3" />
                          {matchPercentage}% Match
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSave(job.id)}
                          className="text-amber-500 hover:text-rose-500"
                        >
                          <BookmarkCheck className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Job Title & Company */}
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors cursor-pointer" onClick={() => handleViewJob(job)}>
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
                          <span>{job.location}</span>
                          {job.workMode && (
                            <Badge variant="outline" className="text-xs">
                              {job.workMode}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary || 'Competitive'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.experience || 'Not specified'}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1 bg-sky-600 hover:bg-sky-700 disabled:opacity-60"
                          onClick={() => handleApply(job.id)}
                          disabled={profileCompletion < 70 || deadlinePassed}
                        >
                          {deadlinePassed
                            ? "Deadline Reached"
                            : profileCompletion >= 70
                              ? "Apply"
                              : "Complete Profile"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleViewJob(job)}
                        >
                          View
                        </Button>
                      </div>

                      {/* Posted Time */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>Saved {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Detail Drawer */}
      <JobDetailDrawer 
        job={selectedJob} 
        open={drawerOpen} 
        onOpenChange={setDrawerOpen}
        onApply={handleApply}
        isSaved={selectedJob ? savedJobs.includes(selectedJob.id) : false}
        onSave={handleRemoveSave}
        profileCompletion={profileCompletion}
      />
    </div>
  );
}
