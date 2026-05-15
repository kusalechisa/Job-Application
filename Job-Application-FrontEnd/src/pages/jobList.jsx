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
    <div className="min-h-screen p-6">
  {/* Table */}
     <TooltipProvider>
        <Card className="shadow-md rounded-2xl border border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">
              Job Vacancies
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>

              {/* Header */}
              <TableHeader className="bg-slate-100">
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

              {/* Body */}
              <TableBody>
                {paginatedData.map((vacancy) => (
                  <TableRow key={vacancy.id} className="hover:bg-slate-50">

                    <TableCell>{vacancy.vac_no}</TableCell>
                    <TableCell>{vacancy.position}</TableCell>
                    <TableCell>{vacancy.qualification}</TableCell>
                    <TableCell>{vacancy.experience}</TableCell>
                    <TableCell>{vacancy.postedDate}</TableCell>
                    <TableCell>{vacancy.closingDate}</TableCell>

                    {/* Actions */}
                    <TableCell className="flex gap-2">

                      {/* View */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>

                      {/* Apply (NEW ICON) */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="icon">
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

            </div>

          </CardContent>
        </Card>
      </TooltipProvider>
    </div>
  );
}