import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  ArrowRight
} from "lucide-react";

export default function JobDetailDrawer({ job, open, onOpenChange, onApply, isSaved, onSave, profileCompletion }) {
  if (!job) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <div className="space-y-6 py-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {job.title}
              </SheetTitle>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">{job.company}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave(job.id)}
              className="text-slate-400 hover:text-amber-500"
            >
              {isSaved ? <BookmarkCheck className="h-5 w-5 text-amber-500" /> : <Bookmark className="h-5 w-5" />}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-50 dark:bg-sky-950 rounded-lg">
                    <MapPin className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{job.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Salary</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{job.salary || 'Competitive'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg">
                    <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Experience</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{job.experience || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200/60 dark:border-slate-800/60">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                    <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Applications</p>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{job._count?.applications ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {job.workMode && (
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                {job.workMode}
              </Badge>
            )}
            {job.jobType && (
              <Badge variant="secondary">{job.jobType}</Badge>
            )}
            {job.category && (
              <Badge variant="outline">{job.category}</Badge>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Job Description</h3>
            <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-400">
              <p>{job.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Requirements</h3>
              <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-400">
                <p>{job.requirements}</p>
              </div>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4" />
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Apply Button */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button 
              className="w-full bg-sky-600 hover:bg-sky-700 gap-2"
              onClick={() => onApply(job.id)}
              disabled={profileCompletion < 70}
              size="lg"
            >
              {profileCompletion >= 70 ? (
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
            {profileCompletion < 70 && (
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
                Complete your profile to 70%+ to enable quick apply
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
