import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function ApplicantDashboard() {
  return (
    <div className="min-h-screen p-6">

      {/* Stats w-full shadow-lg*/}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-slate-500">
            New Job
          </CardTitle>

          {/* Badge count */}
          <Badge className="bg-green-500">New</Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-2xl font-bold">120</p>
          <Link to="/joblist" >
            <Button variant="ghost" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:no-underline rounded-lg">
              View Job List
            </Button>            
          </Link>
        </CardContent>
      </Card>

    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-slate-500">
            Applied Job
          </CardTitle>

          {/* Badge count */}
          <Badge className="bg-blue-500">applied</Badge>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-2xl font-bold">100</p>
          <Link to="/joblist" >
            <Button variant="ghost" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:no-underline rounded-lg">
              View Your Applied Job Status
            </Button>            
          </Link>          
        </CardContent>
      </Card>

      </div>

      

    </div>
  );
}