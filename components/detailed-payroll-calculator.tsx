"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Play, Download, FileText, Users, Calculator, CheckCircle, AlertCircle, DollarSign } from "lucide-react"
import type { Employee, PayrollResult } from "../types/erp-payroll"
import { PayrollEngine } from "../utils/payroll-calculations"
import { ExcelGenerator } from "../utils/excel-generator"

interface DetailedPayrollCalculatorProps {
  employees: Employee[]
  onPayrollComplete?: (results: PayrollResult[]) => void
}

export function DetailedPayrollCalculator({ employees = [], onPayrollComplete }: DetailedPayrollCalculatorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentEmployee, setCurrentEmployee] = useState<string>("")
  const [payrollResults, setPayrollResults] = useState<PayrollResult[]>([])
  const [processingComplete, setProcessingComplete] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const processPayroll = async () => {
    if (!employees || employees.length === 0) {
      setValidationErrors(["No employees found to process payroll"])
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setValidationErrors([])
    setProcessingComplete(false)

    const results: PayrollResult[] = []
    const errors: string[] = []

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i]
      setCurrentEmployee(employee.name)
      setProgress(((i + 1) / employees.length) * 100)

      try {
        // Validate employee data
        const validation = PayrollEngine.validateEmployee(employee)
        if (!validation.isValid) {
          errors.push(`${employee.name}: ${validation.errors.join(", ")}`)
          continue
        }

        // Calculate payroll
        const result = PayrollEngine.calculatePayroll(employee)
        results.push(result)

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (error) {
        errors.push(`${employee.name}: Calculation error - ${error}`)
      }
    }

    setPayrollResults(results)
    setValidationErrors(errors)
    setProcessingComplete(true)
    setIsProcessing(false)
    setCurrentEmployee("")

    if (onPayrollComplete) {
      onPayrollComplete(results)
    }
  }

  const generateReturn = (type: string) => {
    if (!payrollResults || payrollResults.length === 0) {
      alert("Please process payroll first")
      return
    }

    switch (type) {
      case "bank":
        ExcelGenerator.generateBankFile(payrollResults)
        break
      case "pf":
        ExcelGenerator.generatePFECR(payrollResults)
        break
      case "esi":
        ExcelGenerator.generateESIReturn(payrollResults)
        break
      case "tds":
        ExcelGenerator.generateForm24Q(payrollResults)
        break
      case "payslips":
        ExcelGenerator.generatePayslips(payrollResults)
        break
      case "summary":
        ExcelGenerator.generatePayrollSummary(payrollResults)
        break
      default:
        alert("Unknown return type")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalStats =
    payrollResults.length > 0
      ? {
          totalEmployees: payrollResults.length,
          totalGross: payrollResults.reduce((sum, r) => sum + r.grossPay, 0),
          totalDeductions: payrollResults.reduce((sum, r) => sum + r.totalDeductions, 0),
          totalNet: payrollResults.reduce((sum, r) => sum + r.netPay, 0),
          totalPF: payrollResults.reduce((sum, r) => sum + r.deductions.pf, 0),
          totalESI: payrollResults.reduce((sum, r) => sum + r.deductions.esi, 0),
          totalTDS: payrollResults.reduce((sum, r) => sum + r.deductions.tds, 0),
        }
      : null

  return (
    <div className="space-y-6">
      {/* Processing Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payroll Processing Engine
          </CardTitle>
          <CardDescription>
            Process payroll for {employees?.length || 0} employees with complete statutory compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={processPayroll}
                disabled={isProcessing || !employees || employees.length === 0}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Process Payroll"}
              </Button>

              {employees && employees.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {employees.length} Employees
                </Badge>
              )}
            </div>

            {processingComplete && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Processing Complete
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing: {currentEmployee}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                <AlertCircle className="h-4 w-4" />
                Validation Errors ({validationErrors.length})
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      {totalStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payroll Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{totalStats.totalEmployees}</div>
                <div className="text-sm text-blue-800">Employees</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStats.totalGross)}</div>
                <div className="text-sm text-green-800">Gross Pay</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{formatCurrency(totalStats.totalDeductions)}</div>
                <div className="text-sm text-red-800">Deductions</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalStats.totalNet)}</div>
                <div className="text-sm text-purple-800">Net Pay</div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Total PF:</span>
                <span className="font-medium">{formatCurrency(totalStats.totalPF)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total ESI:</span>
                <span className="font-medium">{formatCurrency(totalStats.totalESI)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total TDS:</span>
                <span className="font-medium">{formatCurrency(totalStats.totalTDS)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Options */}
      {processingComplete && payrollResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Generate Returns & Reports (Excel Format)
            </CardTitle>
            <CardDescription>Download statutory returns and payroll reports in Excel format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => generateReturn("bank")}
                className="flex items-center gap-2 h-auto p-4 flex-col"
              >
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Bank Transfer</div>
                  <div className="text-xs text-gray-500">Salary disbursement file</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => generateReturn("pf")}
                className="flex items-center gap-2 h-auto p-4 flex-col"
              >
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">PF ECR</div>
                  <div className="text-xs text-gray-500">Provident Fund return</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => generateReturn("esi")}
                className="flex items-center gap-2 h-auto p-4 flex-col"
              >
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">ESI Return</div>
                  <div className="text-xs text-gray-500">Employee State Insurance</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => generateReturn("tds")}
                className="flex items-center gap-2 h-auto p-4 flex-col"
              >
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Form 24Q</div>
                  <div className="text-xs text-gray-500">TDS quarterly return</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => generateReturn("payslips")}
                className="flex items-center gap-2 h-auto p-4 flex-col"
              >
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Payslips</div>
                  <div className="text-xs text-gray-500">Individual payslips</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => generateReturn("summary")}
                className="flex items-center gap-2 h-auto p-4 flex-col"
              >
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Summary Report</div>
                  <div className="text-xs text-gray-500">Payroll overview</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Results */}
      {payrollResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Payroll Results</CardTitle>
            <CardDescription>Detailed breakdown for each employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {payrollResults.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{result.employee.name}</h3>
                      <p className="text-sm text-gray-600">{result.employee.employeeId}</p>
                    </div>
                    <Badge variant="outline">{formatCurrency(result.netPay)}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Gross:</span>
                      <span className="ml-2 font-medium">{formatCurrency(result.grossPay)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Deductions:</span>
                      <span className="ml-2 font-medium">{formatCurrency(result.totalDeductions)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Net:</span>
                      <span className="ml-2 font-medium text-green-600">{formatCurrency(result.netPay)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
