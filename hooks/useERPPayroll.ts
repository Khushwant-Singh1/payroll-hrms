"use client"

import { useState, useCallback } from "react"
import type { Employee } from "../types/erp-payroll"

export interface PayrollProcessingState {
  isProcessing: boolean
  progress: number
  currentEmployee: string
  results: any[]
  errors: string[]
}

export function useERPPayroll() {
  const [processingState, setProcessingState] = useState<PayrollProcessingState>({
    isProcessing: false,
    progress: 0,
    currentEmployee: "",
    results: [],
    errors: [],
  })

  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "Rajesh Kumar",
      employeeId: "EMP001",
      email: "rajesh.kumar@company.com",
      mobile: "9876543210",
      designation: "Software Engineer",
      company: "Tech Solutions",
      joiningDate: "2023-01-15",
      salary: 85000,
      basicSalary: 50000,
      hra: 20000,
      allowances: 15000,
      pfOptIn: true,
      esiApplicable: true,
      pan: "ABCDE1234F",
      aadhaar: "1234-5678-9012",
      uan: "123456789012",
      esicNumber: "1234567890",
      bankAccount: "1234567890123456",
      ifsc: "HDFC0001234",
      lwfState: "Karnataka",
    },
    {
      id: "2",
      name: "Priya Sharma",
      employeeId: "EMP002",
      email: "priya.sharma@company.com",
      mobile: "9876543211",
      designation: "Senior Developer",
      company: "Tech Solutions",
      joiningDate: "2022-06-01",
      salary: 95000,
      basicSalary: 55000,
      hra: 22000,
      allowances: 18000,
      pfOptIn: true,
      esiApplicable: false,
      pan: "FGHIJ5678K",
      aadhaar: "2345-6789-0123",
      uan: "234567890123",
      esicNumber: "2345678901",
      bankAccount: "2345678901234567",
      ifsc: "ICICI0002345",
      lwfState: "Karnataka",
    },
    {
      id: "3",
      name: "Amit Patel",
      employeeId: "EMP003",
      email: "amit.patel@company.com",
      mobile: "9876543212",
      designation: "Team Lead",
      company: "Tech Solutions",
      joiningDate: "2021-03-10",
      salary: 120000,
      basicSalary: 70000,
      hra: 28000,
      allowances: 22000,
      pfOptIn: true,
      esiApplicable: false,
      pan: "KLMNO9012P",
      aadhaar: "3456-7890-1234",
      uan: "345678901234",
      esicNumber: "3456789012",
      bankAccount: "3456789012345678",
      ifsc: "SBI0003456",
      lwfState: "Karnataka",
    },
  ])

  const addEmployee = useCallback((employee: Omit<Employee, "id">) => {
    const newEmployee: Employee = {
      ...employee,
      id: Date.now().toString(),
    }
    setEmployees((prev) => [...prev, newEmployee])
    return newEmployee
  }, [])

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp)))
  }, [])

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id))
  }, [])

  const processPayroll = useCallback(
    async (month: string, year: number, attendanceData: any[], deductionData: any[]) => {
      setProcessingState({
        isProcessing: true,
        progress: 0,
        currentEmployee: "",
        results: [],
        errors: [],
      })

      const results: any[] = []
      const errors: string[] = []

      for (let i = 0; i < employees.length; i++) {
        const employee = employees[i]

        setProcessingState((prev) => ({
          ...prev,
          currentEmployee: employee.name,
          progress: (i / employees.length) * 100,
        }))

        try {
          // Simulate payroll calculation
          await new Promise((resolve) => setTimeout(resolve, 500))

          const attendance = attendanceData.find((a) => a.employeeId === employee.id) || {
            presentDays: 26,
            totalDays: 31,
            overtimeHours: 0,
          }

          const deductions = deductionData.find((d) => d.employeeId === employee.id) || {
            loanDeduction: 0,
            advanceDeduction: 0,
            otherDeductions: 0,
          }

          // Basic payroll calculation
          const grossSalary = employee.salary
          const pfDeduction = employee.pfOptIn ? Math.round(employee.basicSalary * 0.12) : 0
          const esiDeduction = employee.esiApplicable && grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0
          const ptDeduction = grossSalary > 15000 ? 200 : 0
          const totalDeductions =
            pfDeduction +
            esiDeduction +
            ptDeduction +
            deductions.loanDeduction +
            deductions.advanceDeduction +
            deductions.otherDeductions
          const netPay = grossSalary - totalDeductions

          const result = {
            employeeId: employee.id,
            employeeName: employee.name,
            grossSalary,
            pfDeduction,
            esiDeduction,
            ptDeduction,
            loanDeduction: deductions.loanDeduction,
            advanceDeduction: deductions.advanceDeduction,
            otherDeductions: deductions.otherDeductions,
            totalDeductions,
            netPay,
            month,
            year,
            processedAt: new Date().toISOString(),
          }

          results.push(result)
        } catch (error) {
          errors.push(`Error processing ${employee.name}: ${error}`)
        }
      }

      setProcessingState({
        isProcessing: false,
        progress: 100,
        currentEmployee: "",
        results,
        errors,
      })

      return results
    },
    [employees],
  )

  const generateBankFile = useCallback(
    (results: any[]) => {
      const bankData = results.map((result) => {
        const employee = employees.find((emp) => emp.id === result.employeeId)
        return {
          employeeId: employee?.employeeId,
          employeeName: employee?.name,
          accountNumber: employee?.bankAccount,
          ifscCode: employee?.ifsc,
          amount: result.netPay,
          narration: `Salary for ${result.month} ${result.year}`,
        }
      })

      const csvContent = [
        "Employee ID,Employee Name,Account Number,IFSC Code,Amount,Narration",
        ...bankData.map(
          (record) =>
            `${record.employeeId},${record.employeeName},${record.accountNumber},${record.ifscCode},${record.amount},${record.narration}`,
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `bank_transfer_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },
    [employees],
  )

  const generateStatutoryReturns = useCallback(
    (results: any[], type: "pf" | "esi" | "tds") => {
      const filteredResults = results.filter((result) => {
        switch (type) {
          case "pf":
            return result.pfDeduction > 0
          case "esi":
            return result.esiDeduction > 0
          case "tds":
            return result.tdsDeduction > 0
          default:
            return false
        }
      })

      const returnData = filteredResults.map((result) => {
        const employee = employees.find((emp) => emp.id === result.employeeId)

        switch (type) {
          case "pf":
            return {
              uan: employee?.uan,
              memberName: employee?.name,
              grossWages: result.grossSalary,
              pfWages: employee?.basicSalary,
              pfContribution: result.pfDeduction,
              epsContribution: Math.round((employee?.basicSalary || 0) * 0.0833),
            }
          case "esi":
            return {
              esicNumber: employee?.esicNumber,
              employeeName: employee?.name,
              totalWages: result.grossSalary,
              esiWages: result.grossSalary,
              employeeContribution: result.esiDeduction,
              employerContribution: Math.round(result.grossSalary * 0.0325),
            }
          case "tds":
            return {
              pan: employee?.pan,
              employeeName: employee?.name,
              grossSalary: result.grossSalary,
              tdsDeducted: result.tdsDeduction || 0,
            }
          default:
            return {}
        }
      })

      const jsonContent = JSON.stringify(
        {
          type: type.toUpperCase(),
          generatedAt: new Date().toISOString(),
          totalRecords: returnData.length,
          data: returnData,
        },
        null,
        2,
      )

      const blob = new Blob([jsonContent], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_return_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    [employees],
  )

  return {
    employees,
    processingState,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    processPayroll,
    generateBankFile,
    generateStatutoryReturns,
  }
}
