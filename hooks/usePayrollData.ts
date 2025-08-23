// hooks/usePayrollData.ts (Refactored for Backend API)

"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import type { Employee as PrismaEmployee, StatutoryReturn, Attendance } from "@prisma/client" // Import types from Prisma
import type { Employee, PayrollCalculation } from "@/types/payroll" // Import the extended Employee type

// Transform Prisma Employee to include calculated salary
const transformEmployee = (employee: any): Employee => ({
  ...employee,
  basicSalary: Number(employee.basicSalary),
  hra: Number(employee.hra),
  allowances: Number(employee.allowances),
  salary: employee.salary || (Number(employee.basicSalary) + Number(employee.hra) + Number(employee.allowances)),
  joiningDate: typeof employee.joiningDate === 'string' ? employee.joiningDate.split('T')[0] : employee.joiningDate.toISOString().split('T')[0],
  dateOfBirth: employee.dateOfBirth ? (typeof employee.dateOfBirth === 'string' ? employee.dateOfBirth.split('T')[0] : employee.dateOfBirth.toISOString().split('T')[0]) : "",
})

export function usePayrollData() {
  // State for holding data fetched from the backend
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
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
        const [empRes, attRes, retRes] = await Promise.all([
          axios.get("/api/employees"),
          axios.get("/api/attendance"),
          axios.get("/api/compliance/returns"),
        ])
        
        // Transform employees to include calculated salary
        const transformedEmployees = empRes.data.map(transformEmployee)
        
        setEmployees(transformedEmployees)
        setAttendance(attRes.data)
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
      
      // Transform the response to include calculated salary
      const transformedEmployee = transformEmployee(response.data)
      
      setEmployees((prev) => [transformedEmployee, ...prev])
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
      
      // Transform the response to include calculated salary
      const transformedEmployee = transformEmployee(response.data)
      
      setEmployees((prev) => prev.map((emp) => (emp.id === id ? transformedEmployee : emp)))
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

  // --- Attendance CRUD ---
  const addAttendanceRecord = useCallback(async (attendanceData: Omit<Attendance, "id" | "createdAt" | "updatedAt">) => {
    try {
      const response = await axios.post("/api/attendance", attendanceData)
      setAttendance((prev) => [response.data, ...prev])
      toast({ title: "Success", description: "Attendance record added." })
      return response.data
    } catch (error) {
      console.error("Error adding attendance:", error)
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to add attendance."
        toast({ title: "Error", description: errorMessage, variant: "destructive" })
      } else {
        toast({ title: "Error", description: "Failed to add attendance.", variant: "destructive" })
      }
      throw error
    }
  }, [toast])

  const updateAttendanceRecord = useCallback(async (id: string, updates: Partial<Attendance>) => {
    try {
      const response = await axios.patch(`/api/attendance/${id}`, updates)
      setAttendance((prev) => prev.map((att) => (att.id === id ? response.data : att)))
      toast({ title: "Success", description: "Attendance record updated." })
      return response.data
    } catch (error) {
      toast({ title: "Error", description: "Failed to update attendance.", variant: "destructive" })
      throw error
    }
  }, [toast])

  const deleteAttendanceRecord = useCallback(async (id: string) => {
    try {
      await axios.delete(`/api/attendance/${id}`)
      setAttendance((prev) => prev.filter((att) => att.id !== id))
      toast({ title: "Success", description: "Attendance record deleted." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete attendance.", variant: "destructive" })
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
    return payrollCalculations.reduce((sum, calc) => sum + calc.grossPay, 0)
  }, [payrollCalculations])
  
  // --- Statutory Returns ---
  const generateStatutoryReturn = useCallback(async (type: string, month: number, year: number) => {
    try {
      const response = await axios.post("/api/compliance/generate", { type, month, year })
      setStatutoryReturns((prev) => [response.data, ...prev])
      toast({ title: "Success", description: "Statutory return generated." })
      return response.data
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate statutory return.", variant: "destructive" })
      throw error
    }
  }, [toast])

  return {
    employees,
    attendance,
    payrollCalculations,
    statutoryReturns,
    isProcessing,
    isLoading, // Add isLoading to show loading states in the UI
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addAttendanceRecord,
    updateAttendanceRecord,
    deleteAttendanceRecord,
    calculatePayroll,
    generateStatutoryReturn,
    getTotalNetPay,
    getTotalGrossPay,
  }
}