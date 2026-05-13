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
    <div className="min-h-screen p-6">

      <Card className="shadow-md rounded-2xl border border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">
            Applied Jobs
          </CardTitle>
        </CardHeader>

        <CardContent>

          <Table>

            {/* Header */}
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead>First Name</TableHead>
                <TableHead>Middle Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Applied Position</TableHead>
                <TableHead>Remark</TableHead>
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50">

                  <TableCell>{item.firstName}</TableCell>
                  <TableCell>{item.middleName}</TableCell>
                  <TableCell>{item.lastName}</TableCell>
                  <TableCell>{item.position}</TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.remark === "Approved"
                          ? "bg-green-100 text-green-700"
                          : item.remark === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.remark}
                    </span>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>

          </Table>

          {/* Pagination */}
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

    </div>
  );
}