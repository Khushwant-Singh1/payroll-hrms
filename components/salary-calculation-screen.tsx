"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Calculator, 
  Download, 
  Eye, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  IndianRupee,
  Users,
  MoreHorizontal
} from "lucide-react"
import type { Employee } from "../types/erp-payroll"

interface SalaryCalculation {
  employeeId: string
  employeeName: string
  department: string
  designation: string
  daysWorked: number
  workingDays: number
  basicSalary: number
  hra: number
  allowances: number
  overtimePay: number
  nightShiftPay: number
  hazardPay: number
  grossSalary: number
  pfDeduction: number
  esiDeduction: number
  taxDeduction: number
  otherDeductions: number
  totalDeductions: number
  netSalary: number
  status: "pending" | "calculated" | "approved" | "rejected" | "paid"
  remarks?: string
}

export function SalaryCalculationScreen() {
  const [calculations, setCalculations] = useState<SalaryCalculation[]>([])
  const [filteredCalculations, setFilteredCalculations] = useState<SalaryCalculation[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    calculatedEmployees: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0
  })

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCalculations: SalaryCalculation[] = [
      {
        employeeId: "EMP001",
        employeeName: "Rajesh Kumar",
        department: "Engineering",
        designation: "Software Engineer",
        daysWorked: 22,
        workingDays: 22,
        basicSalary: 50000,
        hra: 15000,
        allowances: 5000,
        overtimePay: 2000,
        nightShiftPay: 0,
        hazardPay: 0,
        grossSalary: 72000,
        pfDeduction: 6000,
        esiDeduction: 1080,
        taxDeduction: 8000,
        otherDeductions: 0,
        totalDeductions: 15080,
        netSalary: 56920,
        status: "calculated"
      },
      {
        employeeId: "EMP002",
        employeeName: "Priya Sharma",
        department: "Human Resources",
        designation: "HR Manager",
        daysWorked: 20,
        workingDays: 22,
        basicSalary: 60000,
        hra: 18000,
        allowances: 8000,
        overtimePay: 0,
        nightShiftPay: 0,
        hazardPay: 0,
        grossSalary: 78545, // Calculated pro-rata
        pfDeduction: 7200,
        esiDeduction: 1178,
        taxDeduction: 10000,
        otherDeductions: 500,
        totalDeductions: 18878,
        netSalary: 59667,
        status: "pending"
      },
      {
        employeeId: "EMP003",
        employeeName: "Amit Patel",
        department: "Operations",
        designation: "Operations Executive",
        daysWorked: 22,
        workingDays: 22,
        basicSalary: 35000,
        hra: 10500,
        allowances: 3000,
        overtimePay: 3000,
        nightShiftPay: 2000,
        hazardPay: 1500,
        grossSalary: 55000,
        pfDeduction: 4200,
        esiDeduction: 825,
        taxDeduction: 2000,
        otherDeductions: 0,
        totalDeductions: 7025,
        netSalary: 47975,
        status: "calculated"
      },
      {
        employeeId: "EMP004",
        employeeName: "Sneha Reddy",
        department: "Finance",
        designation: "Accountant",
        daysWorked: 18,
        workingDays: 22,
        basicSalary: 40000,
        hra: 12000,
        allowances: 4000,
        overtimePay: 0,
        nightShiftPay: 0,
        hazardPay: 0,
        grossSalary: 45818, // Pro-rata calculation
        pfDeduction: 4800,
        esiDeduction: 687,
        taxDeduction: 3000,
        otherDeductions: 200,
        totalDeductions: 8687,
        netSalary: 37131,
        status: "approved"
      },
      {
        employeeId: "EMP005",
        employeeName: "Vikram Singh",
        department: "Engineering",
        designation: "Senior Developer",
        daysWorked: 22,
        workingDays: 22,
        basicSalary: 75000,
        hra: 22500,
        allowances: 10000,
        overtimePay: 5000,
        nightShiftPay: 0,
        hazardPay: 0,
        grossSalary: 112500,
        pfDeduction: 9000,
        esiDeduction: 0, // Above ESI limit
        taxDeduction: 15000,
        otherDeductions: 1000,
        totalDeductions: 25000,
        netSalary: 87500,
        status: "calculated"
      }
    ]

    setCalculations(mockCalculations)
    setFilteredCalculations(mockCalculations)

    // Calculate summary
    const summary = mockCalculations.reduce(
      (acc, calc) => ({
        totalEmployees: acc.totalEmployees + 1,
        calculatedEmployees: acc.calculatedEmployees + (calc.status !== "pending" ? 1 : 0),
        totalGross: acc.totalGross + calc.grossSalary,
        totalDeductions: acc.totalDeductions + calc.totalDeductions,
        totalNet: acc.totalNet + calc.netSalary
      }),
      { totalEmployees: 0, calculatedEmployees: 0, totalGross: 0, totalDeductions: 0, totalNet: 0 }
    )
    setSummary(summary)
  }, [])

  // Filter calculations based on search and filters
  useEffect(() => {
    let filtered = calculations

    if (searchTerm) {
      filtered = filtered.filter(calc => 
        calc.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        calc.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(calc => calc.status === statusFilter)
    }

    if (departmentFilter !== "all") {
      filtered = filtered.filter(calc => calc.department === departmentFilter)
    }

    setFilteredCalculations(filtered)
  }, [calculations, searchTerm, statusFilter, departmentFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusIcon = (status: SalaryCalculation["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "calculated":
        return <Calculator className="h-4 w-4 text-blue-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "paid":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: SalaryCalculation["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "calculated":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredCalculations.map(calc => calc.employeeId))
    } else {
      setSelectedEmployees([])
    }
  }

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees(prev => [...prev, employeeId])
    } else {
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId))
    }
  }

  const departments = [...new Set(calculations.map(calc => calc.department))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Calculation</h1>
          <p className="text-gray-600">
            Review and process salary calculations for August 2025
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve Selected
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {summary.calculatedEmployees} calculated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
            <IndianRupee className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalGross)}</div>
            <p className="text-xs text-muted-foreground">
              Before deductions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalDeductions)}</div>
            <p className="text-xs text-muted-foreground">
              PF, ESI, Tax & Others
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Payout</CardTitle>
            <IndianRupee className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalNet)}</div>
            <p className="text-xs text-muted-foreground">
              Amount to be paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="calculated">Calculated</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredCalculations.length} of {calculations.length} employees
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Employee Salary Calculations
          </CardTitle>
          <CardDescription>
            Detailed salary breakdown for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedEmployees.length === filteredCalculations.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-center">Days Worked</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalculations.map((calculation) => (
                  <TableRow key={calculation.employeeId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmployees.includes(calculation.employeeId)}
                        onCheckedChange={(checked) => 
                          handleSelectEmployee(calculation.employeeId, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{calculation.employeeName}</div>
                        <div className="text-sm text-gray-600">
                          {calculation.employeeId} • {calculation.department}
                        </div>
                        <div className="text-xs text-gray-500">
                          {calculation.designation}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-medium">
                        {calculation.daysWorked}/{calculation.workingDays}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((calculation.daysWorked / calculation.workingDays) * 100).toFixed(0)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {formatCurrency(calculation.grossSalary)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Basic: {formatCurrency(calculation.basicSalary)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        {formatCurrency(calculation.totalDeductions)}
                      </div>
                      <div className="text-xs text-gray-500">
                        PF: {formatCurrency(calculation.pfDeduction)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(calculation.netSalary)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${getStatusColor(calculation.status)} flex items-center gap-1 w-fit mx-auto`}>
                        {getStatusIcon(calculation.status)}
                        {calculation.status.charAt(0).toUpperCase() + calculation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Table Actions */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              {selectedEmployees.length} of {filteredCalculations.length} employees selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={selectedEmployees.length === 0}>
                Recalculate Selected
              </Button>
              <Button variant="outline" size="sm" disabled={selectedEmployees.length === 0}>
                Approve Selected
              </Button>
              <Button size="sm" disabled={selectedEmployees.length === 0}>
                Process Payment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
