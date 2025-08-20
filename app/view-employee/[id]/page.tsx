"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Edit,
  User,
  Calendar,
  Phone,
  Mail,
  Building,
  MapPin,
  IndianRupee,
  CreditCard,
  FileText,
  Printer,
} from "lucide-react"
import { usePayrollData } from "@/hooks/usePayrollData"
import type { Employee } from "@/types/payroll"

export default function ViewEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const employeeId = params.id as string

  const { employees } = usePayrollData()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* Fetch employee data */
  useEffect(() => {
    const foundEmployee = employees.find((emp) => emp.id === employeeId)
    if (foundEmployee) {
      try {
        const totalSalary = Number(foundEmployee.basicSalary) + Number(foundEmployee.hra) + Number(foundEmployee.allowances)
        const basicSalary = Number(foundEmployee.basicSalary)
        const hra = Number(foundEmployee.hra) 
        const allowances = Number(foundEmployee.allowances)
        const salary = basicSalary + hra + allowances

        const formatDate = (date: any): string => {
          if (!date) return ""
          try {
            const dateObj = typeof date === 'string' ? new Date(date) : date
            if (isNaN(dateObj.getTime())) return ""
            return dateObj.toISOString().split('T')[0]
          } catch {
            return ""
          }
        }

        const employeeData: Employee = {
          id: foundEmployee.id,
          employeeId: foundEmployee.employeeId,
          name: foundEmployee.name,
          email: foundEmployee.email,
          phone: foundEmployee.phone,
          department: foundEmployee.department,
          designation: foundEmployee.designation,
          company: foundEmployee.company,
          location: foundEmployee.location || "",
          grade: foundEmployee.grade || "",
          status: foundEmployee.status,
          joiningDate: formatDate(foundEmployee.joiningDate),
          dateOfBirth: formatDate(foundEmployee.dateOfBirth),
          basicSalary,
          hra,
          allowances,
          salary,
          pan: foundEmployee.pan || "",
          aadhaar: foundEmployee.aadhaar || "",
          uan: foundEmployee.uan || "",
          esicNumber: foundEmployee.esicNumber || "",
          pfOptIn: foundEmployee.pfOptIn,
          esiApplicable: foundEmployee.esiApplicable,
          lwfState: foundEmployee.lwfState || "",
          bankAccount: foundEmployee.bankAccount || "",
          ifsc: foundEmployee.ifsc || "",
          branch: foundEmployee.branch || "",
          profilePic: foundEmployee.profilePic || "",
        }
        setEmployee(employeeData)
      } catch (error) {
        setError("Failed to fetch employee data")
      } finally {
        setIsLoading(false)
      }
    }
  }, [employees, employeeId])

  /* Helpers */
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided"
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "Not provided"
    try {
      const today = new Date()
      const birthDate = new Date(dateOfBirth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--
      return `${age} years`
    } catch {
      return "Invalid date"
    }
  }

  /* Loading / 404 */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Employee Not Found</h2>
            <p className="text-gray-600 mb-4">The employee you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/?tab=hr-data")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <div className="p-6 max-w-4xl mx-auto">
          <div className="no-print">
            <Button variant="ghost" onClick={() => router.push("/?tab=hr-data")} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Profile</h1>
                <p className="text-gray-600 mt-2">Viewing {employee.name}'s information</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => window.print()} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button onClick={() => router.push(`/edit-employee/${employeeId}`)} className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Employee
                </Button>
              </div>
            </div>
          </div>

          {/* PRINTABLE AREA */}
          <div className="print-area">
            {/* Profile Overview */}
            <Card className="mb-6 card">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={employee.profilePic || "/placeholder.svg"} alt={employee.name} />
                    <AvatarFallback className="text-4xl">
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{employee.name}</h2>
                      <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                        {employee.status}
                      </Badge>
                    </div>
                    <p className="text-lg text-gray-600 mb-1">{employee.designation}</p>
                    <p className="text-gray-500 mb-3">
                      {employee.department} • {employee.company}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{employee.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span>{employee.employeeId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{employee.location || "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Employee ID</label>
                      <p className="font-medium">{employee.employeeId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Grade</label>
                      <p className="font-medium">{employee.grade || "Not specified"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Joining Date</label>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {formatDate(employee.joiningDate)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="font-medium">
                        {employee.dateOfBirth ? formatDate(employee.dateOfBirth) : "Not provided"}
                      </p>
                    </div>
                    {employee.dateOfBirth && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Age</label>
                        <p className="font-medium">{calculateAge(employee.dateOfBirth)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Salary Information */}
              <Card className="card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Salary Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary</span>
                      <span className="font-medium">{formatCurrency(employee.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">HRA</span>
                      <span className="font-medium">{formatCurrency(employee.hra)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Allowances</span>
                      <span className="font-medium">{formatCurrency(employee.allowances)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Salary</span>
                        <span className="font-bold text-green-600">{formatCurrency(employee.salary)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statutory Information */}
              <Card className="card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Statutory Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">PAN Number</label>
                      <p className="font-medium font-mono">{employee.pan || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Aadhaar Number</label>
                      <p className="font-medium font-mono">{employee.aadhaar || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">UAN Number</label>
                      <p className="font-medium font-mono">{employee.uan || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">ESIC Number</label>
                      <p className="font-medium font-mono">{employee.esicNumber || "Not provided"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">PF Opt-in</label>
                        <p className="font-medium">
                          <Badge variant={employee.pfOptIn ? "default" : "secondary"}>
                            {employee.pfOptIn ? "Yes" : "No"}
                          </Badge>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">ESI Applicable</label>
                        <p className="font-medium">
                          <Badge variant={employee.esiApplicable ? "default" : "secondary"}>
                            {employee.esiApplicable ? "Yes" : "No"}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    {employee.lwfState && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">LWF State</label>
                        <p className="font-medium">{employee.lwfState}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bank Information */}
              <Card className="card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Bank Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <p className="font-medium font-mono">{employee.bankAccount || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                      <p className="font-medium font-mono">{employee.ifsc || "Not provided"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Branch</label>
                      <p className="font-medium">{employee.branch || "Not provided"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </div>
  )
}