"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Save,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { Employee } from "../types/payroll";
import * as XLSX from "xlsx"; // Excel library

interface EmployeeManagementProps {
  employees: Employee[];
  formatCurrency: (amount: number) => string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  companyFilter: string | null;
  setCompanyFilter: (company: string | null) => void;
  statusFilter: string | null;
  setStatusFilter: (status: string | null) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}

export function EmployeeManagement({
  employees,
  formatCurrency,
  searchTerm,
  setSearchTerm,
  companyFilter,
  setCompanyFilter,
  statusFilter,
  setStatusFilter,
  isFilterOpen,
  setIsFilterOpen,
}: EmployeeManagementProps) {
  const router = useRouter();

  /* ---------------- Filters ---------------- */
  const companies = Array.from(new Set(employees.map((emp) => emp.company)));
  const statusOptions = ["active", "inactive"];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.company.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = companyFilter ? emp.company === companyFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;

    return matchesSearch && matchesCompany && matchesStatus;
  });

  const clearFilters = () => {
    setCompanyFilter(null);
    setStatusFilter(null);
    setIsFilterOpen(false);
  };

  /* ---------------- Excel Download ---------------- */
  const handleDownloadExcel = () => {
    const rows = filteredEmployees.map((e) => ({
      "Employee ID": e.employeeId,
      Name: e.name,
      Email: e.email,
      Phone: e.phone,
      Company: e.company,
      Department: e.department,
      Designation: e.designation,
      Location: e.location ?? "",
      Grade: e.grade ?? "",
      "Joining Date": e.joiningDate,
      "Date of Birth": e.dateOfBirth ?? "",
      Status: e.status,
      "Basic Salary": Number(e.basicSalary),
      HRA: Number(e.hra),
      Allowances: Number(e.allowances),
      PAN: e.pan ?? "",
      Aadhaar: e.aadhaar ?? "",
      UAN: e.uan ?? "",
      "ESIC Number": e.esicNumber ?? "",
      "PF Opt In": e.pfOptIn,
      "ESI Applicable": e.esiApplicable,
      "LWF State": e.lwfState ?? "",
      "Bank Account": e.bankAccount ?? "",
      IFSC: e.ifsc ?? "",
      Branch: e.branch ?? "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, "Employees.xlsx");
  };

  /* ---------------- UI ---------------- */
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Employee Management</CardTitle>
            <CardDescription>Manage employee master data</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadExcel}
              className="cursor-pointer"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/employee-drafts")}
              className="cursor-pointer"
            >
              <Save className="h-4 w-4 mr-2" />
              Drafts
            </Button>

            <Button
              onClick={() => router.push("/add-employee")}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search + Filter controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 cursor-pointer ${
                companyFilter || statusFilter
                  ? "bg-blue-50 border-blue-300"
                  : ""
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
              {(companyFilter || statusFilter) && (
                <Badge variant="secondary" className="ml-1">
                  {[companyFilter, statusFilter].filter(Boolean).length}
                </Badge>
              )}
            </Button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-10 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                  >
                    Clear all
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Company */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Company</h4>
                    <div className="space-y-2">
                      {companies.map((c) => (
                        <div key={c} className="flex items-center">
                          <input
                            type="radio"
                            id={`company-${c}`}
                            name="companyFilter"
                            checked={companyFilter === c}
                            onChange={() => setCompanyFilter(c)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`company-${c}`}
                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                          >
                            {c}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="company-all"
                          name="companyFilter"
                          checked={!companyFilter}
                          onChange={() => setCompanyFilter(null)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label
                          htmlFor="company-all"
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          All Companies
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Status</h4>
                    <div className="space-y-2">
                      {statusOptions.map((s) => (
                        <div key={s} className="flex items-center">
                          <input
                            type="radio"
                            id={`status-${s}`}
                            name="statusFilter"
                            checked={statusFilter === s}
                            onChange={() => setStatusFilter(s)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`status-${s}`}
                            className="ml-2 text-sm text-gray-700 capitalize cursor-pointer"
                          >
                            {s}
                          </label>
                        </div>
                      ))}
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="status-all"
                          name="statusFilter"
                          checked={!statusFilter}
                          onChange={() => setStatusFilter(null)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <label
                          htmlFor="status-all"
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          All Statuses
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active filter badges */}
        {(companyFilter || statusFilter) && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {companyFilter && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
                onClick={() => setCompanyFilter(null)}
              >
                Company: {companyFilter}
                <X className="h-3 w-3 cursor-pointer" />
              </Badge>
            )}
            {statusFilter && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 capitalize"
                onClick={() => setStatusFilter(null)}
              >
                Status: {statusFilter}
                <X className="h-3 w-3 cursor-pointer" />
              </Badge>
            )}
          </div>
        )}

        {/* Employee Table */}
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <CardTitle className="text-lg sm:text-xl">Employees ({filteredEmployees.length})</CardTitle>
                <CardDescription className="text-sm">
                  Showing {filteredEmployees.length} of {employees.length} employees
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <span>Total: {employees.length}</span>
                {companyFilter && <span>• Company: {companyFilter}</span>}
                {statusFilter && <span>• Status: {statusFilter}</span>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Employee</TableHead>
                    <TableHead className="text-xs sm:text-sm">Company</TableHead>
                    <TableHead className="text-xs sm:text-sm">Department</TableHead>
                    <TableHead className="text-xs sm:text-sm">Basic Salary</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage src={employee.profilePic} alt={employee.name} />
                            <AvatarFallback className="text-xs sm:text-sm">
                              {employee.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-xs sm:text-sm">{employee.name}</div>
                            <div className="text-xs text-gray-500">{employee.employeeId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{employee.company}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{employee.department}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatCurrency(Number(employee.basicSalary))}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge
                          variant={employee.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/view-employee/${employee.id}`)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Eye className="h-3 w-3 sm:h-3 sm:w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/edit-employee/${employee.id}`)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                          >
                            <Edit className="h-3 w-3 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}