import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { appliedJobs } from "@/mock/mockData";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AppliedJobList() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const totalPages = Math.ceil(appliedJobs.length / itemsPerPage);

  const paginatedData = appliedJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Applied Jobs
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Track the status of your job applications in one place.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100 dark:bg-slate-800">
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Middle Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Applied Position</TableHead>
                  <TableHead>Remark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <TableCell>{item.firstName}</TableCell>
                    <TableCell>{item.middleName}</TableCell>
                    <TableCell>{item.lastName}</TableCell>
                    <TableCell>{item.position}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.remark === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.remark === "Pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.remark}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}