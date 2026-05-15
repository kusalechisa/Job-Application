import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { vacancies } from "@/mock/mockData";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Eye, Hand, ChevronLeft, ChevronRight } from "lucide-react";
export default function JobList() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(vacancies.length / itemsPerPage);

  const paginatedData = vacancies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  return (
    <div className="min-h-screen p-4 sm:p-6">
      <TooltipProvider>
        <Card className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Job Vacancies
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Browse open positions and apply to roles that match your profile.
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-100 dark:bg-slate-800">
                  <TableRow>
                    <TableHead>Vac No</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Qualification</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Closing</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedData.map((vacancy) => (
                    <TableRow key={vacancy.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <TableCell>{vacancy.vac_no}</TableCell>
                      <TableCell>{vacancy.position}</TableCell>
                      <TableCell>{vacancy.qualification}</TableCell>
                      <TableCell>{vacancy.experience}</TableCell>
                      <TableCell>{vacancy.postedDate}</TableCell>
                      <TableCell>{vacancy.closingDate}</TableCell>
                      <TableCell className="flex flex-wrap gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="border border-slate-200 dark:border-slate-700">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700" size="icon">
                              <Hand className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Apply</TooltipContent>
                        </Tooltip>
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
      </TooltipProvider>
    </div>
  );
}