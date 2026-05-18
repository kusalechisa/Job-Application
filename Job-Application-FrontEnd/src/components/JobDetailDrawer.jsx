import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  DollarSign,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  Building2,
  Clock,
  Calendar,
  Users,
  Sparkles,
  X,
  ArrowRight,
  Globe,
  AlertCircle,
  CheckCircle,
  Award,
  TrendingUp,
  Mail,
  Phone,
  FileText,
  Eye,
} from "lucide-react";
import {
  isJobDeadlinePassed,
  formatJobDeadline,
} from "@/lib/jobDeadline";

export default function JobDetailDrawer({
  job,
  open,
  onOpenChange,
  onApply,
  isSaved,
  onSave,
  profileCompletion,
}) {
  if (!job) return null;

  const deadlinePassed = isJobDeadlinePassed(job.deadline);

  const getMatchPercentage = () => {
    // Simulate match percentage based on profile completion
    return Math.min(Math.round(profileCompletion * 0.9), 95);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl max-h-screen overflow-y-auto p-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <SheetTitle className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                {job.title}
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Building2 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{job.company}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave(job.id)}
              className="flex-shrink-0 text-slate-400 hover:text-amber-500"
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-amber-500" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Match Score - Mobile Friendly */}
          <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Match Score
                </span>
              </div>
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {getMatchPercentage()}%
              </span>
            </div>
            <Progress value={getMatchPercentage()} className="h-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Based on your profile and skills
            </p>
          </div>
        </div>

        <div className="space-y-6 p-4 sm:p-6">
          {/* Quick Stats Grid - Responsive */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-sky-50 dark:bg-sky-950 rounded-lg">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Location
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {job.location || "Remote"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                    <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Salary
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {job.salary || "Competitive"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Experience
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {job.experience || "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Applicants
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                      {job._count?.applications ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Type Badges - Responsive Wrap */}
          <div className="flex flex-wrap gap-2">
            {job.workType && (
              <Badge variant="outline" className="gap-1 text-xs sm:text-sm">
                <Globe className="h-3 w-3" />
                {job.workType}
              </Badge>
            )}
            {job.employmentType && (
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {job.employmentType}
              </Badge>
            )}
            {job.type && (
              <Badge variant="outline" className="text-xs sm:text-sm">
                {job.type}
              </Badge>
            )}
            {job.featured && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Job Description - Responsive Text */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-sm sm:text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              Job Description
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
              <p>{job.description || "No description provided."}</p>
            </div>
          </div>

          {/* Requirements - Responsive */}
          {job.requirements && (
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-sm sm:text-base flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Requirements
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                <p>{job.requirements}</p>
              </div>
            </div>
          )}

          {/* Responsibilities - Responsive */}
          {job.responsibilities && (
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-sm sm:text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Responsibilities
              </h3>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                <p>{job.responsibilities}</p>
              </div>
            </div>
          )}

          {/* Skills - Responsive */}
          {job.skills && (
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-sm sm:text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {typeof job.skills === "string"
                  ? job.skills.split(",").map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))
                  : job.skills?.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
              </div>
            </div>
          )}

          {/* Posted Date - Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400 pt-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            {job.deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span
                  className={
                    deadlinePassed
                      ? "font-medium text-red-600 dark:text-red-400"
                      : ""
                  }
                >
                  Deadline:{" "}
                  {formatJobDeadline(job.deadline) ||
                    new Date(job.deadline).toLocaleDateString()}
                  {deadlinePassed ? " (Reached)" : ""}
                </span>
              </div>
            )}
          </div>

          {deadlinePassed && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4 dark:border-red-800 dark:bg-red-950/30"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                    Application deadline reached
                  </p>
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-500">
                    This job is no longer accepting applications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Completion Warning - Mobile Friendly */}
          {profileCompletion < 70 && !deadlinePassed && (
            <div className="p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">
                    Profile {profileCompletion}% Complete
                  </p>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-500">
                    Complete your profile to 70% to enable quick apply and
                    increase your chances.
                  </p>
                  <Progress value={profileCompletion} className="h-1.5 mt-2" />
                </div>
              </div>
            </div>
          )}

          {/* Company Info - Responsive */}
          {job.company && (
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 text-sm sm:text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-500" />
                About {job.company}
              </h3>
              <Card className="border-slate-200/60 dark:border-slate-800/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Size: 50-200 employees
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Industry: {job.type || "Technology"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Sticky Apply Button - Mobile Optimized */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 -mx-4 sm:mx-0 px-4 sm:px-0">
            <Button
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg transition-all gap-2 disabled:opacity-60"
              onClick={() => onApply(job.id)}
              disabled={profileCompletion < 70 || deadlinePassed}
              size="lg"
            >
              {deadlinePassed ? (
                <>Deadline Reached</>
              ) : profileCompletion >= 70 ? (
                <>
                  Apply Now
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Complete Profile to Apply
                </>
              )}
            </Button>
            {deadlinePassed && (
              <p className="text-xs text-center text-red-600 dark:text-red-400 mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Applications closed for this position
              </p>
            )}
            {!deadlinePassed && profileCompletion < 70 && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <AlertCircle className="h-3 w-3 text-amber-500" />
                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  Complete your profile to {70 - profileCompletion}% more to
                  unlock quick apply
                </p>
              </div>
            )}
            {!deadlinePassed && profileCompletion >= 70 && (
              <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 mt-2 flex items-center justify-center gap-1">
                <CheckCircle className="h-3 w-3" />
                You're ready to apply!
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
