"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Download,
  FileText,
  Users,
  TrendingUp,
  Shield,
  Loader2,
  Eye,
  Lock,
  Unlock,
} from "lucide-react"
import { payrollEngine } from "../utils/payroll-engine"
import type { PayrollInput, PayrollOutput } from "../types/payroll-engine"
import type { Employee } from "../types/erp-payroll"

interface PayrollProcessingEngineProps {
  employees: Employee[]
  attendanceData: any[]
  deductionData: any[]
  month: string
  year: number
}

export function PayrollProcessingEngine({
  employees,
  attendanceData,
  deductionData,
  month,
  year,
}: PayrollProcessingEngineProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedResults, setProcessedResults] = useState<PayrollOutput[]>([])
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentEmployee, setCurrentEmployee] = useState<string>("")
  const [isLocked, setIsLocked] = useState(false)
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    valid: 0,
    warnings: 0,
    errors: 0,
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Convert employee data to payroll input format
  const convertToPayrollInput = (employee: Employee): PayrollInput => {
    const attendance = attendanceData.find((a) => a.employeeId === employee.id) || {
      totalDays: 31,
      workingDays: 26,
      presentDays: 26,
      lopDays: 0,
      overtimeHours: 0,
      nightShiftDays: 0,
      weekendShiftDays: 0,
    }

    const deductions = deductionData.find((d) => d.employeeId === employee.id) || {
      loanEmi: 0,
      advanceRecovery: 0,
      insurancePremium: 0,
      canteenDeduction: 0,
      otherDeductions: 0,
    }

    return {
      employeeId: employee.id,
      month,
      year,
      employee: {
        id: employee.id,
        name: employee.name,
        employeeId: employee.employeeId,
        pan: employee.pan,
        aadhaar: employee.aadhaar,
        uan: employee.uan,
        esicNumber: employee.esicNumber,
        bankAccount: employee.bankAccount,
        ifsc: employee.ifsc,
        joiningDate: employee.joiningDate,
        workState: employee.lwfState,
        pfOptIn: employee.pfOptIn,
        esiApplicable: employee.esiApplicable,
      },
      salaryStructure: {
        basic: employee.basicSalary,
        hra: employee.hra,
        allowances: employee.allowances,
        da: 0, // Dearness Allowance - can be added to employee master
        ctc: employee.salary,
      },
      attendance,
      variablePay: {
        bonus: 0,
        incentives: 0,
        arrears: 0,
        reimbursements: 0,
      },
      deductions,
    }
  }

  // Process payroll for all employees
  const processAllPayroll = async () => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessedResults([])

    const results: PayrollOutput[] = []
    const total = employees.length

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i]
      setCurrentEmployee(employee.name)

      try {
        const payrollInput = convertToPayrollInput(employee)
        const result = payrollEngine.processPayroll(payrollInput)
        results.push(result)

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 100))

        setProcessingProgress(((i + 1) / total) * 100)
      } catch (error) {
        console.error(`Error processing payroll for ${employee.name}:`, error)
      }
    }

    setProcessedResults(results)
    setCurrentEmployee("")
    setIsProcessing(false)

    // Calculate validation summary
    const summary = results.reduce(
      (acc, result) => {
        acc.total++
        if (result.validation.isValid) acc.valid++
        if (result.validation.warnings.length > 0) acc.warnings++
        if (result.validation.errors.length > 0) acc.errors++
        return acc
      },
      { total: 0, valid: 0, warnings: 0, errors: 0 },
    )

    setValidationSummary(summary)
  }

  // Generate reports and files
  const generateBankFile = () => {
    const bankRecords = payrollEngine.generateBankTransferFile(processedResults)
    const csvContent = [
      "Employee ID,Employee Name,Account Number,IFSC Code,Amount,Narration",
      ...bankRecords.map(
        (record) =>
          `${record.employeeId},${record.employeeName},${record.accountNumber},${record.ifscCode},${record.amount},${record.narration}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bank_transfer_${month}_${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generatePFECR = () => {
    const pfFile = payrollEngine.generatePFECR(processedResults, "EST001")
    const jsonContent = JSON.stringify(pfFile, null, 2)

    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `pf_ecr_${month}_${year}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateESIReturn = () => {
    const esiFile = payrollEngine.generateESIReturn(processedResults, "EST001")
    const jsonContent = JSON.stringify(esiFile, null, 2)

    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `esi_return_${month}_${year}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const lockPayroll = () => {
    payrollEngine.lockPayroll(month, year, "admin")
    setIsLocked(true)
  }

  const getTotalStats = () => {
    if (processedResults.length === 0) return { totalGross: 0, totalDeductions: 0, totalNet: 0 }

    return processedResults.reduce(
      (acc, result) => ({
        totalGross: acc.totalGross + result.earnings.netGrossEarnings,
        totalDeductions: acc.totalDeductions + result.totalDeductions,
        totalNet: acc.totalNet + result.netPay,
      }),
      { totalGross: 0, totalDeductions: 0, totalNet: 0 },
    )
  }

  const stats = getTotalStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Payroll Processing Engine
              </CardTitle>
              <CardDescription>
                Advanced payroll calculation with Indian statutory compliance - {month} {year}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {isLocked ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Unlock className="h-3 w-3" />
                  Unlocked
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <div>
                  <div className="font-semibold">Processing Payroll...</div>
                  <div className="text-sm text-gray-600">Currently processing: {currentEmployee}</div>
                </div>
              </div>
              <Progress value={processingProgress} className="w-full" />
              <div className="text-sm text-gray-600 text-center">{Math.round(processingProgress)}% Complete</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="statutory">Statutory</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{employees.length}</div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalGross)}</div>
                    <div className="text-sm text-gray-600">Total Gross</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalDeductions)}</div>
                    <div className="text-sm text-gray-600">Total Deductions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calculator className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatCurrency(stats.totalNet)}</div>
                    <div className="text-sm text-gray-600">Total Net Pay</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Processing Controls</CardTitle>
              <CardDescription>Execute payroll processing and generate outputs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={processAllPayroll}
                  disabled={isProcessing || isLocked}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {processedResults.length > 0 ? "Reprocess Payroll" : "Process Payroll"}
                </Button>

                {processedResults.length > 0 && !isLocked && (
                  <Button onClick={lockPayroll} variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Lock Payroll
                  </Button>
                )}

                {processedResults.length > 0 && (
                  <div className="text-sm text-gray-600">Last processed: {new Date().toLocaleString()}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <FileText className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{validationSummary.total}</div>
                    <div className="text-sm text-gray-600">Total Records</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{validationSummary.valid}</div>
                    <div className="text-sm text-gray-600">Valid Records</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{validationSummary.warnings}</div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{validationSummary.errors}</div>
                    <div className="text-sm text-gray-600">Errors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Validation Details */}
          {processedResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Validation Details</CardTitle>
                <CardDescription>Detailed validation results for each employee</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processedResults
                    .filter((result) => !result.validation.isValid || result.validation.warnings.length > 0)
                    .map((result) => {
                      const employee = employees.find((emp) => emp.id === result.employeeId)
                      return (
                        <Alert key={result.employeeId} variant={result.validation.isValid ? "default" : "destructive"}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="font-semibold">
                              {employee?.name} ({employee?.employeeId})
                            </div>
                            {result.validation.errors.map((error, index) => (
                              <div key={index} className="text-red-600 text-sm">
                                • {error}
                              </div>
                            ))}
                            {result.validation.warnings.map((warning, index) => (
                              <div key={index} className="text-yellow-600 text-sm">
                                • {warning}
                              </div>
                            ))}
                          </AlertDescription>
                        </Alert>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-6">
          {processedResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payroll Results</CardTitle>
                <CardDescription>Detailed payroll calculations for all employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Gross Earnings</TableHead>
                        <TableHead className="text-right">PF</TableHead>
                        <TableHead className="text-right">ESI</TableHead>
                        <TableHead className="text-right">PT</TableHead>
                        <TableHead className="text-right">TDS</TableHead>
                        <TableHead className="text-right">Total Deductions</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedResults.map((result) => {
                        const employee = employees.find((emp) => emp.id === result.employeeId)
                        return (
                          <TableRow key={result.employeeId}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{employee?.name}</div>
                                <div className="text-sm text-gray-500">{employee?.employeeId}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(result.earnings.netGrossEarnings)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(result.statutoryDeductions.pfEmployee)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(result.statutoryDeductions.esiEmployee)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(result.statutoryDeductions.professionalTax)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(result.statutoryDeductions.tds)}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(result.totalDeductions)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(result.netPay)}</TableCell>
                            <TableCell>
                              {result.validation.isValid ? (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Valid
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Statutory Tab */}
        <TabsContent value="statutory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  PF ECR
                </CardTitle>
                <CardDescription>Provident Fund Electronic Challan cum Return</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {processedResults.filter((r) => r.statutoryDeductions.pfEmployee > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Employees covered</div>
                  <Button
                    onClick={generatePFECR}
                    disabled={processedResults.length === 0}
                    className="w-full bg-transparent"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate PF ECR
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ESI Return
                </CardTitle>
                <CardDescription>Employee State Insurance Return</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-green-600">
                    {processedResults.filter((r) => r.statutoryDeductions.esiEmployee > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Employees covered</div>
                  <Button
                    onClick={generateESIReturn}
                    disabled={processedResults.length === 0}
                    className="w-full bg-transparent"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate ESI Return
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  TDS Form 24Q
                </CardTitle>
                <CardDescription>Tax Deducted at Source Quarterly Return</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {processedResults.filter((r) => r.statutoryDeductions.tds > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Employees with TDS</div>
                  <Button disabled={processedResults.length === 0} className="w-full bg-transparent" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Form 24Q
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bank Transfer File</CardTitle>
                <CardDescription>Generate bank file for salary disbursement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalNet)}</div>
                  <div className="text-sm text-gray-600">Total amount to transfer</div>
                  <Button onClick={generateBankFile} disabled={processedResults.length === 0} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Bank File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payslips</CardTitle>
                <CardDescription>Individual employee payslips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {processedResults.filter((r) => r.validation.isValid).length}
                  </div>
                  <div className="text-sm text-gray-600">Payslips ready</div>
                  <Button disabled={processedResults.length === 0} className="w-full bg-transparent" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download All Payslips
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Processing history and audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {payrollEngine
                  .getAuditLog()
                  .slice(-10)
                  .reverse()
                  .map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{log.action.replace("_", " ")}</div>
                        <div className="text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
