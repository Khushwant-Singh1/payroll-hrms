"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Minus } from "lucide-react"
import type { Employee, DeductionInput } from "../types/erp-payroll"

interface DeductionInputModalProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee
  onSave: (deductionData: DeductionInput) => void
  existingData?: DeductionInput
}

export function DeductionInputModal({ isOpen, onClose, employee, onSave, existingData }: DeductionInputModalProps) {
  const [formData, setFormData] = useState<DeductionInput>({
    employeeId: employee.id,
    month: "December",
    year: 2024,
    loanDeduction: existingData?.loanDeduction || 0,
    advanceDeduction: existingData?.advanceDeduction || 0,
    otherDeductions: existingData?.otherDeductions || 0,
    description: existingData?.description || "",
  })

  const handleInputChange = (field: keyof DeductionInput, value: number | string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalDeductions = formData.loanDeduction + formData.advanceDeduction + formData.otherDeductions

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Additional Deductions - {employee.name}
          </DialogTitle>
          <DialogDescription>
            Enter loan, advance, and other deductions for {employee.employeeId} - December 2024
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Minus className="h-4 w-4" />
                Deduction Details
              </CardTitle>
              <CardDescription>All amounts will be deducted from the employee's salary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="loanDeduction">Loan Deduction (₹)</Label>
                  <Input
                    id="loanDeduction"
                    type="number"
                    value={formData.loanDeduction}
                    onChange={(e) => handleInputChange("loanDeduction", Number(e.target.value))}
                    min="0"
                    step="100"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Monthly loan EMI or installment</p>
                </div>

                <div>
                  <Label htmlFor="advanceDeduction">Advance Deduction (₹)</Label>
                  <Input
                    id="advanceDeduction"
                    type="number"
                    value={formData.advanceDeduction}
                    onChange={(e) => handleInputChange("advanceDeduction", Number(e.target.value))}
                    min="0"
                    step="100"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Salary advance recovery</p>
                </div>

                <div>
                  <Label htmlFor="otherDeductions">Other Deductions (₹)</Label>
                  <Input
                    id="otherDeductions"
                    type="number"
                    value={formData.otherDeductions}
                    onChange={(e) => handleInputChange("otherDeductions", Number(e.target.value))}
                    min="0"
                    step="100"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Canteen, transport, etc.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Add notes about the deductions..."
                  rows={3}
                />
              </div>

              {/* Deduction Summary */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Deduction Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Loan Deduction:</span>
                    <span className="font-medium">{formatCurrency(formData.loanDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Advance Deduction:</span>
                    <span className="font-medium">{formatCurrency(formData.advanceDeduction)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Other Deductions:</span>
                    <span className="font-medium">{formatCurrency(formData.otherDeductions)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Additional Deductions:</span>
                      <span className="text-red-600">{formatCurrency(totalDeductions)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact on Salary */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Impact on Net Salary</h4>
                <div className="text-sm text-yellow-700">
                  <div className="flex justify-between">
                    <span>Current Gross Salary:</span>
                    <span>{formatCurrency(employee.salary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Additional Deductions:</span>
                    <span>-{formatCurrency(totalDeductions)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-yellow-200 pt-1 mt-1">
                    <span>Estimated Net (Before Statutory):</span>
                    <span>{formatCurrency(employee.salary - totalDeductions)}</span>
                  </div>
                  <p className="text-xs mt-2">
                    * Final net salary will be calculated after statutory deductions (PF, ESI, Tax, etc.)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Deductions</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
