"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { X } from "lucide-react"
import type { Employee, PayrollCalculation } from "../../types/payroll"

interface PayrollResultsModalProps {
  isOpen: boolean
  onClose: () => void
  calculations: PayrollCalculation[]
  employees: Employee[]
}

export function PayrollResultsModal({
  isOpen,
  onClose,
  calculations,
  employees,
}: PayrollResultsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payroll Results</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculations.map((c) => {
                const emp = employees.find((e) => e.id === c.employeeId)!
                const totalDeductions = c.pfDeduction + c.esiDeduction + c.taxDeduction + c.otherDeductions
                return (
                  <TableRow key={c.employeeId}>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>₹{c.grossPay.toLocaleString("en-IN")}</TableCell>
                    <TableCell>₹{totalDeductions.toLocaleString("en-IN")}</TableCell>
                    <TableCell>₹{c.netPay.toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
