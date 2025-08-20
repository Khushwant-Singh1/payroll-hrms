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
import { Plus, Search, Filter, Eye, Edit, X, User, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Employee } from "../types/payroll";

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

  // Get unique companies for filter dropdown
  const companies = Array.from(new Set(employees.map((emp) => emp.company)));
  const statusOptions = ["active", "inactive"];

  const filteredEmployees = employees.filter((emp) => {
    // Search term filter
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.company.toLowerCase().includes(searchTerm.toLowerCase());

    // Company filter
    const matchesCompany = companyFilter ? emp.company === companyFilter : true;

    // Status filter
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;

    return matchesSearch && matchesCompany && matchesStatus;
  });

  // Clear all filters
  const clearFilters = () => {
    setCompanyFilter(null);
    setStatusFilter(null);
    setIsFilterOpen(false);
  };

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

          {/* Filter Button with Dropdown */}
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
                  {/* Company Filter */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Company</h4>
                    <div className="space-y-2">
                      {companies.map((company) => (
                        <div key={company} className="flex items-center">
                          <input
                            type="radio"
                            id={`company-${company}`}
                            name="companyFilter"
                            checked={companyFilter === company}
                            onChange={() => setCompanyFilter(company)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`company-${company}`}
                            className="ml-2 text-sm text-gray-700 cursor-pointer"
                          >
                            {company}
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

                  {/* Status Filter */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Status</h4>
                    <div className="space-y-2">
                      {statusOptions.map((status) => (
                        <div key={status} className="flex items-center">
                          <input
                            type="radio"
                            id={`status-${status}`}
                            name="statusFilter"
                            checked={statusFilter === status}
                            onChange={() => setStatusFilter(status)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <label
                            htmlFor={`status-${status}`}
                            className="ml-2 text-sm text-gray-700 capitalize cursor-pointer"
                          >
                            {status}
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

        {/* Active Filters Badges */}
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

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead className="text-right">Basic Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={emp.profilePic || "/placeholder.svg"}
                          alt={emp.name}
                        />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{emp.name}</div>
                        <div className="text-sm text-gray-500">
                          {emp.employeeId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{emp.company}</TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(emp.basicSalary)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        emp.status === "active" ? "default" : "secondary"
                      }
                    >
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/view-employee/${emp.id}`)}
                        title="View Employee"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/edit-employee/${emp.id}`)}
                        title="Edit Employee"
                      >
                        <Edit className="h-3 w-3" />
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
  );
}
