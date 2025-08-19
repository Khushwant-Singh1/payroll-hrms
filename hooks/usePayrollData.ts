// hooks/usePayrollData.ts (Refactored for Backend API)

"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import type { Employee, PayrollCalculation, StatutoryReturn } from "@prisma/client" // Import types from Prisma

export function usePayrollData() {
  // State for holding data fetched from the backend
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollCalculations, setPayrollCalculations] = useState<PayrollCalculation[]>([])
  const [statutoryReturns, setStatutoryReturns] = useState<StatutoryReturn[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        // Fetch initial data in parallel
        const [empRes, retRes] = await Promise.all([
          axios.get("/api/employees"),
          axios.get("/api/compliance/returns"),
        ])
        setEmployees(empRes.data)
        setStatutoryReturns(retRes.data)
      } catch (error) {
        toast({ title: "Error", description: "Failed to load initial data.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  // --- Employee CRUD ---
  const addEmployee = useCallback(async (employeeData: Omit<Employee, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("Adding employee with data:", employeeData)
      const response = await axios.post("/api/employees", employeeData)
      console.log("Employee added successfully:", response.data)
      setEmployees((prev) => [response.data, ...prev])
      toast({ title: "Success", description: "Employee added." })
    } catch (error) {
      console.error("Error adding employee:", error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to add employee."
        toast({ title: "Error", description: errorMessage, variant: "destructive" })
      } else {
        toast({ title: "Error", description: "Failed to add employee.", variant: "destructive" })
      }
      throw error // Re-throw to let the calling component handle it
    }
  }, [toast])

  const updateEmployee = useCallback(async (id: string, updates: Partial<Employee>) => {
    try {
      const response = await axios.put(`/api/employees/${id}`, updates)
      setEmployees((prev) => prev.map((emp) => (emp.id === id ? response.data : emp)))
      toast({ title: "Success", description: "Employee updated." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update employee.", variant: "destructive" })
    }
  }, [toast])

  const deleteEmployee = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/employees/${id}`)
      setEmployees((prev) => prev.filter((emp) => emp.id !== id))
      toast({ title: "Success", description: "Employee deleted." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete employee.", variant: "destructive" })
    }
  }, [toast])

  // --- Payroll Processing ---
  const calculatePayroll = useCallback(async (month: number, year: number) => {
    setIsProcessing(true)
    try {
      const response = await axios.post("/api/payroll/process", { month, year })
      // The API returns the full PayrollRun object, including the calculations
      setPayrollCalculations(response.data.calculations)
      toast({ title: "Success", description: "Payroll processed successfully." })
    } catch (error) {
      toast({ title: "Error", description: "Payroll processing failed.", variant: "destructive" })
    } finally {
      setIsProcessing(false)
    }
  }, [toast])

  // --- Helper Functions ---
  const getTotalNetPay = useCallback(() => {
    return payrollCalculations.reduce((sum, calc) => sum + calc.netPay, 0)
  }, [payrollCalculations])

  const getTotalGrossPay = useCallback(() => {
    return payrollCalculations.reduce((sum, calc) => sum + calc.grossEarnings, 0)
  }, [payrollCalculations])
  
  // (generateStatutoryReturn would now be a POST to a backend endpoint)

  return {
    employees,
    payrollCalculations,
    statutoryReturns,
    isProcessing,
    isLoading, // Add isLoading to show loading states in the UI
    addEmployee,
    updateEmployee,
    deleteEmployee,
    calculatePayroll,
    getTotalNetPay,
    getTotalGrossPay,
  }
}