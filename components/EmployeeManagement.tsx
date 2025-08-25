"use client";

import React from "react";
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
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [employeeList, setEmployeeList] = useState<Employee[]>(employees);

  // Update local state when employees prop changes
  React.useEffect(() => {
    setEmployeeList(employees);
  }, [employees]);

  /* ---------------- Delete Handler ---------------- */
  const handleDelete = async (employee: Employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setDeletingId(employee.id);
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }
      
      // Remove employee from local state
      setEmployeeList(prev => prev.filter(emp => emp.id !== employee.id));
      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete employee');
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- Filters ---------------- */
  const companies = Array.from(new Set(employeeList.map((emp) => emp.company)));
  const statusOptions = ["active", "inactive"];

  const filteredEmployees = employeeList.filter((emp) => {
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
    const rows = filteredEmployees.map((e) => {
      // Calculate total earnings
      const totalEarnings = (
        Number(e.basicSalary || 0) +
        Number(e.specialBasic || 0) +
        Number(e.dearnessAllowance || 0) +
        Number(e.hra || 0) +
        Number(e.overtimeRate || 0) +
        Number(e.foodAllowance || 0) +
        Number(e.conveyanceAllowance || 0) +
        Number(e.officeWearAllowance || 0) +
        Number(e.bonus || 0) +
        Number(e.leaveWithWages || 0) +
        Number(e.otherAllowances || 0) +
        Number(e.rateOfWages || 0)
      );

      // Calculate total deductions
      const totalDeductions = (
        Number(e.pfDeduction || 0) +
        Number(e.esicDeduction || 0) +
        Number(e.societyDeduction || 0) +
        Number(e.incomeTaxDeduction || 0) +
        Number(e.insuranceDeduction || 0) +
        Number(e.otherRecoveries || 0)
      );

      // Calculate net salary
      const netSalary = totalEarnings - totalDeductions;

      return {
        // Basic Information
        "Employee ID": e.employeeId,
        "Name": e.name,
        "Email": e.email,
        "Phone": e.phone,
        "Department": e.department,
        "Designation": e.designation,
        "Company": e.company,
        "Location": e.location ?? "",
        "Grade": e.grade ?? "",
        "Status": e.status,
        "Joining Date": e.joiningDate,
        "Date of Birth": e.dateOfBirth ?? "",

        // Salary Components (Earnings)
        "Basic Salary": Number(e.basicSalary || 0),
        "Special Basic": Number(e.specialBasic || 0),
        "Dearness Allowance (DA)": Number(e.dearnessAllowance || 0),
        "House Rent Allowance (HRA)": Number(e.hra || 0),
        "Overtime Rate": Number(e.overtimeRate || 0),
        "Food Allowance": Number(e.foodAllowance || 0),
        "Conveyance Allowance": Number(e.conveyanceAllowance || 0),
        "Office Wear Allowance": Number(e.officeWearAllowance || 0),
        "Bonus": Number(e.bonus || 0),
        "Leave With Wages": Number(e.leaveWithWages || 0),
        "Other Allowances": Number(e.otherAllowances || 0),
        "Rate of Wages": Number(e.rateOfWages || 0),

        // Calculated Totals
        "Total Earnings": totalEarnings,

        // Deductions (Employee Share)
        "PF Deduction": Number(e.pfDeduction || 0),
        "ESIC Deduction": Number(e.esicDeduction || 0),
        "Society Deduction": Number(e.societyDeduction || 0),
        "Income Tax Deduction": Number(e.incomeTaxDeduction || 0),
        "Insurance Deduction": Number(e.insuranceDeduction || 0),
        "Other Recoveries": Number(e.otherRecoveries || 0),

        // Calculated Totals
        "Total Deductions": totalDeductions,
        "Net Salary": netSalary,

        // Employer Contributions
        "Employer PF Contribution": Number(e.employerPfContribution || 0),
        "Employer ESIC Contribution": Number(e.employerEsicContribution || 0),

        // Statutory Information
        "PAN": e.pan ?? "",
        "Aadhaar": e.aadhaar ?? "",
        "UAN": e.uan ?? "",
        "ESIC Number": e.esicNumber ?? "",
        "PF Opt In": e.pfOptIn ? "Yes" : "No",
        "ESI Applicable": e.esiApplicable ? "Yes" : "No",
        "LWF State": e.lwfState ?? "",

        // Bank Information
        "Bank Account": e.bankAccount ?? "",
        "IFSC Code": e.ifsc ?? "",
        "Branch": e.branch ?? "",
        "Last Transaction ID": e.lastTransactionId ?? "",
        "Last Payment Date": e.lastPaymentDate ?? "",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    
    // Auto-size columns
    const columnWidths: { wch: number }[] = [];
    const headers = Object.keys(rows[0] || {});
    
    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...rows.map(row => String(row[header as keyof typeof row] || "").length)
      );
      columnWidths[index] = { wch: Math.min(maxLength + 2, 30) };
    });
    
    ws['!cols'] = columnWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee_Master_Data");
    
    // Create a comprehensive summary sheet
    const summaryData = [
      { "Metric": "Report Generated", "Value": new Date().toLocaleString() },
      { "Metric": "Total Employees", "Value": filteredEmployees.length },
      { "Metric": "Active Employees", "Value": filteredEmployees.filter(e => e.status === "active").length },
      { "Metric": "Inactive Employees", "Value": filteredEmployees.filter(e => e.status === "inactive").length },
      { "Metric": "Total Companies", "Value": new Set(filteredEmployees.map(e => e.company)).size },
      { "Metric": "Total Departments", "Value": new Set(filteredEmployees.map(e => e.department)).size },
      { "Metric": "", "Value": "" }, // Empty row for spacing
      
      // Salary Analysis
      { "Metric": "SALARY BREAKDOWN", "Value": "" },
      { "Metric": "Total Basic Salary (All Employees)", "Value": filteredEmployees.reduce((sum, e) => sum + Number(e.basicSalary || 0), 0) },
      { "Metric": "Total HRA (All Employees)", "Value": filteredEmployees.reduce((sum, e) => sum + Number(e.hra || 0), 0) },
      { "Metric": "Total Allowances (All Employees)", "Value": filteredEmployees.reduce((sum, e) => {
          return sum + (
            Number(e.specialBasic || 0) + Number(e.dearnessAllowance || 0) +
            Number(e.foodAllowance || 0) + Number(e.conveyanceAllowance || 0) +
            Number(e.officeWearAllowance || 0) + Number(e.bonus || 0) +
            Number(e.leaveWithWages || 0) + Number(e.otherAllowances || 0) +
            Number(e.rateOfWages || 0)
          );
        }, 0) },
      { "Metric": "Total Earnings (All Employees)", "Value": filteredEmployees.reduce((sum, e) => {
          return sum + (
            Number(e.basicSalary || 0) + Number(e.specialBasic || 0) + Number(e.dearnessAllowance || 0) +
            Number(e.hra || 0) + Number(e.overtimeRate || 0) + Number(e.foodAllowance || 0) +
            Number(e.conveyanceAllowance || 0) + Number(e.officeWearAllowance || 0) +
            Number(e.bonus || 0) + Number(e.leaveWithWages || 0) + Number(e.otherAllowances || 0) +
            Number(e.rateOfWages || 0)
          );
        }, 0) },
      { "Metric": "", "Value": "" }, // Empty row for spacing
        
      // Deductions Analysis
      { "Metric": "DEDUCTIONS BREAKDOWN", "Value": "" },
      { "Metric": "Total PF Deductions", "Value": filteredEmployees.reduce((sum, e) => sum + Number(e.pfDeduction || 0), 0) },
      { "Metric": "Total ESIC Deductions", "Value": filteredEmployees.reduce((sum, e) => sum + Number(e.esicDeduction || 0), 0) },
      { "Metric": "Total Income Tax Deductions", "Value": filteredEmployees.reduce((sum, e) => sum + Number(e.incomeTaxDeduction || 0), 0) },
      { "Metric": "Total Other Deductions", "Value": filteredEmployees.reduce((sum, e) => {
          return sum + (
            Number(e.societyDeduction || 0) + Number(e.insuranceDeduction || 0) + Number(e.otherRecoveries || 0)
          );
        }, 0) },
      { "Metric": "Total Deductions (All Employees)", "Value": filteredEmployees.reduce((sum, e) => {
          return sum + (
            Number(e.pfDeduction || 0) + Number(e.esicDeduction || 0) + Number(e.societyDeduction || 0) +
            Number(e.incomeTaxDeduction || 0) + Number(e.insuranceDeduction || 0) + Number(e.otherRecoveries || 0)
          );
        }, 0) },
      { "Metric": "", "Value": "" }, // Empty row for spacing
        
      // Net Salary Analysis
      { "Metric": "NET SALARY ANALYSIS", "Value": "" },
      { "Metric": "Total Net Salary (All Employees)", "Value": filteredEmployees.reduce((sum, e) => {
          const earnings = (
            Number(e.basicSalary || 0) + Number(e.specialBasic || 0) + Number(e.dearnessAllowance || 0) +
            Number(e.hra || 0) + Number(e.overtimeRate || 0) + Number(e.foodAllowance || 0) +
            Number(e.conveyanceAllowance || 0) + Number(e.officeWearAllowance || 0) +
            Number(e.bonus || 0) + Number(e.leaveWithWages || 0) + Number(e.otherAllowances || 0) +
            Number(e.rateOfWages || 0)
          );
          const deductions = (
            Number(e.pfDeduction || 0) + Number(e.esicDeduction || 0) + Number(e.societyDeduction || 0) +
            Number(e.incomeTaxDeduction || 0) + Number(e.insuranceDeduction || 0) + Number(e.otherRecoveries || 0)
          );
          return sum + (earnings - deductions);
        }, 0) },
      { "Metric": "Average Basic Salary", "Value": filteredEmployees.length > 0 ? Math.round(filteredEmployees.reduce((sum, e) => sum + Number(e.basicSalary || 0), 0) / filteredEmployees.length) : 0 },
      { "Metric": "Average Net Salary", "Value": filteredEmployees.length > 0 ? Math.round(filteredEmployees.reduce((sum, e) => {
          const earnings = (
            Number(e.basicSalary || 0) + Number(e.specialBasic || 0) + Number(e.dearnessAllowance || 0) +
            Number(e.hra || 0) + Number(e.overtimeRate || 0) + Number(e.foodAllowance || 0) +
            Number(e.conveyanceAllowance || 0) + Number(e.officeWearAllowance || 0) +
            Number(e.bonus || 0) + Number(e.leaveWithWages || 0) + Number(e.otherAllowances || 0) +
            Number(e.rateOfWages || 0)
          );
          const deductions = (
            Number(e.pfDeduction || 0) + Number(e.esicDeduction || 0) + Number(e.societyDeduction || 0) +
            Number(e.incomeTaxDeduction || 0) + Number(e.insuranceDeduction || 0) + Number(e.otherRecoveries || 0)
          );
          return sum + (earnings - deductions);
        }, 0) / filteredEmployees.length) : 0 },
      { "Metric": "", "Value": "" }, // Empty row for spacing
        
      // Employer Contributions
      { "Metric": "EMPLOYER CONTRIBUTIONS", "Value": "" },
      { "Metric": "Total Employer PF Contribution", "Value": filteredEmployees.reduce((sum, e) => sum + Number(e.employerPfContribution || 0), 0) },
      { "Metric": "Total Employer ESIC Contribution", "Value": filteredEmployees.reduce((sum, e) => sum + Number(e.employerEsicContribution || 0), 0) },
      { "Metric": "", "Value": "" }, // Empty row for spacing
        
      // Filter Information
      { "Metric": "APPLIED FILTERS", "Value": "" },
      { "Metric": "Company Filter", "Value": companyFilter || "None" },
      { "Metric": "Status Filter", "Value": statusFilter || "None" },
      { "Metric": "Search Term", "Value": searchTerm || "None" }
    ];

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 35 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Employee_Master_Data_${currentDate}.xlsx`;
    
    XLSX.writeFile(wb, filename);
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
              title="Download comprehensive employee data with salary calculations"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
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
                  Showing {filteredEmployees.length} of {employeeList.length} employees
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <span>Total: {employeeList.length}</span>
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
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer"
                          >
                            <Eye className="h-3 w-3 sm:h-3 sm:w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/edit-employee/${employee.id}`)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer"
                          >
                            <Edit className="h-3 w-3 sm:h-3 sm:w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(employee)}
                            disabled={deletingId === employee.id}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 cursor-pointer"
                          >
                            {deletingId === employee.id ? (
                              <Loader2 className="h-3 w-3 sm:h-3 sm:w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3 sm:h-3 sm:w-3" />
                            )}
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