import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllApplications, updateApplicationStatus } from "../../../api/Endpoints/Applications.jsx";
import { getApiErrorMessage } from "@/lib/apiError";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Download, X, Star, FileText, Mail, MapPin, GraduationCap, Briefcase, ExternalLink, Check, XCircle, Eye } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    education: "",
    experience: "",
    location: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [recruiterNotes, setRecruiterNotes] = useState("");
  const [candidateRating, setCandidateRating] = useState(0);
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllApplications();
      let filtered = res.data.data || [];
      
      // Client-side filtering for search
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(app => 
          app.applicant?.account?.name?.toLowerCase().includes(searchLower) ||
          app.applicant?.account?.email?.toLowerCase().includes(searchLower) ||
          app.job?.title?.toLowerCase().includes(searchLower)
        );
      }
      
      // Client-side filtering for status
      if (filters.status) {
        filtered = filtered.filter(app => app.status === filters.status);
      }
      
      setApplications(filtered);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, filters]);

  const clearFilters = () => {
    setFilters({ status: "", education: "", experience: "", location: "" });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedApplications(applications.map(app => app.id));
    } else {
      setSelectedApplications([]);
    }
  };

  const handleSelectOne = (applicationId, checked) => {
    if (checked) {
      setSelectedApplications([...selectedApplications, applicationId]);
    } else {
      setSelectedApplications(selectedApplications.filter(id => id !== applicationId));
    }
  };

  const openReviewModal = (application) => {
    setSelectedApplication(application);
    setRecruiterNotes(application.recruiterNotes || "");
    setCandidateRating(application.rating || 0);
    setReviewModalOpen(true);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      // Update application with notes and rating
      await updateApplicationStatus(selectedApplication.id, {
        recruiterNotes,
        rating: candidateRating
      });
      setReviewModalOpen(false);
      fetchApplications();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedApplications.length === 0) return;
    try {
      await Promise.all(
        selectedApplications.map(id => updateApplicationStatus(id, { status }))
      );
      setSelectedApplications([]);
      fetchApplications();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const handleBulkExport = () => {
    // Implement bulk export functionality
    alert("Bulk export feature - to be implemented with backend support");
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            } ${
              interactive ? "cursor-pointer hover:text-amber-400" : ""
            }
            onClick={interactive ? () => setCandidateRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminNavbar />
        <main className="ml-64 mt-16 p-6">
          <Card className="rounded-[1.5rem] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
              <CardTitle>All Applications</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by name, email, job title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 max-w-xs"
                  />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                  <Filter className="mr-2 h-4 w-4" /> Filters
                  {showFilters && <X className="ml-2 h-4 w-4" />}
                </Button>
                {selectedApplications.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => handleBulkStatusUpdate("reviewed")}>
                      <Check className="mr-2 h-4 w-4" /> Shortlist ({selectedApplications.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkStatusUpdate("rejected")}>
                      <XCircle className="mr-2 h-4 w-4" /> Reject ({selectedApplications.length})
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkExport}>
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            {showFilters && (
              <div className="px-6 pb-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label>Status</Label>
                    <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Education</Label>
                    <Select value={filters.education} onValueChange={(value) => setFilters({ ...filters, education: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All levels</SelectItem>
                        <SelectItem value="bachelor">Bachelor's</SelectItem>
                        <SelectItem value="master">Master's</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                        <SelectItem value="high-school">High School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Experience</Label>
                    <Select value={filters.experience} onValueChange={(value) => setFilters({ ...filters, experience: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All levels</SelectItem>
                        <SelectItem value="entry">Entry (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid (2-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (5-10 years)</SelectItem>
                        <SelectItem value="lead">Lead (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Select value={filters.location} onValueChange={(value) => setFilters({ ...filters, location: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="All locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All locations</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                        <SelectItem value="on-site">On-site</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="outline" onClick={clearFilters} className="mt-2">
                  <X className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
              </div>
            )}
            <CardContent>
              {error && <p className="mb-3 text-rose-600">{error}</p>}
              {loading ? (
                <p className="text-slate-500">Loading...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedApplications.length === applications.length && applications.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">No applications found.</TableCell>
                      </TableRow>
                    ) : (
                      applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedApplications.includes(app.id)}
                              onCheckedChange={(checked) => handleSelectOne(app.id, checked)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{app.applicant?.account?.name}</div>
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Mail className="h-3 w-3" />
                                {app.applicant?.account?.email}
                              </div>
                              {app.applicant?.location && (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="h-3 w-3" />
                                  {app.applicant.location}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{app.job?.title}</div>
                              <div className="text-xs text-slate-500">{app.job?.company}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {app.applicant?.experience || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {app.applicant?.education || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell>
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {renderStars(app.rating || 0)}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => openReviewModal(app)}>
                              <Eye className="mr-2 h-4 w-4" /> Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          {reviewModalOpen && selectedApplication && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Candidate Review</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setReviewModalOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Applicant Info */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{selectedApplication.applicant?.account?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="h-4 w-4" />
                            {selectedApplication.applicant?.account?.email}
                          </div>
                          {selectedApplication.applicant?.location && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="h-4 w-4" />
                              {selectedApplication.applicant.location}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Education</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-slate-400" />
                          <span>{selectedApplication.applicant?.education || "Not specified"}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Experience</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span>{selectedApplication.applicant?.experience || "Not specified"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">Applied Position</h3>
                        <div className="mt-2 space-y-2">
                          <div className="font-medium">{selectedApplication.job?.title}</div>
                          <div className="text-sm text-slate-600">{selectedApplication.job?.company}</div>
                          <div className="text-xs text-slate-500">
                            Applied: {new Date(selectedApplication.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Current Status</h3>
                        <div className="mt-2">
                          <StatusBadge status={selectedApplication.status} />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold">Candidate Rating</h3>
                        <div className="mt-2">
                          {renderStars(candidateRating, true)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills */}
                  {selectedApplication.applicant?.skills && (
                    <div>
                      <h3 className="text-lg font-semibold">Skills</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedApplication.applicant.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Portfolio Links */}
                  {selectedApplication.applicant?.portfolioLinks && selectedApplication.applicant.portfolioLinks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold">Portfolio Links</h3>
                      <div className="mt-2 space-y-2">
                        {selectedApplication.applicant.portfolioLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sky-600 hover:underline"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Resume Preview */}
                  {selectedApplication.applicant?.resumeUrl && (
                    <div>
                      <h3 className="text-lg font-semibold">Resume</h3>
                      <div className="mt-2">
                        <Button variant="outline" asChild>
                          <a href={selectedApplication.applicant.resumeUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" /> Download Resume
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Recruiter Notes */}
                  <div>
                    <h3 className="text-lg font-semibold">Recruiter Notes</h3>
                    <div className="mt-2">
                      <Textarea
                        value={recruiterNotes}
                        onChange={(e) => setRecruiterNotes(e.target.value)}
                        placeholder="Add your notes about this candidate..."
                        className="min-h-32"
                      />
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                      Close
                    </Button>
                    <Button 
                      onClick={handleSaveNotes} 
                      disabled={savingNotes}
                      className="bg-sky-600 text-white"
                    >
                      {savingNotes ? "Saving..." : "Save Notes & Rating"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}



