"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Loader2 } from "lucide-react"
import type { Employee, PayrollCalculation } from "../types/payroll"

interface PayrollTabProps {
  employees: Employee[]
  payrollCalculations: PayrollCalculation[]
  isProcessing: boolean
  formatCurrency: (amount: number) => string
  handleProcessPayroll: () => Promise<void>
  setIsPayrollResultsOpen: (open: boolean) => void
  getTotalGrossPay: () => number
  getTotalNetPay: () => number
}

export function PayrollTab({
  employees,
  payrollCalculations,
  isProcessing,
  formatCurrency,
  handleProcessPayroll,
  setIsPayrollResultsOpen,
  getTotalGrossPay,
  getTotalNetPay,
}: PayrollTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gross-to-Net Calculation Engine</CardTitle>
        <CardDescription>Indian payroll calculations with statutory deductions</CardDescription>
      </CardHeader>
      <CardContent>
        {payrollCalculations.length === 0 ? (
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Process Payroll</h3>
            <p className="text-gray-600 mb-6">
              Process payroll for {employees.length} employees for December 2024
            </p>
            <Button onClick={handleProcessPayroll} disabled={isProcessing} size="lg">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Payroll"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Total Gross Pay</div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(getTotalGrossPay())}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">Total Deductions</div>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(getTotalGrossPay() - getTotalNetPay())}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Total Net Pay</div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(getTotalNetPay())}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setIsPayrollResultsOpen(true)}>View Detailed Results</Button>
              <Button variant="outline" onClick={handleProcessPayroll}>
                Recalculate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
